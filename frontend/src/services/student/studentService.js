// Student panel service. Components call only these functions — never mock data directly.
// Each function lists the Spring Boot endpoint it will use when VITE_USE_MOCK_API=false.

import { api, withMock } from "../apiClient";
import { studentMock } from "./studentMock";

export const studentService = {
  getDashboard: (studentId) =>
    withMock(() => studentMock.dashboard(studentId), () => api.get(`/students/${studentId}/dashboard`)),

  getMyCourses: (studentId) =>
    withMock(() => studentMock.myCourses(studentId), () => api.get(`/students/${studentId}/courses`)),

  getCourseDetails: (studentId, courseId) =>
    withMock(
      () => studentMock.courseDetails(studentId, courseId),
      () => api.get(`/students/${studentId}/courses/${courseId}`)
    ),

  getLecture: (studentId, courseId, lectureId) =>
    withMock(
      () => studentMock.lecture(studentId, courseId, lectureId),
      () => api.get(`/students/${studentId}/courses/${courseId}/lectures/${lectureId}`)
    ),

  setLectureComplete: (studentId, lectureId, completed) =>
    withMock(
      () => studentMock.setLectureComplete(studentId, lectureId, completed),
      () => api.put(`/students/${studentId}/progress/lectures/${lectureId}`, { completed })
    ),

  getResources: (studentId) =>
    withMock(() => studentMock.resources(studentId), () => api.get(`/students/${studentId}/resources`)),

  getProgress: (studentId) =>
    withMock(() => studentMock.progress(studentId), () => api.get(`/students/${studentId}/progress`)),

  getAnnouncements: (studentId) =>
    withMock(() => studentMock.announcements(studentId), () => api.get(`/students/${studentId}/announcements`)),

  getProfile: (studentId) =>
    withMock(() => studentMock.profile(studentId), () => api.get(`/students/${studentId}/profile`)),

  updateProfile: (studentId, changes) =>
    withMock(
      () => studentMock.updateProfile(studentId, changes),
      () => api.patch(`/students/${studentId}/profile`, changes)
    ),

  // Mock mode cannot change passwords; the backend will validate and store them securely.
  changePassword: (studentId, passwords) =>
    withMock(
      () => ({ changed: false }),
      () => api.post(`/students/${studentId}/change-password`, passwords)
    ),
};
