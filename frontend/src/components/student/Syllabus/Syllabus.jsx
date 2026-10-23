import Icon from "../../common/Icon/Icon";
import { useResourceDownload } from "../../../hooks/useResourceDownload";
import { formatDate, formatFileSize, formatMinutes } from "../../../utils/format";
import "./Syllabus.css";

// Course syllabus: downloadable syllabus file plus the module-by-module outline.
function Syllabus({ course, modules, syllabus }) {
  const download = useResourceDownload();

  return (
    <div className="stack">
      {syllabus ? (
        <div className="syllabus-file">
          <span className="syllabus-file-icon">
            <Icon name="file" size={22} />
          </span>
          <div className="syllabus-file-body">
            <p className="syllabus-file-title">{syllabus.title}</p>
            <p className="muted">
              PDF · {formatFileSize(syllabus.sizeKb)} · Updated {formatDate(syllabus.updatedOn)}
            </p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => download(syllabus)}>
            <Icon name="download" size={16} />
            Download
          </button>
        </div>
      ) : (
        <p className="muted">The syllabus file for this course has not been uploaded yet.</p>
      )}

      <div>
        <h3 className="syllabus-heading">Course outline · {course.durationWeeks} weeks</h3>

        <ol className="syllabus-outline">
          {modules.map((module) => (
            <li key={module.id}>
              <div className="syllabus-module">
                <span className="syllabus-module-title">{module.title}</span>
                <span className="muted syllabus-module-meta">
                  {module.lectures.length} lectures ·{" "}
                  {formatMinutes(module.lectures.reduce((sum, lecture) => sum + lecture.durationMinutes, 0))}
                </span>
              </div>
              <ul>
                {module.lectures.map((lecture) => (
                  <li key={lecture.id}>{lecture.title}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default Syllabus;
