import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import Icon from "../Icon/Icon";
import Logo from "../Logo/Logo";
import { useAuth } from "../../../hooks/useAuth";
import "./Sidebar.css";

// Navigation sidebar shared by the Student and Admin panels.
// navGroups: [{ title, items: [{ to, label, icon }] }]
// showLogout: adds a Logout item at the bottom (used by the Admin panel).
function Sidebar({ navGroups, panelLabel, isOpen, onClose, showLogout = false }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Esc closes the mobile menu.
  useEffect(() => {
    if (!isOpen) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpen ? "is-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      <aside className={`sidebar ${isOpen ? "is-open" : ""}`} aria-label={`${panelLabel} navigation`}>
        <div className="sidebar-top">
          <Logo variant="dark" />

          <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close menu">
            <Icon name="close" />
          </button>
        </div>

        <span className="sidebar-panel">{panelLabel}</span>

        <nav className="sidebar-nav">
          {navGroups.map((group) => (
            <div className="sidebar-group" key={group.title}>
              <p className="sidebar-group-title">{group.title}</p>

              <ul>
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
                      onClick={onClose}
                    >
                      <Icon name={item.icon} size={19} />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {showLogout && (
          <button type="button" className="sidebar-link sidebar-logout" onClick={handleLogout}>
            <Icon name="logout" size={19} />
            <span>Logout</span>
          </button>
        )}
      </aside>
    </>
  );
}

export default Sidebar;
