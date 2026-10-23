import { useCallback, useState } from "react";
import { Link } from "react-router-dom";

import PageHeader from "../../common/PageHeader/PageHeader";
import PageState from "../../common/PageState/PageState";
import Icon from "../../common/Icon/Icon";
import { useAuth } from "../../../hooks/useAuth";
import { useAsync } from "../../../hooks/useAsync";
import { useToast } from "../../../hooks/useToast";
import { authService } from "../../../services/auth/authService";
import { PATHS } from "../../../routes/paths";
import { formatDateTimeLong, initials } from "../../../utils/format";
import "./AdminProfile.css";

// Admin → My Profile: view and edit own name, email (login username), mobile and city.
function AdminProfile() {
  const { user } = useAuth();
  const userId = user.id;
  const role = user.role;
  const loadProfile = useCallback(() => authService.getMyProfile({ id: userId, role }), [userId, role]);
  const { data, error, reload, setData } = useAsync(loadProfile);

  if (!data) {
    return <PageState error={error} onRetry={reload} />;
  }

  return (
    <>
      <PageHeader eyebrow="Account" title="My Profile" description="Your details as an administrator of 42X Academy." />

      <div className="admin-profile-grid">
        <section className="card card-pad admin-profile-summary">
          <span className="admin-profile-avatar" aria-hidden="true">{initials(data.name)}</span>
          <p className="admin-profile-name">{data.name}</p>
          <p className="muted admin-profile-email">{data.email}</p>
          <span className="badge badge-primary">Administrator</span>

          <dl className="admin-profile-facts">
            <div><dt>Mobile</dt><dd>{data.phone || "—"}</dd></div>
            <div><dt>City</dt><dd>{data.city || "—"}</dd></div>
            <div><dt>Account created</dt><dd>{formatDateTimeLong(data.createdAt)}</dd></div>
          </dl>

          <Link to={PATHS.admin.changePassword} className="btn btn-secondary btn-sm admin-profile-password">
            <Icon name="lock" size={15} /> Change password
          </Link>
        </section>

        <ProfileForm key={`${data.id}-${data.email}-${data.name}`} profile={data} onSaved={setData} />
      </div>
    </>
  );
}

function ProfileForm({ profile, onSaved }) {
  const { user, updateSession } = useAuth();
  const showToast = useToast();
  const [values, setValues] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone ?? "",
    city: profile.city ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const emailChanged = values.email.trim().toLowerCase() !== profile.email.toLowerCase();
  const unchanged =
    values.name.trim() === profile.name &&
    !emailChanged &&
    values.phone.trim() === (profile.phone ?? "") &&
    values.city.trim() === (profile.city ?? "");

  function setValue(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!values.name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!values.email.trim()) {
      setError("Email is required.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      const result = await authService.updateMyProfile(user, values);
      updateSession(result);
      onSaved(result.profile);
      showToast(emailChanged ? "Profile saved. Sign in with your new email next time." : "Profile saved.");
    } catch (saveError) {
      setError(saveError.message || "Could not save your profile. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form className="card card-pad admin-profile-form" onSubmit={handleSubmit} noValidate>
      <h2 className="card-title">Edit details</h2>

      <p className="admin-profile-section">Login details</p>
      <div className="admin-profile-fields">
        <div className="field admin-profile-full">
          <label className="field-label" htmlFor="profile-name">Full name</label>
          <input id="profile-name" className="input" value={values.name} onChange={(event) => setValue("name", event.target.value)} autoComplete="name" />
        </div>
        <div className="field admin-profile-full">
          <label className="field-label" htmlFor="profile-email">Email (login username)</label>
          <input id="profile-email" className="input" type="email" value={values.email} onChange={(event) => setValue("email", event.target.value)} autoComplete="email" />
          {emailChanged ? (
            <span className="admin-profile-warning">
              <Icon name="alert" size={14} /> After saving, you sign in with this new email.
            </span>
          ) : (
            <span className="field-hint">You sign in to the Admin panel with this email.</span>
          )}
        </div>
      </div>

      <p className="admin-profile-section">Contact details</p>
      <div className="admin-profile-fields">
        <div className="field">
          <label className="field-label" htmlFor="profile-phone">Mobile number</label>
          <input id="profile-phone" className="input" type="tel" value={values.phone} onChange={(event) => setValue("phone", event.target.value)} autoComplete="tel" />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="profile-city">City</label>
          <input id="profile-city" className="input" value={values.city} onChange={(event) => setValue("city", event.target.value)} autoComplete="address-level2" />
        </div>
      </div>

      {error && (
        <p className="admin-profile-error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-profile-actions">
        <button type="submit" className="btn btn-primary" disabled={saving || unchanged}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        {!unchanged && !saving && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setValues({ name: profile.name, email: profile.email, phone: profile.phone ?? "", city: profile.city ?? "" });
              setError("");
            }}
          >
            Undo changes
          </button>
        )}
      </div>
    </form>
  );
}

export default AdminProfile;
