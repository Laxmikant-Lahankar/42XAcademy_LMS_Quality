import Icon from "../../common/Icon/Icon";
import { useResourceDownload } from "../../../hooks/useResourceDownload";
import { formatDate, formatFileSize } from "../../../utils/format";
import "./ResourceList.css";

const TYPE_BADGES = {
  Syllabus: "badge-primary",
  Notes: "badge-success",
  Assignment: "badge-warning",
};

// List of downloadable learning materials. Used on the Resources page, course page and lecture page.
function ResourceList({ resources, showCourse = false, compact = false }) {
  const download = useResourceDownload();

  return (
    <ul className={`resource-list ${compact ? "is-compact" : ""}`}>
      {resources.map((resource) => (
        <li key={resource.id} className="resource-item">
          <span className="resource-icon">
            <Icon name="file" size={20} />
          </span>

          <div className="resource-body">
            <p className="resource-title">{resource.title}</p>
            <p className="muted resource-meta">
              <span className={`badge ${TYPE_BADGES[resource.type] ?? ""}`}>{resource.type}</span>
              {showCourse && <span>{resource.courseTitle}</span>}
              {resource.moduleTitle && <span>{resource.moduleTitle}</span>}
              <span>{formatFileSize(resource.sizeKb)}</span>
              {!compact && <span>Updated {formatDate(resource.updatedOn)}</span>}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => download(resource)}
            aria-label={`Download ${resource.title}`}
          >
            <Icon name="download" size={15} />
            <span className="resource-download-text">Download</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default ResourceList;
