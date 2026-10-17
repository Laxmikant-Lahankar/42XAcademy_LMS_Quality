import { Link } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader/PageHeader";
import EmptyState from "../../components/common/EmptyState/EmptyState";

function NotFound() {
  return (
    <>
      <PageHeader title="Page not found" />
      <div className="card">
        <EmptyState
          icon="alert"
          title="This page does not exist"
          message="The link may be wrong or the page has moved."
          action={
            <Link to="/" className="btn btn-primary">
              Go to dashboard
            </Link>
          }
        />
      </div>
    </>
  );
}

export default NotFound;
