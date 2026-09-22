import Card from "../../components/Card/Card";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-page">
      <h1>Fleet Dashboard</h1>
      <p>Overview of your fleet</p>

      <div className="dashboard-grid">
        <Card title="Vehicles" value="68" />
        <Card title="Service" value="12" />
        <Card title="Documents" value="43" />
        <Card title="Alerts" value="5" />
      </div>
    </div>
  );
}

export default Dashboard;