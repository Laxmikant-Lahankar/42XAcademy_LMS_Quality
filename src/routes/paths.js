// All route paths in one place, so links never hardcode URLs.

export const PATHS = {
  login: "/login",

  student: {
    dashboard: "/student",
    courses: "/student/courses",
    course: (courseId) => `/student/courses/${courseId}`,
    lecture: (courseId, lectureId) => `/student/courses/${courseId}/lectures/${lectureId}`,
    resources: "/student/resources",
    progress: "/student/progress",
    announcements: "/student/announcements",
    profile: "/student/profile",
  },

  admin: {
    dashboard: "/admin",
    students: "/admin/students",
    courses: "/admin/courses",
    // Course management page; tab = overview | students | modules | lectures | resources
    course: (courseId, tab) => `/admin/courses/${courseId}${tab && tab !== "overview" ? `?tab=${tab}` : ""}`,
    enrollments: "/admin/enrollments",
    announcements: "/admin/announcements",
    certificates: "/admin/certificates",
  },
};

export function homePathFor(role) {
  return role === "ADMIN" ? PATHS.admin.dashboard : PATHS.student.dashboard;
}
