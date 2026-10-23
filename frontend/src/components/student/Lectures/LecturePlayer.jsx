import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";

import VideoPlayer from "./VideoPlayer";
import ResourceList from "../Resources/ResourceList";
import PageState from "../../common/PageState/PageState";
import Icon from "../../common/Icon/Icon";
import { useAuth } from "../../../hooks/useAuth";
import { useAsync } from "../../../hooks/useAsync";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { useToast } from "../../../hooks/useToast";
import { studentService } from "../../../services/student/studentService";
import { PATHS } from "../../../routes/paths";
import { formatMinutes } from "../../../utils/format";
import "./Lectures.css";

// Lecture page: video, previous/next navigation, mark as complete, module lectures and resources.
function LecturePlayer() {
  const { courseId, lectureId } = useParams();
  const { user } = useAuth();
  const showToast = useToast();
  const [saving, setSaving] = useState(false);

  const loadLecture = useCallback(
    () => studentService.getLecture(user.id, courseId, lectureId),
    [user.id, courseId, lectureId]
  );
  const { data, error, reload, setData } = useAsync(loadLecture);
  useDocumentTitle(data?.lecture.title ?? "Lecture");

  if (!data) {
    return <PageState error={error} onRetry={reload} />;
  }

  const { course, module, lecture, previous, next, moduleLectures, resources, position } = data;

  async function toggleComplete() {
    const completed = !lecture.completed;
    setSaving(true);
    try {
      await studentService.setLectureComplete(user.id, lecture.id, completed);
      setData((current) => ({
        ...current,
        lecture: { ...current.lecture, completed },
        moduleLectures: current.moduleLectures.map((item) =>
          item.id === lecture.id ? { ...item, completed } : item
        ),
      }));
      showToast(completed ? "Lecture marked as complete." : "Lecture marked as not complete.");
    } catch (toggleError) {
      showToast(toggleError.message || "Could not update progress.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="lecture-page">
      <nav className="lecture-breadcrumb" aria-label="Breadcrumb">
        <Link to={PATHS.student.courses}>My Courses</Link>
        <Icon name="chevron-right" size={14} />
        <Link to={PATHS.student.course(course.id)}>{course.title}</Link>
        <Icon name="chevron-right" size={14} />
        <span>{module?.title}</span>
      </nav>

      <div className="lecture-layout">
        <div className="lecture-main">
          <VideoPlayer lecture={lecture} />

          <div className="lecture-info">
            <p className="lecture-position">
              Lecture {position.current} of {position.total} · {formatMinutes(lecture.durationMinutes)}
            </p>
            <h1>{lecture.title}</h1>
            {lecture.description && <p className="muted lecture-description">{lecture.description}</p>}
          </div>

          <div className="lecture-actions">
            {previous ? (
              <Link to={PATHS.student.lecture(course.id, previous.id)} className="btn btn-secondary">
                <Icon name="chevron-left" size={16} /> Previous
              </Link>
            ) : (
              <span className="lecture-action-spacer"></span>
            )}

            <button
              type="button"
              className={`btn ${lecture.completed ? "btn-secondary lecture-done-button" : "btn-primary"}`}
              onClick={toggleComplete}
              disabled={saving}
              aria-pressed={lecture.completed}
            >
              <Icon name={lecture.completed ? "check-circle" : "check"} size={16} />
              {lecture.completed ? "Completed" : "Mark as complete"}
            </button>

            {next ? (
              <Link to={PATHS.student.lecture(course.id, next.id)} className="btn btn-secondary">
                Next <Icon name="chevron-right" size={16} />
              </Link>
            ) : (
              <Link to={PATHS.student.course(course.id)} className="btn btn-secondary">
                Back to course
              </Link>
            )}
          </div>

          {resources.length > 0 && (
            <section className="card card-pad">
              <h2 className="card-title">Resources for this module</h2>
              <ResourceList resources={resources} compact />
            </section>
          )}
        </div>

        <aside className="card card-pad lecture-side" aria-label="Lectures in this module">
          <p className="lecture-side-eyebrow">Module {module?.order}</p>
          <h2 className="card-title">{module?.title}</h2>

          <ol className="lecture-side-list">
            {moduleLectures.map((item) => (
              <li key={item.id} className={item.id === lecture.id ? "is-current" : ""}>
                <Icon
                  name={item.completed ? "check-circle" : item.id === lecture.id ? "play-circle" : "circle"}
                  size={18}
                  className={item.completed ? "lecture-done" : "lecture-todo"}
                />
                <Link to={PATHS.student.lecture(course.id, item.id)} aria-current={item.id === lecture.id ? "page" : undefined}>
                  {item.title}
                </Link>
                <span className="muted">{formatMinutes(item.durationMinutes)}</span>
              </li>
            ))}
          </ol>

          <Link to={PATHS.student.course(course.id)} className="lecture-side-all">
            View all modules
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default LecturePlayer;
