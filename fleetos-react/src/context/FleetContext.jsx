import { useEffect, useState } from "react";
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

const initialDocuments = [
  {
    id: 1,
    registration: "M AZ 5263",
    vehicle: "Mercedes Sprinter",
    type: "Insurance",
    document: "RCA",
    expiry: "2026-12-15",
    status: "Valid",
  },
  {
    id: 2,
    registration: "M AZ 5270",
    vehicle: "Mercedes Sprinter",
    type: "Inspection",
    document: "TÜV",
    expiry: "2026-10-20",
    status: "Attention",
  },
  {
    id: 3,
    registration: "M AS 1679",
    vehicle: "Ford Transit",
    type: "Insurance",
    document: "RCA",
    expiry: "2026-09-10",
    status: "Expired",
  },
  {
    id: 4,
    registration: "M AZ 1725",
    vehicle: "Opel Vivaro",
    type: "Inspection",
    document: "TÜV",
    expiry: "2027-02-18",
    status: "Valid",
  },
  {
    id: 5,
    registration: "M AZ 1728",
    vehicle: "Fiat Ducato",
    type: "Registration",
    document: "Vehicle Documents",
    expiry: "2027-04-05",
    status: "Valid",
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
  const [vehicles, setVehicles] = useState(() =>
    loadData("fleetos-vehicles", initialVehicles),
  );

  const [documents, setDocuments] = useState(() =>
    loadData("fleetos-documents", initialDocuments),
  );

  useEffect(() => {
    localStorage.setItem("fleetos-vehicles", JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem("fleetos-documents", JSON.stringify(documents));
  }, [documents]);

  const [costs, setCosts] = useState(() => loadData("fleetos-costs", []));

  const [incidents, setIncidents] = useState(() =>
    loadData("fleetos-incidents", []),
  );

  useEffect(() => {
    localStorage.setItem("fleetos-incidents", JSON.stringify(incidents));
  }, [incidents]);

  const [drivers, setDrivers] = useState(() =>
    loadData("fleetos-drivers", []),
  );

  useEffect(() => {
    localStorage.setItem("fleetos-drivers", JSON.stringify(drivers));
  }, [drivers]);

  const [odometer, setOdometer] = useState(() =>
    loadData("fleetos-odometer", []),
  );

  useEffect(() => {
    localStorage.setItem("fleetos-odometer", JSON.stringify(odometer));
  }, [odometer]);

  const [settings, setSettings] = useState(() => ({
    ...defaultSettings,
    ...loadData("fleetos-settings", {}),
  }));

  useEffect(() => {
    localStorage.setItem("fleetos-settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("fleetos-costs", JSON.stringify(costs));
  }, [costs]);

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
    setDocuments((current) => [
      ...current,
      {
        id: Date.now(),
        ...document,
      },
    ]);
  };

  const addCost = (cost) => {
    setCosts((current) => [...current, { id: Date.now(), ...cost }]);
  };

  const updateCost = (id, costData) => {
    setCosts((current) =>
      current.map((cost) => (cost.id === id ? { ...cost, ...costData } : cost)),
    );
  };

  const updateSettings = (data) => {
    setSettings((current) => ({ ...current, ...data }));
  };

  const addDriver = (driver) => {
    setDrivers((current) => [...current, { id: Date.now(), ...driver }]);
  };

  const updateDriver = (id, driverData) => {
    setDrivers((current) =>
      current.map((driver) =>
        driver.id === id ? { ...driver, ...driverData } : driver,
      ),
    );
  };

  const deleteDriver = (id) => {
    setDrivers((current) => current.filter((driver) => driver.id !== id));
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

    setOdometer((current) => [
      ...current,
      {
        id: Date.now(),
        vehicleId,
        registration: vehicle.registration,
        date: reading.date,
        km,
        notes: reading.notes || "",
      },
    ]);
    updateVehicle(vehicleId, { km });

    return { ok: true };
  };

  const deleteOdometerReading = (id) => {
    setOdometer((current) => current.filter((item) => item.id !== id));
  };

  const addIncident = (incident) => {
    setIncidents((current) => [...current, { id: Date.now(), ...incident }]);
  };

  const updateIncident = (id, incidentData) => {
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === id ? { ...incident, ...incidentData } : incident,
      ),
    );
  };

  const deleteIncident = (id) => {
    setIncidents((current) => current.filter((incident) => incident.id !== id));
  };

  const deleteCost = (id) => {
    setCosts((current) => current.filter((cost) => cost.id !== id));
  };

  const updateDocument = (id, documentData) => {
    setDocuments((current) =>
      current.map((document) =>
        document.id === id ? { ...document, ...documentData } : document,
      ),
    );
  };

  const deleteDocument = (id) => {
    setDocuments((current) => current.filter((document) => document.id !== id));
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