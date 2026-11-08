import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "./Topbar.css";

const pageInfo = {
  "/": {
    title: "Dashboard",
    subtitle: "Fleet overview and management",
  },
  "/vehicles": {
    title: "Vehicles",
    subtitle: "Fleet vehicles and vehicle information",
  },
  "/service": {
    title: "Service",
    subtitle: "Maintenance planning and service tracking",
  },
  "/documents": {
    title: "Documents",
    subtitle: "Vehicle documents and expiry tracking",
  },
  "/analytics": {
    title: "Analytics",
    subtitle: "Fleet performance and maintenance analytics",
  },
  "/incidents": {
    title: "Incidents",
    subtitle: "Damages and fines",
  },
  "/drivers": {
    title: "Drivers",
    subtitle: "Driver records and licence control",
  },
  "/costs": {
    title: "Costs",
    subtitle: "Fleet expenses and cost tracking",
  },
  "/alerts": {
    title: "Alerts",
    subtitle: "Maintenance and document alerts",
  },
  "/history": {
    title: "History",
    subtitle: "Fleet activity timeline",
  },
  "/vehicles/profile": {
    title: "Vehicle Profile",
    subtitle: "Vehicle details, documents and service history",
  },
  "/settings": {
    title: "Settings",
    subtitle: "FleetOS application settings",
  },
};

function Topbar({ onMenu }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const path = location.pathname.startsWith("/vehicles/")
    ? "/vehicles/profile"
    : location.pathname;
  const currentPage = pageInfo[path] || pageInfo["/"];

  return (
    <header className="topbar">
      <button type="button" className="topbar-menu" onClick={onMenu} aria-label="Open menu">{"\u2630"}</button>
      <div>
        <h2>{currentPage.title}</h2>
        <p>{currentPage.subtitle}</p>
      </div>

      <div className="topbar-user">
        <span className="user-name">{user?.email || "Admin"}</span>
        <div className="user-avatar">
          {(user?.email || "A").charAt(0).toUpperCase()}
        </div>
        <button type="button" className="topbar-logout" onClick={logout}>
          Sign out
        </button>
      </div>
    </header>
  );
}

export default Topbar;
