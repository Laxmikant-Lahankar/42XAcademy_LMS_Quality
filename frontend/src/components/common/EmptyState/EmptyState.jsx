import Icon from "../Icon/Icon";
import "./EmptyState.css";

// Friendly message when a list has nothing to show.
function EmptyState({ icon = "folder", title, message, action }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">
        <Icon name={icon} size={26} />
      </span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export default EmptyState;
