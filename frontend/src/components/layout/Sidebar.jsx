import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", end: true, icon: "🏠" },
  { to: "/ask", label: "Ask AI", end: false, primary: true, icon: "🤖" },
  { to: "/dashboards", label: "Dashboards", end: false, icon: "📊" },
  { to: "/history", label: "History", end: false, icon: "📜" },
  { to: "/data", label: "Data Sources", end: false, icon: "🗄️" },
];

export function Sidebar({ collapsed, setCollapsed }) {
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const handleChange = () => {
      const stored = localStorage.getItem("db_connection");
      setConnection(stored ? JSON.parse(stored) : null);
    };

    window.addEventListener('dbConnectionChanged', handleChange);
    handleChange(); // initial load

    return () => window.removeEventListener('dbConnectionChanged', handleChange);
  }, []);

  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`} aria-label="Main navigation">
      <div className="sidebar__header">
        <button
          className="sidebar__toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "▶" : "◀"}
        </button>
        {!collapsed && (
          <div className="sidebar__brand">
            <div className="sidebar__mark" aria-hidden="true">
              ◆
            </div>
            <span className="sidebar__brand-name">Insight</span>
          </div>
        )}
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__list">
          {navItems.map(({ to, label, end, primary, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `sidebar__link${isActive ? " sidebar__link--active" : ""}${
                    primary ? " sidebar__link--primary" : ""
                  }`
                }
              >
                <span className="sidebar__link-icon">{icon}</span>
                {!collapsed && <span className="sidebar__link-label">{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__status">
        {connection ? (
          <span className="sidebar__status-connected">
            🟢 Connected: {connection.type} ({connection.host})
          </span>
        ) : (
          <span className="sidebar__status-disconnected">
            🔴 No database connected
          </span>
        )}
      </div>
    </aside>
  );
}
