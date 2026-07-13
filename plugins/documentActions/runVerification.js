/**
 * documentActions/runVerification.js
 *
 * "Run Verification" document action button.
 * Appears in the publish toolbar of any establishment document.
 *
 * On click: calls your Netlify Function (verify-establishment),
 * which runs a Stagehand/Browserbase check on the establishment's website
 * and returns updated HH times, hours, and operational status.
 * Patches non-experience fields back into the open document.
 *
 * Does NOT touch: seating, lighting, goodForConversation, staffNiceness,
 * music, bathrooms, interiorDesign, accessibility, allergyFriendly, notes.
 */

import { useDocumentOperation, useEditState } from "sanity";
import { useState, useCallback } from "react";

const VERIFY_ENDPOINT = process.env.SANITY_STUDIO_VERIFY_ENDPOINT ||
  "https://happyhere.netlify.app/.netlify/functions/verify-establishment";

// Experience fields — never patched by automation
const EXPERIENCE_FIELDS = [
  "seating", "lighting", "goodForConversation", "staffNiceness",
  "music", "bathrooms", "interiorDesign", "accessibility",
  "allergyFriendly", "notes",
];

export function RunVerificationAction(props) {
  const { id, type, published } = props;
  const { patch } = useDocumentOperation(id, type);
  const editState = useEditState(id, type);

  const [isRunning, setIsRunning] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [result, setResult] = useState(null);

  // Only show on establishment documents
  if (type !== "establishment") return null;

  const doc = editState?.published || editState?.draft;
  const hasWebsite = !!doc?.website;
  const hasName = !!doc?.name;

  const handleRun = useCallback(async () => {
    if (!hasWebsite) return;
    setIsRunning(true);
    setResult(null);

    try {
      const response = await fetch(VERIFY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: doc.name,
          website: doc.website,
          existingHappyHourDetails: doc.happyHourDetails,
        }),
      });

      if (!response.ok) {
        throw new Error(`Verification endpoint returned ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

      // Build patch — exclude experience fields and only include
      // fields that came back with actual values
      const patchData = {};

      if (data.happyHourTimes?.length) {
        patchData.happyHourTimes = data.happyHourTimes;
      }
      // Only overwrite happyHourDetails if currently empty
      if (data.happyHourSummary && !doc.happyHourDetails) {
        patchData.happyHourDetails = data.happyHourSummary;
      }
      if (data.currentHours?.length) {
        patchData.hours = data.currentHours;
      }
      if (data.permanentlyClosed) {
        patchData.notes = [
          doc.notes,
          `[AUTO-FLAG ${new Date().toISOString().split("T")[0]}] Possibly permanently closed — verify before removing.`,
        ]
          .filter(Boolean)
          .join("\n\n");
      }

      // Sanity-check: make sure no experience fields snuck in
      EXPERIENCE_FIELDS.forEach((f) => delete patchData[f]);

      if (Object.keys(patchData).length > 0) {
        patch.execute([{ set: patchData }]);
      }

      setDialogOpen(true);
    } catch (err) {
      setResult({ error: err.message });
      setDialogOpen(true);
    } finally {
      setIsRunning(false);
    }
  }, [id, doc, hasWebsite, patch]);

  return {
    label: isRunning ? "Verifying…" : "Run Verification",
    title: hasWebsite
      ? "Check website for current HH times and operational status"
      : "No website on record — add one to enable verification",
    disabled: !hasWebsite || isRunning,
    tone: "primary",
    onHandle: handleRun,

    // Inline result dialog
    dialog: dialogOpen && result
      ? {
          type: "confirm",
          tone: result.error || result.permanentlyClosed ? "critical" : "positive",
          header: result.error
            ? "Verification failed"
            : result.permanentlyClosed
            ? "⚠️ Possibly closed"
            : "Verification complete",
          message: result.error
            ? `Could not reach ${doc?.website}. Error: ${result.error}`
            : result.permanentlyClosed
            ? `${doc?.name} may be permanently closed. A flag has been added to Notes. Please verify manually before removing this record.`
            : [
                result.happyHourStillExists === false
                  ? "⚠️ Happy hour not found on website."
                  : "✓ Happy hour confirmed.",
                result.happyHourTimes?.length
                  ? `Times updated: ${result.happyHourTimes.join(", ")}`
                  : null,
                result.currentHours?.length
                  ? `Hours updated.`
                  : null,
              ]
                .filter(Boolean)
                .join(" "),
          onConfirm: () => setDialogOpen(false),
          confirmButtonText: "Got it",
        }
      : null,
  };
}
