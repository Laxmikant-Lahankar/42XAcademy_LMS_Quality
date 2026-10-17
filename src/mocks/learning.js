// Mock enrollments, progress, resources, announcements and certificates.

export const enrollmentsSeed = [
  { id: "enr-1", studentId: "stu-1001", courseId: "sap-abap", enrolledOn: "2026-09-01", status: "Active" },
  { id: "enr-4", studentId: "stu-1002", courseId: "sap-abap", enrolledOn: "2026-09-02", status: "Active" },
  { id: "enr-5", studentId: "stu-1003", courseId: "sap-mm", enrolledOn: "2026-08-20", status: "Active" },
  { id: "enr-6", studentId: "stu-1004", courseId: "power-platform", enrolledOn: "2026-08-22", status: "Active" },
  { id: "enr-7", studentId: "stu-1005", courseId: "data-engineering", enrolledOn: "2026-09-05", status: "Paused" },
  { id: "enr-8", studentId: "stu-1006", courseId: "devops", enrolledOn: "2026-08-01", status: "Active" },
  { id: "enr-9", studentId: "stu-1007", courseId: "sap-mm", enrolledOn: "2026-08-03", status: "Completed" },
  { id: "enr-10", studentId: "stu-1008", courseId: "power-platform", enrolledOn: "2026-08-25", status: "Active" },
];

// Progress per student: completed lecture ids, last watched lecture and recent activity.
export const progressSeed = {
  "stu-1001": {
    completedLectureIds: [
      "sap-abap-m1-l1", "sap-abap-m1-l2", "sap-abap-m1-l3", "sap-abap-m2-l1", "sap-abap-m2-l2",
    ],
    lastWatched: { lectureId: "sap-abap-m2-l3", watchedAt: "2026-10-15T18:40:00" },
    activity: [
      { id: "act-1", text: "Completed “ALV reports”", at: "2026-10-15T18:20:00" },
      { id: "act-2", text: "Downloaded “ABAP Reports — Notes”", at: "2026-10-15T17:55:00" },
      { id: "act-3", text: "Completed “Classical reports”", at: "2026-10-14T20:10:00" },
      { id: "act-4", text: "Completed “Data Dictionary basics”", at: "2026-10-12T19:00:00" },
    ],
  },
  "stu-1002": { completedLectureIds: ["sap-abap-m1-l1", "sap-abap-m1-l2"], lastWatched: { lectureId: "sap-abap-m1-l3", watchedAt: "2026-10-14T10:00:00" }, activity: [] },
  "stu-1003": { completedLectureIds: ["sap-mm-m1-l1", "sap-mm-m1-l2", "sap-mm-m1-l3", "sap-mm-m2-l1", "sap-mm-m2-l2", "sap-mm-m2-l3", "sap-mm-m3-l1"], lastWatched: null, activity: [] },
  "stu-1004": { completedLectureIds: ["power-platform-m1-l1"], lastWatched: null, activity: [] },
  "stu-1006": { completedLectureIds: ["devops-m1-l1", "devops-m1-l2", "devops-m1-l3", "devops-m2-l1", "devops-m2-l2", "devops-m2-l3", "devops-m3-l1", "devops-m3-l2", "devops-m4-l1"], lastWatched: null, activity: [] },
  "stu-1007": { completedLectureIds: ["sap-mm-m1-l1", "sap-mm-m1-l2", "sap-mm-m1-l3", "sap-mm-m2-l1", "sap-mm-m2-l2", "sap-mm-m2-l3", "sap-mm-m3-l1", "sap-mm-m3-l2", "sap-mm-m3-l3", "sap-mm-m3-l4", "sap-mm-m4-l1", "sap-mm-m4-l2"], lastWatched: null, activity: [] },
};

// fileUrl stays null until files are served from OneDrive through the backend.
export const resourcesSeed = [
  { id: "res-1", courseId: "sap-abap", moduleId: null, title: "SAP ABAP — Course Syllabus", type: "Syllabus", sizeKb: 420, updatedOn: "2026-09-01", lectureId: null, description: "", fileUrl: null },
  { id: "res-2", courseId: "sap-abap", moduleId: "sap-abap-m1", title: "ABAP Fundamentals — Notes", type: "Notes", sizeKb: 1260, updatedOn: "2026-09-08", lectureId: null, description: "", fileUrl: null },
  { id: "res-3", courseId: "sap-abap", moduleId: "sap-abap-m2", title: "ABAP Reports — Notes", type: "Notes", sizeKb: 980, updatedOn: "2026-10-02", lectureId: null, description: "", fileUrl: null },
  { id: "res-4", courseId: "sap-abap", moduleId: "sap-abap-m2", title: "ALV Report Assignment", type: "Assignment", sizeKb: 210, updatedOn: "2026-10-05", lectureId: null, description: "", fileUrl: null },
  { id: "res-5", courseId: "data-engineering", moduleId: null, title: "Power BI for Data Professionals — Syllabus", type: "Syllabus", sizeKb: 380, updatedOn: "2026-09-01", lectureId: null, description: "", fileUrl: null },
  { id: "res-6", courseId: "data-engineering", moduleId: "data-engineering-m1", title: "Python Cheat Sheet", type: "PDF", sizeKb: 640, updatedOn: "2026-09-12", lectureId: null, description: "", fileUrl: null },
  { id: "res-7", courseId: "data-engineering", moduleId: "data-engineering-m2", title: "SQL Practice Dataset (Sales)", type: "Dataset", sizeKb: 2150, updatedOn: "2026-09-20", lectureId: null, description: "", fileUrl: null },
  { id: "res-8", courseId: "devops", moduleId: null, title: "DevOps with AI — Syllabus", type: "Syllabus", sizeKb: 400, updatedOn: "2026-09-10", lectureId: null, description: "", fileUrl: null },
  { id: "res-9", courseId: "devops", moduleId: "devops-m2", title: "Linux Commands Reference", type: "PDF", sizeKb: 720, updatedOn: "2026-09-25", lectureId: null, description: "", fileUrl: null },
  { id: "res-10", courseId: "sap-mm", moduleId: null, title: "SAP MM — Course Syllabus", type: "Syllabus", sizeKb: 450, updatedOn: "2026-08-18", lectureId: null, description: "", fileUrl: null },
  { id: "res-11", courseId: "power-platform", moduleId: null, title: "Power Platform Mastery — Syllabus", type: "Syllabus", sizeKb: 360, updatedOn: "2026-08-20", lectureId: null, description: "", fileUrl: null },
];

export const announcementsSeed = [
  { id: "ann-1", title: "Mock interview week starts 20 October", message: "Mock interviews for all batches run from 20 to 24 October. Book your slot with your trainer and keep your resume updated.", courseId: null, postedBy: "Placement Team", postedOn: "2026-10-15", pinned: true },
  { id: "ann-2", title: "ABAP Reports assignment due Sunday", message: "Submit the ALV Report Assignment by Sunday 9 PM. Download it from Notes & Resources.", courseId: "sap-abap", postedBy: "Amit Deshmukh", postedOn: "2026-10-14", pinned: false },
  { id: "ann-3", title: "New SQL practice dataset uploaded", message: "A sales dataset for SQL window function practice is now available in Module 2 resources.", courseId: "data-engineering", postedBy: "Kiran Patil", postedOn: "2026-10-12", pinned: false },
  { id: "ann-4", title: "Diwali break", message: "Live classes pause from 8 to 11 November. Recorded lectures stay available throughout.", courseId: null, postedBy: "42X Academy", postedOn: "2026-10-10", pinned: false },
];

export const certificatesSeed = [
  { id: "cert-1", studentId: "stu-1007", courseId: "sap-mm", status: "Issued", certificateNo: "42X-MM-2026-0142", issuedOn: "2026-10-09" },
];
