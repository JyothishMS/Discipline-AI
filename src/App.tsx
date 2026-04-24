import React, { useState } from "react";
import Dashboard from "./components/Dashboard";
import Diet from "./components/Diet";
import Chat from "./components/Chat";
import BMICalculator from "./components/BMICalculator";
import Goals from "./components/Goals";
import History from "./components/History";
import CalendarView from "./components/CalendarView";

export default function App() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-cyan-900/20 dark:to-teal-900/20">
      <div className="flex gap-2 p-4 border-b overflow-x-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <button onClick={() => setTab("dashboard")} className="px-3 py-1 whitespace-nowrap text-white font-semibold hover:bg-white/20 rounded">Dashboard</button>
        <button onClick={() => setTab("diet")} className="px-3 py-1 whitespace-nowrap text-white font-semibold hover:bg-white/20 rounded">Diet</button>
        <button onClick={() => setTab("chat")} className="px-3 py-1 whitespace-nowrap text-white font-semibold hover:bg-white/20 rounded">Chat</button>
        <button onClick={() => setTab("bmi")} className="px-3 py-1 whitespace-nowrap text-white font-semibold hover:bg-white/20 rounded">BMI</button>
        <button onClick={() => setTab("goals")} className="px-3 py-1 whitespace-nowrap text-white font-semibold hover:bg-white/20 rounded">Goals</button>
        <button onClick={() => setTab("history")} className="px-3 py-1 whitespace-nowrap text-white font-semibold hover:bg-white/20 rounded">History</button>
        <button onClick={() => setTab("calendar")} className="px-3 py-1 whitespace-nowrap text-white font-semibold hover:bg-white/20 rounded">Calendar</button>
      </div>

      <div className="p-4">
        {tab === "dashboard" && <Dashboard />}
        {tab === "diet" && <Diet />}
        {tab === "chat" && <Chat />}
        {tab === "bmi" && <BMICalculator />}
        {tab === "goals" && <Goals />}
        {tab === "history" && <History />}
        {tab === "calendar" && <CalendarView />}
      </div>
    </div>
  );
}
