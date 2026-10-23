import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import "./PageHeader.css";

// Title row at the top of every page. `actions` renders on the right (buttons).
// Also sets the browser tab title.
function PageHeader({ title, description, actions, eyebrow }) {
  useDocumentTitle(title);

  return (
    <div className="page-header">
      <div className="page-header-text">
        {eyebrow && <p className="page-header-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-header-description">{description}</p>}
      </div>

      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}

export default PageHeader;
