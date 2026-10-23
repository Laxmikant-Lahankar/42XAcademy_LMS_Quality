import { useCallback } from "react";
import { Link } from "react-router-dom";

import PageHeader from "../../common/PageHeader/PageHeader";
import PageState from "../../common/PageState/PageState";
import ProgressBar from "../../common/ProgressBar/ProgressBar";
import CourseThumb from "../../common/CourseThumb/CourseThumb";
import EmptyState from "../../common/EmptyState/EmptyState";
import Icon from "../../common/Icon/Icon";
import { useAuth } from "../../../hooks/useAuth";
import { useAsync } from "../../../hooks/useAsync";
import { useToast } from "../../../hooks/useToast";
import { studentService } from "../../../services/student/studentService";
import { PATHS } from "../../../routes/paths";
import { formatDate, formatDateTime } from "../../../utils/format";
import "./Progress.css";

// Progress tracking: course completion, module breakdown, last watched lecture and certificates.
function Progress() {
  const { user } = useAuth();
  const showToast = useToast();
  const loadProgress = useCallback(() => studentService.getProgress(user.id), [user.id]);
  const { data, error, reload } = useAsync(loadProgress);

  if (!data) {
    return <PageState error={error} onRetry={reload} />;
  }

  const { courses, lastWatched } = data;

  return (
    <>
      <PageHeader eyebrow="Learn" title="My Progress" description="Course completion, module by module." />

      <div className="stack">
        {lastWatched && (
          <section className="card card-pad progress-last">
            <Icon name="clock" size={20} />
            <p>
              Last watched <strong>{lastWatched.lecture.title}</strong> in {lastWatched.course.title} ·{" "}
              {formatDateTime(lastWatched.watchedAt)}
            </p>
            <Link to={PATHS.student.lecture(lastWatched.course.id, lastWatched.lecture.id)} className="btn btn-primary btn-sm">
              Resume
            </Link>
          </section>
        )}

        {courses.length === 0 && (
          <div className="card">
            <EmptyState icon="chart" title="No progress yet" message="Enroll in a course to start tracking progress." />
          </div>
        )}

        {courses.map((course) => (
          <section key={course.id} className="card card-pad progress-course">
            <div className="progress-course-head">
              <CourseThumb course={course} size="sm" />
              <div className="progress-course-title">
                <Link to={PATHS.student.course(course.id)}>{course.title}</Link>
                <p className="muted">
                  {course.progress.completed} of {course.progress.total} lectures completed
                </p>
              </div>
              <div className="progress-course-bar">
                <ProgressBar percent={course.progress.percent} label={`${course.title} progress`} />
              </div>
            </div>

            <ul className="progress-modules">
              {course.modules.map((module) => {
                const percent = module.total ? (module.completed / module.total) * 100 : 0;
                return (
                  <li key={module.id}>
                    <span className="progress-module-title">{module.title}</span>
                    <span className="muted progress-module-count">
                      {module.completed}/{module.total}
                    </span>
                    <ProgressBar percent={percent} showLabel={false} label={`${module.title} progress`} />
                  </li>
                );
              })}
            </ul>

            <div className="progress-certificate">
              <Icon name="award" size={18} />
              {course.certificate?.status === "Issued" ? (
                <>
                  <span>
                    Certificate issued on {formatDate(course.certificate.issuedOn)} · No. {course.certificate.certificateNo}
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => showToast("Certificate download will be available once the backend is connected.", "info")}
                  >
                    <Icon name="download" size={15} /> Download
                  </button>
                </>
              ) : course.progress.percent === 100 ? (
                <span>Course complete. Your certificate is being prepared by 42X Academy.</span>
              ) : (
                <span className="muted">Complete all lectures to become eligible for the certificate.</span>
              )}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

export default Progress;
