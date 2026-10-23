// Admin portal service. Components call only these functions — never mock data directly.
// Each function lists the Spring Boot endpoint it will use when VITE_USE_MOCK_API=false.
// Course content (modules, lectures, resources, students) is always scoped to one course.

import { api, withMock } from "../apiClient";
import { adminMock } from "./adminMock";

// Create when there is no id, otherwise update.
function save(path, item) {
  return item.id ? api.put(`${path}/${item.id}`, item) : api.post(path, item);
}

const coursePath = (courseId) => `/admin/courses/${courseId}`;

export const adminService = {
  getDashboard: () => withMock(() => adminMock.dashboard(), () => api.get("/admin/dashboard")),

  // Students (academy-wide)
  getStudents: () => withMock(() => adminMock.students(), () => api.get("/admin/students")),
  getStudentDetails: (studentId) =>
    withMock(() => adminMock.studentDetails(studentId), () => api.get(`/admin/students/${studentId}`)),
  saveStudent: (student) => withMock(() => adminMock.saveStudent(student), () => save("/admin/students", student)),
  deleteStudent: (id) => withMock(() => adminMock.deleteStudent(id), () => api.delete(`/admin/students/${id}`)),

  // Courses
  getCourses: () => withMock(() => adminMock.courses(), () => api.get("/admin/courses")),
  getCourse: (courseId) => withMock(() => adminMock.course(courseId), () => api.get(coursePath(courseId))),
  saveCourse: (course) => withMock(() => adminMock.saveCourse(course), () => save("/admin/courses", course)),
  setCourseStatus: (courseId, status) =>
    withMock(() => adminMock.setCourseStatus(courseId, status), () => api.patch(coursePath(courseId), { status })),
  deleteCourse: (courseId) => withMock(() => adminMock.deleteCourse(courseId), () => api.delete(coursePath(courseId))),

  // Course → Students
  getCourseStudents: (courseId) =>
    withMock(() => adminMock.courseStudents(courseId), () => api.get(`${coursePath(courseId)}/students`)),
  getAvailableStudents: (courseId) =>
    withMock(() => adminMock.availableStudents(courseId), () => api.get(`${coursePath(courseId)}/available-students`)),

  // Course → Modules
  getModules: (courseId) => withMock(() => adminMock.modules(courseId), () => api.get(`${coursePath(courseId)}/modules`)),
  saveModule: (module) =>
    withMock(() => adminMock.saveModule(module), () => save(`${coursePath(module.courseId)}/modules`, module)),
  moveModule: (module, direction) =>
    withMock(
      () => adminMock.moveModule(module.id, direction),
      () => api.post(`${coursePath(module.courseId)}/modules/${module.id}/move`, { direction })
    ),
  deleteModule: (module) =>
    withMock(() => adminMock.deleteModule(module.id), () => api.delete(`${coursePath(module.courseId)}/modules/${module.id}`)),

  // Course → Lectures
  getLectures: (courseId) => withMock(() => adminMock.lectures(courseId), () => api.get(`${coursePath(courseId)}/lectures`)),
  saveLecture: (lecture) =>
    withMock(() => adminMock.saveLecture(lecture), () => save(`${coursePath(lecture.courseId)}/lectures`, lecture)),
  deleteLecture: (lecture) =>
    withMock(() => adminMock.deleteLecture(lecture.id), () => api.delete(`${coursePath(lecture.courseId)}/lectures/${lecture.id}`)),

  // Course → Resources
  getResources: (courseId) => withMock(() => adminMock.resources(courseId), () => api.get(`${coursePath(courseId)}/resources`)),
  saveResource: (resource) =>
    withMock(() => adminMock.saveResource(resource), () => save(`${coursePath(resource.courseId)}/resources`, resource)),
  deleteResource: (resource) =>
    withMock(() => adminMock.deleteResource(resource.id), () => api.delete(`${coursePath(resource.courseId)}/resources/${resource.id}`)),

  // Enrollments (student ↔ one course)
  getEnrollments: () => withMock(() => adminMock.enrollments(), () => api.get("/admin/enrollments")),
  saveEnrollment: (enrollment) =>
    withMock(() => adminMock.saveEnrollment(enrollment), () => save("/admin/enrollments", enrollment)),
  deleteEnrollment: (id) => withMock(() => adminMock.deleteEnrollment(id), () => api.delete(`/admin/enrollments/${id}`)),

  // Announcements (academy-wide or one course)
  getAnnouncements: () => withMock(() => adminMock.announcements(), () => api.get("/admin/announcements")),
  saveAnnouncement: (announcement, adminName) =>
    withMock(() => adminMock.saveAnnouncement(announcement, adminName), () => save("/admin/announcements", announcement)),
  setAnnouncementPinned: (id, pinned) =>
    withMock(() => adminMock.setAnnouncementPinned(id, pinned), () => api.patch(`/admin/announcements/${id}`, { pinned })),
  deleteAnnouncement: (id) =>
    withMock(() => adminMock.deleteAnnouncement(id), () => api.delete(`/admin/announcements/${id}`)),

  // Certificates (one per student per course)
  getCertificates: () => withMock(() => adminMock.certificates(), () => api.get("/admin/certificates")),
  issueCertificate: (studentId, courseId) =>
    withMock(() => adminMock.issueCertificate(studentId, courseId), () => api.post("/admin/certificates", { studentId, courseId })),
  revokeCertificate: (id) =>
    withMock(() => adminMock.revokeCertificate(id), () => api.patch(`/admin/certificates/${id}`, { status: "Revoked" })),
};
