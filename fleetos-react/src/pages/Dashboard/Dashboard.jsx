import { useMemo } from "react";
import { useFleet } from "../../context/useFleet";
import "./Dashboard.css";

function Dashboard() {
  const { vehicles, documents } = useFleet();

  const stats = useMemo(() => {
    const good = vehicles.filter((v) => v.status === "Good").length;
    const attention = vehicles.filter((v) => v.status === "Attention").length;
    const critical = vehicles.filter((v) => v.status === "Critical").length;
    const serviceDue = vehicles.filter((v) => Number(v.serviceKm) <= Number(v.km) || Number(v.oilKm) <= Number(v.km)).length;
    const active = vehicles.length - critical;
    const expired = documents.filter((d) => d.status === "Expired").length;
    const expiring = documents.filter((d) => d.status === "Attention").length;

    return { good, attention, critical, serviceDue, active, expired, expiring };
  }, [vehicles, documents]);

  const upcoming = useMemo(() => {
    return vehicles
      .map((v) => ({
        ...v,
        remaining: Math.min(Number(v.serviceKm) - Number(v.km), Number(v.oilKm) - Number(v.km)),
      }))
      .sort((a, b) => a.remaining - b.remaining)
      .slice(0, 5);
  }, [vehicles]);

  const health = vehicles.length ? Math.round((stats.good / vehicles.length) * 100) : 0;
  const urgentVehicles = vehicles.filter(
    (v) =>
      v.status === "Critical" ||
      Number(v.serviceKm) <= Number(v.km) ||
      Number(v.oilKm) <= Number(v.km),
  ).slice(0, 4);

  const validDocuments = documents.length - stats.expired - stats.expiring;
  const documentCompliance = documents.length
    ? Math.round((validDocuments / documents.length) * 100)
    : 100;

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div>
          <div className="dashboard-eyebrow">FLEETOS CONTROL CENTER</div>
          <h1>Fleet Overview</h1>
          <p>Real-time fleet status and maintenance overview</p>
        </div>
        <button type="button" className="dashboard-primary-button">
          + Add Vehicle
        </button>
      </div>

      <section className="dashboard-kpis">
        <div className="dashboard-kpi">
          <div className="kpi-icon">▣</div>
          <div><span>TOTAL VEHICLES</span><strong>{vehicles.length}</strong><small>Fleet size</small></div>
        </div>
        <div className="dashboard-kpi">
          <div className="kpi-icon kpi-green">✓</div>
          <div><span>ACTIVE VEHICLES</span><strong>{stats.active}</strong><small>Operational</small></div>
        </div>
        <div className="dashboard-kpi">
          <div className="kpi-icon kpi-orange">⚙</div>
          <div><span>SERVICE DUE</span><strong>{stats.serviceDue}</strong><small>Requires attention</small></div>
        </div>
        <div className="dashboard-kpi">
          <div className="kpi-icon kpi-red">!</div>
          <div><span>CRITICAL ALERTS</span><strong>{stats.critical}</strong><small>Immediate action</small></div>
        </div>
      </section>

      <div className="dashboard-main-grid">
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div><div className="panel-kicker">FLEET HEALTH</div><h2>Vehicle Condition</h2></div>
            <span className="panel-live">LIVE</span>
          </div>
          <div className="health-content">
            <div
              className="health-ring"
              style={{
                background: `conic-gradient(#19ce88 0deg ${stats.good * 360 / Math.max(vehicles.length, 1)}deg, #f2a52c ${stats.good * 360 / Math.max(vehicles.length, 1)}deg ${(stats.good + stats.attention) * 360 / Math.max(vehicles.length, 1)}deg, #ed4b57 ${(stats.good + stats.attention) * 360 / Math.max(vehicles.length, 1)}deg 360deg)`,
              }}
            >
              <div className="health-ring-inner"><strong>{health}%</strong><span>HEALTHY</span></div>
            </div>
            <div className="health-list">
              <div><span className="health-label"><i className="dot green"></i>Good</span><strong>{stats.good}</strong></div>
              <div><span className="health-label"><i className="dot orange"></i>Attention</span><strong>{stats.attention}</strong></div>
              <div><span className="health-label"><i className="dot red"></i>Critical</span><strong>{stats.critical}</strong></div>
            </div>
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div><div className="panel-kicker">PRIORITY</div><h2>Urgent Actions</h2></div>
            <span className="alert-count">{urgentVehicles.length}</span>
          </div>
          <div className="action-list">
            {urgentVehicles.map((vehicle) => (
              <div className="action-item" key={vehicle.id}>
                <i className="action-status red"></i>
                <div>
                  <strong>{vehicle.registration}</strong>
                  <span>{vehicle.status === "Critical" ? "Critical vehicle status" : "Service or oil change due"}</span>
                </div>
                <b>ACTION</b>
              </div>
            ))}
            {urgentVehicles.length === 0 && (
              <div className="empty-action">
                <span>✓</span>
                <div><strong>No urgent actions</strong><small>Fleet is currently within service limits</small></div>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="dashboard-bottom-grid">
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div><div className="panel-kicker">MAINTENANCE</div><h2>Upcoming Service</h2></div>
            <span className="panel-link">VIEW ALL</span>
          </div>
          <div className="service-table">
            <div className="service-row service-header"><span>VEHICLE</span><span>KM REMAINING</span><span>STATUS</span><span>TYPE</span></div>
            {upcoming.map((vehicle) => {
              const overdue = vehicle.remaining <= 0;
              const soon = vehicle.remaining > 0 && vehicle.remaining <= 5000;
              return (
                <div className="service-row" key={vehicle.id}>
                  <span className="vehicle-cell"><strong>{vehicle.registration}</strong><small>{vehicle.brand} {vehicle.model}</small></span>
                  <span className={overdue ? "remaining critical" : soon ? "remaining warning" : "remaining"}>{vehicle.remaining.toLocaleString("de-DE")} km</span>
                  <span><em className={`status-pill ${overdue ? "red" : soon ? "orange" : "green"}`}>{overdue ? "OVERDUE" : soon ? "SOON" : "OK"}</em></span>
                  <span>{Number(vehicle.serviceKm) <= Number(vehicle.oilKm) ? "SERVICE" : "OIL"}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div><div className="panel-kicker">COMPLIANCE</div><h2>Documents</h2></div>
            <span className="panel-link">VIEW ALL</span>
          </div>
          <div className="document-summary">
            <div className="document-card red"><strong>{stats.expired}</strong><span>EXPIRED</span></div>
            <div className="document-card orange"><strong>{stats.expiring}</strong><span>EXPIRING SOON</span></div>
            <div className="document-card green"><strong>{validDocuments}</strong><span>VALID</span></div>
          </div>
          <div className="document-progress">
            <div><span>DOCUMENT COMPLIANCE</span><strong>{documentCompliance}%</strong></div>
            <div className="progress-track"><span style={{ width: `${documentCompliance}%` }}></span></div>
          </div>
        </section>
      </div>

      <section className="dashboard-panel activity-panel">
        <div className="panel-heading">
          <div><div className="panel-kicker">FLEET DATA</div><h2>Vehicle Status</h2></div>
          <span className="panel-link">FLEET</span>
        </div>
        <div className="activity-grid">
          {vehicles.slice(0, 5).map((vehicle) => (
            <div className="activity-card" key={vehicle.id}>
              <div className="activity-top"><i className={`mini-status ${vehicle.status.toLowerCase()}`}></i><strong>{vehicle.registration}</strong></div>
              <span>{vehicle.brand} {vehicle.model}</span>
              <small>{Number(vehicle.km).toLocaleString("de-DE")} km</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
