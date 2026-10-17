import { useCallback, useState } from "react";

import ResourceList from "./ResourceList";
import PageHeader from "../../common/PageHeader/PageHeader";
import PageState from "../../common/PageState/PageState";
import SearchInput from "../../common/SearchInput/SearchInput";
import EmptyState from "../../common/EmptyState/EmptyState";
import { useAuth } from "../../../hooks/useAuth";
import { useAsync } from "../../../hooks/useAsync";
import { studentService } from "../../../services/student/studentService";
import { matchesSearch } from "../../../utils/format";
import "./Resources.css";

// Notes & Resources: every downloadable file across the student's courses.
function Resources() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [courseId, setCourseId] = useState("all");
  const [type, setType] = useState("all");

  const loadResources = useCallback(() => studentService.getResources(user.id), [user.id]);
  const { data, error, reload } = useAsync(loadResources);

  if (!data) {
    return <PageState error={error} onRetry={reload} />;
  }

  const courses = [...new Map(data.map((item) => [item.courseId, item.courseTitle])).entries()];
  const types = [...new Set(data.map((item) => item.type))];
  const resources = data
    .filter(
      (item) =>
        (courseId === "all" || item.courseId === courseId) &&
        (type === "all" || item.type === type) &&
        matchesSearch(query, item.title, item.moduleTitle, item.courseTitle)
    )
    .sort((a, b) => b.updatedOn.localeCompare(a.updatedOn));

  return (
    <>
      <PageHeader
        eyebrow="Learn"
        title="Notes & Resources"
        description="Syllabus, notes, assignments and study material for your courses."
      />

      <div className="toolbar resources-toolbar">
        <SearchInput id="resource-search" value={query} onChange={setQuery} placeholder="Search resources" />

        <label htmlFor="resource-course" className="visually-hidden">Course</label>
        <select id="resource-course" className="input" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
          <option value="all">All courses</option>
          {courses.map(([id, title]) => (
            <option key={id} value={id}>{title}</option>
          ))}
        </select>

        <label htmlFor="resource-type" className="visually-hidden">Type</label>
        <select id="resource-type" className="input" value={type} onChange={(event) => setType(event.target.value)}>
          <option value="all">All types</option>
          {types.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <section className="card card-pad">
        {resources.length ? (
          <ResourceList resources={resources} showCourse />
        ) : (
          <EmptyState icon="folder" title="No resources found" message="Try a different search or filter." />
        )}
      </section>
    </>
  );
}

export default Resources;
