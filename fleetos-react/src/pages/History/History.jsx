import { useMemo, useState } from "react";
import { useFleet } from "../../context/useFleet";
import "./History.css";

const HISTORY_KEY = "fleetos-service-history";

function History() {
  const { vehicles, documents } = useFleet();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const events = useMemo(() => {
    const result = [];

    vehicles.forEach((vehicle) => {
      result.push({
        id: `vehicle-${vehicle.id}`,
        type: "Vehicle",
        title: `${vehicle.registration} added to fleet`,
        description: `${vehicle.brand} ${vehicle.model} (${vehicle.year})`,
        vehicle: vehicle.registration,
        date: vehicle.createdAt || null,
        icon: "▣",
      });
    });

    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      const history = stored ? JSON.parse(stored) : [];

      history.forEach((entry, index) => {
        result.push({
          id: `service-${entry.id || index}`,
          type: "Service",
          title: entry.serviceType || "Service completed",
          description: entry.notes || "Service record added",
          vehicle: entry.registration || "Unknown",
          date: entry.date || entry.createdAt || null,
          km: entry.km,
          icon: "⚙",
        });
      });
    } catch {
      // Ignore invalid history data.
    }

    documents.forEach((document, index) => {
      result.push({
        id: `document-${document.id || index}`,
        type: "Document",
        title: document.name || document.type || "Document",
        description: document.expiryDate
          ? `Valid until ${new Date(document.expiryDate).toLocaleDateString("de-DE")}`
          : "Document added",
        vehicle: document.registration || document.vehicle || "Fleet",
        date: document.createdAt || document.expiryDate || null,
        icon: "▤",
      });
    });

    return result.sort((a, b) => {
      const aDate = a.date ? new Date(a.date).getTime() : 0;
      const bDate = b.date ? new Date(b.date).getTime() : 0;
      return bDate - aDate;
    });
  }, [vehicles, documents]);

  const filteredEvents = events.filter((event) => {
    const query = search.trim().toLowerCase();

    return (
      (typeFilter === "All" || event.type === typeFilter) &&
      (!query ||
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.vehicle.toLowerCase().includes(query) ||
        event.type.toLowerCase().includes(query))
    );
  });

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString("de-DE");
  };

  return (
    <section className="history-page">
      <div className="history-header">
        <div>
          <span className="history-eyebrow">FleetOS / History</span>
          <h1>History</h1>
          <p>Central timeline of fleet activity and records.</p>
        </div>

        <div className="history-count">
          <strong>{filteredEvents.length}</strong>
          <span>events</span>
        </div>
      </div>

      <div className="history-toolbar">
        <input
          type="text"
          placeholder="Search history..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="history-filters">
          {["All", "Vehicle", "Service", "Document"].map((type) => (
            <button
              key={type}
              type="button"
              className={typeFilter === type ? "active" : ""}
              onClick={() => setTypeFilter(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="history-panel">
        {filteredEvents.length === 0 ? (
          <div className="history-empty">
            <div className="history-empty-icon">◷</div>
            <h3>No history found</h3>
            <p>There are no events matching the current filters.</p>
          </div>
        ) : (
          <div className="history-timeline">
            {filteredEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                className="history-event"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="history-event-marker">{event.icon}</div>

                <div className="history-event-content">
                  <div className="history-event-top">
                    <span className={`history-type ${event.type.toLowerCase()}`}>
                      {event.type}
                    </span>
                    <span className="history-date">
                      {formatDate(event.date)}
                    </span>
                  </div>

                  <h3>{event.title}</h3>
                  <p>{event.description}</p>

                  <div className="history-meta">
                    <span>{event.vehicle}</span>
                    {event.km !== undefined && event.km !== null && (
                      <span>{Number(event.km).toLocaleString("de-DE")} km</span>
                    )}
                  </div>
                </div>

                <span className="history-arrow">›</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedEvent && (
        <div
          className="history-modal-backdrop"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="history-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="history-modal-header">
              <div>
                <span className="history-eyebrow">Event details</span>
                <h2>{selectedEvent.title}</h2>
              </div>

              <button
                type="button"
                className="history-close"
                onClick={() => setSelectedEvent(null)}
              >
                ×
              </button>
            </div>

            <div className="history-details">
              <div>
                <span>Type</span>
                <strong>{selectedEvent.type}</strong>
              </div>

              <div>
                <span>Vehicle</span>
                <strong>{selectedEvent.vehicle}</strong>
              </div>

              <div>
                <span>Date</span>
                <strong>{formatDate(selectedEvent.date)}</strong>
              </div>

              {selectedEvent.km !== undefined &&
                selectedEvent.km !== null && (
                  <div>
                    <span>Kilometers</span>
                    <strong>
                      {Number(selectedEvent.km).toLocaleString("de-DE")} km
                    </strong>
                  </div>
                )}

              <div className="history-detail-full">
                <span>Description</span>
                <strong>{selectedEvent.description}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default History;
