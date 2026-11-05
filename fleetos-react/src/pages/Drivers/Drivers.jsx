import { useMemo, useState } from "react";
import { useFleet } from "../../context/useFleet";
import "../Documents/Documents.css";
import "./Drivers.css";

const LICENSE_CLASSES = [
  "AM",
  "A1",
  "A2",
  "A",
  "B1",
  "B",
  "BE",
  "C1",
  "C1E",
  "C",
  "CE",
  "D1",
  "D1E",
  "D",
  "DE",
  "E",
];

function getLicenseStatus(expiry) {
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
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("de-DE");
}

function getDriverClasses(driver) {
  if (Array.isArray(driver.licenseClasses)) return driver.licenseClasses;
  return driver.licenseClass ? [driver.licenseClass] : [];
}

function createEmptyForm() {
  return {
    name: "",
    phone: "",
    licenseNumber: "",
    licenseClasses: [],
    licenseExpiry: "",
    vehicleId: "",
    notes: "",
  };
}

function Drivers() {
  const { vehicles, drivers, addDriver, updateDriver, deleteDriver } =
    useFleet();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(createEmptyForm);

  const liveDrivers = useMemo(
    () =>
      drivers.map((driver) => ({
        ...driver,
        status: getLicenseStatus(driver.licenseExpiry),
      })),
    [drivers],
  );

  const filteredDrivers = useMemo(() => {
    const value = search.toLowerCase().trim();

    return liveDrivers
      .filter((driver) => {
        const matchesSearch =
          !value ||
          String(driver.name || "").toLowerCase().includes(value) ||
          String(driver.phone || "").toLowerCase().includes(value) ||
          String(driver.licenseNumber || "").toLowerCase().includes(value) ||
          String(driver.registration || "").toLowerCase().includes(value);

        const matchesFilter = filter === "All" || driver.status === filter;

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }, [liveDrivers, search, filter]);

  const stats = useMemo(() => {
    const count = (status) =>
      liveDrivers.filter((driver) => driver.status === status).length;

    return {
      total: liveDrivers.length,
      valid: count("Valid"),
      attention: count("Attention"),
      expired: count("Expired"),
    };
  }, [liveDrivers]);

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const toggleClass = (item) => {
    setForm((current) => ({
      ...current,
      licenseClasses: current.licenseClasses.includes(item)
        ? current.licenseClasses.filter((value) => value !== item)
        : [...current.licenseClasses, item],
    }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(createEmptyForm());
    setModalOpen(true);
  };

  const openEditModal = (driver) => {
    const vehicle = vehicles.find(
      (item) => item.registration === driver.registration,
    );

    setEditingId(driver.id);
    setForm({
      name: driver.name || "",
      phone: driver.phone || "",
      licenseNumber: driver.licenseNumber || "",
      licenseClasses: getDriverClasses(driver),
      licenseExpiry: driver.licenseExpiry || "",
      vehicleId: vehicle ? String(vehicle.id) : "",
      notes: driver.notes || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(createEmptyForm());
  };

  const handleSaveDriver = (event) => {
    event.preventDefault();

    const name = form.name.trim();

    if (!name || !form.licenseExpiry) return;

    const vehicle = vehicles.find(
      (item) => String(item.id) === String(form.vehicleId),
    );

    const driverData = {
      name,
      phone: form.phone.trim(),
      licenseNumber: form.licenseNumber.trim(),
      licenseClasses: form.licenseClasses,
      licenseExpiry: form.licenseExpiry,
      registration: vehicle ? vehicle.registration : "",
      notes: form.notes.trim(),
    };

    if (editingId !== null) {
      updateDriver(editingId, driverData);
    } else {
      addDriver(driverData);
    }

    closeModal();
  };

  const handleDeleteDriver = (driver) => {
    const confirmed = window.confirm(
      `Delete driver ${driver.name}? This cannot be undone.`,
    );

    if (confirmed) {
      deleteDriver(driver.id);
    }
  };

  return (
    <div className="documents-page">
      <div className="documents-header">
        <div>
          <div className="panel-kicker">FLEETOS COMPLIANCE</div>
          <h1>Drivers</h1>
          <p>Driver records and driving licence control</p>
        </div>

        <button
          type="button"
          className="documents-primary-button"
          onClick={openAddModal}
        >
          + Add Driver
        </button>
      </div>

      <section className="documents-kpis">
        <div className="documents-kpi">
          <span>Total Drivers</span>
          <strong>{stats.total}</strong>
        </div>

        <div className="documents-kpi valid">
          <span>Licence Valid</span>
          <strong>{stats.valid}</strong>
        </div>

        <div className="documents-kpi attention">
          <span>Expiring Soon</span>
          <strong>{stats.attention}</strong>
        </div>

        <div className="documents-kpi expired">
          <span>Expired</span>
          <strong>{stats.expired}</strong>
        </div>
      </section>

      <section className="documents-section">
        <div className="documents-section-header">
          <div>
            <div className="panel-kicker">LICENCE CONTROL</div>
            <h2>Fleet Drivers</h2>
            <p>Licence status is calculated live from the expiry date</p>
          </div>
        </div>

        <div className="documents-toolbar">
          <input
            type="text"
            placeholder="Search name, phone, licence or vehicle..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Valid">Valid</option>
            <option value="Attention">Expiring Soon</option>
            <option value="Expired">Expired</option>
            <option value="Missing">Missing</option>
          </select>
        </div>

        <div className="documents-table-wrapper">
          <table className="documents-table">
            <thead>
              <tr>
                <th>DRIVER</th>
                <th>PHONE</th>
                <th>LICENCE</th>
                <th>EXPIRY</th>
                <th>STATUS</th>
                <th>VEHICLE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filteredDrivers.map((driver) => (
                <tr key={driver.id}>
                  <td>
                    <div className="documents-vehicle">
                      <strong>{driver.name}</strong>
                    </div>
                  </td>

                  <td>{driver.phone || "-"}</td>

                  <td>
                    {getDriverClasses(driver).join(", ") || "-"}
                    {driver.licenseNumber ? ` - ${driver.licenseNumber}` : ""}
                  </td>

                  <td>{formatDate(driver.licenseExpiry)}</td>

                  <td>
                    <span
                      className={`documents-status documents-status-${driver.status.toLowerCase()}`}
                    >
                      <span className="documents-status-dot"></span>
                      {driver.status === "Attention"
                        ? "Expiring Soon"
                        : driver.status}
                    </span>
                  </td>

                  <td>
                    <strong className="documents-registration">
                      {driver.registration || "-"}
                    </strong>
                  </td>

                  <td>
                    <div className="documents-actions">
                      <button
                        type="button"
                        onClick={() => openEditModal(driver)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="documents-delete"
                        onClick={() => handleDeleteDriver(driver)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredDrivers.length === 0 && (
                <tr>
                  <td colSpan="7" className="documents-empty">
                    {drivers.length === 0
                      ? "No drivers yet. Use + Add Driver to enter the first one."
                      : "No drivers match your search."}
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
                <h2>{editingId !== null ? "Edit Driver" : "Add Driver"}</h2>
                <p>Name and licence expiry date are required.</p>
              </div>

              <button
                type="button"
                className="documents-modal-close"
                onClick={closeModal}
              >
                {String.fromCharCode(215)}
              </button>
            </div>

            <form className="documents-form" onSubmit={handleSaveDriver}>
              <label>
                <span>FULL NAME</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  required
                />
              </label>

              <label>
                <span>PHONE</span>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="Optional"
                />
              </label>

              <div className="drivers-classes-field">
                <span>LICENCE CLASSES</span>
                <div className="drivers-classes">
                  {LICENSE_CLASSES.map((item) => (
                    <label key={item} className="drivers-class-option">
                      <input
                        type="checkbox"
                        checked={form.licenseClasses.includes(item)}
                        onChange={() => toggleClass(item)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label>
                <span>LICENCE NUMBER</span>
                <input
                  type="text"
                  value={form.licenseNumber}
                  onChange={(event) =>
                    updateField("licenseNumber", event.target.value)
                  }
                  placeholder="Optional"
                />
              </label>

              <label>
                <span>LICENCE EXPIRY DATE</span>
                <input
                  type="date"
                  value={form.licenseExpiry}
                  onChange={(event) =>
                    updateField("licenseExpiry", event.target.value)
                  }
                  required
                />
              </label>

              <label>
                <span>ASSIGNED VEHICLE</span>
                <select
                  value={form.vehicleId}
                  onChange={(event) =>
                    updateField("vehicleId", event.target.value)
                  }
                >
                  <option value="">Not assigned</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registration} - {vehicle.brand} {vehicle.model}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>NOTES</span>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  placeholder="Optional"
                />
              </label>

              <button type="submit" className="documents-form-save">
                {editingId !== null ? "Update Driver" : "Save Driver"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Drivers;
