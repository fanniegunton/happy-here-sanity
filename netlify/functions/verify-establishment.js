/**
 * netlify/functions/verify-establishment.js
 *
 * Per-document verification endpoint.
 * Called by the "Run Verification" document action in Sanity Studio.
 *
 * Receives: { id, name, website, existingHappyHourDetails }
 * Returns:  VerificationSchema shape (see below)
 *
 * Environment variables required:
 *   BROWSERBASE_API_KEY
 *   BROWSERBASE_PROJECT_ID
 */

import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";

// Structured-output models require every property in `required`, so unknown
// values are expressed as null rather than omitted (.nullable, not .optional)
const VerificationSchema = z.object({
  isOperational: z.boolean(),
  permanentlyClosed: z.boolean(),
  temporarilyClosed: z.boolean(),
  websiteAlive: z.boolean(),
  happyHourStillExists: z.boolean().nullable(),
  happyHourTimes: z.array(z.string()).nullable(),
  happyHourSummary: z.string().nullable(),
  hoursChanged: z.boolean().nullable(),
  currentHours: z.array(z.string()).nullable(),
  notes: z.string().nullable(),
});

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { id, name, website, existingHappyHourDetails } = body;

  if (!website) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No website provided" }),
    };
  }

  // Stagehand 3.x API: pages live on stagehand.context, and extract takes
  // (instruction, schema) as positional args
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    verbose: 0,
  });

  try {
    await stagehand.init();
    const page =
      stagehand.context.pages()[0] ?? (await stagehand.context.newPage());

    try {
      await page.goto(website, { waitUntil: "load", timeoutMs: 20000 });
    } catch (gotoErr) {
      // Slow sites often render fine without ever firing `load` —
      // attempt extraction anyway; only bail on non-timeout failures
      if (!/timed out/i.test(gotoErr.message || "")) throw gotoErr;
    }

    const result = await stagehand.extract(
      `Check this establishment's website for the following:
        1. Is the business operational (not closed)?
        2. Is it permanently or temporarily closed?
        3. Does a happy hour, drink special, or similar deal still exist?
        4. What are the happy hour times if listed (e.g. "Mon–Fri 3–6pm")?
        5. A brief summary of what the happy hour includes (drinks, food, pricing).
        6. What are the current business hours if listed?
        Look for happy hour info on the homepage, a menu page, or a specials/deals page.`,
      VerificationSchema
    );

    await stagehand.close();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  } catch (err) {
    try { await stagehand.close(); } catch {}

    // Distinguish between "site unreachable" and other errors
    const isNetworkError =
      err.message.includes("net::ERR") ||
      err.message.includes("timeout") ||
      err.message.includes("ECONNREFUSED");

    return {
      statusCode: 200, // Return 200 so the action can handle it gracefully
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isOperational: false,
        permanentlyClosed: false,
        temporarilyClosed: false,
        websiteAlive: false,
        error: isNetworkError
          ? `Website unreachable: ${err.message}`
          : err.message,
      }),
    };
  }
};
