import { useState } from "react";

import { useAdminCrud } from "../useAdminCrud";
import StudentDetails from "./StudentDetails";
import PageHeader from "../../common/PageHeader/PageHeader";
import PageState from "../../common/PageState/PageState";
import SearchInput from "../../common/SearchInput/SearchInput";
import DataTable from "../../common/DataTable/DataTable";
import FormModal from "../../common/FormModal/FormModal";
import ConfirmButton from "../../common/ConfirmButton/ConfirmButton";
import ProgressBar from "../../common/ProgressBar/ProgressBar";
import EmptyState from "../../common/EmptyState/EmptyState";
import Icon from "../../common/Icon/Icon";
import { useToast } from "../../../hooks/useToast";
import { adminService } from "../../../services/admin/adminService";
import { formatDate, matchesSearch } from "../../../utils/format";
import "../admin.css";
import "./Students.css";

// The student signs in with their email (username) and the password the admin sets here.
// When editing, an empty password keeps the current one.
function studentFields(isNew) {
  return [
    {
      name: "loginSection",
      type: "section",
      label: "Login details",
      hint: isNew
        ? "The student signs in with this email and password."
        : "Leave the password empty to keep the current one, or type a new one to reset it.",
    },
    { name: "name", label: "Full name", required: true, full: true },
    { name: "email", label: "Email (username)", type: "email", required: true, autoComplete: "off" },
    {
      name: "password",
      label: isNew ? "Password" : "New password (optional)",
      type: "password",
      required: isNew,
      autoComplete: "new-password",
      hint: "At least 8 characters.",
    },
    { name: "personalSection", type: "section", label: "Personal details" },
    { name: "phone", label: "Mobile number", type: "tel" },
    { name: "city", label: "City" },
    { name: "batch", label: "Batch", placeholder: "e.g. Oct 2026 Weekday" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive (cannot sign in)" },
      ],
    },
  ];
}

const EMPTY_STUDENT = { name: "", email: "", password: "", phone: "", city: "", batch: "", status: "Active" };

// Academy-wide student management: add, edit, deactivate, search, and view details.
function Students() {
  const showToast = useToast();
  const crud = useAdminCrud({
    load: adminService.getStudents,
    save: adminService.saveStudent,
    remove: (student) => adminService.deleteStudent(student.id),
    label: "Student",
    messages: {
      created: "Student added. They can now sign in with their email and password.",
      updated: "Student details saved.",
      deleted: "Student deleted permanently.",
    },
  });
  const [viewingId, setViewingId] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [course, setCourse] = useState("all");

  if (!crud.data) {
    return <PageState error={crud.error} onRetry={crud.reload} />;
  }

  async function toggleStatus(student) {
    const nextStatus = student.status === "Active" ? "Inactive" : "Active";
    try {
      await adminService.saveStudent({ ...student, status: nextStatus });
      showToast(`${student.name} is now ${nextStatus.toLowerCase()}.`);
      crud.reload();
    } catch (toggleError) {
      showToast(toggleError.message, "error");
    }
  }

  const courseOptions = [...new Set(crud.data.flatMap((student) => student.courseTitles))].sort();
  const students = crud.data.filter(
    (student) =>
      (status === "all" || student.status === status) &&
      (course === "all" || student.courseTitles.includes(course)) &&
      matchesSearch(query, student.name, student.email, student.phone, student.batch, student.city)
  );

  return (
    <>
      <PageHeader
        eyebrow="Academy"
        title="Students"
        description="Every student in 42X Academy. Open a student to see their courses and progress."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => crud.setEditing(EMPTY_STUDENT)}>
            <Icon name="plus" size={16} /> Add student
          </button>
        }
      />

      <div className="toolbar admin-toolbar">
        <SearchInput id="student-search" value={query} onChange={setQuery} placeholder="Search name, email, phone or batch" />

        <label htmlFor="student-status" className="visually-hidden">Status</label>
        <select id="student-status" className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <label htmlFor="student-course" className="visually-hidden">Course</label>
        <select id="student-course" className="input" value={course} onChange={(event) => setCourse(event.target.value)}>
          <option value="all">All courses</option>
          {courseOptions.map((title) => (
            <option key={title} value={title}>{title}</option>
          ))}
        </select>

        <span className="admin-count">{students.length} of {crud.data.length} students</span>
      </div>

      <section className="card card-pad">
        <DataTable
          caption="Students"
          rows={students}
          emptyState={<EmptyState icon="users" title="No students found" message="Try a different search or filter." />}
          columns={[
            {
              key: "name",
              header: "Student", sortValue: (row) => row.name,
              render: (row) => (
                <>
                  <span className="cell-title">{row.name}</span>
                  <span className="cell-sub">{row.email}</span>
                </>
              ),
            },
            {
              key: "batch",
              header: "Batch", sortValue: (row) => row.batch,
              render: (row) => (
                <>
                  {row.batch || "—"}
                  <span className="cell-sub">Joined {formatDate(row.joinedOn)}</span>
                </>
              ),
            },
            {
              key: "courses",
              header: "Enrolled courses",
              render: (row) =>
                row.courseTitles.length ? (
                  <span className="students-courses">{row.courseTitles.join(", ")}</span>
                ) : (
                  <span className="muted">None</span>
                ),
            },
            {
              key: "progress",
              header: "Avg. progress", sortValue: (row) => row.averageProgress,
              render: (row) => (
                <div className="admin-table-progress">
                  <ProgressBar percent={row.averageProgress} label={`${row.name} average progress`} />
                </div>
              ),
            },
            {
              key: "status",
              header: "Status", sortValue: (row) => row.status,
              render: (row) => (
                <span className={`badge ${row.status === "Active" ? "badge-success" : "badge-danger"}`}>{row.status}</span>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              align: "right",
              render: (row) => (
                <span className="cell-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setViewingId(row.id)}>
                    <Icon name="eye" size={15} /> View
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => crud.setEditing(row)}>
                    <Icon name="edit" size={15} /> Edit
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggleStatus(row)}>
                    {row.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                  <ConfirmButton confirmLabel="Delete permanently" onConfirm={() => crud.removeItem(row)} />
                </span>
              ),
            },
          ]}
        />
      </section>

      {viewingId && <StudentDetails studentId={viewingId} onClose={() => setViewingId(null)} />}

      {crud.editing && (
        <FormModal
          title={crud.editing.id ? "Edit student" : "Add student"}
          fields={studentFields(!crud.editing.id)}
          initialValues={{ ...crud.editing, password: "" }}
          submitLabel={crud.editing.id ? "Save changes" : "Add student"}
          onSubmit={crud.saveItem}
          onClose={() => crud.setEditing(null)}
        />
      )}
    </>
  );
}

export default Students;
