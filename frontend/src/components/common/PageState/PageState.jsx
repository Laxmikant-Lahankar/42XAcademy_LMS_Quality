import Icon from "../Icon/Icon";
import "./PageState.css";

// Loading or error placeholder for a page or a card while data is fetched.
//   if (!data) return <PageState error={error} onRetry={reload} />;
function PageState({ error, onRetry }) {
  if (error) {
    return (
      <div className="page-state page-state-error" role="alert">
        <Icon name="alert" size={26} />
        <p>{error.message || "Something went wrong while loading this page."}</p>
        {onRetry && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="page-state" aria-busy="true">
      <span className="page-state-spinner" aria-hidden="true"></span>
      <p>Loading…</p>
    </div>
  );
}

export default PageState;
