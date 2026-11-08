import { useMemo, useState } from "react";
import { useFleet } from "../../context/useFleet";
import { exportCsv, formatCsvNumber } from "../../utils/exportCsv";
import "../Documents/Documents.css";

const TYPES = ["Damage", "Fine"];
const STATUSES = ["Open", "In progress", "Resolved"];

function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

const INCIDENT_COLUMNS = [
  { label: "Date", value: (item) => item.date },
  { label: "Type", value: (item) => item.type },
  { label: "Registration", value: (item) => item.registration },
  { label: "Vehicle", value: (item) => item.vehicle },
  { label: "Driver", value: (item) => item.driver },
  { label: "Amount (EUR)", value: (item) => formatCsvNumber(item.amount) },
  { label: "Status", value: (item) => item.status },
  { label: "Notes", value: (item) => item.notes },
];

function formatDate(value) {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("de-DE");
}

function statusClass(status) {
  if (status === "Resolved") return "valid";
  if (status === "In progress") return "attention";
  return "expired";
}

function createEmptyForm() {
  return {
    type: "Damage",
    vehicleId: "",
    driverId: "",
    date: todayString(),
    amount: "",
    status: "Open",
    notes: "",
  };
}

function Incidents() {
  const {
    vehicles,
    drivers,
    incidents,
    addIncident,
    updateIncident,
    deleteIncident,
  } = useFleet();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(createEmptyForm);

  const filteredIncidents = useMemo(() => {
    const value = search.toLowerCase().trim();

    return incidents
      .filter((item) => {
        const matchesSearch =
          !value ||
          String(item.registration || "").toLowerCase().includes(value) ||
          String(item.vehicle || "").toLowerCase().includes(value) ||
          String(item.driver || "").toLowerCase().includes(value) ||
          String(item.notes || "").toLowerCase().includes(value);

        const matchesType = typeFilter === "All" || item.type === typeFilter;
        const matchesStatus =
          statusFilter === "All" || item.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  }, [incidents, search, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const open = incidents.filter((item) => item.status !== "Resolved");

    return {
      total: incidents.length,
      open: open.length,
      resolved: incidents.length - open.length,
      amount: incidents.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    };
  }, [incidents]);

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(createEmptyForm());
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    const vehicle = vehicles.find(
      (entry) => entry.registration === item.registration,
    );
    const driver = drivers.find((entry) => entry.name === item.driver);

    setEditingId(item.id);
    setForm({
      type: item.type || "Damage",
      vehicleId: vehicle ? String(vehicle.id) : "",
      driverId: driver ? String(driver.id) : "",
      date: item.date || todayString(),
      amount: String(item.amount ?? ""),
      status: item.status || "Open",
      notes: item.notes || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(createEmptyForm());
  };

  const handleSave = (event) => {
    event.preventDefault();

    const vehicle = vehicles.find(
      (entry) => String(entry.id) === String(form.vehicleId),
    );
    const driver = drivers.find(
      (entry) => String(entry.id) === String(form.driverId),
    );
    const amount = Number(form.amount);

    if (!vehicle || !form.date || !(amount >= 0) || form.amount === "") return;

    const data = {
      type: form.type,
      registration: vehicle.registration,
      vehicle: `${vehicle.brand} ${vehicle.model}`,
      driver: driver ? driver.name : "",
      date: form.date,
      amount,
      status: form.status,
      notes: form.notes.trim(),
    };

    if (editingId !== null) {
      updateIncident(editingId, data);
    } else {
      addIncident(data);
    }

    closeModal();
  };

  const handleDelete = (item) => {
    const confirmed = window.confirm(
      `Delete this ${item.type.toLowerCase()} for ${item.registration}? This cannot be undone.`,
    );

    if (confirmed) {
      deleteIncident(item.id);
    }
  };

  return (
    <div className="documents-page">
      <div className="documents-header">
        <div>
          <div className="panel-kicker">FLEETOS COMPLIANCE</div>
          <h1>Incidents</h1>
          <p>Damages and fines recorded for fleet vehicles</p>
          <button
            type="button"
            className="documents-export-button"
            onClick={() => exportCsv("incidents", INCIDENT_COLUMNS, filteredIncidents)}
          >
            Export CSV
          </button>
        </div>

        <button
          type="button"
          className="documents-primary-button"
          onClick={openAddModal}
        >
          + Add Incident
        </button>
      </div>

      <section className="documents-kpis">
        <div className="documents-kpi">
          <span>Total Records</span>
          <strong>{stats.total}</strong>
        </div>

        <div className="documents-kpi attention">
          <span>Open</span>
          <strong>{stats.open}</strong>
        </div>

        <div className="documents-kpi valid">
          <span>Resolved</span>
          <strong>{stats.resolved}</strong>
        </div>

        <div className="documents-kpi">
          <span>Total Amount</span>
          <strong>{formatMoney(stats.amount)}</strong>
        </div>
      </section>

      <section className="documents-section">
        <div className="documents-section-header">
          <div>
            <div className="panel-kicker">INCIDENT CONTROL</div>
            <h2>Damages and Fines</h2>
            <p>Open items stay visible until they are marked as resolved</p>
          </div>
        </div>

        <div className="documents-toolbar">
          <input
            type="text"
            placeholder="Search vehicle, driver or notes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="All">All Types</option>
            {TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Statuses</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="documents-table-wrapper">
          <table className="documents-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>TYPE</th>
                <th>VEHICLE</th>
                <th>DRIVER</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filteredIncidents.map((item) => (
                <tr key={item.id}>
                  <td>{formatDate(item.date)}</td>

                  <td>
                    <div className="documents-vehicle">
                      <strong>{item.type}</strong>
                      {item.notes ? <span>{item.notes}</span> : null}
                    </div>
                  </td>

                  <td>
                    <strong className="documents-registration">
                      {item.registration}
                    </strong>
                  </td>

                  <td>{item.driver || "-"}</td>

                  <td>
                    <strong>{formatMoney(item.amount)}</strong>
                  </td>

                  <td>
                    <span
                      className={`documents-status documents-status-${statusClass(item.status)}`}
                    >
                      <span className="documents-status-dot"></span>
                      {item.status}
                    </span>
                  </td>

                  <td>
                    <div className="documents-actions">
                      <button type="button" onClick={() => openEditModal(item)}>
                        Edit
                      </button>

                      <button
                        type="button"
                        className="documents-delete"
                        onClick={() => handleDelete(item)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredIncidents.length === 0 && (
                <tr>
                  <td colSpan="7" className="documents-empty">
                    {incidents.length === 0
                      ? "No incidents recorded. Use + Add Incident to enter one."
                      : "No incidents match your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="documents-modal-backdrop" onClick={closeModal}>
          <div
            className="documents-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="documents-modal-header">
              <div>
                <div className="panel-kicker">FLEETOS COMPLIANCE</div>
                <h2>{editingId !== null ? "Edit Incident" : "Add Incident"}</h2>
                <p>Vehicle, date and amount are required.</p>
              </div>

              <button
                type="button"
                className="documents-modal-close"
                onClick={closeModal}
              >
                {String.fromCharCode(215)}
              </button>
            </div>

            <form className="documents-form" onSubmit={handleSave}>
              <label>
                <span>TYPE</span>
                <select
                  value={form.type}
                  onChange={(event) => updateField("type", event.target.value)}
                >
                  {TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>STATUS</span>
                <select
                  value={form.status}
                  onChange={(event) => updateField("status", event.target.value)}
                >
                  {STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>VEHICLE</span>
                <select
                  value={form.vehicleId}
                  onChange={(event) =>
                    updateField("vehicleId", event.target.value)
                  }
                  required
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registration} - {vehicle.brand} {vehicle.model}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>DRIVER</span>
                <select
                  value={form.driverId}
                  onChange={(event) =>
                    updateField("driverId", event.target.value)
                  }
                >
                  <option value="">Not specified</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>DATE</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => updateField("date", event.target.value)}
                  required
                />
              </label>

              <label>
                <span>AMOUNT (EUR)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) => updateField("amount", event.target.value)}
                  placeholder="0.00"
                  required
                />
              </label>

              <label className="incidents-notes">
                <span>NOTES</span>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  placeholder="Optional"
                />
              </label>

              <button type="submit" className="documents-form-save">
                {editingId !== null ? "Update Incident" : "Save Incident"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Incidents;
