import "./Topbar.css";

function Topbar() {
  return (
    <header className="topbar">
      <div>
        <h2>Dashboard</h2>
        <p>Fleet overview and management</p>
      </div>

      <div className="topbar-user">
        <span className="user-name">Admin</span>
        <div className="user-avatar">A</div>
      </div>
    </header>
  );
}

export default Topbar;