import { useMemo, useState } from "react";
import "./Analytics.css";
import { useFleet } from "../../context/useFleet";

function Analytics() {
  const { vehicles } = useFleet();
  const [search, setSearch] = useState("");

  const getRemaining = (vehicle) => {
    const serviceRemaining =
      Number(vehicle.serviceKm || 0) - Number(vehicle.km || 0);

    const oilRemaining =
      Number(vehicle.oilKm || 0) - Number(vehicle.km || 0);

    return Math.min(serviceRemaining, oilRemaining);
  };

  const analyticsVehicles = useMemo(() => {
    return vehicles.map((vehicle) => {
      const remaining = getRemaining(vehicle);

      let status = "Good";

      if (vehicle.status === "Critical" || remaining <= 2000) {
        status = "Critical";
      } else if (
        vehicle.status === "Attention" ||
        remaining <= 5000
      ) {
        status = "Attention";
      }

      return {
        ...vehicle,
        currentKm: Number(vehicle.km || 0),
        serviceKm: Number(vehicle.serviceKm || 0),
        oilKm: Number(vehicle.oilKm || 0),
        remaining,
        status,
      };
    });
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    const value = search.toLowerCase().trim();

    return analyticsVehicles.filter((vehicle) => {
      const registration =
        vehicle.registration?.toLowerCase() || "";

      const vehicleName =
        `${vehicle.brand || ""} ${vehicle.model || ""}`.toLowerCase();

      return (
        !value ||
        registration.includes(value) ||
        vehicleName.includes(value)
      );
    });
  }, [analyticsVehicles, search]);

  const stats = useMemo(() => {
    const totalVehicles = analyticsVehicles.length;

    const goodVehicles = analyticsVehicles.filter(
      (vehicle) => vehicle.status === "Good",
    ).length;

    const attentionVehicles = analyticsVehicles.filter(
      (vehicle) => vehicle.status === "Attention",
    ).length;

    const criticalVehicles = analyticsVehicles.filter(
      (vehicle) => vehicle.status === "Critical",
    ).length;

    const totalKm = analyticsVehicles.reduce(
      (total, vehicle) => total + vehicle.currentKm,
      0,
    );

    const averageKm = totalVehicles
      ? Math.round(totalKm / totalVehicles)
      : 0;

    const serviceDue = analyticsVehicles.filter(
      (vehicle) => vehicle.currentKm >= vehicle.serviceKm,
    ).length;

    const oilDue = analyticsVehicles.filter(
      (vehicle) => vehicle.currentKm >= vehicle.oilKm,
    ).length;

    const attentionSoon = analyticsVehicles.filter(
      (vehicle) =>
        vehicle.remaining > 0 &&
        vehicle.remaining <= 5000,
    ).length;

    return {
      totalVehicles,
      goodVehicles,
      attentionVehicles,
      criticalVehicles,
      averageKm,
      serviceDue,
      oilDue,
      attentionSoon,
    };
  }, [analyticsVehicles]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Analytics</h1>
          <p>Live fleet performance and maintenance overview</p>
        </div>
      </div>

      <section className="dashboard-kpis">
        <div className="fleet-card">
          <span className="fleet-card-title">Total Vehicles</span>
          <strong className="fleet-card-value">
            {stats.totalVehicles}
          </strong>
        </div>

        <div className="fleet-card">
          <span className="fleet-card-title">Average KM</span>
          <strong className="fleet-card-value">
            {stats.averageKm.toLocaleString("de-DE")}
          </strong>
        </div>

        <div className="fleet-card">
          <span className="fleet-card-title">Service Due</span>
          <strong className="fleet-card-value">
            {stats.serviceDue}
          </strong>
        </div>

        <div className="fleet-card">
          <span className="fleet-card-title">Oil Due</span>
          <strong className="fleet-card-value">
            {stats.oilDue}
          </strong>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Fleet Status</h2>
            <p>Current calculated vehicle condition</p>
          </div>
        </div>

        <div className="status-grid">
          <div className="status-item">
            <span className="status-dot status-green"></span>
            <div>
              <strong>{stats.goodVehicles}</strong>
              <span>Good</span>
            </div>
          </div>

          <div className="status-item">
            <span className="status-dot status-orange"></span>
            <div>
              <strong>{stats.attentionVehicles}</strong>
              <span>Attention</span>
            </div>
          </div>

          <div className="status-item">
            <span className="status-dot status-red"></span>
            <div>
              <strong>{stats.criticalVehicles}</strong>
              <span>Critical</span>
            </div>
          </div>

          <div className="status-item">
            <span className="status-dot status-orange"></span>
            <div>
              <strong>{stats.attentionSoon}</strong>
              <span>Within 5,000 km</span>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Vehicle Analytics</h2>
            <p>Maintenance metrics from live fleet data</p>
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
                <th>Remaining</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredVehicles.map((vehicle) => {
                const remainingClass =
                  vehicle.remaining <= 0
                    ? "vehicle-status-critical"
                    : vehicle.remaining <= 5000
                      ? "vehicle-status-attention"
                      : "vehicle-status-good";

                return (
                  <tr key={vehicle.id}>
                    <td>
                      <div className="vehicle-name">
                        <strong>
                          {vehicle.brand} {vehicle.model}
                        </strong>
                        <span>
                          {vehicle.driver || "No driver assigned"}
                        </span>
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
                      <strong className={remainingClass}>
                        {vehicle.remaining.toLocaleString("de-DE")} km
                      </strong>
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
                );
              })}

              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan="7" className="vehicles-empty">
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


