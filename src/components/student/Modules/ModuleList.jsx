import { useState } from "react";
import { Link } from "react-router-dom";

import Icon from "../../common/Icon/Icon";
import { PATHS } from "../../../routes/paths";
import { formatMinutes } from "../../../utils/format";
import "./ModuleList.css";

// Course modules (chapters) as an accordion with lectures and completion state.
function ModuleList({ courseId, modules, activeLectureId }) {
  const firstOpen =
    modules.find((module) => module.lectures.some((lecture) => lecture.id === activeLectureId)) ??
    modules.find((module) => module.lectures.some((lecture) => !lecture.completed)) ??
    modules[0];

  const [openIds, setOpenIds] = useState(() => new Set(firstOpen ? [firstOpen.id] : []));

  function toggle(moduleId) {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  return (
    <ol className="module-list">
      {modules.map((module) => {
        const isOpen = openIds.has(module.id);
        const done = module.lectures.filter((lecture) => lecture.completed).length;
        const minutes = module.lectures.reduce((sum, lecture) => sum + lecture.durationMinutes, 0);
        const panelId = `module-panel-${module.id}`;

        return (
          <li key={module.id} className={`module ${isOpen ? "is-open" : ""}`}>
            <button
              type="button"
              className="module-head"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(module.id)}
            >
              <span className="module-number">Module {module.order}</span>
              <span className="module-title">{module.title}</span>
              <span className="module-meta">
                {done}/{module.lectures.length} done · {formatMinutes(minutes)}
              </span>
              <Icon name="chevron-down" size={18} className="module-chevron" />
            </button>

            {isOpen && (
              <ul id={panelId} className="module-lectures">
                {module.lectures.map((lecture) => (
                  <li key={lecture.id} className={lecture.id === activeLectureId ? "is-active" : ""}>
                    <Icon
                      name={lecture.completed ? "check-circle" : "circle"}
                      size={18}
                      className={lecture.completed ? "lecture-done" : "lecture-todo"}
                    />
                    <Link to={PATHS.student.lecture(courseId, lecture.id)}>{lecture.title}</Link>
                    <span className="muted module-lecture-time">{formatMinutes(lecture.durationMinutes)}</span>
                  </li>
                ))}
                {module.lectures.length === 0 && <li className="muted">No lectures in this module yet.</li>}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default ModuleList;
