import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ModuleList from "../Modules/ModuleList";
import Syllabus from "../Syllabus/Syllabus";
import ResourceList from "../Resources/ResourceList";
import PageState from "../../common/PageState/PageState";
import ProgressBar from "../../common/ProgressBar/ProgressBar";
import CourseThumb from "../../common/CourseThumb/CourseThumb";
import EmptyState from "../../common/EmptyState/EmptyState";
import Icon from "../../common/Icon/Icon";
import { useAuth } from "../../../hooks/useAuth";
import { useAsync } from "../../../hooks/useAsync";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { studentService } from "../../../services/student/studentService";
import { PATHS } from "../../../routes/paths";
import { formatMinutes } from "../../../utils/format";
import "./CourseDetails.css";

const TABS = [
  { id: "modules", label: "Modules" },
  { id: "syllabus", label: "Syllabus" },
  { id: "resources", label: "Notes & Resources" },
];

function CourseDetails() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [tab, setTab] = useState("modules");

  const loadCourse = useCallback(() => studentService.getCourseDetails(user.id, courseId), [user.id, courseId]);
  const { data, error, reload } = useAsync(loadCourse);
  useDocumentTitle(data?.course.title ?? "Course");

  if (!data) {
    return <PageState error={error} onRetry={reload} />;
  }

  const { course, modules, resources, syllabus } = data;
  const lectureCount = modules.reduce((sum, module) => sum + module.lectures.length, 0);

  return (
    <div className="stack">
      <Link to={PATHS.student.courses} className="course-back">
        <Icon name="chevron-left" size={16} /> My Courses
      </Link>

      <section className="card course-hero">
        <CourseThumb course={course} />

        <div className="course-hero-body">
          <span className="badge badge-primary">{course.category} · {course.level}</span>
          <h1>{course.title}</h1>
          <p className="muted">{course.description}</p>

          <dl className="course-facts">
            <div><dt>Trainer</dt><dd>{course.instructor}</dd></div>
            <div><dt>Duration</dt><dd>{course.durationWeeks} weeks</dd></div>
            <div><dt>Modules</dt><dd>{modules.length}</dd></div>
            <div><dt>Lectures</dt><dd>{lectureCount} · {formatMinutes(course.totalMinutes)}</dd></div>
          </dl>

          <div className="course-hero-progress">
            <ProgressBar percent={course.progress.percent} label="Course progress" />
            <span className="muted">
              {course.progress.completed} of {course.progress.total} lectures completed
            </span>
          </div>

          {course.nextLectureId && (
            <Link to={PATHS.student.lecture(course.id, course.nextLectureId)} className="btn btn-primary course-hero-cta">
              <Icon name="play" size={14} />
              {course.progress.completed === 0 ? "Start first lecture" : "Continue learning"}
            </Link>
          )}
        </div>
      </section>

      <section className="card card-pad">
        <div className="course-tabs" role="tablist" aria-label="Course sections">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls={`panel-${item.id}`}
              className={`course-tab ${tab === item.id ? "is-active" : ""}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="course-tab-panel">
          {tab === "modules" &&
            (modules.length ? (
              <ModuleList courseId={course.id} modules={modules} activeLectureId={course.nextLectureId} />
            ) : (
              <EmptyState icon="layers" title="No modules yet" message="Modules will appear here once they are published." />
            ))}

          {tab === "syllabus" && <Syllabus course={course} modules={modules} syllabus={syllabus} />}

          {tab === "resources" &&
            (resources.length ? (
              <ResourceList resources={resources.map((item) => ({
                ...item,
                moduleTitle: modules.find((module) => module.id === item.moduleId)?.title ?? null,
              }))} />
            ) : (
              <EmptyState icon="folder" title="No resources yet" message="Notes and assignments will appear here." />
            ))}
        </div>
      </section>
    </div>
  );
}

export default CourseDetails;
