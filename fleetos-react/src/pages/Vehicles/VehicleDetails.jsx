import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFleet } from "../../context/useFleet";
import "./VehicleDetails.css";

const HISTORY_KEY = "fleetos-service-history";
const DASH = String.fromCharCode(8212);

function loadHistory() {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getMaintenanceStatus(currentKm, targetKm) {
  const target = Number(targetKm || 0);

  if (target <= 0) return "Not set";

  const remaining = target - Number(currentKm || 0);

  if (remaining <= 0) return "Overdue";
  if (remaining <= 2000) return "Critical";
  if (remaining <= 5000) return "Attention";
  return "Good";
}

function getOverallStatus(...statuses) {
  const priority = ["Overdue", "Critical", "Attention", "Good"];

  return priority.find((status) => statuses.includes(status)) || "Not set";
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

function statusKey(status) {
  return String(status || "").toLowerCase().replace(/\s+/g, "");
}

function formatKm(value) {
  return `${Number(value || 0).toLocaleString("de-DE")} km`;
}

function formatDate(value) {
  if (!value) return DASH;

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("de-DE");
}

function remainingText(currentKm, targetKm) {
  const target = Number(targetKm || 0);

  if (target <= 0) return "No interval set";

  const remaining = target - Number(currentKm || 0);

  if (remaining <= 0) {
    return `Overdue by ${Math.abs(remaining).toLocaleString("de-DE")} km`;
  }

  return `${remaining.toLocaleString("de-DE")} km remaining`;
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

function StatusBadge({ status, label }) {
  return (
    <span className={`vprofile-status vprofile-status-${statusKey(status)}`}>
      <span className="vprofile-status-dot"></span>
      {label || status}
    </span>
  );
}

function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicles, documents, costs } = useFleet();

  const history = useMemo(() => {
    return loadHistory()
      .filter((entry) => String(entry.vehicleId) === String(id))
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  }, [id]);

  const vehicle = vehicles.find((item) => String(item.id) === String(id));

  if (!vehicle) {
    return (
      <div className="vprofile-page">
        <section className="vprofile-card vprofile-notfound">
          <h1>Vehicle not found</h1>
          <p>This vehicle does not exist or was removed.</p>
          <button
            type="button"
            className="vprofile-back"
            onClick={() => navigate("/vehicles")}
          >
            Back to Vehicles
          </button>
        </section>
      </div>
    );
  }

  const currentKm = Number(vehicle.km || 0);
  const serviceStatus = getMaintenanceStatus(currentKm, vehicle.serviceKm);
  const oilStatus = getMaintenanceStatus(currentKm, vehicle.oilKm);
  const overallStatus = getOverallStatus(serviceStatus, oilStatus);

  const vehicleDocuments = documents
    .filter((document) => document.registration === vehicle.registration)
    .map((document) => ({
      ...document,
      liveStatus: getDocumentStatus(document.expiry),
    }));

  const alertDocuments = vehicleDocuments.filter(
    (document) =>
      document.liveStatus === "Expired" ||
      document.liveStatus === "Attention" ||
      document.liveStatus === "Missing",
  );
  const expiredCount = vehicleDocuments.filter(
    (document) => document.liveStatus === "Expired",
  ).length;

  const vehicleCosts = (costs || [])
    .filter((cost) => cost.registration === vehicle.registration)
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const totalCosts = vehicleCosts.reduce(
    (sum, cost) => sum + Number(cost.amount || 0),
    0,
  );
  const thisYear = String(new Date().getFullYear());
  const yearCosts = vehicleCosts
    .filter((cost) => String(cost.date || "").startsWith(thisYear))
    .reduce((sum, cost) => sum + Number(cost.amount || 0), 0);

  return (
    <div className="vprofile-page">
      <button
        type="button"
        className="vprofile-back"
        onClick={() => navigate("/vehicles")}
      >
        {String.fromCharCode(8592)} Back to Vehicles
      </button>

      <div className="vprofile-header">
        <div>
          <div className="vprofile-kicker">VEHICLE PROFILE</div>
          <h1>
            {vehicle.brand} {vehicle.model}
          </h1>
          <p>
            {vehicle.registration}
            {vehicle.year ? ` - ${vehicle.year}` : ""}
            {vehicle.driver ? ` - Driver: ${vehicle.driver}` : ""}
          </p>
        </div>

        <StatusBadge
          status={overallStatus}
          label={`Maintenance: ${overallStatus}`}
        />
      </div>

      <section className="vprofile-kpis">
        <div className="vprofile-kpi">
          <span>Current KM</span>
          <strong>{formatKm(currentKm)}</strong>
          <small>From the vehicle record</small>
        </div>

        <div className={`vprofile-kpi vprofile-kpi-${statusKey(serviceStatus)}`}>
          <span>Next Service</span>
          <strong>
            {Number(vehicle.serviceKm || 0) > 0
              ? formatKm(vehicle.serviceKm)
              : "Not set"}
          </strong>
          <small>{remainingText(currentKm, vehicle.serviceKm)}</small>
        </div>

        <div className={`vprofile-kpi vprofile-kpi-${statusKey(oilStatus)}`}>
          <span>Next Oil</span>
          <strong>
            {Number(vehicle.oilKm || 0) > 0
              ? formatKm(vehicle.oilKm)
              : "Not set"}
          </strong>
          <small>{remainingText(currentKm, vehicle.oilKm)}</small>
        </div>

        <div
          className={`vprofile-kpi ${
            expiredCount > 0
              ? "vprofile-kpi-critical"
              : alertDocuments.length > 0
                ? "vprofile-kpi-attention"
                : "vprofile-kpi-good"
          }`}
        >
          <span>Document Alerts</span>
          <strong>{alertDocuments.length}</strong>
          <small>
            {alertDocuments.length === 0
              ? "All documents valid"
              : `${expiredCount} expired, ${
                  alertDocuments.length - expiredCount
                } need attention`}
          </small>
        </div>

        <div className="vprofile-kpi">
          <span>Total Costs</span>
          <strong>{formatMoney(totalCosts)}</strong>
          <small>{`${formatMoney(yearCosts)} in ${thisYear}`}</small>
        </div>
      </section>

      <nav className="vprofile-quicklinks">
        <Link to="/service">Service</Link>
        <Link to="/documents">Documents</Link>
        <Link to="/costs">Costs</Link>
        <Link to="/history">History</Link>
      </nav>

      <div className="vprofile-grid">
        <section className="vprofile-card">
          <h2>Vehicle Details</h2>

          <dl className="vprofile-details">
            <div>
              <dt>Registration</dt>
              <dd>{vehicle.registration || DASH}</dd>
            </div>
            <div>
              <dt>Brand</dt>
              <dd>{vehicle.brand || DASH}</dd>
            </div>
            <div>
              <dt>Model</dt>
              <dd>{vehicle.model || DASH}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{vehicle.year || DASH}</dd>
            </div>
            <div>
              <dt>Driver</dt>
              <dd>{vehicle.driver || DASH}</dd>
            </div>
            <div>
              <dt>Fleet status</dt>
              <dd>{vehicle.status || DASH}</dd>
            </div>
          </dl>

          <h3>Observations</h3>
          <p className="vprofile-observations">
            {vehicle.observations || "No observations"}
          </p>
        </section>

        <section className="vprofile-card">
          <h2>Documents</h2>

          {vehicleDocuments.length > 0 ? (
            <ul className="vprofile-list">
              {vehicleDocuments.map((document) => (
                <li key={document.id} className="vprofile-list-item">
                  <div>
                    <strong>{document.document || document.type}</strong>
                    <span>
                      {`${document.type} - expires ${formatDate(document.expiry)}`}
                    </span>
                  </div>

                  <StatusBadge
                    status={document.liveStatus}
                    label={
                      document.liveStatus === "Attention"
                        ? "Expiring Soon"
                        : document.liveStatus
                    }
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="vprofile-empty">
              No documents recorded for this vehicle.
            </p>
          )}
        </section>
      </div>

      <section className="vprofile-card vprofile-costs-card">
        <div className="vprofile-card-header">
          <h2>Costs</h2>
          <span>{vehicleCosts.length} records</span>
        </div>

        {vehicleCosts.length > 0 ? (
          <ul className="vprofile-list">
            {vehicleCosts.slice(0, 5).map((cost) => (
              <li key={cost.id} className="vprofile-list-item">
                <div>
                  <strong>{cost.category || "Other"}</strong>
                  <span>{cost.notes || "No notes"}</span>
                </div>

                <div className="vprofile-list-meta">
                  <strong>{formatMoney(cost.amount)}</strong>
                  <span>{formatDate(cost.date)}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="vprofile-empty">
            No costs recorded yet. Add them from the Costs page.
          </p>
        )}
      </section>

      <section className="vprofile-card">
        <div className="vprofile-card-header">
          <h2>Service History</h2>
          <span>{history.length} records</span>
        </div>

        {history.length > 0 ? (
          <ul className="vprofile-list">
            {history.map((entry) => (
              <li key={entry.id} className="vprofile-list-item">
                <div>
                  <strong>{entry.type || entry.serviceType || "Service"}</strong>
                  <span>{entry.notes || "No notes"}</span>
                </div>

                <div className="vprofile-list-meta">
                  <strong>{formatDate(entry.date)}</strong>
                  <span>{formatKm(entry.km)}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="vprofile-empty">
            No maintenance recorded yet. Add records from the Service page.
          </p>
        )}
      </section>
    </div>
  );
}

export default VehicleDetails;