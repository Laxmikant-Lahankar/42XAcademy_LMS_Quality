import "./ProgressBar.css";

// Course / module progress bar. Shows the percentage label unless showLabel is false.
function ProgressBar({ percent, showLabel = true, label = "Progress" }) {
  const value = Math.min(100, Math.max(0, Math.round(percent || 0)));

  return (
    <div className="progress">
      <div
        className="progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={`progress-fill ${value === 100 ? "is-complete" : ""}`} style={{ width: `${value}%` }}></div>
      </div>

      {showLabel && <span className="progress-label">{value}%</span>}
    </div>
  );
}

export default ProgressBar;
