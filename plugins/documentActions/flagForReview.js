/**
 * documentActions/flagForReview.js
 *
 * "Flag for Review" document action button.
 * Sets needsReview: true and appends a timestamped note.
 * Appears in the publish toolbar of any establishment document.
 *
 * Requires adding needsReview (boolean) to your schema — see README.
 */

import { useDocumentOperation, useEditState } from "sanity";
import { useCallback, useState } from "react";

export function FlagForReviewAction(props) {
  const { id, type } = props;
  const { patch } = useDocumentOperation(id, type);
  const editState = useEditState(id, type);
  const [done, setDone] = useState(false);

  if (type !== "establishment") return null;

  const doc = editState?.published || editState?.draft;
  const alreadyFlagged = !!doc?.needsReview;

  const handleFlag = useCallback(() => {
    const timestamp = new Date().toISOString().split("T")[0];
    const flagNote = `[FLAGGED ${timestamp}] Marked for manual review.`;

    patch.execute([
      {
        set: {
          needsReview: true,
          notes: [doc?.notes, flagNote].filter(Boolean).join("\n\n"),
        },
      },
    ]);

    setDone(true);
    props.onComplete();
  }, [doc, patch, props]);

  const handleUnflag = useCallback(() => {
    patch.execute([{ set: { needsReview: false } }]);
    setDone(true);
    props.onComplete();
  }, [patch, props]);

  if (alreadyFlagged) {
    return {
      label: "Remove Flag",
      title: "Clear the review flag on this establishment",
      tone: "positive",
      onHandle: handleUnflag,
    };
  }

  return {
    label: "Flag for Review",
    title: "Mark this establishment as needing manual review",
    tone: "caution",
    onHandle: handleFlag,
  };
}
