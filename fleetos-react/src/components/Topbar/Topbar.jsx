import { useLocation } from "react-router-dom";
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
  "/settings": {
    title: "Settings",
    subtitle: "FleetOS application settings",
  },
};

function Topbar() {
  const location = useLocation();
  const currentPage = pageInfo[location.pathname] || pageInfo["/"];

  return (
    <header className="topbar">
      <div>
        <h2>{currentPage.title}</h2>
        <p>{currentPage.subtitle}</p>
      </div>

      <div className="topbar-user">
        <span className="user-name">Admin</span>
        <div className="user-avatar">A</div>
      </div>
    </header>
  );
}

export default Topbar;
