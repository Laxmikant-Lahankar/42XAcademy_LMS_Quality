import { useCallback, useState } from "react";

import PageHeader from "../../common/PageHeader/PageHeader";
import PageState from "../../common/PageState/PageState";
import SearchInput from "../../common/SearchInput/SearchInput";
import EmptyState from "../../common/EmptyState/EmptyState";
import Icon from "../../common/Icon/Icon";
import { useAuth } from "../../../hooks/useAuth";
import { useAsync } from "../../../hooks/useAsync";
import { studentService } from "../../../services/student/studentService";
import { formatDate, matchesSearch } from "../../../utils/format";
import "./Announcements.css";

// Announcements for all students and for the student's own courses.
function Announcements() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");

  const loadAnnouncements = useCallback(() => studentService.getAnnouncements(user.id), [user.id]);
  const { data, error, reload } = useAsync(loadAnnouncements);

  if (!data) {
    return <PageState error={error} onRetry={reload} />;
  }

  const courseOptions = [...new Map(data.filter((item) => item.courseId).map((item) => [item.courseId, item.courseTitle])).entries()];
  const items = data.filter(
    (item) =>
      (scope === "all" || (scope === "general" ? item.courseId === null : item.courseId === scope)) &&
      matchesSearch(query, item.title, item.message)
  );

  return (
    <>
      <PageHeader eyebrow="Account" title="Announcements" description="Updates from 42X Academy and your trainers." />

      <div className="toolbar announcements-toolbar">
        <SearchInput id="announcement-search" value={query} onChange={setQuery} placeholder="Search announcements" />

        <label htmlFor="announcement-scope" className="visually-hidden">Show</label>
        <select id="announcement-scope" className="input" value={scope} onChange={(event) => setScope(event.target.value)}>
          <option value="all">All announcements</option>
          <option value="general">For all students</option>
          {courseOptions.map(([id, title]) => (
            <option key={id} value={id}>{title}</option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <div className="card">
          <EmptyState icon="megaphone" title="No announcements" message="Nothing matches your search right now." />
        </div>
      ) : (
        <ul className="announcement-list">
          {items.map((item) => (
            <li key={item.id} className={`card card-pad announcement ${item.pinned ? "is-pinned" : ""}`}>
              <div className="announcement-head">
                <h2>{item.title}</h2>
                {item.pinned && (
                  <span className="badge badge-primary">
                    <Icon name="pin" size={12} /> Pinned
                  </span>
                )}
              </div>
              <p className="announcement-message">{item.message}</p>
              <p className="muted announcement-meta">
                {item.courseTitle ?? "All students"} · {item.postedBy} · {formatDate(item.postedOn)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default Announcements;
