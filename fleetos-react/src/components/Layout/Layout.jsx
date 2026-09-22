import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";
import "./Layout.css";

function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />

      <div className="layout-main">
        <Topbar />

        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;