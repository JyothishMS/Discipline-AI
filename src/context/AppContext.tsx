import React, { createContext, useContext, useState } from "react";
import type { Goals, Meal, DayRecord } from "../types";

interface AppContextValue {
  meals: Meal[];
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
  goals: Goals | null;
  setGoals: React.Dispatch<React.SetStateAction<Goals | null>>;
  history: DayRecord[];
  setHistory: React.Dispatch<React.SetStateAction<DayRecord[]>>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [goals, setGoals] = useState<Goals | null>({
    cal: 2000,
    prot: 150,
    carbs: 250,
    fat: 65,
    water: 10,
    weight: 70,
  });
  const [history, setHistory] = useState<DayRecord[]>([]);

  return (
    <AppContext.Provider value={{ meals, setMeals, goals, setGoals, history, setHistory }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return ctx;
};
