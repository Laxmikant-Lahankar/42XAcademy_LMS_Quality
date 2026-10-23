import { useState } from "react";

import { useAdminCrud } from "../useAdminCrud";
import PageHeader from "../../common/PageHeader/PageHeader";
import PageState from "../../common/PageState/PageState";
import SearchInput from "../../common/SearchInput/SearchInput";
import FormModal from "../../common/FormModal/FormModal";
import ConfirmButton from "../../common/ConfirmButton/ConfirmButton";
import EmptyState from "../../common/EmptyState/EmptyState";
import Icon from "../../common/Icon/Icon";
import { useAuth } from "../../../hooks/useAuth";
import { useAsync } from "../../../hooks/useAsync";
import { useToast } from "../../../hooks/useToast";
import { adminService } from "../../../services/admin/adminService";
import { formatDate, matchesSearch } from "../../../utils/format";
import "../admin.css";
import "./Announcements.css";

const EMPTY_ANNOUNCEMENT = { title: "", courseId: "", message: "", pinned: false };

// Announcement management. Students see announcements for all students and for their own courses.
function Announcements() {
  const { user } = useAuth();
  const showToast = useToast();
  const crud = useAdminCrud({
    load: adminService.getAnnouncements,
    save: (values) => adminService.saveAnnouncement(values, user.name),
    remove: (item) => adminService.deleteAnnouncement(item.id),
    label: "Announcement",
  });
  const courses = useAsync(adminService.getCourses);
  const [query, setQuery] = useState("");
  const [audience, setAudience] = useState("all");

  if (!crud.data || !courses.data) {
    return <PageState error={crud.error || courses.error} onRetry={crud.reload} />;
  }

  async function togglePinned(item) {
    try {
      await adminService.setAnnouncementPinned(item.id, !item.pinned);
      showToast(item.pinned ? "Announcement unpinned." : "Announcement pinned to the top.");
      crud.reload();
    } catch (pinError) {
      showToast(pinError.message, "error");
    }
  }

  const courseOptions = courses.data.map((course) => ({ value: course.id, label: course.title }));
  const items = crud.data.filter(
    (item) =>
      (audience === "all" || (audience === "general" ? item.courseId === null : item.courseId === audience)) &&
      matchesSearch(query, item.title, item.message)
  );

  const fields = [
    { name: "title", label: "Title", required: true, full: true },
    {
      name: "courseId",
      label: "Target",
      type: "select",
      placeholder: "All students (academy-wide)",
      options: courseOptions.map((option) => ({ value: option.value, label: `Only students of ${option.label}` })),
      full: true,
    },
    { name: "message", label: "Message", type: "textarea", required: true },
    { name: "pinned", label: "Pin to the top of the student dashboard", type: "checkbox" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Academy"
        title="Announcements"
        description="Post an update for all students, or only for the students of one course."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => crud.setEditing(EMPTY_ANNOUNCEMENT)}>
            <Icon name="plus" size={16} /> New announcement
          </button>
        }
      />

      <div className="toolbar admin-toolbar">
        <SearchInput id="announcement-search" value={query} onChange={setQuery} placeholder="Search announcements" />

        <label htmlFor="announcement-audience" className="visually-hidden">Target</label>
        <select id="announcement-audience" className="input" value={audience} onChange={(event) => setAudience(event.target.value)}>
          <option value="all">All targets</option>
          <option value="general">Academy-wide</option>
          {courseOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <span className="admin-count">{items.length} announcements</span>
      </div>

      {items.length === 0 ? (
        <div className="card">
          <EmptyState icon="megaphone" title="No announcements found" message="Try another filter or post a new announcement." />
        </div>
      ) : (
        <ul className="admin-announcements">
          {items.map((item) => (
            <li key={item.id} className="card card-pad">
              <div className="admin-announcement-head">
                <div>
                  <h2>{item.title}</h2>
                  <p className="muted admin-announcement-meta">
                    {item.postedBy} · {formatDate(item.postedOn)}
                  </p>
                </div>
                <span className="admin-announcement-badges">
                  <span className={`badge ${item.courseId ? "badge-primary" : ""}`}>
                    {item.courseTitle ? `Course: ${item.courseTitle}` : "All students"}
                  </span>
                  {item.pinned && <span className="badge badge-warning"><Icon name="pin" size={12} /> Pinned</span>}
                </span>
              </div>

              <p className="admin-announcement-message">{item.message}</p>

              <div className="cell-actions admin-announcement-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => crud.setEditing({ ...item, courseId: item.courseId ?? "" })}
                >
                  <Icon name="edit" size={15} /> Edit
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => togglePinned(item)}>
                  <Icon name="pin" size={15} /> {item.pinned ? "Unpin" : "Pin"}
                </button>
                <ConfirmButton onConfirm={() => crud.removeItem(item)} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {crud.editing && (
        <FormModal
          title={crud.editing.id ? "Edit announcement" : "New announcement"}
          fields={fields}
          initialValues={crud.editing}
          submitLabel={crud.editing.id ? "Save changes" : "Post announcement"}
          onSubmit={crud.saveItem}
          onClose={() => crud.setEditing(null)}
        />
      )}
    </>
  );
}

export default Announcements;
