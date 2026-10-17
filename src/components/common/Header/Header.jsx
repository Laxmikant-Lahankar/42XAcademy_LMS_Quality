import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Icon from "../Icon/Icon";
import { useAuth } from "../../../hooks/useAuth";
import { initials } from "../../../utils/format";
import "./Header.css";

// Top bar: menu button (mobile), optional search, signed-in user and logout.
// searchPath: when set, the search box navigates to `${searchPath}?q=...`.
function Header({ onMenuClick, searchPath, searchPlaceholder }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function handleSearch(event) {
    event.preventDefault();
    navigate(`${searchPath}?q=${encodeURIComponent(query.trim())}`);
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="app-header">
      <button type="button" className="app-header-menu" onClick={onMenuClick} aria-label="Open menu">
        <Icon name="menu" size={22} />
      </button>

      {searchPath ? (
        <form className="app-header-search" role="search" onSubmit={handleSearch}>
          <Icon name="search" size={18} />
          <label htmlFor="header-search" className="visually-hidden">Search</label>
          <input
            id="header-search"
            type="search"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </form>
      ) : (
        <span className="app-header-spacer"></span>
      )}

      <div className="app-header-user">
        <span className="app-header-avatar" aria-hidden="true">{initials(user?.name)}</span>
        <span className="app-header-name">
          <strong>{user?.name}</strong>
          <small>{user?.role === "ADMIN" ? "Administrator" : "Student"}</small>
        </span>

        <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
          <Icon name="logout" size={16} />
          <span className="app-header-logout-text">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
