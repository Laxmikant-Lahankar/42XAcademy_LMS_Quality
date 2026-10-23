import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import PageState from "../components/common/PageState/PageState";
import Login from "../pages/Login/Login";
import NotFound from "../pages/NotFound/NotFound";
import { useAuth } from "../hooks/useAuth";
import { PATHS, homePathFor } from "./paths";

// Student panel (loaded only when a student signs in)
const StudentLayout = lazy(() => import("../pages/Student/StudentLayout"));
const StudentDashboard = lazy(() => import("../components/student/Dashboard/Dashboard"));
const MyCourses = lazy(() => import("../components/student/Courses/Courses"));
const CourseDetails = lazy(() => import("../components/student/CourseDetails/CourseDetails"));
const LecturePlayer = lazy(() => import("../components/student/Lectures/LecturePlayer"));
const StudentResources = lazy(() => import("../components/student/Resources/Resources"));
const StudentProgress = lazy(() => import("../components/student/Progress/Progress"));
const StudentAnnouncements = lazy(() => import("../components/student/Announcements/Announcements"));
const StudentProfile = lazy(() => import("../components/student/Profile/Profile"));

// Admin panel (loaded only when an admin signs in)
const AdminLayout = lazy(() => import("../pages/Admin/AdminLayout"));
const AdminDashboard = lazy(() => import("../components/admin/Dashboard/AdminDashboard"));
const AdminStudents = lazy(() => import("../components/admin/Students/Students"));
const AdminCourses = lazy(() => import("../components/admin/Courses/Courses"));
const AdminCourseManage = lazy(() => import("../components/admin/CourseManage/CourseManage"));
const AdminEnrollments = lazy(() => import("../components/admin/Enrollments/Enrollments"));
const AdminAnnouncements = lazy(() => import("../components/admin/Announcements/Announcements"));
const AdminCertificates = lazy(() => import("../components/admin/Certificates/Certificates"));
const AdminChangePassword = lazy(() => import("../components/admin/ChangePassword/ChangePassword"));
const AdminProfile = lazy(() => import("../components/admin/Profile/AdminProfile"));

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? homePathFor(user.role) : PATHS.login} replace />;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageState />}>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path={PATHS.login} element={<Login />} />

        <Route element={<ProtectedRoute role="STUDENT" />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="courses" element={<MyCourses />} />
            <Route path="courses/:courseId" element={<CourseDetails />} />
            <Route path="courses/:courseId/lectures/:lectureId" element={<LecturePlayer />} />
            <Route path="resources" element={<StudentResources />} />
            <Route path="progress" element={<StudentProgress />} />
            <Route path="announcements" element={<StudentAnnouncements />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="courses/:courseId" element={<AdminCourseManage />} />
            {/* Modules, lectures and resources are managed inside each course now */}
            <Route path="modules" element={<Navigate to={PATHS.admin.courses} replace />} />
            <Route path="lectures" element={<Navigate to={PATHS.admin.courses} replace />} />
            <Route path="resources" element={<Navigate to={PATHS.admin.courses} replace />} />
            <Route path="enrollments" element={<AdminEnrollments />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="change-password" element={<AdminChangePassword />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
