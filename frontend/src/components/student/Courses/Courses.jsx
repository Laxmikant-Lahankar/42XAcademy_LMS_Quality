import { useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";

import CourseCard from "./CourseCard";
import PageHeader from "../../common/PageHeader/PageHeader";
import PageState from "../../common/PageState/PageState";
import SearchInput from "../../common/SearchInput/SearchInput";
import EmptyState from "../../common/EmptyState/EmptyState";
import Icon from "../../common/Icon/Icon";
import { useAuth } from "../../../hooks/useAuth";
import { useAsync } from "../../../hooks/useAsync";
import { studentService } from "../../../services/student/studentService";
import { PATHS } from "../../../routes/paths";
import { matchesSearch } from "../../../utils/format";
import "./Courses.css";

const STATUS_FILTERS = {
  all: () => true,
  "in-progress": (course) => course.progress.percent > 0 && course.progress.percent < 100,
  "not-started": (course) => course.progress.percent === 0,
  completed: (course) => course.progress.percent === 100,
};

// "My Courses": enrolled courses with search (courses + lectures) and filters.
// Filters live in the URL (?q=&category=&status=) so the header search can link here.
function Courses() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const loadCourses = useCallback(() => studentService.getMyCourses(user.id), [user.id]);
  const { data, error, reload } = useAsync(loadCourses);

  const query = params.get("q") ?? "";
  const category = params.get("category") ?? "all";
  const status = params.get("status") ?? "all";

  function setParam(key, value) {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }

  if (!data) {
    return <PageState error={error} onRetry={reload} />;
  }

  const categories = [...new Set(data.courses.map((course) => course.category))];
  const courses = data.courses.filter(
    (course) =>
      (category === "all" || course.category === category) &&
      (STATUS_FILTERS[status] ?? STATUS_FILTERS.all)(course) &&
      matchesSearch(query, course.title, course.code, course.instructor, course.category)
  );
  const lectureMatches = query.trim()
    ? data.lectureIndex.filter((lecture) => matchesSearch(query, lecture.title, lecture.moduleTitle))
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Learn"
        title="My Courses"
        description="All courses you are enrolled in. Search by course or lecture name."
      />

      <div className="toolbar courses-toolbar">
        <SearchInput
          id="course-search"
          value={query}
          onChange={(value) => setParam("q", value)}
          placeholder="Search courses or lectures"
        />

        <label htmlFor="course-category" className="visually-hidden">Category</label>
        <select
          id="course-category"
          className="input"
          value={category}
          onChange={(event) => setParam("category", event.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <label htmlFor="course-status" className="visually-hidden">Status</label>
        <select
          id="course-status"
          className="input"
          value={status}
          onChange={(event) => setParam("status", event.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="in-progress">In progress</option>
          <option value="not-started">Not started</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {lectureMatches.length > 0 && (
        <section className="card card-pad courses-lecture-matches">
          <h2 className="card-title">
            {lectureMatches.length} matching lecture{lectureMatches.length === 1 ? "" : "s"}
          </h2>
          <ul>
            {lectureMatches.map((lecture) => (
              <li key={lecture.id}>
                <Icon name="play-circle" size={18} />
                <Link to={PATHS.student.lecture(lecture.courseId, lecture.id)}>{lecture.title}</Link>
                <span className="muted">
                  {lecture.courseTitle} · {lecture.moduleTitle}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {courses.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="search"
            title="No courses match"
            message={data.courses.length === 0 ? "You are not enrolled in any course yet." : "Try a different search or filter."}
          />
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </>
  );
}

export default Courses;
