import { useMemo, useState } from "react";
import { useFleet } from "../../context/useFleet";
import "./Alerts.css";

function getMaintenanceStatus(currentKm, targetKm) {
  const remaining = Number(targetKm || 0) - Number(currentKm || 0);

  if (remaining <= 0) return "Critical";
  if (remaining <= 2000) return "Critical";
  if (remaining <= 5000) return "Attention";
  return "Good";
}

function getDocumentStatus(expiry) {
  if (!expiry) return "Missing";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDate = new Date(`${expiry}T00:00:00`);
  const diffDays = Math.ceil((expiryDate - today) / 86400000);

  if (diffDays < 0) return "Expired";
  if (diffDays <= 30) return "Attention";
  return "Valid";
}

function formatDate(value) {
  if (!value) return "â€”";
  return new Date(`${value}T00:00:00`).toLocaleDateString("de-DE");
}

function Alerts() {
  const { vehicles, documents } = useFleet();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const alerts = useMemo(() => {
    const items = [];

    vehicles.forEach((vehicle) => {
      const currentKm = Number(vehicle.km || 0);
      const serviceKm = Number(vehicle.serviceKm || 0);
      const oilKm = Number(vehicle.oilKm || 0);

      if (serviceKm > 0) {
        const remaining = serviceKm - currentKm;
        const status = getMaintenanceStatus(currentKm, serviceKm);

        if (status !== "Good") {
          items.push({
            id: `service-${vehicle.id}`,
            priority: status,
            category: "Service",
            title: `${vehicle.registration} - Service`,
            description:
              remaining <= 0
                ? "Service interval exceeded."
                : `${remaining.toLocaleString("de-DE")} km remaining until service.`,
            vehicle: `${vehicle.brand} ${vehicle.model}`,
            registration: vehicle.registration,
          });
        }
      }

      if (oilKm > 0) {
        const remaining = oilKm - currentKm;
        const status = getMaintenanceStatus(currentKm, oilKm);

        if (status !== "Good") {
          items.push({
            id: `oil-${vehicle.id}`,
            priority: status,
            category: "Oil",
            title: `${vehicle.registration} - Oil`,
            description:
              remaining <= 0
                ? "Oil change interval exceeded."
                : `${remaining.toLocaleString("de-DE")} km remaining until oil change.`,
            vehicle: `${vehicle.brand} ${vehicle.model}`,
            registration: vehicle.registration,
          });
        }
      }
    });

    documents.forEach((document) => {
      const status = getDocumentStatus(document.expiry);

      if (status !== "Valid") {
        items.push({
          id: `document-${document.id}`,
          priority: status === "Expired" ? "Critical" : "Attention",
          category: "Document",
          title: `${document.registration} - ${document.document}`,
          description:
            status === "Expired"
              ? `Document expired on ${formatDate(document.expiry)}.`
              : `Document expires on ${formatDate(document.expiry)}.`,
          vehicle: document.vehicle,
          registration: document.registration,
        });
      }
    });

    return items;
  }, [vehicles, documents]);

  const filteredAlerts = alerts.filter((alert) => {
    const value = search.toLowerCase().trim();

    const matchesSearch =
      !value ||
      alert.title.toLowerCase().includes(value) ||
      alert.description.toLowerCase().includes(value) ||
      alert.vehicle.toLowerCase().includes(value) ||
      alert.registration.toLowerCase().includes(value);

    const matchesFilter =
      filter === "All" || alert.priority === filter;

    return matchesSearch && matchesFilter;
  });

  const criticalCount = alerts.filter(
    (alert) => alert.priority === "Critical",
  ).length;

  const attentionCount = alerts.filter(
    (alert) => alert.priority === "Attention",
  ).length;

  const serviceCount = alerts.filter(
    (alert) => alert.category === "Service" || alert.category === "Oil",
  ).length;

  const documentCount = alerts.filter(
    (alert) => alert.category === "Document",
  ).length;

  return (
    <div className="alerts-page">
      <div className="alerts-header">
        <div>
          <div className="panel-kicker">FLEETOS MONITORING</div>
          <h1>Alerts</h1>
          <p>Maintenance and compliance alerts across the fleet</p>
        </div>
      </div>

      <section className="alerts-kpis">
        <div className="alerts-kpi total">
          <span>Total Alerts</span>
          <strong>{alerts.length}</strong>
        </div>
        <div className="alerts-kpi critical">
          <span>Critical</span>
          <strong>{criticalCount}</strong>
        </div>
        <div className="alerts-kpi attention">
          <span>Attention</span>
          <strong>{attentionCount}</strong>
        </div>
        <div className="alerts-kpi service">
          <span>Maintenance</span>
          <strong>{serviceCount}</strong>
        </div>
        <div className="alerts-kpi document">
          <span>Documents</span>
          <strong>{documentCount}</strong>
        </div>
      </section>

      <section className="alerts-section">
        <div className="alerts-section-header">
          <div>
            <div className="panel-kicker">ALERT CONTROL</div>
            <h2>Active Alerts</h2>
            <p>Live alerts calculated from current fleet data</p>
          </div>
        </div>

        <div className="alerts-toolbar">
          <input
            type="text"
            placeholder="Search registration, vehicle or alert..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="Attention">Attention</option>
          </select>
        </div>

        <div className="alerts-list">
          {filteredAlerts.map((alert) => (
            <article
              key={alert.id}
              className={`alert-card alert-card-${alert.priority.toLowerCase()}`}
            >
              <div className="alert-card-icon">
                {alert.category === "Document" ? "D" : "!"}
              </div>

              <div className="alert-card-content">
                <div className="alert-card-top">
                  <span className="alert-category">{alert.category}</span>
                  <span
                    className={`alert-priority alert-priority-${alert.priority.toLowerCase()}`}
                  >
                    {alert.priority}
                  </span>
                </div>

                <h3>{alert.title}</h3>
                <p>{alert.description}</p>

                <span className="alert-vehicle">
                  {alert.vehicle} - {alert.registration}
                </span>
              </div>
            </article>
          ))}

          {filteredAlerts.length === 0 && (
            <div className="alerts-empty">
              <strong>No active alerts</strong>
              <span>The current fleet has no alerts matching this filter.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Alerts;
