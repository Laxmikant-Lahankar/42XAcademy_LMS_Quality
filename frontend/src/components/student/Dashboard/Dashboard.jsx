import { useCallback } from "react";
import { Link } from "react-router-dom";

import PageHeader from "../../common/PageHeader/PageHeader";
import PageState from "../../common/PageState/PageState";
import StatCard from "../../common/StatCard/StatCard";
import ProgressBar from "../../common/ProgressBar/ProgressBar";
import CourseThumb from "../../common/CourseThumb/CourseThumb";
import EmptyState from "../../common/EmptyState/EmptyState";
import Icon from "../../common/Icon/Icon";
import { useAuth } from "../../../hooks/useAuth";
import { useAsync } from "../../../hooks/useAsync";
import { studentService } from "../../../services/student/studentService";
import { PATHS } from "../../../routes/paths";
import { formatDate, formatDateTime } from "../../../utils/format";
import "./Dashboard.css";

function Dashboard() {
  const { user } = useAuth();
  const loadDashboard = useCallback(() => studentService.getDashboard(user.id), [user.id]);
  const { data, error, reload } = useAsync(loadDashboard);

  if (!data) {
    return <PageState error={error} onRetry={reload} />;
  }

  const { stats, continueLearning, courses, recentActivity, announcements } = data;
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${firstName}`}
        description="Pick up where you left off and keep track of your courses."
      />

      <div className="stack">
        <div className="stat-grid">
          <StatCard icon="book" label="Enrolled courses" value={stats.enrolledCourses} />
          <StatCard icon="check-circle" label="Lectures completed" value={stats.lecturesCompleted} />
          <StatCard icon="chart" label="Overall progress" value={`${stats.overallPercent}%`} />
          <StatCard icon="award" label="Courses completed" value={stats.coursesCompleted} />
        </div>

        <div className="dashboard-grid">
          <div className="stack">
            <section className="card card-pad">
              <h2 className="card-title">Continue learning</h2>

              {continueLearning ? (
                <div className="continue-card">
                  <CourseThumb course={continueLearning.course} size="sm" />

                  <div className="continue-card-body">
                    <p className="continue-card-course">{continueLearning.course.title}</p>
                    <p className="continue-card-lecture">{continueLearning.lecture.title}</p>
                    <p className="muted continue-card-meta">
                      {continueLearning.module?.title} · Last watched {formatDateTime(continueLearning.watchedAt)}
                    </p>
                  </div>

                  <Link
                    className="btn btn-primary"
                    to={PATHS.student.lecture(continueLearning.course.id, continueLearning.lecture.id)}
                  >
                    <Icon name="play" size={14} />
                    Resume
                  </Link>
                </div>
              ) : (
                <EmptyState
                  icon="play-circle"
                  title="No lecture watched yet"
                  message="Open one of your courses to start your first lecture."
                />
              )}
            </section>

            <section className="card card-pad">
              <div className="card-head">
                <h2 className="card-title">My courses</h2>
                <Link to={PATHS.student.courses} className="dashboard-link">View all</Link>
              </div>

              {courses.length === 0 ? (
                <EmptyState icon="book" title="No courses yet" message="Your enrolled courses will appear here." />
              ) : (
                <ul className="dashboard-courses">
                  {courses.map((course) => (
                    <li key={course.id}>
                      <CourseThumb course={course} size="sm" />
                      <div className="dashboard-course-body">
                        <Link to={PATHS.student.course(course.id)} className="dashboard-course-title">
                          {course.title}
                        </Link>
                        <p className="muted dashboard-course-meta">
                          {course.progress.completed} of {course.progress.total} lectures
                        </p>
                        <ProgressBar percent={course.progress.percent} label={`${course.title} progress`} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="stack">
            <section className="card card-pad">
              <div className="card-head">
                <h2 className="card-title">Announcements</h2>
                <Link to={PATHS.student.announcements} className="dashboard-link">See all</Link>
              </div>

              {announcements.length === 0 ? (
                <p className="muted">No announcements right now.</p>
              ) : (
                <ul className="dashboard-list">
                  {announcements.map((item) => (
                    <li key={item.id}>
                      <p className="dashboard-list-title">
                        {item.pinned && <Icon name="pin" size={14} />}
                        {item.title}
                      </p>
                      <p className="muted dashboard-list-meta">
                        {item.courseTitle ?? "All students"} · {formatDate(item.postedOn)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card card-pad">
              <h2 className="card-title">Recent activity</h2>

              {recentActivity.length === 0 ? (
                <p className="muted">Your learning activity will show here.</p>
              ) : (
                <ul className="dashboard-list">
                  {recentActivity.map((item) => (
                    <li key={item.id}>
                      <p className="dashboard-list-title">{item.text}</p>
                      <p className="muted dashboard-list-meta">{formatDateTime(item.at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
