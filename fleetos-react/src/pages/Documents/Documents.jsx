import { useMemo, useState } from "react";

const initialDocuments = [
  {
    id: 1,
    registration: "M AZ 5263",
    vehicle: "Mercedes Sprinter",
    type: "Insurance",
    document: "RCA",
    expiry: "2026-12-15",
    status: "Valid",
  },
  {
    id: 2,
    registration: "M AZ 5270",
    vehicle: "Mercedes Sprinter",
    type: "Inspection",
    document: "TÜV",
    expiry: "2026-10-20",
    status: "Attention",
  },
  {
    id: 3,
    registration: "M AS 1679",
    vehicle: "Ford Transit",
    type: "Insurance",
    document: "RCA",
    expiry: "2026-09-10",
    status: "Expired",
  },
  {
    id: 4,
    registration: "M AZ 1725",
    vehicle: "Opel Vivaro",
    type: "Inspection",
    document: "TÜV",
    expiry: "2027-02-18",
    status: "Valid",
  },
  {
    id: 5,
    registration: "M AZ 1728",
    vehicle: "Fiat Ducato",
    type: "Registration",
    document: "Vehicle Documents",
    expiry: "2027-04-05",
    status: "Valid",
  },
];

const emptyDocument = {
  registration: "",
  vehicle: "",
  type: "Insurance",
  document: "",
  expiry: "",
  status: "Valid",
};

function getStatusClass(status) {
  return status.toLowerCase();
}

function Documents() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyDocument);

  const filteredDocuments = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return documents.filter((document) => {
      const matchesSearch =
        !searchValue ||
        document.registration.toLowerCase().includes(searchValue) ||
        document.vehicle.toLowerCase().includes(searchValue) ||
        document.type.toLowerCase().includes(searchValue) ||
        document.document.toLowerCase().includes(searchValue);

      const matchesFilter =
        filter === "All" || document.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [documents, search, filter]);

  const validCount = documents.filter(
    (document) => document.status === "Valid",
  ).length;

  const attentionCount = documents.filter(
    (document) => document.status === "Attention",
  ).length;

  const expiredCount = documents.filter(
    (document) => document.status === "Expired",
  ).length;

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAddDocument = (event) => {
    event.preventDefault();

    const newDocument = {
      id: Date.now(),
      registration: formData.registration.trim(),
      vehicle: formData.vehicle.trim(),
      type: formData.type,
      document: formData.document.trim(),
      expiry: formData.expiry,
      status: formData.status,
    };

    setDocuments((current) => [...current, newDocument]);
    setFormData(emptyDocument);
    setShowForm(false);
  };

  const handleCancel = () => {
    setFormData(emptyDocument);
    setShowForm(false);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Documents</h1>
          <p>Manage vehicle documents and expiration dates</p>
        </div>

        <button
          type="button"
          className="dashboard-action"
          onClick={() => setShowForm(true)}
        >
          + Add Document
        </button>
      </div>

      {showForm && (
        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Add Document</h2>
              <p>Enter the document information</p>
            </div>
          </div>

          <form className="vehicles-form" onSubmit={handleAddDocument}>
            <div className="vehicles-form-grid">
              <div className="vehicles-form-field">
                <label htmlFor="registration">Registration</label>
                <input
                  id="registration"
                  name="registration"
                  type="text"
                  value={formData.registration}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="vehicles-form-field">
                <label htmlFor="vehicle">Vehicle</label>
                <input
                  id="vehicle"
                  name="vehicle"
                  type="text"
                  value={formData.vehicle}
                  onChange={handleFormChange}
                  placeholder="Mercedes Sprinter"
                  required
                />
              </div>

              <div className="vehicles-form-field">
                <label htmlFor="type">Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                >
                  <option value="Insurance">Insurance</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Registration">Registration</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="vehicles-form-field">
                <label htmlFor="document">Document</label>
                <input
                  id="document"
                  name="document"
                  type="text"
                  value={formData.document}
                  onChange={handleFormChange}
                  placeholder="RCA / TÜV"
                  required
                />
              </div>

              <div className="vehicles-form-field">
                <label htmlFor="expiry">Expiry Date</label>
                <input
                  id="expiry"
                  name="expiry"
                  type="date"
                  value={formData.expiry}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="vehicles-form-field">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                >
                  <option value="Valid">Valid</option>
                  <option value="Attention">Expiring Soon</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>

            <div className="vehicles-form-actions">
              <button
                type="button"
                className="vehicles-cancel-button"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="vehicles-save-button"
              >
                Save Document
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="dashboard-kpis">
        <div className="fleet-card">
          <span className="fleet-card-title">Total Documents</span>
          <strong className="fleet-card-value">
            {documents.length}
          </strong>
        </div>

        <div className="fleet-card">
          <span className="fleet-card-title">Valid</span>
          <strong className="fleet-card-value">
            {validCount}
          </strong>
        </div>

        <div className="fleet-card">
          <span className="fleet-card-title">Expiring Soon</span>
          <strong className="fleet-card-value">
            {attentionCount}
          </strong>
        </div>

        <div className="fleet-card">
          <span className="fleet-card-title">Expired</span>
          <strong className="fleet-card-value">
            {expiredCount}
          </strong>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Vehicle Documents</h2>
            <p>Insurance, inspection and registration documents</p>
          </div>
        </div>

        <div className="vehicles-toolbar">
          <div className="vehicles-search">
            <input
              type="text"
              placeholder="Search registration, vehicle or document..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="vehicles-filter">
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Valid">Valid</option>
              <option value="Attention">Expiring Soon</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="vehicles-table-wrapper">
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Registration</th>
                <th>Type</th>
                <th>Document</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredDocuments.map((document) => (
                <tr key={document.id}>
                  <td>
                    <div className="vehicle-name">
                      <strong>{document.vehicle}</strong>
                      <span>{document.type}</span>
                    </div>
                  </td>

                  <td>
                    <strong className="registration">
                      {document.registration}
                    </strong>
                  </td>

                  <td>{document.type}</td>

                  <td>{document.document}</td>

                  <td>
                    {new Date(document.expiry).toLocaleDateString(
                      "de-DE",
                    )}
                  </td>

                  <td>
                    <span
                      className={`vehicle-status vehicle-status-${getStatusClass(
                        document.status,
                      )}`}
                    >
                      <span className="vehicle-status-dot"></span>
                      {document.status}
                    </span>
                  </td>

                  <td>
                    <div className="vehicle-actions">
                      <button type="button">View</button>
                      <button type="button">Upload</button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredDocuments.length === 0 && (
                <tr>
                  <td colSpan="7" className="vehicles-empty">
                    No documents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Documents;