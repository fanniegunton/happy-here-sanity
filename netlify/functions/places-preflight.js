/**
 * netlify/functions/places-preflight.js
 *
 * Google Places pre-flight check.
 * Called by the dashboard widget before a full Browserbase verification run.
 *
 * What it does:
 * - Fetches all establishment records from Sanity
 * - Skips any that already have a website (Browserbase handles those)
 * - For the rest, calls Google Places API to check operational status
 * - Flags permanently closed ones in Sanity (adds a note, sets needsReview)
 * - Returns a summary count
 *
 * Environment variables required:
 *   GOOGLE_PLACES_API_KEY   — Google Cloud API key with Places API enabled
 *   SANITY_PROJECT_ID
 *   SANITY_DATASET
 *   SANITY_API_TOKEN        — Editor-level Sanity token
 */

import { createClient } from "@sanity/client";

const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  token: process.env.SANITY_API_TOKEN,
  apiVersion: "2024-01-01",
  useCdn: false,
});

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

/**
 * Find a Place ID by name + address using the Places Text Search API.
 */
async function findPlaceId(name, address) {
  const query = encodeURIComponent(`${name} ${address || "Austin TX"}`);
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id&key=${PLACES_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();
  return data.candidates?.[0]?.place_id || null;
}

/**
 * Get business_status for a Place ID.
 * Returns: "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY" | null
 */
async function getPlaceStatus(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=business_status,name&key=${PLACES_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();
  return data.result?.business_status || null;
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  if (!PLACES_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "GOOGLE_PLACES_API_KEY not configured" }),
    };
  }

  try {
    // Fetch all records without a website
    const records = await sanity.fetch(
      `*[_type == "establishment" && !defined(website)] { _id, name, address, notes, needsReview }`
    );

    const results = {
      checked: 0,
      flaggedClosed: 0,
      skippedHasWebsite: 0,
      errors: [],
    };

    // Also count how many were skipped because they have websites
    const allRecords = await sanity.fetch(
      `count(*[_type == "establishment" && defined(website)])`
    );
    results.skippedHasWebsite = allRecords;

    for (const record of records) {
      try {
        const placeId = await findPlaceId(record.name, record.address);
        if (!placeId) {
          results.errors.push({ name: record.name, reason: "Place not found" });
          continue;
        }

        const status = await getPlaceStatus(placeId);
        results.checked++;

        if (status === "CLOSED_PERMANENTLY") {
          results.flaggedClosed++;

          const today = new Date().toISOString().split("T")[0];
          const flagNote = `[AUTO-FLAG ${today}] Google Places reports PERMANENTLY CLOSED. Verify before removing.`;

          await sanity.patch(record._id).set({
            needsReview: true,
            notes: [record.notes, flagNote].filter(Boolean).join("\n\n"),
          }).commit();
        }

        // Polite delay — Places API rate limit is 100 QPS but we're courteous
        await new Promise((r) => setTimeout(r, 100));
      } catch (err) {
        results.errors.push({ name: record.name, reason: err.message });
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(results),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
