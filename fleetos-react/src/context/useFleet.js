import { useContext } from "react";
import { FleetContext } from "./FleetContextDefinition";

export function useFleet() {
  const context = useContext(FleetContext);

  if (!context) {
    throw new Error("useFleet must be used inside FleetProvider");
  }

  return context;
}

