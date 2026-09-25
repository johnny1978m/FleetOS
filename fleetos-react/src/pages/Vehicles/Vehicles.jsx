import { useMemo, useState } from "react";
import "./Vehicles.css";

const initialVehicles = [
  {
    id: 1,
    registration: "M AZ 5263",
    brand: "Mercedes",
    model: "Sprinter",
    year: 2022,
    km: 148520,
    serviceKm: 150000,
    oilKm: 150000,
    status: "Attention",
    driver: "Stanescu",
    observations: "",
  },
  {
    id: 2,
    registration: "M AZ 5270",
    brand: "Mercedes",
    model: "Sprinter",
    year: 2022,
    km: 132800,
    serviceKm: 150000,
    oilKm: 150000,
    status: "Good",
    driver: "Popescu",
    observations: "",
  },
  {
    id: 3,
    registration: "M AS 1679",
    brand: "Ford",
    model: "Transit",
    year: 2021,
    km: 176400,
    serviceKm: 175000,
    oilKm: 180000,
    status: "Critical",
    driver: "Ionescu",
    observations: "",
  },
  {
    id: 4,
    registration: "M AZ 1725",
    brand: "Opel",
    model: "Vivaro",
    year: 2022,
    km: 119300,
    serviceKm: 150000,
    oilKm: 150000,
    status: "Good",
    driver: "Marin",
    observations: "",
  },
  {
    id: 5,
    registration: "M AZ 1728",
    brand: "Fiat",
    model: "Ducato",
    year: 2021,
    km: 154700,
    serviceKm: 155000,
    oilKm: 160000,
    status: "Attention",
    driver: "Dumitru",
    observations: "",
  },
];

const emptyVehicle = {
  registration: "",
  brand: "",
  model: "",
  year: "",
  km: "",
  serviceKm: "",
  oilKm: "",
  status: "Good",
  driver: "",
  observations: "",
};

function Vehicles() {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingVehicle, setViewingVehicle] = useState(null);
  const [formData, setFormData] = useState(emptyVehicle);

  const filteredVehicles = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return vehicles.filter((vehicle) => {
      const matchesSearch =
        !searchValue ||
        vehicle.registration.toLowerCase().includes(searchValue) ||
        vehicle.brand.toLowerCase().includes(searchValue) ||
        vehicle.model.toLowerCase().includes(searchValue) ||
        vehicle.driver.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || vehicle.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vehicles, search, statusFilter]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(emptyVehicle);
    setShowForm(true);
  };

  const openEditForm = (vehicle) => {
    setEditingId(vehicle.id);
    setFormData({
      registration: vehicle.registration,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      km: vehicle.km,
      serviceKm: vehicle.serviceKm,
      oilKm: vehicle.oilKm,
      status: vehicle.status,
      driver: vehicle.driver,
      observations: vehicle.observations,
    });
    setShowForm(true);
    setViewingVehicle(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyVehicle);
  };

  const handleSaveVehicle = (event) => {
    event.preventDefault();

    const vehicleData = {
      registration: formData.registration.trim(),
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      year: Number(formData.year),
      km: Number(formData.km),
      serviceKm: Number(formData.serviceKm),
      oilKm: Number(formData.oilKm),
      status: formData.status,
      driver: formData.driver.trim(),
      observations: formData.observations.trim(),
    };

    if (editingId !== null) {
      setVehicles((current) =>
        current.map((vehicle) =>
          vehicle.id === editingId
            ? { ...vehicle, ...vehicleData }
            : vehicle,
        ),
      );
    } else {
      setVehicles((current) => [
        ...current,
        {
          id: Date.now(),
          ...vehicleData,
        },
      ]);
    }

    closeForm();
  };

  return (
    <div className="vehicles-page">
      <div className="vehicles-header">
        <div>
          <h1>Vehicles</h1>
          <p>Manage your fleet vehicles and maintenance information</p>
        </div>

        <button
          type="button"
          className="vehicles-add-button"
          onClick={openAddForm}
        >
          + Add Vehicle
        </button>
      </div>

      {showForm && (
        <section className="vehicles-form-card">
          <div className="vehicles-table-header">
            <div>
              <h2>{editingId !== null ? "Edit Vehicle" : "Add Vehicle"}</h2>
              <p>
                {editingId !== null
                  ? "Update the vehicle information"
                  : "Enter the vehicle information"}
              </p>
            </div>
          </div>

          <form className="vehicles-form" onSubmit={handleSaveVehicle}>
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
                <label htmlFor="brand">Brand</label>
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  value={formData.brand}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="vehicles-form-field">
                <label htmlFor="model">Model</label>
                <input
                  id="model"
                  name="model"
                  type="text"
                  value={formData.model}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="vehicles-form-field">
                <label htmlFor="year">Year</label>
                <input
                  id="year"
                  name="year"
                  type="number"
                  min="1900"
                  max="2100"
                  value={formData.year}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="vehicles-form-field">
                <label htmlFor="km">Current KM</label>
                <input
                  id="km"
                  name="km"
                  type="number"
                  min="0"
                  value={formData.km}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="vehicles-form-field">
                <label htmlFor="serviceKm">Next Service KM</label>
                <input
                  id="serviceKm"
                  name="serviceKm"
                  type="number"
                  min="0"
                  value={formData.serviceKm}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="vehicles-form-field">
                <label htmlFor="oilKm">Next Oil KM</label>
                <input
                  id="oilKm"
                  name="oilKm"
                  type="number"
                  min="0"
                  value={formData.oilKm}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="vehicles-form-field">
                <label htmlFor="driver">Driver</label>
                <input
                  id="driver"
                  name="driver"
                  type="text"
                  value={formData.driver}
                  onChange={handleFormChange}
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
                  <option value="Good">Good</option>
                  <option value="Attention">Attention</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="vehicles-form-field vehicles-form-field-full">
                <label htmlFor="observations">Observations</label>
                <textarea
                  id="observations"
                  name="observations"
                  rows="4"
                  value={formData.observations}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="vehicles-form-actions">
              <button
                type="button"
                className="vehicles-cancel-button"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button type="submit" className="vehicles-save-button">
                {editingId !== null ? "Update Vehicle" : "Save Vehicle"}
              </button>
            </div>
          </form>
        </section>
      )}

      {viewingVehicle && (
        <section className="vehicles-form-card">
          <div className="vehicles-table-header">
            <div>
              <h2>
                {viewingVehicle.brand} {viewingVehicle.model}
              </h2>
              <p>{viewingVehicle.registration}</p>
            </div>

            <button
              type="button"
              className="vehicles-cancel-button"
              onClick={() => setViewingVehicle(null)}
            >
              Close
            </button>
          </div>

          <div className="vehicles-form-grid">
            <div className="vehicles-form-field">
              <label>Registration</label>
              <input value={viewingVehicle.registration} readOnly />
            </div>

            <div className="vehicles-form-field">
              <label>Brand</label>
              <input value={viewingVehicle.brand} readOnly />
            </div>

            <div className="vehicles-form-field">
              <label>Model</label>
              <input value={viewingVehicle.model} readOnly />
            </div>

            <div className="vehicles-form-field">
              <label>Year</label>
              <input value={viewingVehicle.year} readOnly />
            </div>

            <div className="vehicles-form-field">
              <label>Current KM</label>
              <input value={`${viewingVehicle.km.toLocaleString("de-DE")} km`} readOnly />
            </div>

            <div className="vehicles-form-field">
              <label>Next Service</label>
              <input
                value={`${viewingVehicle.serviceKm.toLocaleString("de-DE")} km`}
                readOnly
              />
            </div>

            <div className="vehicles-form-field">
              <label>Next Oil</label>
              <input
                value={`${viewingVehicle.oilKm.toLocaleString("de-DE")} km`}
                readOnly
              />
            </div>

            <div className="vehicles-form-field">
              <label>Driver</label>
              <input value={viewingVehicle.driver || "—"} readOnly />
            </div>

            <div className="vehicles-form-field">
              <label>Status</label>
              <input value={viewingVehicle.status} readOnly />
            </div>

            <div className="vehicles-form-field vehicles-form-field-full">
              <label>Observations</label>
              <textarea
                value={viewingVehicle.observations || "No observations"}
                readOnly
                rows="4"
              />
            </div>
          </div>
        </section>
      )}

      <section className="vehicles-toolbar">
        <div className="vehicles-search">
          <input
            type="text"
            placeholder="Search registration, brand, model or driver..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="vehicles-filter">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Good">Good</option>
            <option value="Attention">Attention</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </section>

      <section className="vehicles-table-card">
        <div className="vehicles-table-header">
          <div>
            <h2>Fleet Vehicles</h2>
            <p>
              Showing {filteredVehicles.length} of {vehicles.length} vehicles
            </p>
          </div>
        </div>

        <div className="vehicles-table-wrapper">
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Registration</th>
                <th>Driver</th>
                <th>Current KM</th>
                <th>Next Service</th>
                <th>Next Oil</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>
                    <div className="vehicle-name">
                      <strong>
                        {vehicle.brand} {vehicle.model}
                      </strong>
                      <span>{vehicle.year}</span>
                    </div>
                  </td>

                  <td>
                    <strong className="registration">
                      {vehicle.registration}
                    </strong>
                  </td>

                  <td>{vehicle.driver || "—"}</td>

                  <td>{vehicle.km.toLocaleString("de-DE")} km</td>

                  <td>{vehicle.serviceKm.toLocaleString("de-DE")} km</td>

                  <td>{vehicle.oilKm.toLocaleString("de-DE")} km</td>

                  <td>
                    <span
                      className={`vehicle-status vehicle-status-${vehicle.status.toLowerCase()}`}
                    >
                      <span className="vehicle-status-dot"></span>
                      {vehicle.status}
                    </span>
                  </td>

                  <td>
                    <div className="vehicle-actions">
                      <button
                        type="button"
                        onClick={() => setViewingVehicle(vehicle)}
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditForm(vehicle)}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan="8" className="vehicles-empty">
                    No vehicles found.
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

export default Vehicles;