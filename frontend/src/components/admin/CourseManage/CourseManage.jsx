import { useCallback, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import CourseOverview from "./CourseOverview/CourseOverview";
import CourseStudents from "./CourseStudents/CourseStudents";
import CourseModules from "./CourseModules/CourseModules";
import CourseLectures from "./CourseLectures/CourseLectures";
import CourseResources from "./CourseResources/CourseResources";
import { courseFieldsFor } from "../Courses/courseFields";
import PageState from "../../common/PageState/PageState";
import CourseThumb from "../../common/CourseThumb/CourseThumb";
import FormModal from "../../common/FormModal/FormModal";
import Icon from "../../common/Icon/Icon";
import { useAsync } from "../../../hooks/useAsync";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { useToast } from "../../../hooks/useToast";
import { adminService } from "../../../services/admin/adminService";
import { PATHS } from "../../../routes/paths";
import "../admin.css";
import "./CourseManage.css";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "students", label: "Students" },
  { id: "modules", label: "Modules" },
  { id: "lectures", label: "Lectures" },
  { id: "resources", label: "Resources" },
];

// Manage one course: /admin/courses/:courseId?tab=students
// Every tab shows and changes ONLY data that belongs to this course.
function CourseManage() {
  const { courseId } = useParams();
  const [params, setParams] = useSearchParams();
  const showToast = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const loadCourse = useCallback(() => adminService.getCourse(courseId), [courseId]);
  const { data: course, error, reload } = useAsync(loadCourse);
  useDocumentTitle(course ? `Manage ${course.title}` : "Manage course");

  const requestedTab = params.get("tab");
  const tab = TABS.some((item) => item.id === requestedTab) ? requestedTab : "overview";

  function openTab(nextTab) {
    setParams(nextTab === "overview" ? {} : { tab: nextTab }, { replace: true });
  }

  if (!course) {
    return (
      <>
        <Link to={PATHS.admin.courses} className="course-manage-back">
          <Icon name="chevron-left" size={16} /> All courses
        </Link>
        <PageState error={error} onRetry={reload} />
      </>
    );
  }

  async function toggleStatus() {
    const next = course.status === "Published" ? "Draft" : "Published";
    try {
      await adminService.setCourseStatus(course.id, next);
      showToast(next === "Published" ? "Course published. Enrolled students can now see it." : "Course moved to draft.");
      reload();
    } catch (toggleError) {
      showToast(toggleError.message, "error");
    }
  }

  async function saveCourse(values) {
    await adminService.saveCourse(values);
    showToast("Course updated.");
    setIsEditing(false);
    reload();
  }

  const tabProps = { course, onChange: reload, openTab };

  return (
    <div className="stack">
      <Link to={PATHS.admin.courses} className="course-manage-back">
        <Icon name="chevron-left" size={16} /> All courses
      </Link>

      <header className="card card-pad course-manage-header">
        <div className="course-manage-title">
          <CourseThumb course={course} size="sm" />
          <div className="course-manage-title-text">
            <p className="course-manage-eyebrow">Manage course</p>
            <h1>{course.title}</h1>
            <p className="muted">
              {course.code} · {course.category}
              {course.instructor && ` · Trainer: ${course.instructor}`}
            </p>
          </div>
          <span className={`badge ${course.status === "Published" ? "badge-success" : "badge-warning"}`}>
            {course.status}
          </span>
        </div>

        <dl className="course-manage-counts">
          <div><dt>Students</dt><dd>{course.studentCount}</dd></div>
          <div><dt>Modules</dt><dd>{course.moduleCount}</dd></div>
          <div><dt>Lectures</dt><dd>{course.lectureCount}</dd></div>
          <div><dt>Resources</dt><dd>{course.resourceCount}</dd></div>
        </dl>

        <div className="course-manage-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(true)}>
            <Icon name="edit" size={16} /> Edit course
          </button>
          <button type="button" className="btn btn-ghost" onClick={toggleStatus}>
            {course.status === "Published" ? "Move to draft" : "Publish course"}
          </button>
        </div>
      </header>

      <section className="card card-pad">
        <div className="course-manage-tabs" role="tablist" aria-label="Course sections">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`course-tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls="course-tab-panel"
              className={`course-manage-tab ${tab === item.id ? "is-active" : ""}`}
              onClick={() => openTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div id="course-tab-panel" role="tabpanel" aria-labelledby={`course-tab-${tab}`}>
          {tab === "overview" && <CourseOverview {...tabProps} onEdit={() => setIsEditing(true)} />}
          {tab === "students" && <CourseStudents {...tabProps} />}
          {tab === "modules" && <CourseModules {...tabProps} />}
          {tab === "lectures" && <CourseLectures {...tabProps} />}
          {tab === "resources" && <CourseResources {...tabProps} />}
        </div>
      </section>

      {isEditing && (
        <FormModal
          title="Edit course"
          fields={courseFieldsFor(course)}
          initialValues={course}
          submitLabel="Save changes"
          onSubmit={saveCourse}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}

export default CourseManage;
