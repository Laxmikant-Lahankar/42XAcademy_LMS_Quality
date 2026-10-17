import AppShell from "../../components/common/AppShell/AppShell";
import { PATHS } from "../../routes/paths";

const STUDENT_NAV = [
  {
    title: "Learn",
    items: [
      { to: PATHS.student.dashboard, label: "Dashboard", icon: "dashboard", end: true },
      { to: PATHS.student.courses, label: "My Courses", icon: "book" },
      { to: PATHS.student.resources, label: "Notes & Resources", icon: "folder" },
      { to: PATHS.student.progress, label: "Progress", icon: "chart" },
    ],
  },
  {
    title: "Account",
    items: [
      { to: PATHS.student.announcements, label: "Announcements", icon: "megaphone" },
      { to: PATHS.student.profile, label: "My Profile", icon: "user" },
    ],
  },
];

function StudentLayout() {
  return (
    <AppShell
      navGroups={STUDENT_NAV}
      panelLabel="Student"
      searchPath={PATHS.student.courses}
      searchPlaceholder="Search courses and lectures"
    />
  );
}

export default StudentLayout;
