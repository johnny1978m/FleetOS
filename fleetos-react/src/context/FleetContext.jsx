import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { useCollection } from "../data/useCollection";
import { FleetContext } from "./FleetContextDefinition";



const defaultSettings = {
  companyName: "FleetOS",
  language: "English",
  distanceUnit: "Kilometers",
  notifications: true,
  serviceAlerts: true,
  documentAlerts: true,
};

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) {
      return fallback;
    }

    return JSON.parse(saved);
  } catch {
    return fallback;
  }
}

export function FleetProvider({ children }) {
  const { companyId } = useAuth();
  const [vehicles, saveVehicle, , vehiclesLoaded] = useCollection(companyId, "vehicles");

  const [documents, saveDocument, removeDocument] = useCollection(
    companyId,
    "documents",
  );

  useEffect(() => {
    if (!companyId || !vehiclesLoaded || vehicles.length > 0) return;
    const flag = "fleetos-vehicles-imported-" + companyId;
    try {
      if (localStorage.getItem(flag)) return;
      const raw = localStorage.getItem("fleetos-vehicles");
      localStorage.setItem(flag, "1");
      const old = raw ? JSON.parse(raw) : [];
      if (Array.isArray(old)) {
        old.forEach((item) => {
          if (item && item.id) saveVehicle(item);
        });
      }
    } catch (error) {
      console.error("vehicles import", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, vehiclesLoaded, vehicles.length]);

  const [costs, saveCost, removeCost] = useCollection(companyId, "costs");

  const [incidents, saveIncident, removeIncident] = useCollection(
    companyId,
    "incidents",
  );

  const [drivers, saveDriver, removeDriver] = useCollection(
    companyId,
    "drivers",
  );

  const [odometer, saveReading, removeReading] = useCollection(
    companyId,
    "odometer",
  );

  const [serviceHistory, saveServiceRecord, , serviceHistoryLoaded] =
    useCollection(companyId, "serviceHistory");

  const addServiceRecord = (entry) => saveServiceRecord(entry);

  useEffect(() => {
    if (!companyId || !serviceHistoryLoaded || serviceHistory.length > 0) return;
    const flag = "fleetos-service-imported-" + companyId;
    try {
      if (localStorage.getItem(flag)) return;
      const raw = localStorage.getItem("fleetos-service-history");
      localStorage.setItem(flag, "1");
      const old = raw ? JSON.parse(raw) : [];
      if (Array.isArray(old)) {
        old.forEach((item) => {
          if (item && item.id) saveServiceRecord(item);
        });
      }
    } catch (error) {
      console.error("service import", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, serviceHistoryLoaded, serviceHistory.length]);

  const [settingsDocs, saveSettingsDoc, , settingsLoaded] = useCollection(
    companyId,
    "settings",
  );
  const remoteSettings = settingsDocs.find((item) => item.id === "main");
  const settings = { ...defaultSettings, ...remoteSettings };

  useEffect(() => {
    if (!companyId || !settingsLoaded || remoteSettings) return;
    const flag = "fleetos-settings-imported-" + companyId;
    try {
      if (localStorage.getItem(flag)) return;
      localStorage.setItem(flag, "1");
      const old = loadData("fleetos-settings", {});
      if (old && Object.keys(old).length > 0) {
        saveSettingsDoc({ ...defaultSettings, ...old, id: "main" });
      }
    } catch (error) {
      console.error("settings import", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, settingsLoaded, remoteSettings]);

  const addVehicle = (vehicle) => {
    saveVehicle({ id: Date.now(), ...vehicle });
  };

  const updateVehicle = (id, vehicleData) => {
    const existing = vehicles.find((item) => item.id === id);
    if (existing) saveVehicle({ ...existing, ...vehicleData });
  };

  const addDocument = (document) => {
    saveDocument({ id: Date.now(), ...document });
  };

  const addCost = (cost) => {
    saveCost({ id: Date.now(), ...cost });
  };

  const updateCost = (id, costData) => {
    const existing = costs.find((cost) => cost.id === id);

    if (existing) saveCost({ ...existing, ...costData });
  };

  const updateSettings = (data) => {
    saveSettingsDoc({ ...settings, ...data, id: "main" });
  };

  const addDriver = (driver) => {
    saveDriver({ id: Date.now(), ...driver });
  };

  const updateDriver = (id, driverData) => {
    const existing = drivers.find((driver) => driver.id === id);

    if (existing) saveDriver({ ...existing, ...driverData });
  };

  const deleteDriver = (id) => {
    removeDriver(id);
  };

  const addOdometerReading = (vehicleId, reading) => {
    const vehicle = vehicles.find((item) => item.id === vehicleId);
    const km = Number(reading.km);

    if (!vehicle) return { ok: false, error: "Vehicle not found." };
    if (!reading.date) return { ok: false, error: "Select a date." };
    if (!Number.isFinite(km) || km < 0) {
      return { ok: false, error: "Enter a valid kilometre value." };
    }

    const lastKm = Math.max(
      Number(vehicle.km || 0),
      ...odometer
        .filter((item) => item.vehicleId === vehicleId)
        .map((item) => Number(item.km)),
    );

    if (km < lastKm) {
      return { ok: false, error: `Kilometres cannot be lower than ${lastKm}.` };
    }

    saveReading({
      id: Date.now(),
      vehicleId,
      registration: vehicle.registration,
      date: reading.date,
      km,
      notes: reading.notes || "",
    });
    updateVehicle(vehicleId, { km });

    return { ok: true };
  };

  const deleteOdometerReading = (id) => {
    removeReading(id);
  };

  const addIncident = (incident) => {
    saveIncident({ id: Date.now(), ...incident });
  };

  const updateIncident = (id, incidentData) => {
    const existing = incidents.find((incident) => incident.id === id);

    if (existing) saveIncident({ ...existing, ...incidentData });
  };

  const deleteIncident = (id) => {
    removeIncident(id);
  };

  const deleteCost = (id) => {
    removeCost(id);
  };

  const updateDocument = (id, documentData) => {
    const existing = documents.find((document) => document.id === id);

    if (existing) saveDocument({ ...existing, ...documentData });
  };

  const deleteDocument = (id) => {
    removeDocument(id);
  };

  return (
    <FleetContext.Provider
      value={{
        vehicles,
        documents,
        addVehicle,
        serviceHistory,
        addServiceRecord,
        updateVehicle,
        addDocument,
        updateDocument,
        deleteDocument,
        costs,
        addCost,
        incidents,
        addIncident,
        updateIncident,
        deleteIncident,
        drivers,
        addDriver,
        updateDriver,
        deleteDriver,
        settings,
        updateSettings,
        settingsLoaded,
        updateCost,
        odometer,
        addOdometerReading,
        deleteOdometerReading,
        deleteCost,
      }}
    >
      {children}
    </FleetContext.Provider>
  );
}