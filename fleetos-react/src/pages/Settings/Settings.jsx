import { useState } from "react";

const savedSettings = JSON.parse(
  localStorage.getItem("fleetos-settings") || "null",
);

function Settings() {
  const [companyName, setCompanyName] = useState(
    savedSettings?.companyName || "FleetOS",
  );
  const [language, setLanguage] = useState(
    savedSettings?.language || "English",
  );
  const [distanceUnit, setDistanceUnit] = useState(
    savedSettings?.distanceUnit || "Kilometers",
  );
  const [notifications, setNotifications] = useState(
    savedSettings?.notifications ?? true,
  );
  const [serviceAlerts, setServiceAlerts] = useState(
    savedSettings?.serviceAlerts ?? true,
  );
  const [documentAlerts, setDocumentAlerts] = useState(
    savedSettings?.documentAlerts ?? true,
  );
  const [saved, setSaved] = useState(false);

  const handleSave = (event) => {
    event.preventDefault();

    const settings = {
      companyName,
      language,
      distanceUnit,
      notifications,
      serviceAlerts,
      documentAlerts,
    };

    localStorage.setItem("fleetos-settings", JSON.stringify(settings));

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Settings</h1>
          <p>Manage FleetOS application settings</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>General Settings</h2>
              <p>Basic fleet and application configuration</p>
            </div>
          </div>

          <div className="vehicles-form-grid">
            <div className="vehicles-form-field">
              <label htmlFor="companyName">Company Name</label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
              />
            </div>

            <div className="vehicles-form-field">
              <label htmlFor="language">Language</label>
              <select
                id="language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                <option>English</option>
                <option>German</option>
                <option>Romanian</option>
              </select>
            </div>

            <div className="vehicles-form-field">
              <label htmlFor="distanceUnit">Distance Unit</label>
              <select
                id="distanceUnit"
                value={distanceUnit}
                onChange={(event) => setDistanceUnit(event.target.value)}
              >
                <option>Kilometers</option>
                <option>Miles</option>
              </select>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Notifications</h2>
              <p>Control fleet alerts and notifications</p>
            </div>
          </div>

          <div className="settings-options">
            <label className="settings-option">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(event) =>
                  setNotifications(event.target.checked)
                }
              />
              <span>
                <strong>Notifications</strong>
                <small>Enable FleetOS notifications</small>
              </span>
            </label>

            <label className="settings-option">
              <input
                type="checkbox"
                checked={serviceAlerts}
                onChange={(event) =>
                  setServiceAlerts(event.target.checked)
                }
              />
              <span>
                <strong>Service Alerts</strong>
                <small>Alert when vehicle maintenance is due</small>
              </span>
            </label>

            <label className="settings-option">
              <input
                type="checkbox"
                checked={documentAlerts}
                onChange={(event) =>
                  setDocumentAlerts(event.target.checked)
                }
              />
              <span>
                <strong>Document Alerts</strong>
                <small>Alert before documents expire</small>
              </span>
            </label>
          </div>
        </section>

        <div className="vehicles-form-actions">
          {saved && <span>Settings saved</span>}

          <button type="submit" className="vehicles-save-button">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;