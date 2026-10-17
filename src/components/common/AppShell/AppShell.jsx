import { useCallback, useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./AppShell.css";

// Page frame used by both panels: sidebar + header + page content + footer.
function AppShell({ navGroups, panelLabel, searchPath, searchPlaceholder, showSidebarLogout = false }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  return (
    <div className="app-shell">
      {/* Lets keyboard users jump past the navigation */}
      <a href="#main-content" className="skip-link">Skip to content</a>

      <Sidebar
        navGroups={navGroups}
        panelLabel={panelLabel}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        showLogout={showSidebarLogout}
      />

      <div className="app-shell-main">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          searchPath={searchPath}
          searchPlaceholder={searchPlaceholder}
        />

        <main id="main-content" className="app-shell-content" tabIndex={-1}>
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default AppShell;
