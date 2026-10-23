import { useState } from "react";

import PageHeader from "../../common/PageHeader/PageHeader";
import PageState from "../../common/PageState/PageState";
import SearchInput from "../../common/SearchInput/SearchInput";
import DataTable from "../../common/DataTable/DataTable";
import ConfirmButton from "../../common/ConfirmButton/ConfirmButton";
import ProgressBar from "../../common/ProgressBar/ProgressBar";
import EmptyState from "../../common/EmptyState/EmptyState";
import Icon from "../../common/Icon/Icon";
import { useAsync } from "../../../hooks/useAsync";
import { useToast } from "../../../hooks/useToast";
import { adminService } from "../../../services/admin/adminService";
import { formatDate, matchesSearch } from "../../../utils/format";
import "../admin.css";
import "./Certificates.css";

const STATUS_BADGES = { Issued: "badge-success", Eligible: "badge-primary", Revoked: "badge-danger", "In progress": "" };
const STATUSES = ["Eligible", "Issued", "Revoked", "In progress"];

// Course-wise certificates: one row per student per course.
// Students become eligible when they complete every lecture of that course.
function Certificates() {
  const showToast = useToast();
  const { data, error, reload } = useAsync(adminService.getCertificates);
  const [query, setQuery] = useState("");
  const [courseId, setCourseId] = useState("all");
  const [status, setStatus] = useState("all");

  if (!data) {
    return <PageState error={error} onRetry={reload} />;
  }

  async function issue(row) {
    try {
      const certificate = await adminService.issueCertificate(row.studentId, row.courseId);
      showToast(`Certificate ${certificate.certificateNo} issued to ${row.studentName} for ${row.courseTitle}.`);
      reload();
    } catch (issueError) {
      showToast(issueError.message, "error");
    }
  }

  async function revoke(row) {
    try {
      await adminService.revokeCertificate(row.certificate.id);
      showToast(`Certificate revoked for ${row.studentName} (${row.courseTitle}).`);
      reload();
    } catch (revokeError) {
      showToast(revokeError.message, "error");
    }
  }

  const courseOptions = [...new Map(data.map((row) => [row.courseId, row.courseTitle])).entries()].sort((a, b) =>
    a[1].localeCompare(b[1])
  );
  const rows = data.filter(
    (row) =>
      (courseId === "all" || row.courseId === courseId) &&
      (status === "all" || row.status === status) &&
      matchesSearch(query, row.studentName, row.courseTitle)
  );
  const countOf = (value) => data.filter((row) => row.status === value).length;

  return (
    <>
      <PageHeader
        eyebrow="Academy"
        title="Certificates"
        description="Certificates are issued per course. A student is eligible after completing every lecture of that course."
      />

      <div className="toolbar admin-toolbar">
        <SearchInput id="certificate-search" value={query} onChange={setQuery} placeholder="Search student or course" />

        <label htmlFor="certificate-course" className="visually-hidden">Course</label>
        <select id="certificate-course" className="input" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
          <option value="all">All courses</option>
          {courseOptions.map(([id, title]) => (
            <option key={id} value={id}>{title}</option>
          ))}
        </select>

        <label htmlFor="certificate-status" className="visually-hidden">Status</label>
        <select id="certificate-status" className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>{item} ({countOf(item)})</option>
          ))}
        </select>
      </div>

      <section className="card card-pad">
        <DataTable
          caption="Certificates"
          rows={rows}
          emptyState={<EmptyState icon="award" title="Nothing to show" message="No students match this filter." />}
          columns={[
            { key: "studentName", header: "Student", sortValue: (row) => row.studentName, render: (row) => <span className="cell-title">{row.studentName}</span> },
            { key: "courseTitle", header: "Course", sortValue: (row) => row.courseTitle },
            {
              key: "progress",
              header: "Progress", sortValue: (row) => row.progress.percent,
              render: (row) => (
                <div className="admin-table-progress">
                  <ProgressBar percent={row.progress.percent} label={`${row.studentName} progress`} />
                </div>
              ),
            },
            {
              key: "status",
              header: "Certificate", sortValue: (row) => row.status,
              render: (row) => (
                <>
                  <span className={`badge ${STATUS_BADGES[row.status]}`}>{row.status}</span>
                  {row.status === "Issued" && (
                    <span className="cell-sub">
                      {row.certificate.certificateNo} · {formatDate(row.certificate.issuedOn)}
                    </span>
                  )}
                </>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              align: "right",
              render: (row) => {
                if (row.status === "Issued") {
                  return (
                    <span className="cell-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => showToast("Certificate PDFs will be generated once the backend is connected.", "info")}
                      >
                        <Icon name="download" size={15} /> PDF
                      </button>
                      <ConfirmButton label="Revoke" confirmLabel="Revoke" icon="close" onConfirm={() => revoke(row)} />
                    </span>
                  );
                }
                if (row.eligible) {
                  return (
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => issue(row)}>
                      <Icon name="award" size={15} /> {row.status === "Revoked" ? "Re-issue" : "Issue"}
                    </button>
                  );
                }
                return <span className="muted">Not complete yet</span>;
              },
            },
          ]}
        />
      </section>
    </>
  );
}

export default Certificates;
