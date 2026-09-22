import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>FleetOS</h1>
        <span>Fleet Management</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className="sidebar-link">
          Dashboard
        </NavLink>

        <NavLink to="/vehicles" className="sidebar-link">
          Vehicles
        </NavLink>

        <NavLink to="/service" className="sidebar-link">
          Service
        </NavLink>

        <NavLink to="/documents" className="sidebar-link">
          Documents
        </NavLink>

        <NavLink to="/analytics" className="sidebar-link">
          Analytics
        </NavLink>

        <NavLink to="/settings" className="sidebar-link">
          Settings
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <span>FleetOS</span>
        <small>v1.0.0</small>
      </div>
    </aside>
  );
}

export default Sidebar;