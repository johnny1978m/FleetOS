import { useMemo, useState } from "react";
import { useFleet } from "../../context/useFleet";
import "./Documents.css";

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

function Documents() {
  const { vehicles, documents, addDocument } = useFleet();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    vehicleId: "",
    type: "Insurance",
    document: "RCA",
    expiry: "",
  });

  const liveDocuments = useMemo(() => {
    return documents.map((document) => ({
      ...document,
      status: getDocumentStatus(document.expiry),
    }));
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const value = search.toLowerCase().trim();

    return liveDocuments.filter((document) => {
      const matchesSearch =
        !value ||
        String(document.registration || "").toLowerCase().includes(value) ||
        String(document.vehicle || "").toLowerCase().includes(value) ||
        String(document.type || "").toLowerCase().includes(value) ||
        String(document.document || "").toLowerCase().includes(value);

      const matchesFilter =
        filter === "All" || document.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [liveDocuments, search, filter]);

  const stats = useMemo(() => {
    const expired = liveDocuments.filter(
      (document) => document.status === "Expired",
    ).length;

    const attention = liveDocuments.filter(
      (document) => document.status === "Attention",
    ).length;

    const valid = liveDocuments.filter(
      (document) => document.status === "Valid",
    ).length;

    return {
      total: liveDocuments.length,
      valid,
      attention,
      expired,
    };
  }, [liveDocuments]);

  const handleAddDocument = (event) => {
    event.preventDefault();

    const vehicle = vehicles.find(
      (item) => String(item.id) === String(form.vehicleId),
    );

    if (!vehicle || !form.expiry) return;

    addDocument({
      registration: vehicle.registration,
      vehicle: `${vehicle.brand} ${vehicle.model}`,
      type: form.type,
      document: form.document,
      expiry: form.expiry,
      status: getDocumentStatus(form.expiry),
    });

    setForm({
      vehicleId: "",
      type: "Insurance",
      document: "RCA",
      expiry: "",
    });
    setModalOpen(false);
  };

  return (
    <div className="documents-page">
      <div className="documents-header">
        <div>
          <div className="panel-kicker">FLEETOS COMPLIANCE</div>
          <h1>Documents</h1>
          <p>Vehicle documents, expiry dates and compliance status</p>
        </div>

        <button
          type="button"
          className="documents-primary-button"
          onClick={() => setModalOpen(true)}
        >
          + Add Document
        </button>
      </div>

      <section className="documents-kpis">
        <div className="documents-kpi">
          <span>Total Documents</span>
          <strong>{stats.total}</strong>
        </div>

        <div className="documents-kpi valid">
          <span>Valid</span>
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
            <div className="panel-kicker">DOCUMENT CONTROL</div>
            <h2>Fleet Documents</h2>
            <p>Live expiry status calculated from the document date</p>
          </div>
        </div>

        <div className="documents-toolbar">
          <input
            type="text"
            placeholder="Search registration, vehicle or document..."
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
                <th>VEHICLE</th>
                <th>REGISTRATION</th>
                <th>TYPE</th>
                <th>DOCUMENT</th>
                <th>EXPIRY</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {filteredDocuments.map((document) => (
                <tr key={document.id}>
                  <td>
                    <div className="documents-vehicle">
                      <strong>{document.vehicle}</strong>
                    </div>
                  </td>

                  <td>
                    <strong className="documents-registration">
                      {document.registration}
                    </strong>
                  </td>

                  <td>{document.type}</td>

                  <td>
                    <strong>{document.document}</strong>
                  </td>

                  <td>{formatDate(document.expiry)}</td>

                  <td>
                    <span
                      className={`documents-status documents-status-${document.status.toLowerCase()}`}
                    >
                      <span className="documents-status-dot"></span>
                      {document.status === "Attention"
                        ? "Expiring Soon"
                        : document.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredDocuments.length === 0 && (
                <tr>
                  <td colSpan="6" className="documents-empty">
                    No documents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div
          className="documents-modal-backdrop"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="documents-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="documents-modal-header">
              <div>
                <div className="panel-kicker">FLEETOS COMPLIANCE</div>
                <h2>Add Document</h2>
                <p>Create a document record for a fleet vehicle.</p>
              </div>

              <button
                type="button"
                className="documents-modal-close"
                onClick={() => setModalOpen(false)}
              >
                Ã—
              </button>
            </div>

            <form className="documents-form" onSubmit={handleAddDocument}>
              <label>
                <span>VEHICLE</span>
                <select
                  value={form.vehicleId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      vehicleId: event.target.value,
                    }))
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
              </label>

              <label>
                <span>TYPE</span>
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      type: event.target.value,
                    }))
                  }
                >
                  <option value="Insurance">Insurance</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Registration">Registration</option>
                  <option value="License">License</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                <span>DOCUMENT</span>
                <input
                  type="text"
                  value={form.document}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      document: event.target.value,
                    }))
                  }
                  placeholder="RCA / TÃœV / Registration..."
                  required
                />
              </label>

              <label>
                <span>EXPIRY DATE</span>
                <input
                  type="date"
                  value={form.expiry}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      expiry: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <button type="submit" className="documents-form-save">
                Save Document
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;

