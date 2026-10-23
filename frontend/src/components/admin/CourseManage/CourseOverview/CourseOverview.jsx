import Icon from "../../../common/Icon/Icon";
import "./CourseOverview.css";

// Course → Overview: description, key details and shortcuts to the other tabs.
function CourseOverview({ course, onEdit, openTab }) {
  const shortcuts = [
    { tab: "students", icon: "users", label: "Students", value: course.studentCount, hint: "Enrolled in this course" },
    { tab: "modules", icon: "layers", label: "Modules", value: course.moduleCount, hint: "Chapters of the course" },
    { tab: "lectures", icon: "play-circle", label: "Lectures", value: course.lectureCount, hint: "Recorded sessions" },
    { tab: "resources", icon: "folder", label: "Resources", value: course.resourceCount, hint: "Notes, syllabus, files" },
  ];

  return (
    <div className="course-overview">
      <div className="course-overview-about">
        <div className="card-head">
          <h2 className="card-title">About this course</h2>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onEdit}>
            <Icon name="edit" size={15} /> Edit course
          </button>
        </div>

        <p className="course-overview-description">
          {course.description || <span className="muted">No description yet. Add one with “Edit course”.</span>}
        </p>

        <dl className="course-overview-details">
          <div><dt>Course code</dt><dd>{course.code}</dd></div>
          <div><dt>Category</dt><dd>{course.category}</dd></div>
          <div><dt>Level</dt><dd>{course.level || "—"}</dd></div>
          <div><dt>Trainer</dt><dd>{course.instructor || "—"}</dd></div>
          <div><dt>Duration</dt><dd>{course.durationWeeks ? `${course.durationWeeks} weeks` : "—"}</dd></div>
          <div><dt>Status</dt><dd>{course.status === "Published" ? "Published — visible to enrolled students" : "Draft — hidden from students"}</dd></div>
        </dl>
      </div>

      <ul className="course-overview-shortcuts">
        {shortcuts.map((item) => (
          <li key={item.tab}>
            <button type="button" onClick={() => openTab(item.tab)}>
              <Icon name={item.icon} size={20} />
              <span className="course-overview-shortcut-text">
                <strong>{item.value} {item.label}</strong>
                <small>{item.hint}</small>
              </span>
              <Icon name="chevron-right" size={18} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CourseOverview;
