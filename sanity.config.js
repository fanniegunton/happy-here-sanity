// sanity.config.js
import { defineConfig, useDocumentOperation } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import schemas from "./schemas/schema";
import deskStructure from "./deskStructure";
import { submissionInboxTool } from "./tools/submissionInbox";
import { DEFAULT_IMPLEMENTATION_NOTE } from "./schemas/venueSubmission";
import { RunVerificationAction } from "./plugins/documentActions/runVerification";
import { FlagForReviewAction } from "./plugins/documentActions/flagForReview";
import { MarkVerifiedAction } from "./plugins/documentActions/markVerified";
import { happyHereDashboard } from "./plugins/happyHereDashboard";

// Publishing a venueSubmission is really "archiving" it: the submission
// leaves the inbox (which lists drafts only) and becomes a permanent record.
// Relabel the built-in Publish action accordingly, and block it until the
// reviewer has set a non-pending status — otherwise the submission would be
// archived while still marked "pending" and vanish from the inbox unreviewed.
function createArchiveAction(originalPublishAction) {
  const ArchiveAction = (props) => {
    const { patch } = useDocumentOperation(props.id, props.type);
    const original = originalPublishAction(props);
    if (!original) return null;
    const status = props.draft?.status ?? props.published?.status;
    const isPending = !status || status === "pending";
    return {
      ...original,
      label: "Archive",
      title: isPending
        ? "Set Status to Approved or Rejected before archiving"
        : original.title,
      disabled: isPending || original.disabled,
      onHandle: () => {
        if (!props.draft?.implementationNotes?.trim()) {
          patch.execute([
            { set: { implementationNotes: DEFAULT_IMPLEMENTATION_NOTE } },
          ]);
        }
        original.onHandle();
      },
    };
  };
  ArchiveAction.action = originalPublishAction.action;
  return ArchiveAction;
}

export default defineConfig({
  title: "Happy Here",
  projectId: "9h94j7zr",
  dataset: "production",
  plugins: [
    structureTool({
      structure: deskStructure,
    }),
    visionTool(),
    happyHereDashboard(),
  ],
  tools: (prev) => [...prev, submissionInboxTool],
  schema: {
    types: schemas,
  },
  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === "global") {
        return prev.filter(
          (templateItem) => templateItem.templateId != "settings",
        );
      }
      return prev;
    },
    actions: (prev, { schemaType }) => {
      // Remove certain actions from settings
      if (schemaType === "settings") {
        return prev.filter(
          ({ action }) =>
            !["unpublish", "delete", "duplicate"].includes(action),
        );
      }

      // Publishing a submission == archiving it; relabel and guard
      if (schemaType === "venueSubmission") {
        return prev.map((originalAction) =>
          originalAction.action === "publish"
            ? createArchiveAction(originalAction)
            : originalAction,
        );
      }

      if (schemaType === "establishment") {
        return [
          ...prev,
          RunVerificationAction,
          FlagForReviewAction,
          MarkVerifiedAction,
        ];
      }

      return prev;
    },
  },
});
