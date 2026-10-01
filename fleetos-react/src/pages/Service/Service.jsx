import { useMemo, useState } from "react";
import { useFleet } from "../../context/useFleet";
import "./Service.css";

const HISTORY_KEY = "fleetos-service-history";

function loadHistory() {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function getStatus(currentKm, targetKm) {
  const remaining = Number(targetKm || 0) - Number(currentKm || 0);

  if (remaining <= 0) return "Overdue";
  if (remaining <= 2000) return "Critical";
  if (remaining <= 5000) return "Attention";
  return "Good";
}

function getOverallStatus(serviceStatus, oilStatus) {
  const priority = ["Overdue", "Critical", "Attention", "Good"];

  return (
    priority.find(
      (status) => serviceStatus === status || oilStatus === status,
    ) || "Good"
  );
}

function formatKm(value) {
  return `${Number(value || 0).toLocaleString("de-DE")} km`;
}

function Service() {
  const { vehicles } = useFleet();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [history, setHistory] = useState(loadHistory);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [form, setForm] = useState({
    type: "Service",
    date: new Date().toISOString().slice(0, 10),
    km: "",
    notes: "",
  });

  const services = useMemo(() => {
    return vehicles.map((vehicle) => {
      const currentKm = Number(vehicle.km || 0);
      const serviceKm = Number(vehicle.serviceKm || 0);
      const oilKm = Number(vehicle.oilKm || 0);

      const serviceStatus = getStatus(currentKm, serviceKm);
      const oilStatus = getStatus(currentKm, oilKm);
      const status = getOverallStatus(serviceStatus, oilStatus);

      return {
        ...vehicle,
        currentKm,
        serviceKm,
        oilKm,
        serviceStatus,
        oilStatus,
        status,
        serviceRemaining: serviceKm - currentKm,
        oilRemaining: oilKm - currentKm,
        serviceType:
          serviceKm > 0 && oilKm > 0
            ? "Service + Oil"
            : serviceKm > 0
              ? "Service"
              : oilKm > 0
                ? "Oil"
                : "Maintenance",
      };
    });
  }, [vehicles]);

  const filteredServices = services.filter((service) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      !searchValue ||
      String(service.registration || "").toLowerCase().includes(searchValue) ||
      `${service.brand || ""} ${service.model || ""}`
        .toLowerCase()
        .includes(searchValue) ||
      String(service.driver || "").toLowerCase().includes(searchValue);

    const matchesFilter =
      filter === "All" || service.status === filter;

    return matchesSearch && matchesFilter;
  });

  const overdueCount = services.filter(
    (service) => service.status === "Overdue",
  ).length;

  const criticalCount = services.filter(
    (service) => service.status === "Critical",
  ).length;

  const attentionCount = services.filter(
    (service) => service.status === "Attention",
  ).length;

  const persistHistory = (nextHistory) => {
    setHistory(nextHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
  };

  const openHistory = (vehicleId = "") => {
    setSelectedVehicleId(String(vehicleId || ""));
    setHistoryOpen(true);
  };

  const closeHistory = () => {
    setHistoryOpen(false);
    setSelectedVehicleId("");
    setForm({
      type: "Service",
      date: new Date().toISOString().slice(0, 10),
      km: "",
      notes: "",
    });
  };

  const handleAddHistory = (event) => {
    event.preventDefault();

    if (!selectedVehicleId || !form.km) return;

    const vehicle = vehicles.find(
      (item) => String(item.id) === String(selectedVehicleId),
    );

    if (!vehicle) return;

    const entry = {
      id: Date.now(),
      vehicleId: vehicle.id,
      registration: vehicle.registration,
      vehicle: `${vehicle.brand} ${vehicle.model}`,
      type: form.type,
      date: form.date,
      km: Number(form.km),
      notes: form.notes.trim(),
    };

    persistHistory([entry, ...history]);

    setForm({
      type: "Service",
      date: new Date().toISOString().slice(0, 10),
      km: "",
      notes: "",
    });
  };

  const selectedVehicle = vehicles.find(
    (vehicle) => String(vehicle.id) === String(selectedVehicleId),
  );

  const visibleHistory = history.filter((entry) => {
    if (!selectedVehicleId) return true;
    return String(entry.vehicleId) === String(selectedVehicleId);
  });

  return (
    <div className="service-page">
      <div className="service-header">
        <div>
          <div className="panel-kicker">FLEETOS MAINTENANCE</div>
          <h1>Service</h1>
          <p>Maintenance schedule and service status</p>
        </div>
      </div>

      <section className="service-kpis">
        <div className="service-kpi">
          <span>Total Services</span>
          <strong>{services.length}</strong>
        </div>

        <div className="service-kpi overdue">
          <span>Overdue</span>
          <strong>{overdueCount}</strong>
        </div>

        <div className="service-kpi critical">
          <span>Critical</span>
          <strong>{criticalCount}</strong>
        </div>

        <div className="service-kpi attention">
          <span>Attention</span>
          <strong>{attentionCount}</strong>
        </div>
      </section>

      <section className="service-section">
        <div className="service-section-header">
          <div>
            <div className="panel-kicker">MAINTENANCE CONTROL</div>
            <h2>Maintenance Schedule</h2>
            <p>
              Live service and oil intervals from the fleet vehicle records
            </p>
          </div>

          <button
            type="button"
            className="service-history-button"
            onClick={() => openHistory()}
          >
            Service History
          </button>
        </div>

        <div className="service-toolbar">
          <div className="service-search">
            <input
              type="text"
              placeholder="Search registration, vehicle or driver..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="service-filter">
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Good">Good</option>
              <option value="Attention">Attention</option>
              <option value="Critical">Critical</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="service-table-wrapper">
          <table className="service-table">
            <thead>
              <tr>
                <th>VEHICLE</th>
                <th>REGISTRATION</th>
                <th>CURRENT KM</th>
                <th>NEXT SERVICE</th>
                <th>NEXT OIL</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id}>
                  <td>
                    <div className="service-vehicle">
                      <strong>
                        {service.brand} {service.model}
                      </strong>
                      <span>
                        {service.serviceType}
                        {service.driver ? ` â€¢ ${service.driver}` : ""}
                      </span>
                    </div>
                  </td>

                  <td>
                    <strong className="service-registration">
                      {service.registration}
                    </strong>
                  </td>

                  <td>{formatKm(service.currentKm)}</td>

                  <td>
                    <div className="service-target">
                      <strong>
                        {service.serviceKm > 0
                          ? formatKm(service.serviceKm)
                          : "Not set"}
                      </strong>
                      <span>
                        {service.serviceKm <= 0
                          ? "No interval set"
                          : service.serviceRemaining <= 0
                            ? "Overdue"
                            : `${service.serviceRemaining.toLocaleString("de-DE")} km remaining`}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div className="service-target">
                      <strong>
                        {service.oilKm > 0
                          ? formatKm(service.oilKm)
                          : "Not set"}
                      </strong>
                      <span>
                        {service.oilKm <= 0
                          ? "No interval set"
                          : service.oilRemaining <= 0
                            ? "Overdue"
                            : `${service.oilRemaining.toLocaleString("de-DE")} km remaining`}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`service-status service-status-${service.status.toLowerCase()}`}
                    >
                      <span className="service-status-dot"></span>
                      {service.status}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="service-row-button"
                      onClick={() => openHistory(service.id)}
                    >
                      History
                    </button>
                  </td>
                </tr>
              ))}

              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan="7" className="service-empty">
                    No service records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {historyOpen && (
        <div className="service-modal-backdrop" onClick={closeHistory}>
          <div
            className="service-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="service-modal-header">
              <div>
                <div className="panel-kicker">FLEETOS HISTORY</div>
                <h2>Service History</h2>
                <p>
                  {selectedVehicle
                    ? `${selectedVehicle.registration} â€¢ ${selectedVehicle.brand} ${selectedVehicle.model}`
                    : "All recorded maintenance"}
                </p>
              </div>

              <button
                type="button"
                className="service-modal-close"
                onClick={closeHistory}
                aria-label="Close"
              >
                Ã—
              </button>
            </div>

            <form className="service-history-form" onSubmit={handleAddHistory}>
              <div className="service-history-field">
                <label>VEHICLE</label>
                <select
                  value={selectedVehicleId}
                  onChange={(event) =>
                    setSelectedVehicleId(event.target.value)
                  }
                  required
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registration} â€” {vehicle.brand} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="service-history-field">
                <label>TYPE</label>
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      type: event.target.value,
                    }))
                  }
                >
                  <option value="Service">Service</option>
                  <option value="Oil">Oil Change</option>
                  <option value="Brakes">Brakes</option>
                  <option value="Tires">Tires</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Repair">Repair</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="service-history-field">
                <label>DATE</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="service-history-field">
                <label>KM</label>
                <input
                  type="number"
                  min="0"
                  value={form.km}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      km: event.target.value,
                    }))
                  }
                  placeholder="e.g. 150000"
                  required
                />
              </div>

              <div className="service-history-field service-history-notes">
                <label>NOTES</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Work performed / parts replaced..."
                />
              </div>

              <button type="submit" className="service-history-save">
                Add Record
              </button>
            </form>

            <div className="service-history-list">
              <div className="service-history-list-header">
                <h3>Recorded Work</h3>
                <span>{visibleHistory.length} records</span>
              </div>

              {visibleHistory.length > 0 ? (
                visibleHistory.map((entry) => (
                  <div className="service-history-item" key={entry.id}>
                    <div className="service-history-item-main">
                      <strong>{entry.type}</strong>
                      <span>
                        {entry.registration} â€¢{" "}
                        {Number(entry.km || 0).toLocaleString("de-DE")} km
                      </span>
                    </div>

                    <div className="service-history-item-date">
                      <strong>{entry.date}</strong>
                      <span>{entry.notes || "No notes"}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="service-history-empty">
                  No maintenance history recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Service;

