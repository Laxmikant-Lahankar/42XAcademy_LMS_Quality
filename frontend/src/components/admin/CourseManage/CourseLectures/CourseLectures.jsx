import { useCallback, useState } from "react";

import { useAdminCrud } from "../../useAdminCrud";
import SearchInput from "../../../common/SearchInput/SearchInput";
import DataTable from "../../../common/DataTable/DataTable";
import FormModal from "../../../common/FormModal/FormModal";
import ConfirmButton from "../../../common/ConfirmButton/ConfirmButton";
import PageState from "../../../common/PageState/PageState";
import EmptyState from "../../../common/EmptyState/EmptyState";
import Icon from "../../../common/Icon/Icon";
import { useAsync } from "../../../../hooks/useAsync";
import { adminService } from "../../../../services/admin/adminService";
import { formatMinutes, matchesSearch } from "../../../../utils/format";
import "./CourseLectures.css";

const EMPTY_LECTURE = { moduleId: "", title: "", description: "", order: "", durationMinutes: 45, videoUrl: "", oneDriveItemId: "" };

// Course → Lectures: this course's lectures grouped under their modules.
// The lecture form only offers modules from THIS course.
function CourseLectures({ course, onChange, openTab }) {
  const loadLectures = useCallback(() => adminService.getLectures(course.id), [course.id]);
  const loadModules = useCallback(() => adminService.getModules(course.id), [course.id]);
  const modules = useAsync(loadModules);
  const crud = useAdminCrud({
    load: loadLectures,
    save: (values) => adminService.saveLecture({ ...values, courseId: course.id }),
    remove: (lecture) => adminService.deleteLecture(lecture),
    label: "Lecture",
    onChange,
  });
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");

  if (!crud.data || !modules.data) {
    return <PageState error={crud.error || modules.error} onRetry={crud.reload} />;
  }

  if (modules.data.length === 0) {
    return (
      <EmptyState
        icon="layers"
        title="Add a module first"
        message="Lectures are organised inside modules. Create the first module of this course, then add lectures."
        action={
          <button type="button" className="btn btn-primary" onClick={() => openTab("modules")}>
            Go to Modules
          </button>
        }
      />
    );
  }

  const fields = [
    { name: "course", label: "Course", type: "readonly", display: course.title },
    {
      name: "moduleId",
      label: "Module",
      type: "select",
      required: true,
      placeholder: "Select a module",
      options: modules.data.map((module) => ({ value: module.id, label: `${module.order}. ${module.title}` })),
    },
    { name: "title", label: "Lecture title", required: true, full: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "durationMinutes", label: "Duration (minutes)", type: "number" },
    { name: "order", label: "Position in module", type: "number", hint: "Leave empty to add at the end." },
    {
      name: "videoUrl",
      label: "OneDrive video link",
      type: "url",
      full: true,
      placeholder: "https://…",
      hint: "Paste the OneDrive sharing link. The backend will turn it into a protected stream for students.",
    },
    { name: "oneDriveItemId", label: "OneDrive item ID (optional)", full: true, hint: "For the Microsoft Graph integration later." },
  ];

  const visibleModules = modules.data.filter((module) => moduleFilter === "all" || module.id === moduleFilter);

  function startCreate(moduleId = "") {
    crud.setEditing({ ...EMPTY_LECTURE, moduleId });
  }

  return (
    <>
      <div className="toolbar course-tab-toolbar">
        <SearchInput id="course-lecture-search" value={query} onChange={setQuery} placeholder="Search lectures" />

        <label htmlFor="course-lecture-module" className="visually-hidden">Module</label>
        <select id="course-lecture-module" className="input" value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)}>
          <option value="all">All modules</option>
          {modules.data.map((module) => (
            <option key={module.id} value={module.id}>{module.order}. {module.title}</option>
          ))}
        </select>

        <button type="button" className="btn btn-primary" onClick={() => startCreate(moduleFilter === "all" ? "" : moduleFilter)}>
          <Icon name="plus" size={16} /> Add lecture
        </button>
      </div>

      <div className="course-lectures-groups">
        {visibleModules.map((module) => {
          const lectures = crud.data
            .filter((lecture) => lecture.moduleId === module.id)
            .filter((lecture) => matchesSearch(query, lecture.title, lecture.description));

          if (query.trim() && lectures.length === 0) {
            return null;
          }

          return (
            <section key={module.id} className="course-lectures-group" aria-labelledby={`lectures-${module.id}`}>
              <div className="course-lectures-group-head">
                <h3 id={`lectures-${module.id}`}>
                  <span className="muted">Module {module.order} —</span> {module.title}
                </h3>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => startCreate(module.id)}>
                  <Icon name="plus" size={15} /> Add lecture here
                </button>
              </div>

              <DataTable
                caption={`Lectures in ${module.title}`}
                rows={lectures}
                emptyState={<p className="muted course-lectures-empty">No lectures in this module yet.</p>}
                columns={[
                  { key: "order", header: "No.", render: (row) => row.order },
                  {
                    key: "title",
                    header: "Lecture",
                    render: (row) => (
                      <>
                        <span className="cell-title">{row.title}</span>
                        {row.description && <span className="cell-sub">{row.description}</span>}
                      </>
                    ),
                  },
                  { key: "duration", header: "Duration", render: (row) => formatMinutes(row.durationMinutes) },
                  {
                    key: "video",
                    header: "Video",
                    render: (row) =>
                      row.videoUrl || row.oneDriveItemId ? (
                        <span className="badge badge-success"><Icon name="cloud" size={12} /> Linked</span>
                      ) : (
                        <span className="badge badge-warning">Not linked</span>
                      ),
                  },
                  {
                    key: "actions",
                    header: "Actions",
                    align: "right",
                    render: (row) => (
                      <span className="cell-actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() =>
                            crud.setEditing({ ...EMPTY_LECTURE, ...row, videoUrl: row.videoUrl ?? "", oneDriveItemId: row.oneDriveItemId ?? "" })
                          }
                        >
                          <Icon name="edit" size={15} /> Edit
                        </button>
                        <ConfirmButton onConfirm={() => crud.removeItem(row)} />
                      </span>
                    ),
                  },
                ]}
              />
            </section>
          );
        })}
      </div>

      {crud.editing && (
        <FormModal
          title={crud.editing.id ? "Edit lecture" : `Add lecture to ${course.title}`}
          fields={fields}
          initialValues={crud.editing}
          submitLabel={crud.editing.id ? "Save changes" : "Add lecture"}
          onSubmit={crud.saveItem}
          onClose={() => crud.setEditing(null)}
        />
      )}
    </>
  );
}

export default CourseLectures;
