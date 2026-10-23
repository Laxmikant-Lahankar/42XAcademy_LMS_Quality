import { useState } from "react";

import PageHeader from "../../common/PageHeader/PageHeader";
import Icon from "../../common/Icon/Icon";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../hooks/useToast";
import { authService } from "../../../services/auth/authService";
import { env } from "../../../config/env";
import { initials } from "../../../utils/format";
import "./ChangePassword.css";

const MIN_LENGTH = 8;

// Password input with a show / hide button.
function PasswordField({ id, label, value, onChange, autoComplete, hint }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="change-password-input">
        <input
          id={id}
          className="input"
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="change-password-toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          <Icon name={visible ? "eye-off" : "eye"} size={18} />
        </button>
      </div>
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}

// Admin → Change Password: the signed-in admin changes their own password.
function ChangePassword() {
  const { user } = useAuth();
  const showToast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!current || !next || !confirm) {
      setError("Fill in all three fields.");
      return;
    }
    if (next.length < MIN_LENGTH) {
      setError(`The new password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (next !== confirm) {
      setError("The new passwords do not match.");
      return;
    }
    if (next === current) {
      setError("The new password must be different from the current one.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await authService.changePassword({ currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setConfirm("");
      showToast(
        env.useMockApi
          ? "Mock mode: passwords are not stored. Connect the backend to change it for real."
          : "Password changed. Use the new password next time you sign in.",
        env.useMockApi ? "info" : "success"
      );
    } catch (changeError) {
      setError(changeError.message || "Could not change the password. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Account" title="Change Password" description="Update the password you use to sign in to the Admin panel." />

      <div className="change-password-grid">
        <section className="card card-pad change-password-account">
          <span className="change-password-avatar" aria-hidden="true">{initials(user.name)}</span>
          <div>
            <p className="change-password-name">{user.name}</p>
            <p className="muted">{user.email}</p>
            <span className="badge badge-primary">Administrator</span>
          </div>
        </section>

        <form className="card card-pad change-password-form" onSubmit={handleSubmit} noValidate>
          <h2 className="card-title">Set a new password</h2>

          <PasswordField
            id="admin-current-password"
            label="Current password"
            value={current}
            onChange={setCurrent}
            autoComplete="current-password"
          />
          <PasswordField
            id="admin-new-password"
            label="New password"
            value={next}
            onChange={setNext}
            autoComplete="new-password"
            hint={`At least ${MIN_LENGTH} characters. Mix letters, numbers and a symbol for a stronger password.`}
          />
          <PasswordField
            id="admin-confirm-password"
            label="Confirm new password"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
          />

          {error && (
            <p className="change-password-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Icon name="lock" size={16} />
            {saving ? "Saving…" : "Change password"}
          </button>
        </form>
      </div>
    </>
  );
}

export default ChangePassword;
