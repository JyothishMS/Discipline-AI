import React, { useState } from "react";
import { LogOut } from "lucide-react";
import Dashboard from "./components/Dashboard";
import Diet from "./components/Diet";
import Chat from "./components/Chat";
import BMICalculator from "./components/BMICalculator";
import Goals from "./components/Goals";
import History from "./components/History";
import CalendarView from "./components/CalendarView";
import Login from "./components/Login";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-cyan-900/20 dark:to-teal-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-cyan-900/20 dark:to-teal-900/20">
      {/* Header with logout */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
          Discipline AI
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Welcome, <span className="font-semibold text-gray-900 dark:text-white">{user.email}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-4 border-b overflow-x-auto bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <button
          onClick={() => setTab("dashboard")}
          className={`px-3 py-1 whitespace-nowrap font-semibold rounded transition-colors ${
            tab === "dashboard"
              ? "bg-cyan-600 text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-white/20"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setTab("diet")}
          className={`px-3 py-1 whitespace-nowrap font-semibold rounded transition-colors ${
            tab === "diet"
              ? "bg-cyan-600 text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-white/20"
          }`}
        >
          Diet
        </button>
        <button
          onClick={() => setTab("chat")}
          className={`px-3 py-1 whitespace-nowrap font-semibold rounded transition-colors ${
            tab === "chat"
              ? "bg-cyan-600 text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-white/20"
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setTab("bmi")}
          className={`px-3 py-1 whitespace-nowrap font-semibold rounded transition-colors ${
            tab === "bmi"
              ? "bg-cyan-600 text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-white/20"
          }`}
        >
          BMI
        </button>
        <button
          onClick={() => setTab("goals")}
          className={`px-3 py-1 whitespace-nowrap font-semibold rounded transition-colors ${
            tab === "goals"
              ? "bg-cyan-600 text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-white/20"
          }`}
        >
          Goals
        </button>
        <button
          onClick={() => setTab("history")}
          className={`px-3 py-1 whitespace-nowrap font-semibold rounded transition-colors ${
            tab === "history"
              ? "bg-cyan-600 text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-white/20"
          }`}
        >
          History
        </button>
        <button
          onClick={() => setTab("calendar")}
          className={`px-3 py-1 whitespace-nowrap font-semibold rounded transition-colors ${
            tab === "calendar"
              ? "bg-cyan-600 text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-white/20"
          }`}
        >
          Calendar
        </button>
      </div>

      {/* Content */}
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
