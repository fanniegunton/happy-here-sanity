/**
 * documentActions/markVerified.js
 *
 * "Mark HH Verified" document action button.
 * Toggles the `unverified` boolean field.
 *
 * Note on naming: in your schema, the field is called `unverified`
 * with the Studio label "HH Verified!" — so:
 *   unverified: false = NOT YET verified (needs checking)
 *   unverified: true  = IS verified (HH confirmed)
 *
 * This action sets it to true (confirmed) when you click "Mark HH Verified"
 * and back to false when you click "Mark Unverified."
 */

import { useDocumentOperation, useEditState } from "sanity";
import { useCallback } from "react";

export function MarkVerifiedAction(props) {
  const { id, type } = props;
  const { patch } = useDocumentOperation(id, type);
  const editState = useEditState(id, type);

  if (type !== "establishment") return null;

  const doc = editState?.published || editState?.draft;
  // unverified: false = not verified yet. unverified: true = HH confirmed.
  const isVerified = doc?.unverified === true;

  const handleToggle = useCallback(() => {
    patch.execute([{ set: { unverified: !isVerified } }]);
    props.onComplete();
  }, [isVerified, patch, props]);

  return {
    label: isVerified ? "Mark Unverified" : "✓ Mark HH Verified",
    title: isVerified
      ? "Remove HH verification from this establishment"
      : "Confirm happy hour details have been personally verified",
    tone: isVerified ? "caution" : "positive",
    onHandle: handleToggle,
  };
}
