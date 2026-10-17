import { useState } from "react";

import { useAdminCrud } from "../useAdminCrud";
import PageHeader from "../../common/PageHeader/PageHeader";
import PageState from "../../common/PageState/PageState";
import SearchInput from "../../common/SearchInput/SearchInput";
import DataTable from "../../common/DataTable/DataTable";
import FormModal from "../../common/FormModal/FormModal";
import ConfirmButton from "../../common/ConfirmButton/ConfirmButton";
import ProgressBar from "../../common/ProgressBar/ProgressBar";
import EmptyState from "../../common/EmptyState/EmptyState";
import Icon from "../../common/Icon/Icon";
import { useAsync } from "../../../hooks/useAsync";
import { adminService } from "../../../services/admin/adminService";
import { formatDate, matchesSearch } from "../../../utils/format";
import { ENROLLMENT_BADGES, ENROLLMENT_STATUSES } from "../adminConstants";
import "../admin.css";
import "./Enrollments.css";

const STATUSES = ENROLLMENT_STATUSES;
const STATUS_BADGES = ENROLLMENT_BADGES;

// Enrollment management: assign students to courses and track course-wise enrollments.
function Enrollments() {
  const crud = useAdminCrud({
    load: adminService.getEnrollments,
    save: adminService.saveEnrollment,
    remove: (row) => adminService.deleteEnrollment(row.id),
    label: "Enrollment",
  });
  const students = useAsync(adminService.getStudents);
  const courses = useAsync(adminService.getCourses);
  const [query, setQuery] = useState("");
  const [courseId, setCourseId] = useState("all");
  const [status, setStatus] = useState("all");

  if (!crud.data || !students.data || !courses.data) {
    return <PageState error={crud.error || students.error || courses.error} onRetry={crud.reload} />;
  }

  const courseOptions = courses.data.map((course) => ({ value: course.id, label: course.title }));
  const enrollments = crud.data.filter(
    (item) =>
      (courseId === "all" || item.courseId === courseId) &&
      (status === "all" || item.status === status) &&
      matchesSearch(query, item.studentName, item.studentEmail, item.courseTitle)
  );

  // New: pick one student and one course. Edit: only the status changes (student and course stay fixed).
  const isEditing = Boolean(crud.editing?.id);
  const fields = [
    isEditing
      ? { name: "studentName", label: "Student", type: "readonly", full: true }
      : {
          name: "studentId",
          label: "Student",
          type: "select",
          required: true,
          placeholder: "Select a student",
          full: true,
          options: students.data.map((student) => ({ value: student.id, label: `${student.name} (${student.email})` })),
          resets: ["courseId"],
        },
    isEditing
      ? { name: "courseTitle", label: "Course", type: "readonly" }
      : {
          name: "courseId",
          label: "Course",
          type: "select",
          required: true,
          placeholder: "Select a course",
          // Only courses this student is not already enrolled in
          options: (values) =>
            courseOptions.filter(
              (option) =>
                !crud.data.some((item) => item.studentId === values.studentId && item.courseId === option.value)
            ),
        },
    { name: "status", label: "Status", type: "select", options: STATUSES.map((value) => ({ value, label: value })) },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Academy"
        title="Enrollments"
        description="Each enrollment connects one student to one specific course. A student can be enrolled in several courses."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => crud.setEditing({ studentId: "", courseId: courseId === "all" ? "" : courseId, status: "Active" })}
          >
            <Icon name="user-plus" size={16} /> Assign course
          </button>
        }
      />

      <div className="toolbar admin-toolbar">
        <SearchInput id="enrollment-search" value={query} onChange={setQuery} placeholder="Search student or course" />

        <label htmlFor="enrollment-course" className="visually-hidden">Course</label>
        <select id="enrollment-course" className="input" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
          <option value="all">All courses</option>
          {courseOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <label htmlFor="enrollment-status" className="visually-hidden">Status</label>
        <select id="enrollment-status" className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <span className="admin-count">{enrollments.length} enrollments</span>
      </div>

      <section className="card card-pad">
        <DataTable
          caption="Enrollments"
          rows={enrollments}
          emptyState={<EmptyState icon="user-plus" title="No enrollments found" message="Pick another filter or enroll a student." />}
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
            { key: "courseTitle", header: "Course", sortValue: (row) => row.courseTitle },
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
              render: (row) => <span className={`badge ${STATUS_BADGES[row.status] ?? ""}`}>{row.status}</span>,
            },
            {
              key: "actions",
              header: "Actions",
              align: "right",
              render: (row) => (
                <span className="cell-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => crud.setEditing(row)}>
                    <Icon name="edit" size={15} /> Edit
                  </button>
                  <ConfirmButton label="Remove" confirmLabel="Remove" onConfirm={() => crud.removeItem(row)} />
                </span>
              ),
            },
          ]}
        />
      </section>

      {crud.editing && (
        <FormModal
          title={crud.editing.id ? "Edit enrollment" : "Assign a course to a student"}
          fields={fields}
          initialValues={crud.editing}
          submitLabel={crud.editing.id ? "Save changes" : "Assign course"}
          onSubmit={crud.saveItem}
          onClose={() => crud.setEditing(null)}
        />
      )}
    </>
  );
}

export default Enrollments;
