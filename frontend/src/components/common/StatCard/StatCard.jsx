import Icon from "../Icon/Icon";
import "./StatCard.css";

// Small summary tile: icon, label, value and an optional hint line.
function StatCard({ icon, label, value, hint }) {
  return (
    <div className="stat-card card">
      <span className="stat-card-icon">
        <Icon name={icon} size={20} />
      </span>

      <div className="stat-card-body">
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value}</p>
        {hint && <p className="stat-card-hint">{hint}</p>}
      </div>
    </div>
  );
}

export default StatCard;
