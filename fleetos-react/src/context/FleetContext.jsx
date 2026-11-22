import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useCollection } from "../data/useCollection";
import { FleetContext } from "./FleetContextDefinition";

const initialVehicles = [
  {
    id: 1,
    registration: "M AZ 5263",
    brand: "Mercedes",
    model: "Sprinter",
    year: 2022,
    km: 148520,
    serviceKm: 150000,
    oilKm: 150000,
    status: "Attention",
    driver: "Stanescu",
    observations: "",
  },
  {
    id: 2,
    registration: "M AZ 5270",
    brand: "Mercedes",
    model: "Sprinter",
    year: 2022,
    km: 132800,
    serviceKm: 150000,
    oilKm: 150000,
    status: "Good",
    driver: "Popescu",
    observations: "",
  },
  {
    id: 3,
    registration: "M AS 1679",
    brand: "Ford",
    model: "Transit",
    year: 2021,
    km: 176400,
    serviceKm: 175000,
    oilKm: 180000,
    status: "Critical",
    driver: "Ionescu",
    observations: "",
  },
  {
    id: 4,
    registration: "M AZ 1725",
    brand: "Opel",
    model: "Vivaro",
    year: 2022,
    km: 119300,
    serviceKm: 150000,
    oilKm: 150000,
    status: "Good",
    driver: "Marin",
    observations: "",
  },
  {
    id: 5,
    registration: "M AZ 1728",
    brand: "Fiat",
    model: "Ducato",
    year: 2021,
    km: 154700,
    serviceKm: 155000,
    oilKm: 160000,
    status: "Attention",
    driver: "Dumitru",
    observations: "",
  },
];


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
  const [vehicles, setVehicles] = useState(() =>
    loadData("fleetos-vehicles", initialVehicles),
  );

  const [documents, saveDocument, removeDocument] = useCollection(
    companyId,
    "documents",
  );

  useEffect(() => {
    localStorage.setItem("fleetos-vehicles", JSON.stringify(vehicles));
  }, [vehicles]);

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

  const [settings, setSettings] = useState(() => ({
    ...defaultSettings,
    ...loadData("fleetos-settings", {}),
  }));

  useEffect(() => {
    localStorage.setItem("fleetos-settings", JSON.stringify(settings));
  }, [settings]);

  const addVehicle = (vehicle) => {
    setVehicles((current) => [
      ...current,
      {
        id: Date.now(),
        ...vehicle,
      },
    ]);
  };

  const updateVehicle = (id, vehicleData) => {
    setVehicles((current) =>
      current.map((vehicle) =>
        vehicle.id === id
          ? {
              ...vehicle,
              ...vehicleData,
            }
          : vehicle,
      ),
    );
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
    setSettings((current) => ({ ...current, ...data }));
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