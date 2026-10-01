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

  return (
    <FleetContext.Provider
      value={{
        vehicles,
        documents,
        addVehicle,
        updateVehicle,
        addDocument,
      }}
    >
      {children}
    </FleetContext.Provider>
  );
}