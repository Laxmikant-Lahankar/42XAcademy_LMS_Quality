import { useCallback } from "react";

import { useAdminCrud } from "../../useAdminCrud";
import DataTable from "../../../common/DataTable/DataTable";
import FormModal from "../../../common/FormModal/FormModal";
import ConfirmButton from "../../../common/ConfirmButton/ConfirmButton";
import PageState from "../../../common/PageState/PageState";
import EmptyState from "../../../common/EmptyState/EmptyState";
import Icon from "../../../common/Icon/Icon";
import { useToast } from "../../../../hooks/useToast";
import { adminService } from "../../../../services/admin/adminService";
import "./CourseModules.css";

// Course → Modules: only this course's modules, in order, with move up/down.
function CourseModules({ course, onChange, openTab }) {
  const showToast = useToast();
  const loadModules = useCallback(() => adminService.getModules(course.id), [course.id]);
  const crud = useAdminCrud({
    load: loadModules,
    save: (values) => adminService.saveModule({ ...values, courseId: course.id }),
    remove: (module) => adminService.deleteModule(module),
    label: "Module",
    onChange,
  });

  if (!crud.data) {
    return <PageState error={crud.error} onRetry={crud.reload} />;
  }

  async function move(module, direction) {
    try {
      await adminService.moveModule(module, direction);
      crud.reload();
    } catch (moveError) {
      showToast(moveError.message, "error");
    }
  }

  const fields = [
    { name: "course", label: "Course", type: "readonly", display: course.title, full: true },
    { name: "title", label: "Module title", required: true, full: true, placeholder: "e.g. Internal Tables" },
  ];

  return (
    <>
      <div className="toolbar course-tab-toolbar">
        <p className="muted course-modules-hint">
          Modules are the chapters of {course.title}. Use the arrows to change their order.
        </p>
        <button type="button" className="btn btn-primary" onClick={() => crud.setEditing({ title: "" })}>
          <Icon name="plus" size={16} /> Add module
        </button>
      </div>

      <DataTable
        caption={`Modules in ${course.title}`}
        rows={crud.data}
        emptyState={
          <EmptyState icon="layers" title="No modules yet" message="Add the first module, then add lectures inside it." />
        }
        columns={[
          { key: "order", header: "No.", render: (row) => <span className="course-modules-order">{row.order}</span> },
          { key: "title", header: "Module", render: (row) => <span className="cell-title">{row.title}</span> },
          {
            key: "lectureCount",
            header: "Lectures",
            render: (row) => (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => openTab("lectures")}>
                {row.lectureCount} lecture{row.lectureCount === 1 ? "" : "s"}
              </button>
            ),
          },
          {
            key: "move",
            header: "Order",
            render: (row) => (
              <span className="cell-actions course-modules-move">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={row.order === 1}
                  onClick={() => move(row, -1)}
                  aria-label={`Move ${row.title} up`}
                >
                  <Icon name="chevron-down" size={16} className="course-modules-up" />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={row.order === crud.data.length}
                  onClick={() => move(row, 1)}
                  aria-label={`Move ${row.title} down`}
                >
                  <Icon name="chevron-down" size={16} />
                </button>
              </span>
            ),
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
                <ConfirmButton
                  confirmLabel={row.lectureCount ? `Delete with ${row.lectureCount} lectures` : "Delete"}
                  onConfirm={() => crud.removeItem(row)}
                />
              </span>
            ),
          },
        ]}
      />

      {crud.editing && (
        <FormModal
          title={crud.editing.id ? "Edit module" : `Add module to ${course.title}`}
          fields={fields}
          initialValues={crud.editing}
          submitLabel={crud.editing.id ? "Save changes" : "Add module"}
          onSubmit={crud.saveItem}
          onClose={() => crud.setEditing(null)}
        />
      )}
    </>
  );
}

export default CourseModules;
