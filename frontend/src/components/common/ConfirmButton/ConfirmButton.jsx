import { useState } from "react";

import Icon from "../Icon/Icon";

// Two-step destructive button: first click asks "Delete?", second click confirms.
function ConfirmButton({ label = "Delete", confirmLabel = "Confirm", onConfirm, icon = "trash" }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="cell-actions">
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() => {
            setConfirming(false);
            onConfirm();
          }}
        >
          {confirmLabel}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(true)}>
      <Icon name={icon} size={15} />
      {label}
    </button>
  );
}

export default ConfirmButton;
