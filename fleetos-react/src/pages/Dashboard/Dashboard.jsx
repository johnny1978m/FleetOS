import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useFleet } from "../../context/useFleet";
import "./Dashboard.css";

function Dashboard() {
  const { vehicles, documents } = useFleet();

  const serviceHistory = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("fleetos-service-history") || "[]");
    } catch {
      return [];
    }
  }, []);

  const getRemaining = (vehicle) => {
    const service = Number(vehicle.serviceKm) - Number(vehicle.km);
    const oil = Number(vehicle.oilKm) - Number(vehicle.km);
    return Math.min(service, oil);
  };

  const stats = useMemo(() => {
    let good = 0;
    let attention = 0;
    let critical = 0;

    vehicles.forEach((vehicle) => {
      const remaining = getRemaining(vehicle);

      if (vehicle.status === "Critical" || remaining <= 2000) {
        critical += 1;
      } else if (vehicle.status === "Attention" || remaining <= 5000) {
        attention += 1;
      } else {
        good += 1;
      }
    });

    const serviceDue = vehicles.filter(
      (vehicle) => getRemaining(vehicle) <= 5000,
    ).length;

    const expired = documents.filter(
      (document) => document.status === "Expired",
    ).length;

    const expiring = documents.filter(
      (document) => document.status === "Attention",
    ).length;

    const active = Math.max(vehicles.length - critical, 0);

    return {
      good,
      attention,
      critical,
      serviceDue,
      expired,
      expiring,
      active,
    };
  }, [vehicles, documents]);

  const upcoming = useMemo(() => {
    return vehicles
      .map((vehicle) => ({
        ...vehicle,
        remaining: getRemaining(vehicle),
      }))
      .sort((a, b) => a.remaining - b.remaining)
      .slice(0, 5);
  }, [vehicles]);

  const urgentVehicles = useMemo(() => {
    return vehicles
      .map((vehicle) => ({
        ...vehicle,
        remaining: getRemaining(vehicle),
      }))
      .filter(
        (vehicle) =>
          vehicle.status === "Critical" || vehicle.remaining <= 5000,
      )
      .sort((a, b) => a.remaining - b.remaining)
      .slice(0, 5);
  }, [vehicles]);

  const validDocuments = Math.max(
    documents.length - stats.expired - stats.expiring,
    0,
  );

  const documentCompliance = documents.length
    ? Math.round((validDocuments / documents.length) * 100)
    : 100;

  const health = vehicles.length
    ? Math.round((stats.good / vehicles.length) * 100)
    : 0;

  const recentActivity = useMemo(() => {
    const historyEvents = serviceHistory.map((item, index) => ({
      id: `service-${item.id || index}`,
      type: "Service",
      vehicle: item.registration || item.vehicle || "Vehicle",
      date: item.date || item.createdAt || "",
      description:
        item.notes ||
        item.serviceType ||
        "Service record added",
      km: item.km,
    }));

    const documentEvents = documents.map((document, index) => ({
      id: `document-${document.id || index}`,
      type: "Document",
      vehicle:
        document.registration ||
        document.vehicle ||
        "Fleet",
      date:
        document.updatedAt ||
        document.createdAt ||
        document.expiryDate ||
        "",
      description:
        document.name ||
        document.type ||
        "Document updated",
    }));

    return [...historyEvents, ...documentEvents]
      .sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 6);
  }, [serviceHistory, documents]);

  const formatDate = (value) => {
    if (!value) return "No date";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("de-DE");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div>
          <div className="dashboard-eyebrow">
            FLEETOS CONTROL CENTER
          </div>
          <h1>Fleet Overview</h1>
          <p>
            Live overview of vehicles, maintenance, documents and fleet activity
          </p>
        </div>

        <Link
          to="/vehicles"
          className="dashboard-primary-button"
        >
          + Add Vehicle
        </Link>
      </div>

      <section className="dashboard-kpis">
        <div className="dashboard-kpi">
          <div className="kpi-icon">▣</div>
          <div>
            <span>TOTAL VEHICLES</span>
            <strong>{vehicles.length}</strong>
            <small>Fleet size</small>
          </div>
        </div>

        <div className="dashboard-kpi">
          <div className="kpi-icon kpi-green">✓</div>
          <div>
            <span>ACTIVE VEHICLES</span>
            <strong>{stats.active}</strong>
            <small>Operational</small>
          </div>
        </div>

        <div className="dashboard-kpi">
          <div className="kpi-icon kpi-orange">⚙</div>
          <div>
            <span>SERVICE DUE</span>
            <strong>{stats.serviceDue}</strong>
            <small>Within 5,000 km</small>
          </div>
        </div>

        <div className="dashboard-kpi">
          <div className="kpi-icon kpi-red">!</div>
          <div>
            <span>CRITICAL ALERTS</span>
            <strong>{stats.critical + stats.expired}</strong>
            <small>Immediate attention</small>
          </div>
        </div>
      </section>

      <div className="dashboard-main-grid">
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <div className="panel-kicker">FLEET HEALTH</div>
              <h2>Vehicle Condition</h2>
            </div>

            <span className="panel-live">LIVE</span>
          </div>

          <div className="health-content">
            <div
              className="health-ring"
              style={{
                background: `conic-gradient(
                  #19ce88 0deg ${(stats.good * 360) / Math.max(vehicles.length, 1)}deg,
                  #f2a52c ${(stats.good * 360) / Math.max(vehicles.length, 1)}deg ${((stats.good + stats.attention) * 360) / Math.max(vehicles.length, 1)}deg,
                  #ed4b57 ${((stats.good + stats.attention) * 360) / Math.max(vehicles.length, 1)}deg 360deg
                )`,
              }}
            >
              <div className="health-ring-inner">
                <strong>{health}%</strong>
                <span>HEALTHY</span>
              </div>
            </div>

            <div className="health-list">
              <div>
                <span className="health-label">
                  <i className="dot green"></i>
                  Good
                </span>
                <strong>{stats.good}</strong>
              </div>

              <div>
                <span className="health-label">
                  <i className="dot orange"></i>
                  Attention
                </span>
                <strong>{stats.attention}</strong>
              </div>

              <div>
                <span className="health-label">
                  <i className="dot red"></i>
                  Critical
                </span>
                <strong>{stats.critical}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <div className="panel-kicker">PRIORITY</div>
              <h2>Urgent Actions</h2>
            </div>

            <Link to="/alerts" className="alert-count">
              {urgentVehicles.length + stats.expired}
            </Link>
          </div>

          <div className="action-list">
            {urgentVehicles.map((vehicle) => (
              <div className="action-item" key={vehicle.id}>
                <i
                  className={`action-status ${
                    vehicle.remaining <= 2000 ||
                    vehicle.status === "Critical"
                      ? "red"
                      : "orange"
                  }`}
                ></i>

                <div>
                  <strong>{vehicle.registration}</strong>
                  <span>
                    {vehicle.remaining <= 0
                      ? "Service overdue"
                      : `${vehicle.remaining.toLocaleString("de-DE")} km remaining`}
                  </span>
                </div>

                <Link to="/alerts">VIEW</Link>
              </div>
            ))}

            {stats.expired > 0 && (
              <div className="action-item">
                <i className="action-status red"></i>

                <div>
                  <strong>Documents</strong>
                  <span>
                    {stats.expired} expired document
                    {stats.expired !== 1 ? "s" : ""}
                  </span>
                </div>

                <Link to="/documents">VIEW</Link>
              </div>
            )}

            {urgentVehicles.length === 0 && stats.expired === 0 && (
              <div className="empty-action">
                <span>✓</span>

                <div>
                  <strong>No urgent actions</strong>
                  <small>Fleet is currently within service limits</small>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="dashboard-bottom-grid">
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <div className="panel-kicker">MAINTENANCE</div>
              <h2>Upcoming Service</h2>
            </div>

            <Link to="/service" className="panel-link">
              VIEW ALL
            </Link>
          </div>

          <div className="service-table">
            <div className="service-row service-header">
              <span>VEHICLE</span>
              <span>KM REMAINING</span>
              <span>STATUS</span>
              <span>TYPE</span>
            </div>

            {upcoming.map((vehicle) => {
              const overdue = vehicle.remaining <= 0;
              const soon =
                vehicle.remaining > 0 && vehicle.remaining <= 5000;

              return (
                <div className="service-row" key={vehicle.id}>
                  <span className="vehicle-cell">
                    <strong>{vehicle.registration}</strong>
                    <small>
                      {vehicle.brand} {vehicle.model}
                    </small>
                  </span>

                  <span
                    className={
                      overdue
                        ? "remaining critical"
                        : soon
                          ? "remaining warning"
                          : "remaining"
                    }
                  >
                    {vehicle.remaining.toLocaleString("de-DE")} km
                  </span>

                  <span>
                    <em
                      className={`status-pill ${
                        overdue
                          ? "red"
                          : soon
                            ? "orange"
                            : "green"
                      }`}
                    >
                      {overdue
                        ? "OVERDUE"
                        : soon
                          ? "SOON"
                          : "OK"}
                    </em>
                  </span>

                  <span>
                    {Number(vehicle.serviceKm) <=
                    Number(vehicle.oilKm)
                      ? "SERVICE"
                      : "OIL"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <div className="panel-kicker">COMPLIANCE</div>
              <h2>Documents</h2>
            </div>

            <Link to="/documents" className="panel-link">
              VIEW ALL
            </Link>
          </div>

          <div className="document-summary">
            <div className="document-card red">
              <strong>{stats.expired}</strong>
              <span>EXPIRED</span>
            </div>

            <div className="document-card orange">
              <strong>{stats.expiring}</strong>
              <span>EXPIRING SOON</span>
            </div>

            <div className="document-card green">
              <strong>{validDocuments}</strong>
              <span>VALID</span>
            </div>
          </div>

          <div className="document-progress">
            <div>
              <span>DOCUMENT COMPLIANCE</span>
              <strong>{documentCompliance}%</strong>
            </div>

            <div className="progress-track">
              <span
                style={{
                  width: `${documentCompliance}%`,
                }}
              ></span>
            </div>
          </div>
        </section>
      </div>

      <section className="dashboard-panel activity-panel">
        <div className="panel-heading">
          <div>
            <div className="panel-kicker">ACTIVITY</div>
            <h2>Recent Fleet Activity</h2>
          </div>

          <Link to="/history" className="panel-link">
            VIEW HISTORY
          </Link>
        </div>

        {recentActivity.length > 0 ? (
          <div className="recent-activity-list">
            {recentActivity.map((event) => (
              <div className="recent-activity-item" key={event.id}>
                <div className="activity-type">
                  <span>{event.type === "Service" ? "⚙" : "▤"}</span>
                </div>

                <div className="activity-info">
                  <strong>{event.description}</strong>
                  <span>{event.vehicle}</span>
                </div>

                <div className="activity-meta">
                  <span>{formatDate(event.date)}</span>
                  {event.km && (
                    <small>
                      {Number(event.km).toLocaleString("de-DE")} km
                    </small>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-activity">
            <strong>No recent activity</strong>
            <span>Service and document events will appear here.</span>
          </div>
        )}
      </section>

      <section className="dashboard-panel activity-panel">
        <div className="panel-heading">
          <div>
            <div className="panel-kicker">FLEET DATA</div>
            <h2>Vehicle Status</h2>
          </div>

          <Link to="/vehicles" className="panel-link">
            FLEET
          </Link>
        </div>

        <div className="activity-grid">
          {vehicles.slice(0, 5).map((vehicle) => (
            <div className="activity-card" key={vehicle.id}>
              <div className="activity-top">
                <i
                  className={`mini-status ${
                    vehicle.status?.toLowerCase() || "good"
                  }`}
                ></i>

                <strong>{vehicle.registration}</strong>
              </div>

              <span>
                {vehicle.brand} {vehicle.model}
              </span>

              <small>
                {Number(vehicle.km).toLocaleString("de-DE")} km
              </small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;

