import { Component } from "react";

import Icon from "../Icon/Icon";
import "./ErrorBoundary.css";

// Catches render errors so users see a friendly message instead of a blank page.
// Also handles the common deploy case where an old page tries to load a file from a previous version.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // TODO: send to a logging service (e.g. Azure Application Insights) once one is chosen.
    console.error("LMS page error:", error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) {
      return this.props.children;
    }

    const isNewVersion = /dynamically imported module|Loading chunk|Importing a module script failed/i.test(error.message ?? "");

    return (
      <div className="error-boundary" role="alert">
        <span className="error-boundary-icon">
          <Icon name="alert" size={28} />
        </span>
        <h1>{isNewVersion ? "A new version of the LMS is available" : "Something went wrong on this page"}</h1>
        <p>
          {isNewVersion
            ? "Reload the page to continue with the latest version."
            : "Please reload the page. If the problem continues, contact 42X Academy support."}
        </p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
