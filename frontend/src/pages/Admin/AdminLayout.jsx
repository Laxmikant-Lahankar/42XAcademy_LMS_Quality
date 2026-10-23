import AppShell from "../../components/common/AppShell/AppShell";
import { PATHS } from "../../routes/paths";

// Simple, course-centric admin menu. Modules, lectures and resources live inside each course.
const ADMIN_NAV = [
  {
    title: "Academy",
    items: [
      { to: PATHS.admin.dashboard, label: "Dashboard", icon: "dashboard", end: true },
      { to: PATHS.admin.students, label: "Students", icon: "users" },
      { to: PATHS.admin.courses, label: "Courses", icon: "book" },
      { to: PATHS.admin.enrollments, label: "Enrollments", icon: "user-plus" },
      { to: PATHS.admin.announcements, label: "Announcements", icon: "megaphone" },
      { to: PATHS.admin.certificates, label: "Certificates", icon: "award" },
    ],
  },
  {
    title: "Account",
    items: [
      { to: PATHS.admin.profile, label: "My Profile", icon: "user" },
      { to: PATHS.admin.changePassword, label: "Change Password", icon: "lock" },
    ],
  },
];

function AdminLayout() {
  return <AppShell navGroups={ADMIN_NAV} panelLabel="Admin" showSidebarLogout />;
}

export default AdminLayout;
