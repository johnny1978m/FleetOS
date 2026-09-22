import Card from "../../components/Card/Card";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Fleet Dashboard</h1>
          <p>Overview of your fleet and current operations</p>
        </div>

        <button className="dashboard-action">
          + Add Vehicle
        </button>
      </div>

      <section className="dashboard-kpis">
        <Card title="Total Vehicles" value="68" />
        <Card title="Active Vehicles" value="61" />
        <Card title="Service Due" value="12" />
        <Card title="Alerts" value="5" />
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Fleet Status</h2>
            <p>Current status of your vehicles</p>
          </div>
        </div>

        <div className="status-grid">
          <div className="status-item">
            <span className="status-dot status-green"></span>
            <div>
              <strong>54</strong>
              <span>Good</span>
            </div>
          </div>

          <div className="status-item">
            <span className="status-dot status-orange"></span>
            <div>
              <strong>9</strong>
              <span>Attention</span>
            </div>
          </div>

          <div className="status-item">
            <span className="status-dot status-red"></span>
            <div>
              <strong>5</strong>
              <span>Critical</span>
            </div>
          </div>
        </div>
      </section>

      <div className="dashboard-columns">
        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Upcoming Service</h2>
              <p>Vehicles requiring maintenance</p>
            </div>
          </div>

          <div className="dashboard-list">
            <div className="dashboard-list-item">
              <div>
                <strong>M AZ 5263</strong>
                <span>Service due in 850 km</span>
              </div>
              <span className="list-warning">Soon</span>
            </div>

            <div className="dashboard-list-item">
              <div>
                <strong>M AZ 5270</strong>
                <span>Oil service due in 1,200 km</span>
              </div>
              <span className="list-warning">Soon</span>
            </div>

            <div className="dashboard-list-item">
              <div>
                <strong>M AS 1679</strong>
                <span>Maintenance required</span>
              </div>
              <span className="list-critical">Alert</span>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Documents</h2>
              <p>Documents requiring attention</p>
            </div>
          </div>

          <div className="dashboard-list">
            <div className="dashboard-list-item">
              <div>
                <strong>Insurance</strong>
                <span>3 vehicles expiring soon</span>
              </div>
              <span className="list-warning">Soon</span>
            </div>

            <div className="dashboard-list-item">
              <div>
                <strong>Inspection</strong>
                <span>2 vehicles require inspection</span>
              </div>
              <span className="list-critical">Alert</span>
            </div>

            <div className="dashboard-list-item">
              <div>
                <strong>Documents</strong>
                <span>43 documents stored</span>
              </div>
              <span className="list-normal">OK</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;