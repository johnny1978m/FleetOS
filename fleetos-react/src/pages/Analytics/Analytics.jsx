import { useMemo, useState } from "react";

const analyticsData = [
  {
    registration: "M AZ 5263",
    vehicle: "Mercedes Sprinter",
    currentKm: 148520,
    serviceKm: 150000,
    oilKm: 150000,
    status: "Attention",
  },
  {
    registration: "M AZ 5270",
    vehicle: "Mercedes Sprinter",
    currentKm: 132800,
    serviceKm: 150000,
    oilKm: 150000,
    status: "Good",
  },
  {
    registration: "M AS 1679",
    vehicle: "Ford Transit",
    currentKm: 176400,
    serviceKm: 175000,
    oilKm: 180000,
    status: "Critical",
  },
  {
    registration: "M AZ 1725",
    vehicle: "Opel Vivaro",
    currentKm: 119300,
    serviceKm: 150000,
    oilKm: 150000,
    status: "Good",
  },
  {
    registration: "M AZ 1728",
    vehicle: "Fiat Ducato",
    currentKm: 154700,
    serviceKm: 155000,
    oilKm: 160000,
    status: "Attention",
  },
];

function Analytics() {
  const [search, setSearch] = useState("");

  const filteredVehicles = useMemo(() => {
    const value = search.toLowerCase().trim();

    return analyticsData.filter(
      (vehicle) =>
        !value ||
        vehicle.registration.toLowerCase().includes(value) ||
        vehicle.vehicle.toLowerCase().includes(value),
    );
  }, [search]);

  const totalVehicles = analyticsData.length;

  const goodVehicles = analyticsData.filter(
    (vehicle) => vehicle.status === "Good",
  ).length;

  const attentionVehicles = analyticsData.filter(
    (vehicle) => vehicle.status === "Attention",
  ).length;

  const criticalVehicles = analyticsData.filter(
    (vehicle) => vehicle.status === "Critical",
  ).length;

  const totalKm = analyticsData.reduce(
    (total, vehicle) => total + vehicle.currentKm,
    0,
  );

  const averageKm = Math.round(totalKm / totalVehicles);

  const serviceDue = analyticsData.filter(
    (vehicle) => vehicle.currentKm >= vehicle.serviceKm,
  ).length;

  const oilDue = analyticsData.filter(
    (vehicle) => vehicle.currentKm >= vehicle.oilKm,
  ).length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Analytics</h1>
          <p>Fleet performance and maintenance overview</p>
        </div>
      </div>

      <section className="dashboard-kpis">
        <div className="fleet-card">
          <span className="fleet-card-title">Total Vehicles</span>
          <strong className="fleet-card-value">
            {totalVehicles}
          </strong>
        </div>

        <div className="fleet-card">
          <span className="fleet-card-title">Average KM</span>
          <strong className="fleet-card-value">
            {averageKm.toLocaleString("de-DE")}
          </strong>
        </div>

        <div className="fleet-card">
          <span className="fleet-card-title">Service Due</span>
          <strong className="fleet-card-value">
            {serviceDue}
          </strong>
        </div>

        <div className="fleet-card">
          <span className="fleet-card-title">Oil Due</span>
          <strong className="fleet-card-value">
            {oilDue}
          </strong>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Fleet Status</h2>
            <p>Current vehicle status distribution</p>
          </div>
        </div>

        <div className="status-grid">
          <div className="status-item">
            <span className="status-dot status-green"></span>
            <div>
              <strong>{goodVehicles}</strong>
              <span>Good</span>
            </div>
          </div>

          <div className="status-item">
            <span className="status-dot status-orange"></span>
            <div>
              <strong>{attentionVehicles}</strong>
              <span>Attention</span>
            </div>
          </div>

          <div className="status-item">
            <span className="status-dot status-red"></span>
            <div>
              <strong>{criticalVehicles}</strong>
              <span>Critical</span>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Vehicle Analytics</h2>
            <p>Maintenance metrics by vehicle</p>
          </div>
        </div>

        <div className="vehicles-toolbar">
          <div className="vehicles-search">
            <input
              type="text"
              placeholder="Search registration or vehicle..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="vehicles-table-wrapper">
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Registration</th>
                <th>Current KM</th>
                <th>Service KM</th>
                <th>Oil KM</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.registration}>
                  <td>
                    <div className="vehicle-name">
                      <strong>{vehicle.vehicle}</strong>
                    </div>
                  </td>

                  <td>
                    <strong className="registration">
                      {vehicle.registration}
                    </strong>
                  </td>

                  <td>
                    {vehicle.currentKm.toLocaleString("de-DE")} km
                  </td>

                  <td>
                    {vehicle.serviceKm.toLocaleString("de-DE")} km
                  </td>

                  <td>
                    {vehicle.oilKm.toLocaleString("de-DE")} km
                  </td>

                  <td>
                    <span
                      className={`vehicle-status vehicle-status-${vehicle.status.toLowerCase()}`}
                    >
                      <span className="vehicle-status-dot"></span>
                      {vehicle.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan="6" className="vehicles-empty">
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

export default Analytics;