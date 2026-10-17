import { useCallback } from "react";
import { Link } from "react-router-dom";

import Modal from "../../common/Modal/Modal";
import PageState from "../../common/PageState/PageState";
import ProgressBar from "../../common/ProgressBar/ProgressBar";
import { useAsync } from "../../../hooks/useAsync";
import { adminService } from "../../../services/admin/adminService";
import { PATHS } from "../../../routes/paths";
import { formatDate, initials } from "../../../utils/format";
import { ENROLLMENT_BADGES } from "../adminConstants";
import "./StudentDetails.css";

// Student details popup: basic information and every course the student is enrolled in.
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
