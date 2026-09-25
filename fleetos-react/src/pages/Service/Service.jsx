import { useMemo, useState } from "react";

const serviceData = [
  {
    id: 1,
    registration: "M AZ 5263",
    vehicle: "Mercedes Sprinter",
    currentKm: 148520,
    serviceKm: 150000,
    oilKm: 150000,
    serviceType: "Service + Oil",
  },
  {
    id: 2,
    registration: "M AZ 5270",
    vehicle: "Mercedes Sprinter",
    currentKm: 132800,
    serviceKm: 150000,
    oilKm: 150000,
    serviceType: "Service + Oil",
  },
  {
    id: 3,
    registration: "M AS 1679",
    vehicle: "Ford Transit",
    currentKm: 176400,
    serviceKm: 175000,
    oilKm: 180000,
    serviceType: "Service",
  },
  {
    id: 4,
    registration: "M AZ 1725",
    vehicle: "Opel Vivaro",
    currentKm: 119300,
    serviceKm: 150000,
    oilKm: 150000,
    serviceType: "Service + Oil",
  },
  {
    id: 5,
    registration: "M AZ 1728",
    vehicle: "Fiat Ducato",
    currentKm: 154700,
    serviceKm: 155000,
    oilKm: 160000,
    serviceType: "Service",
  },
];

function getStatus(currentKm, targetKm) {
  const remaining = targetKm - currentKm;

  if (remaining <= 0) {
    return "Overdue";
  }

  if (remaining <= 2000) {
    return "Critical";
  }

  if (remaining <= 5000) {
    return "Attention";
  }

  return "Good";
}

function Service() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const services = useMemo(() => {
    return serviceData.map((vehicle) => {
      const serviceStatus = getStatus(
        vehicle.currentKm,
        vehicle.serviceKm,
      );

      const oilStatus = getStatus(
        vehicle.currentKm,
        vehicle.oilKm,
      );

      const status =
        serviceStatus === "Overdue" || oilStatus === "Overdue"
          ? "Overdue"
          : serviceStatus === "Critical" || oilStatus === "Critical"
            ? "Critical"
            : serviceStatus === "Attention" || oilStatus === "Attention"
              ? "Attention"
              : "Good";

      return {
        ...vehicle,
        serviceStatus,
        oilStatus,
        status,
        serviceRemaining: vehicle.serviceKm - vehicle.currentKm,
        oilRemaining: vehicle.oilKm - vehicle.currentKm,
      };
    });
  }, []);

  const filteredServices = services.filter((service) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      !searchValue ||
      service.registration.toLowerCase().includes(searchValue) ||
      service.vehicle.toLowerCase().includes(searchValue);

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

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Service</h1>
          <p>Maintenance schedule and service status</p>
        </div>
      </div>

      <section className="dashboard-kpis">
        <div className="fleet-card">
          <span className="fleet-card-title">Total Services</span>
          <strong className="fleet-card-value">
            {services.length}
          </strong>
        </div>

        <div className="fleet-card">
          <span className="fleet-card-title">Overdue</span>
          <strong className="fleet-card-value">
            {overdueCount}
          </strong>
        </div>

        <div className="fleet-card">
          <span className="fleet-card-title">Critical</span>
          <strong className="fleet-card-value">
            {criticalCount}
          </strong>
        </div>

        <div className="fleet-card">
          <span className="fleet-card-title">Attention</span>
          <strong className="fleet-card-value">
            {attentionCount}
          </strong>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Maintenance Schedule</h2>
            <p>Service and oil change intervals by vehicle</p>
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

          <div className="vehicles-filter">
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

        <div className="vehicles-table-wrapper">
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Registration</th>
                <th>Current KM</th>
                <th>Next Service</th>
                <th>Next Oil</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id}>
                  <td>
                    <div className="vehicle-name">
                      <strong>{service.vehicle}</strong>
                      <span>{service.serviceType}</span>
                    </div>
                  </td>

                  <td>
                    <strong className="registration">
                      {service.registration}
                    </strong>
                  </td>

                  <td>
                    {service.currentKm.toLocaleString("de-DE")} km
                  </td>

                  <td>
                    <div className="vehicle-name">
                      <strong>
                        {service.serviceKm.toLocaleString("de-DE")} km
                      </strong>
                      <span>
                        {service.serviceRemaining <= 0
                          ? "Overdue"
                          : `${service.serviceRemaining.toLocaleString("de-DE")} km remaining`}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div className="vehicle-name">
                      <strong>
                        {service.oilKm.toLocaleString("de-DE")} km
                      </strong>
                      <span>
                        {service.oilRemaining <= 0
                          ? "Overdue"
                          : `${service.oilRemaining.toLocaleString("de-DE")} km remaining`}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`vehicle-status vehicle-status-${service.status.toLowerCase()}`}
                    >
                      <span className="vehicle-status-dot"></span>
                      {service.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan="6" className="vehicles-empty">
                    No service records found.
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

export default Service;