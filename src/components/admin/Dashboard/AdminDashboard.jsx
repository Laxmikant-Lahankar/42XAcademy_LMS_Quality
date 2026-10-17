import { Link } from "react-router-dom";

import PageHeader from "../../common/PageHeader/PageHeader";
import PageState from "../../common/PageState/PageState";
import StatCard from "../../common/StatCard/StatCard";
import EmptyState from "../../common/EmptyState/EmptyState";
import Icon from "../../common/Icon/Icon";
import { useAsync } from "../../../hooks/useAsync";
import { adminService } from "../../../services/admin/adminService";
import { PATHS } from "../../../routes/paths";
import { formatDate } from "../../../utils/format";
import "./AdminDashboard.css";

// Simple overview: four totals and the latest academy activity.
function AdminDashboard() {
  const { data, error, reload } = useAsync(adminService.getDashboard);

  if (!data) {
    return <PageState error={error} onRetry={reload} />;
  }

  const { stats, recentActivity } = data;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Dashboard"
        description="A quick overview of 42X Academy."
        actions={
          <>
            <Link to={PATHS.admin.students} className="btn btn-secondary">
              <Icon name="users" size={16} /> Students
            </Link>
            <Link to={PATHS.admin.courses} className="btn btn-primary">
              <Icon name="book" size={16} /> Manage courses
            </Link>
          </>
        }
      />

      <div className="stack">
        <div className="stat-grid">
          <StatCard icon="users" label="Total students" value={stats.totalStudents} hint={`${stats.activeStudents} active`} />
          <StatCard icon="book" label="Total courses" value={stats.totalCourses} />
          <StatCard icon="user-plus" label="Total enrollments" value={stats.totalEnrollments} />
          <StatCard icon="check-circle" label="Published courses" value={stats.publishedCourses} />
        </div>

        <section className="card card-pad">
          <h2 className="card-title">Recent activity</h2>

          {recentActivity.length === 0 ? (
            <EmptyState icon="clock" title="No activity yet" message="New enrollments, announcements and certificates will appear here." />
          ) : (
            <ul className="admin-activity">
              {recentActivity.map((item) => (
                <li key={item.id}>
                  <span className="admin-activity-icon">
                    <Icon name={item.icon} size={16} />
                  </span>
                  <span className="admin-activity-text">{item.text}</span>
                  <span className="admin-activity-date">{formatDate(item.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

export default AdminDashboard;
