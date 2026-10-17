import { useState } from "react";
import { Link } from "react-router-dom";

import { useAdminCrud } from "../useAdminCrud";
import { CATEGORIES, EMPTY_COURSE, courseFieldsFor } from "./courseFields";
import PageHeader from "../../common/PageHeader/PageHeader";
import PageState from "../../common/PageState/PageState";
import SearchInput from "../../common/SearchInput/SearchInput";
import FormModal from "../../common/FormModal/FormModal";
import ConfirmButton from "../../common/ConfirmButton/ConfirmButton";
import CourseThumb from "../../common/CourseThumb/CourseThumb";
import EmptyState from "../../common/EmptyState/EmptyState";
import Icon from "../../common/Icon/Icon";
import { useToast } from "../../../hooks/useToast";
import { adminService } from "../../../services/admin/adminService";
import { PATHS } from "../../../routes/paths";
import { matchesSearch } from "../../../utils/format";
import "../admin.css";
import "./Courses.css";

// All courses as cards. Each course is managed on its own page via "Manage course".
function Courses() {
  const showToast = useToast();
  const crud = useAdminCrud({
    load: adminService.getCourses,
    save: adminService.saveCourse,
    remove: (course) => adminService.deleteCourse(course.id),
    label: "Course",
  });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  if (!crud.data) {
    return <PageState error={crud.error} onRetry={crud.reload} />;
  }

  async function toggleStatus(course) {
    const next = course.status === "Published" ? "Draft" : "Published";
    try {
      await adminService.setCourseStatus(course.id, next);
      showToast(next === "Published" ? `${course.title} is now visible to students.` : `${course.title} is now a draft.`);
      crud.reload();
    } catch (toggleError) {
      showToast(toggleError.message, "error");
    }
  }

  const courses = crud.data.filter(
    (course) =>
      (category === "all" || course.category === category) &&
      (status === "all" || course.status === status) &&
      matchesSearch(query, course.title, course.code, course.instructor)
  );

  return (
    <>
      <PageHeader
        eyebrow="Academy"
        title="Courses"
        description="Each course has its own students, modules, lectures and resources. Open a course to manage it."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => crud.setEditing(EMPTY_COURSE)}>
            <Icon name="plus" size={16} /> Add course
          </button>
        }
      />

      <div className="toolbar admin-toolbar">
        <SearchInput id="course-search" value={query} onChange={setQuery} placeholder="Search title, code or trainer" />

        <label htmlFor="course-category" className="visually-hidden">Category</label>
        <select id="course-category" className="input" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All categories</option>
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <label htmlFor="course-status" className="visually-hidden">Status</label>
        <select id="course-status" className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>

        <span className="admin-count">{courses.length} of {crud.data.length} courses</span>
      </div>

      {courses.length === 0 ? (
        <div className="card">
          <EmptyState icon="book" title="No courses found" message="Try a different search, or add a new course." />
        </div>
      ) : (
        <ul className="admin-course-list">
          {courses.map((course) => (
            <li key={course.id} className="card admin-course-card">
              <div className="admin-course-main">
                <CourseThumb course={course} size="sm" />
                <div className="admin-course-text">
                  <h2>
                    <Link to={PATHS.admin.course(course.id)}>{course.title}</Link>
                  </h2>
                  <p className="muted">
                    {course.code} · {course.category}
                    {course.instructor && ` · ${course.instructor}`}
                  </p>
                </div>
                <span className={`badge ${course.status === "Published" ? "badge-success" : "badge-warning"}`}>
                  {course.status}
                </span>
              </div>

              <dl className="admin-course-counts">
                <div><dt>Students</dt><dd>{course.studentCount}</dd></div>
                <div><dt>Modules</dt><dd>{course.moduleCount}</dd></div>
                <div><dt>Lectures</dt><dd>{course.lectureCount}</dd></div>
                <div><dt>Resources</dt><dd>{course.resourceCount}</dd></div>
              </dl>

              <div className="admin-course-actions">
                <Link to={PATHS.admin.course(course.id)} className="btn btn-primary">
                  Manage course
                </Link>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => crud.setEditing(course)}>
                  <Icon name="edit" size={15} /> Edit
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggleStatus(course)}>
                  {course.status === "Published" ? "Move to draft" : "Publish"}
                </button>
                <ConfirmButton onConfirm={() => crud.removeItem(course)} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {crud.editing && (
        <FormModal
          title={crud.editing.id ? "Edit course" : "Add course"}
          fields={courseFieldsFor(crud.editing)}
          initialValues={crud.editing}
          submitLabel={crud.editing.id ? "Save changes" : "Add course"}
          onSubmit={crud.saveItem}
          onClose={() => crud.setEditing(null)}
        />
      )}
    </>
  );
}

export default Courses;
