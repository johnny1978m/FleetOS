import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const navigation = [
  { to: "/", label: "Dashboard", icon: "▦" },
  { to: "/vehicles", label: "Vehicles", icon: "▣" },
  { to: "/service", label: "Service", icon: "⚙" },
  { to: "/documents", label: "Documents", icon: "▤" },
  { to: "/alerts", label: "Alerts", icon: "⚠" },
  { to: "/analytics", label: "Analytics", icon: "▥" },
  { to: "/settings", label: "Settings", icon: "◉" },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>FleetOS</h1>
        <span>Fleet Management</span>
      </div>

      <div className="sidebar-section-title">MAIN MENU</div>

      <nav className="sidebar-nav">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className="sidebar-link"
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-status">
        <span className="sidebar-status-dot"></span>
        <div>
          <strong>System Online</strong>
          <small>FleetOS Control Center</small>
        </div>
      </div>

      <div className="sidebar-footer">
        <span>FleetOS</span>
        <small>v1.0.0</small>
      </div>
    </aside>
  );
}

export default Sidebar;


