import { useCallback, useState } from "react";
import { Link } from "react-router-dom";

import Modal from "../../common/Modal/Modal";
import PageState from "../../common/PageState/PageState";
import ProgressBar from "../../common/ProgressBar/ProgressBar";
import Icon from "../../common/Icon/Icon";
import { useAsync } from "../../../hooks/useAsync";
import { useToast } from "../../../hooks/useToast";
import { adminService } from "../../../services/admin/adminService";
import { PATHS } from "../../../routes/paths";
import { formatDate, initials } from "../../../utils/format";
import { copyText } from "../../../utils/copyText";
import { ENROLLMENT_BADGES } from "../adminConstants";
import "./StudentDetails.css";

// Username + password the student signs in with (admins only).
// The password is hidden until the admin clicks the eye; Copy puts it on the clipboard.
function LoginDetails({ login }) {
  const showToast = useToast();
  const [visible, setVisible] = useState(false);

  async function copy(text, what) {
    if (await copyText(text)) {
      showToast(`${what} copied.`);
    } else {
      showToast("Could not copy. Select the text and copy it manually.", "error");
    }
  }

  if (!login) {
    return null;
  }

  return (
    <section className="student-login-box" aria-label="Login details">
      <p className="student-login-title">Login details</p>

      <div className="student-login-row">
        <span className="student-login-label">Username</span>
        <code className="student-login-value">{login.username}</code>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => copy(login.username, "Username")}>
          Copy
        </button>
      </div>

      <div className="student-login-row">
        <span className="student-login-label">Password</span>
        {login.password ? (
          <>
            <code className="student-login-value">{visible ? login.password : "••••••••••"}</code>
            <span className="student-login-actions">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setVisible((current) => !current)}
                aria-label={visible ? "Hide password" : "Show password"}
              >
                <Icon name={visible ? "eye-off" : "eye"} size={15} />
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => copy(login.password, "Password")}>
                Copy
              </button>
            </span>
          </>
        ) : (
          <span className="student-login-missing">
            Not available — set a new password with <strong>Edit</strong> to see it here.
          </span>
        )}
      </div>

      {login.password && (
        <button
          type="button"
          className="btn btn-secondary btn-sm student-login-copy-both"
          onClick={() => copy(`Username: ${login.username}\nPassword: ${login.password}`, "Username and password")}
        >
          Copy username + password
        </button>
      )}
    </section>
  );
}

// Student details popup: basic information, login details and every course the student is enrolled in.
// Used on the Students page and inside Manage Course → Students.
function StudentDetails({ studentId, onClose }) {
  const loadDetails = useCallback(() => adminService.getStudentDetails(studentId), [studentId]);
  const { data, error, reload } = useAsync(loadDetails);

  return (
    <Modal title="Student details" onClose={onClose}>
      {!data ? (
        <PageState error={error} onRetry={reload} />
      ) : (
        <div className="student-details">
          <div className="student-details-head">
            <span className="student-details-avatar" aria-hidden="true">{initials(data.student.name)}</span>
            <div>
              <p className="student-details-name">{data.student.name}</p>
              <p className="muted">{data.student.email}</p>
            </div>
            <span className={`badge ${data.student.status === "Active" ? "badge-success" : "badge-danger"}`}>
              {data.student.status}
            </span>
          </div>

          <dl className="student-details-facts">
            <div><dt>Mobile</dt><dd>{data.student.phone || "—"}</dd></div>
            <div><dt>Batch</dt><dd>{data.student.batch || "—"}</dd></div>
            <div><dt>City</dt><dd>{data.student.city || "—"}</dd></div>
            <div><dt>Joined</dt><dd>{formatDate(data.student.joinedOn)}</dd></div>
          </dl>

          <LoginDetails login={data.login} />

          <h3 className="student-details-heading">Enrolled courses ({data.enrollments.length})</h3>

          {data.enrollments.length === 0 ? (
            <p className="muted">Not enrolled in any course yet.</p>
          ) : (
            <ul className="student-details-courses">
              {data.enrollments.map((enrollment) => (
                <li key={enrollment.id}>
                  <div className="student-details-course-head">
                    <Link to={PATHS.admin.course(enrollment.courseId, "students")} onClick={onClose}>
                      {enrollment.courseTitle}
                    </Link>
                    <span className={`badge ${ENROLLMENT_BADGES[enrollment.status] ?? ""}`}>{enrollment.status}</span>
                  </div>
                  <ProgressBar percent={enrollment.progress.percent} label={`${enrollment.courseTitle} progress`} />
                  <p className="muted student-details-meta">
                    {enrollment.progress.completed} of {enrollment.progress.total} lectures · Enrolled {formatDate(enrollment.enrolledOn)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
}

export default StudentDetails;
