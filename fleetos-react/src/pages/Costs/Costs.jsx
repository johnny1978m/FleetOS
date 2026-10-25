import { useMemo, useState } from "react";
import { useFleet } from "../../context/useFleet";
import "../Documents/Documents.css";

const CATEGORIES = [
  "Fuel",
  "Service",
  "Repair",
  "Tires",
  "Insurance",
  "Tax",
  "Other",
];

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

function formatDate(value) {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("de-DE");
}

function createEmptyForm() {
  return {
    vehicleId: "",
    category: "Fuel",
    date: todayString(),
    amount: "",
    notes: "",
  };
}

function Costs() {
  const { vehicles, costs, addCost, updateCost, deleteCost } = useFleet();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(createEmptyForm);

  const filteredCosts = useMemo(() => {
    const value = search.toLowerCase().trim();

    return [...costs]
      .filter((cost) => {
        const matchesSearch =
          !value ||
          String(cost.registration || "").toLowerCase().includes(value) ||
          String(cost.vehicle || "").toLowerCase().includes(value) ||
          String(cost.category || "").toLowerCase().includes(value) ||
          String(cost.notes || "").toLowerCase().includes(value);

        const matchesFilter = filter === "All" || cost.category === filter;

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  }, [costs, search, filter]);

  const stats = useMemo(() => {
    const today = todayString();
    const month = today.slice(0, 7);
    const year = today.slice(0, 4);

    let total = 0;
    let thisMonth = 0;
    let thisYear = 0;

    costs.forEach((cost) => {
      const amount = Number(cost.amount || 0);
      const date = String(cost.date || "");

      total += amount;
      if (date.startsWith(month)) thisMonth += amount;
      if (date.startsWith(year)) thisYear += amount;
    });

    return { total, thisMonth, thisYear, records: costs.length };
  }, [costs]);

  const filteredTotal = filteredCosts.reduce(
    (sum, cost) => sum + Number(cost.amount || 0),
    0,
  );

  const openAddModal = () => {
    setEditingId(null);
    setForm(createEmptyForm());
    setModalOpen(true);
  };

  const openEditModal = (cost) => {
    const vehicle = vehicles.find(
      (item) => item.registration === cost.registration,
    );

    setEditingId(cost.id);
    setForm({
      vehicleId: vehicle ? String(vehicle.id) : "",
      category: cost.category || "Other",
      date: cost.date || todayString(),
      amount: String(cost.amount ?? ""),
      notes: cost.notes || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(createEmptyForm());
  };

  const handleSaveCost = (event) => {
    event.preventDefault();

    const vehicle = vehicles.find(
      (item) => String(item.id) === String(form.vehicleId),
    );
    const amount = Number(form.amount);

    if (!vehicle || !form.date || !(amount > 0)) return;

    const costData = {
      registration: vehicle.registration,
      vehicle: `${vehicle.brand} ${vehicle.model}`,
      category: form.category,
      date: form.date,
      amount,
      notes: form.notes.trim(),
    };

    if (editingId !== null) {
      updateCost(editingId, costData);
    } else {
      addCost(costData);
    }

    closeModal();
  };

  const handleDeleteCost = (cost) => {
    const confirmed = window.confirm(
      `Delete ${cost.category} cost of ${formatMoney(cost.amount)} for ${cost.registration}? This cannot be undone.`,
    );

    if (confirmed) {
      deleteCost(cost.id);
    }
  };

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  return (
    <div className="documents-page">
      <div className="documents-header">
        <div>
          <div className="panel-kicker">FLEETOS FINANCE</div>
          <h1>Costs</h1>
          <p>Fleet expenses by vehicle and category</p>
        </div>

        <button
          type="button"
          className="documents-primary-button"
          onClick={openAddModal}
        >
          + Add Cost
        </button>
      </div>

      <section className="documents-kpis">
        <div className="documents-kpi">
          <span>Total Costs</span>
          <strong>{formatMoney(stats.total)}</strong>
        </div>

        <div className="documents-kpi">
          <span>This Month</span>
          <strong>{formatMoney(stats.thisMonth)}</strong>
        </div>

        <div className="documents-kpi">
          <span>This Year</span>
          <strong>{formatMoney(stats.thisYear)}</strong>
        </div>

        <div className="documents-kpi">
          <span>Records</span>
          <strong>{stats.records}</strong>
        </div>
      </section>

      <section className="documents-section">
        <div className="documents-section-header">
          <div>
            <div className="panel-kicker">COST CONTROL</div>
            <h2>Fleet Costs</h2>
            <p>
              Showing {filteredCosts.length} of {costs.length} records, total{" "}
              {formatMoney(filteredTotal)}
            </p>
          </div>
        </div>

        <div className="documents-toolbar">
          <input
            type="text"
            placeholder="Search registration, vehicle, category or notes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="documents-table-wrapper">
          <table className="documents-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>VEHICLE</th>
                <th>REGISTRATION</th>
                <th>CATEGORY</th>
                <th>NOTES</th>
                <th>AMOUNT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filteredCosts.map((cost) => (
                <tr key={cost.id}>
                  <td>{formatDate(cost.date)}</td>

                  <td>
                    <div className="documents-vehicle">
                      <strong>{cost.vehicle}</strong>
                    </div>
                  </td>

                  <td>
                    <strong className="documents-registration">
                      {cost.registration}
                    </strong>
                  </td>

                  <td>{cost.category}</td>

                  <td>{cost.notes || "-"}</td>

                  <td>
                    <strong>{formatMoney(cost.amount)}</strong>
                  </td>

                  <td>
                    <div className="documents-actions">
                      <button type="button" onClick={() => openEditModal(cost)}>
                        Edit
                      </button>

                      <button
                        type="button"
                        className="documents-delete"
                        onClick={() => handleDeleteCost(cost)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCosts.length === 0 && (
                <tr>
                  <td colSpan="7" className="documents-empty">
                    {costs.length === 0
                      ? "No costs recorded yet. Use + Add Cost to enter the first one."
                      : "No costs match your search."}
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
                <div className="panel-kicker">FLEETOS FINANCE</div>
                <h2>{editingId !== null ? "Edit Cost" : "Add Cost"}</h2>
                <p>
                  {editingId !== null
                    ? "Update this cost record."
                    : "Record an expense for a fleet vehicle."}
                </p>
              </div>

              <button
                type="button"
                className="documents-modal-close"
                onClick={closeModal}
              >
                {String.fromCharCode(215)}
              </button>
            </div>

            <form className="documents-form" onSubmit={handleSaveCost}>
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
                <span>CATEGORY</span>
                <select
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
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
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) =>
                    updateField("amount", event.target.value)
                  }
                  placeholder="e.g. 85.50"
                  required
                />
              </label>

              <label>
                <span>NOTES</span>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  placeholder="Optional: invoice number, station, workshop..."
                />
              </label>

              <button type="submit" className="documents-form-save">
                {editingId !== null ? "Update Cost" : "Save Cost"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Costs;
