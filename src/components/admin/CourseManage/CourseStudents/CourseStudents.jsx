import { useCallback, useState } from "react";

import AssignStudent from "./AssignStudent";
import StudentDetails from "../../Students/StudentDetails";
import { useAdminCrud } from "../../useAdminCrud";
import { ENROLLMENT_BADGES, ENROLLMENT_STATUSES } from "../../adminConstants";
import SearchInput from "../../../common/SearchInput/SearchInput";
import DataTable from "../../../common/DataTable/DataTable";
import ConfirmButton from "../../../common/ConfirmButton/ConfirmButton";
import ProgressBar from "../../../common/ProgressBar/ProgressBar";
import PageState from "../../../common/PageState/PageState";
import EmptyState from "../../../common/EmptyState/EmptyState";
import Icon from "../../../common/Icon/Icon";
import { adminService } from "../../../../services/admin/adminService";
import { formatDate, matchesSearch } from "../../../../utils/format";
import "./CourseStudents.css";

// Course → Students: ONLY the students enrolled in this course.
function CourseStudents({ course, onChange }) {
  const loadStudents = useCallback(() => adminService.getCourseStudents(course.id), [course.id]);
  const crud = useAdminCrud({
    load: loadStudents,
    save: (values) => adminService.saveEnrollment({ ...values, courseId: course.id }),
    remove: (row) => adminService.deleteEnrollment(row.id),
    label: "Student",
    messages: {
      created: `Student assigned to ${course.title}.`,
      updated: "Enrollment status updated.",
      deleted: `Student removed from ${course.title}.`,
    },
    onChange,
  });
  const [viewingId, setViewingId] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  if (!crud.data) {
    return <PageState error={crud.error} onRetry={crud.reload} />;
  }

  const rows = crud.data.filter(
    (row) => (status === "all" || row.status === status) && matchesSearch(query, row.studentName, row.studentEmail)
  );

  return (
    <>
      <div className="toolbar course-tab-toolbar">
        <SearchInput id="course-student-search" value={query} onChange={setQuery} placeholder="Search name or email" />

        <label htmlFor="course-student-status" className="visually-hidden">Status</label>
        <select id="course-student-status" className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          {ENROLLMENT_STATUSES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <button type="button" className="btn btn-primary" onClick={() => crud.setEditing({ studentId: "", status: "Active" })}>
          <Icon name="user-plus" size={16} /> Assign student
        </button>
      </div>

      <p className="muted course-students-count">
        {crud.data.length} student{crud.data.length === 1 ? "" : "s"} enrolled in {course.title}
      </p>

      <DataTable
        caption={`Students in ${course.title}`}
        rows={rows}
        emptyState={
          <EmptyState
            icon="users"
            title={crud.data.length ? "No students match" : "No students in this course yet"}
            message={crud.data.length ? "Try a different search or filter." : "Use “Assign student” to add academy students to this course."}
          />
        }
        columns={[
          {
            key: "student",
            header: "Student", sortValue: (row) => row.studentName,
            render: (row) => (
              <>
                <span className="cell-title">{row.studentName}</span>
                <span className="cell-sub">{row.studentEmail}</span>
              </>
            ),
          },
          { key: "enrolledOn", header: "Enrolled on", sortValue: (row) => row.enrolledOn, render: (row) => formatDate(row.enrolledOn) },
          {
            key: "progress",
            header: "Progress", sortValue: (row) => row.progress.percent,
            render: (row) => (
              <div className="admin-table-progress">
                <ProgressBar percent={row.progress.percent} label={`${row.studentName} progress`} />
              </div>
            ),
          },
          {
            key: "status",
            header: "Status", sortValue: (row) => row.status,
            render: (row) => <span className={`badge ${ENROLLMENT_BADGES[row.status] ?? ""}`}>{row.status}</span>,
          },
          {
            key: "actions",
            header: "Actions",
            align: "right",
            render: (row) => (
              <span className="cell-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setViewingId(row.studentId)}>
                  <Icon name="eye" size={15} /> View
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => crud.setEditing(row)}>
                  <Icon name="edit" size={15} /> Status
                </button>
                <ConfirmButton label="Remove" confirmLabel="Remove from course" icon="close" onConfirm={() => crud.removeItem(row)} />
              </span>
            ),
          },
        ]}
      />

      {crud.editing && (
        <AssignStudent
          course={course}
          enrollment={crud.editing}
          onSubmit={crud.saveItem}
          onClose={() => crud.setEditing(null)}
        />
      )}

      {viewingId && <StudentDetails studentId={viewingId} onClose={() => setViewingId(null)} />}
    </>
  );
}

export default CourseStudents;
