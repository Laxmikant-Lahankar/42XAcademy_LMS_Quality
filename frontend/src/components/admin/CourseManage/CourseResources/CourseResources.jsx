import { useCallback, useState } from "react";

import { useAdminCrud } from "../../useAdminCrud";
import { RESOURCE_TYPES } from "../../adminConstants";
import SearchInput from "../../../common/SearchInput/SearchInput";
import DataTable from "../../../common/DataTable/DataTable";
import FormModal from "../../../common/FormModal/FormModal";
import ConfirmButton from "../../../common/ConfirmButton/ConfirmButton";
import PageState from "../../../common/PageState/PageState";
import EmptyState from "../../../common/EmptyState/EmptyState";
import Icon from "../../../common/Icon/Icon";
import { useAsync } from "../../../../hooks/useAsync";
import { adminService } from "../../../../services/admin/adminService";
import { formatDate, formatFileSize, matchesSearch } from "../../../../utils/format";
import "./CourseResources.css";

const EMPTY_RESOURCE = { title: "", type: "Notes", moduleId: "", lectureId: "", fileUrl: "", sizeKb: "", description: "" };

// Course → Resources: files for this course, optionally linked to one module or lecture.
function CourseResources({ course, onChange }) {
  const loadResources = useCallback(() => adminService.getResources(course.id), [course.id]);
  const loadModules = useCallback(() => adminService.getModules(course.id), [course.id]);
  const loadLectures = useCallback(() => adminService.getLectures(course.id), [course.id]);
  const modules = useAsync(loadModules);
  const lectures = useAsync(loadLectures);
  const crud = useAdminCrud({
    load: loadResources,
    save: (values) => adminService.saveResource({ ...values, courseId: course.id }),
    remove: (resource) => adminService.deleteResource(resource),
    label: "Resource",
    onChange,
  });
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");

  if (!crud.data || !modules.data || !lectures.data) {
    return <PageState error={crud.error || modules.error || lectures.error} onRetry={crud.reload} />;
  }

  const fields = [
    { name: "course", label: "Course", type: "readonly", display: course.title },
    { name: "type", label: "Type", type: "select", options: RESOURCE_TYPES.map((value) => ({ value, label: value })) },
    { name: "title", label: "Title", required: true, full: true },
    {
      name: "moduleId",
      label: "Module (optional)",
      type: "select",
      placeholder: "Whole course",
      options: modules.data.map((module) => ({ value: module.id, label: `${module.order}. ${module.title}` })),
      resets: ["lectureId"],
    },
    {
      name: "lectureId",
      label: "Lecture (optional)",
      type: "select",
      placeholder: "Whole module",
      options: (values) =>
        lectures.data
          .filter((lecture) => lecture.moduleId === values.moduleId)
          .map((lecture) => ({ value: lecture.id, label: `${lecture.order}. ${lecture.title}` })),
    },
    {
      name: "fileUrl",
      label: "OneDrive / file link",
      type: "url",
      full: true,
      placeholder: "https://…",
      hint: "Files stay on OneDrive. Students get the download through the backend.",
    },
    { name: "sizeKb", label: "File size (KB)", type: "number" },
    { name: "description", label: "Description", type: "textarea" },
  ];

  const rows = crud.data.filter(
    (item) => (type === "all" || item.type === type) && matchesSearch(query, item.title, item.description, item.moduleTitle)
  );

  return (
    <>
      <div className="toolbar course-tab-toolbar">
        <SearchInput id="course-resource-search" value={query} onChange={setQuery} placeholder="Search resources" />

        <label htmlFor="course-resource-type" className="visually-hidden">Type</label>
        <select id="course-resource-type" className="input" value={type} onChange={(event) => setType(event.target.value)}>
          <option value="all">All types</option>
          {RESOURCE_TYPES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <button type="button" className="btn btn-primary" onClick={() => crud.setEditing(EMPTY_RESOURCE)}>
          <Icon name="plus" size={16} /> Add resource
        </button>
      </div>

      <DataTable
        caption={`Resources in ${course.title}`}
        rows={rows}
        emptyState={
          <EmptyState
            icon="folder"
            title={crud.data.length ? "No resources match" : "No resources yet"}
            message={crud.data.length ? "Try a different search or type." : "Add the syllabus, notes or assignments for this course."}
          />
        }
        columns={[
          {
            key: "title",
            header: "Resource", sortValue: (row) => row.title,
            render: (row) => (
              <>
                <span className="cell-title">{row.title}</span>
                {row.description && <span className="cell-sub">{row.description}</span>}
              </>
            ),
          },
          { key: "type", header: "Type", sortValue: (row) => row.type, render: (row) => <span className="badge">{row.type}</span> },
          {
            key: "linked",
            header: "Linked to",
            render: (row) => (
              <span className="course-resources-link">
                {row.lectureTitle ?? row.moduleTitle ?? "Whole course"}
                {row.lectureTitle && <span className="cell-sub">{row.moduleTitle}</span>}
              </span>
            ),
          },
          {
            key: "file",
            header: "File",
            render: (row) => (
              <>
                {row.fileUrl ? <span className="badge badge-success">Linked</span> : <span className="badge badge-warning">Not linked</span>}
                <span className="cell-sub">{formatFileSize(row.sizeKb)} · {formatDate(row.updatedOn)}</span>
              </>
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
                    crud.setEditing({
                      ...EMPTY_RESOURCE,
                      ...row,
                      moduleId: row.moduleId ?? "",
                      lectureId: row.lectureId ?? "",
                      fileUrl: row.fileUrl ?? "",
                      description: row.description ?? "",
                    })
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

      {crud.editing && (
        <FormModal
          title={crud.editing.id ? "Edit resource" : `Add resource to ${course.title}`}
          fields={fields}
          initialValues={crud.editing}
          submitLabel={crud.editing.id ? "Save changes" : "Add resource"}
          onSubmit={crud.saveItem}
          onClose={() => crud.setEditing(null)}
        />
      )}
    </>
  );
}

export default CourseResources;
