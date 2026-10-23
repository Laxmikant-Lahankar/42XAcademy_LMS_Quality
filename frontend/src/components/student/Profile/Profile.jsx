import { useCallback, useState } from "react";
import { Link } from "react-router-dom";

import PageHeader from "../../common/PageHeader/PageHeader";
import PageState from "../../common/PageState/PageState";
import ProgressBar from "../../common/ProgressBar/ProgressBar";
import { useAuth } from "../../../hooks/useAuth";
import { useAsync } from "../../../hooks/useAsync";
import { useToast } from "../../../hooks/useToast";
import { studentService } from "../../../services/student/studentService";
import { PATHS } from "../../../routes/paths";
import { env } from "../../../config/env";
import { formatDate, initials } from "../../../utils/format";
import "./Profile.css";

// Student profile: personal details, enrolled courses and change password.
function Profile() {
  const { user } = useAuth();
  const showToast = useToast();
  const loadProfile = useCallback(() => studentService.getProfile(user.id), [user.id]);
  const { data, error, reload } = useAsync(loadProfile);

  if (!data) {
    return <PageState error={error} onRetry={reload} />;
  }

  return (
    <>
      <PageHeader eyebrow="Account" title="My Profile" description="Your details and enrolled courses." />

      <div className="profile-grid">
        <div className="stack">
          <section className="card card-pad profile-summary">
            <span className="profile-avatar" aria-hidden="true">{initials(data.student.name)}</span>
            <div>
              <h2>{data.student.name}</h2>
              <p className="muted">{data.student.email}</p>
              <p className="muted">Student since {formatDate(data.student.joinedOn)}</p>
            </div>
          </section>

          <ContactForm
            key={data.student.id}
            student={data.student}
            onSaved={() => {
              showToast("Profile updated.");
              reload();
            }}
            studentId={user.id}
          />
        </div>

        <div className="stack">
          <section className="card card-pad">
            <h2 className="card-title">Enrolled courses</h2>
            <ul className="profile-courses">
              {data.courses.map((course) => (
                <li key={course.id}>
                  <Link to={PATHS.student.course(course.id)}>{course.title}</Link>
                  <ProgressBar percent={course.progress.percent} label={`${course.title} progress`} />
                </li>
              ))}
              {data.courses.length === 0 && <li className="muted">No enrolled courses.</li>}
            </ul>
          </section>

          <PasswordForm studentId={user.id} />
        </div>
      </div>
    </>
  );
}

function ContactForm({ student, studentId, onSaved }) {
  const showToast = useToast();
  const [phone, setPhone] = useState(student.phone ?? "");
  const [city, setCity] = useState(student.city ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await studentService.updateProfile(studentId, { phone: phone.trim(), city: city.trim() });
      onSaved();
    } catch (saveError) {
      showToast(saveError.message || "Could not save your details.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card card-pad profile-form" onSubmit={handleSubmit}>
      <h2 className="card-title">Personal details</h2>

      <dl className="profile-details">
        <div><dt>Full name</dt><dd>{student.name}</dd></div>
        <div><dt>Email</dt><dd>{student.email}</dd></div>
        <div><dt>Batch</dt><dd>{student.batch || "—"}</dd></div>
      </dl>

      <div className="profile-fields">
        <div className="field">
          <label className="field-label" htmlFor="profile-phone">Mobile number</label>
          <input id="profile-phone" className="input" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="profile-city">City</label>
          <input id="profile-city" className="input" value={city} onChange={(event) => setCity(event.target.value)} />
        </div>
      </div>

      <p className="field-hint">To change your name or email, contact 42X Academy support.</p>

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function PasswordForm({ studentId }) {
  const showToast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!current || !next) {
      setMessage({ type: "error", text: "Enter your current and new password." });
      return;
    }
    if (next.length < 8) {
      setMessage({ type: "error", text: "The new password must be at least 8 characters." });
      return;
    }
    if (next !== confirm) {
      setMessage({ type: "error", text: "The new passwords do not match." });
      return;
    }

    try {
      await studentService.changePassword(studentId, { currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setConfirm("");
      if (env.useMockApi) {
        setMessage({ type: "info", text: "Password changes will work once the backend is connected." });
      } else {
        setMessage(null);
        showToast("Password changed.");
      }
    } catch (changeError) {
      setMessage({ type: "error", text: changeError.message || "Could not change the password." });
    }
  }

  return (
    <form className="card card-pad profile-form" onSubmit={handleSubmit} noValidate>
      <h2 className="card-title">Change password</h2>

      <div className="field">
        <label className="field-label" htmlFor="pw-current">Current password</label>
        <input id="pw-current" className="input" type="password" autoComplete="current-password" value={current} onChange={(event) => setCurrent(event.target.value)} />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="pw-new">New password</label>
        <input id="pw-new" className="input" type="password" autoComplete="new-password" value={next} onChange={(event) => setNext(event.target.value)} />
        <span className="field-hint">At least 8 characters.</span>
      </div>
      <div className="field">
        <label className="field-label" htmlFor="pw-confirm">Confirm new password</label>
        <input id="pw-confirm" className="input" type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
      </div>

      {message && (
        <p className={`profile-message ${message.type === "error" ? "is-error" : ""}`} role={message.type === "error" ? "alert" : "status"}>
          {message.text}
        </p>
      )}

      <button type="submit" className="btn btn-secondary">Update password</button>
    </form>
  );
}

export default Profile;
