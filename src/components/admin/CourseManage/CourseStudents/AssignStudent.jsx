import { useCallback } from "react";

import { ENROLLMENT_STATUSES } from "../../adminConstants";
import FormModal from "../../../common/FormModal/FormModal";
import Modal from "../../../common/Modal/Modal";
import PageState from "../../../common/PageState/PageState";
import { useAsync } from "../../../../hooks/useAsync";
import { adminService } from "../../../../services/admin/adminService";

const STATUS_OPTIONS = ENROLLMENT_STATUSES.map((value) => ({ value, label: value }));

// Assign an academy student to THIS course (new enrollment), or change an existing enrollment's status.
// Only students who are not already in this course are offered.
function AssignStudent({ course, enrollment, onSubmit, onClose }) {
  const loadAvailable = useCallback(() => adminService.getAvailableStudents(course.id), [course.id]);
  const { data: available, error, reload } = useAsync(loadAvailable);
  const isNew = !enrollment.id;

  if (isNew && !available) {
    return (
      <Modal title={`Assign student to ${course.title}`} onClose={onClose}>
        <PageState error={error} onRetry={reload} />
      </Modal>
    );
  }

  if (isNew && available.length === 0) {
    return (
      <Modal
        title={`Assign student to ${course.title}`}
        onClose={onClose}
        footer={<button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>}
      >
        <p>Every academy student is already enrolled in this course. Add new students on the Students page first.</p>
      </Modal>
    );
  }

  const fields = [
    { name: "course", label: "Course", type: "readonly", display: course.title, full: true },
    isNew
      ? {
          name: "studentId",
          label: "Student",
          type: "select",
          required: true,
          full: true,
          placeholder: `Select a student (${available.length} not in this course)`,
          options: available.map((student) => ({
            value: student.id,
            label: `${student.name} — ${student.email}${student.status === "Inactive" ? " (inactive)" : ""}`,
          })),
          hint: "Students already in this course are not listed.",
        }
      : { name: "studentName", label: "Student", type: "readonly", full: true },
    { name: "status", label: "Enrollment status", type: "select", options: STATUS_OPTIONS },
  ];

  return (
    <FormModal
      title={isNew ? `Assign student to ${course.title}` : "Change enrollment status"}
      fields={fields}
      initialValues={enrollment}
      submitLabel={isNew ? "Assign to course" : "Save status"}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
}

export default AssignStudent;
