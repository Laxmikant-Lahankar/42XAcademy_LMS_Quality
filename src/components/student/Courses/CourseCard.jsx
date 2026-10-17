import { Link } from "react-router-dom";

import CourseThumb from "../../common/CourseThumb/CourseThumb";
import ProgressBar from "../../common/ProgressBar/ProgressBar";
import { PATHS } from "../../../routes/paths";
import { formatMinutes } from "../../../utils/format";

// One enrolled course in the "My Courses" grid.
function CourseCard({ course }) {
  const { percent } = course.progress;
  const actionLabel = percent === 0 ? "Start course" : percent === 100 ? "Review course" : "Continue";
  const actionPath = course.nextLectureId
    ? PATHS.student.lecture(course.id, course.nextLectureId)
    : PATHS.student.course(course.id);

  return (
    <article className="course-card card">
      <CourseThumb course={course} />

      <div className="course-card-body">
        <span className="badge badge-primary">{course.category}</span>

        <h2 className="course-card-title">
          <Link to={PATHS.student.course(course.id)}>{course.title}</Link>
        </h2>

        <p className="muted course-card-meta">
          {course.instructor} · {course.moduleCount} modules · {formatMinutes(course.totalMinutes)}
        </p>

        <ProgressBar percent={percent} label={`${course.title} progress`} />
        <p className="muted course-card-meta">
          {course.progress.completed} of {course.progress.total} lectures completed
        </p>
      </div>

      <div className="course-card-actions">
        <Link to={actionPath} className="btn btn-primary">{actionLabel}</Link>
        <Link to={PATHS.student.course(course.id)} className="btn btn-secondary">Details</Link>
      </div>
    </article>
  );
}

export default CourseCard;
