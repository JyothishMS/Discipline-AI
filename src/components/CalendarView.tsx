import React, { useState } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DayRecord } from "../types";
import { useApp } from "../context/AppContext";

interface CalendarViewProps {
  history?: DayRecord[];
}

export default function CalendarView({ history = [] }: CalendarViewProps) {
  const { meals } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  // Create a map for O(1) lookup instead of O(n)
  const historyMap = new Map(
    history.map(h => [h.date, h.score])
  );

  const isDateLogged = (day: number) => {
    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
    return historyMap.has(dateStr);
  };

  const getDateScore = (day: number) => {
    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
    return historyMap.get(dateStr) || 0;
  };

  // Get meals for a specific date
  const getMealsForDate = (dateStr: string) => {
    return meals.filter((m) => {
      const mealDate = new Date(m.timestamp).toISOString().split("T")[0];
      return mealDate === dateStr;
    });
  };

  // Get macros for a specific date
  const getMacrosForDate = (dateStr: string) => {
    const dateMeals = getMealsForDate(dateStr);
    return dateMeals.reduce(
      (acc, m) => ({
        cal: acc.cal + m.cal,
        prot: acc.prot + m.prot,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
      }),
      { cal: 0, prot: 0, carbs: 0, fat: 0 }
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDayColor = (day: number) => {
    if (!isDateLogged(day)) return "bg-gray-200 dark:bg-gray-700 text-white hover:bg-gray-300 dark:hover:bg-gray-600";
    
    const score = getDateScore(day);
    if (score >= 90) return "bg-green-600 text-white hover:bg-green-700";
    if (score >= 70) return "bg-green-500 text-white hover:bg-green-600";
    if (score >= 50) return "bg-yellow-500 text-white hover:bg-yellow-600";
    return "bg-orange-500 text-white hover:bg-orange-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 space-y-4">
        <h2 className="font-bold text-2xl flex items-center gap-2 text-gray-900 dark:text-white">
          <CalendarIcon /> Progress Calendar
        </h2>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            ← Previous
          </button>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={goToNextMonth}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Next →
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-sm text-gray-600 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty days for days before month starts */}
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days of month */}
          {days.map((day) => {
            const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
            return (
              <motion.div
                key={day}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square flex items-center justify-center rounded font-bold text-sm cursor-pointer transition ${getDayColor(day)} ${selectedDate === dateStr ? "ring-2 ring-purple-600" : ""}`}
                title={isDateLogged(day) ? `Logged - Score: ${getDateScore(day)}` : "No data"}
              >
                {day}
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded space-y-2">
          <p className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">📊 Performance Legend</p>
          <div className="space-y-1 text-sm text-gray-900 dark:text-white">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Excellent (90+%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span>Good (70-89%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>Fair (50-69%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-400 rounded"></div>
              <span>Needs Improvement (Below 50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
              <span>No Data Logged</span>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded space-y-2">
            <p className="font-semibold text-sm text-gray-900 dark:text-white">📈 Your Stats</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Days Logged</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{history.length}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Avg Score</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {history.length > 0 ? Math.round(history.reduce((sum, h) => sum + h.score, 0) / history.length) : 0}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Meal Details Modal */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 p-4 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg border border-purple-200 dark:border-purple-800 space-y-3"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  📅 {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric"
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <X size={20} className="text-gray-900 dark:text-white" />
                </button>
              </div>

              {(() => {
                const dateMeals = getMealsForDate(selectedDate);
                const macros = getMacrosForDate(selectedDate);
                
                return (
                  <>
                    {/* Macros Summary */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-white/50 dark:bg-gray-800 rounded p-2 text-center">
                        <p className="text-xs opacity-70 text-gray-900 dark:text-white">Calories</p>
                        <p className="font-bold text-red-600 dark:text-red-400">{macros.cal}</p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800 rounded p-2 text-center">
                        <p className="text-xs opacity-70 text-gray-900 dark:text-white">Protein</p>
                        <p className="font-bold text-blue-600 dark:text-blue-400">{macros.prot}g</p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800 rounded p-2 text-center">
                        <p className="text-xs opacity-70 text-gray-900 dark:text-white">Carbs</p>
                        <p className="font-bold text-yellow-600 dark:text-yellow-400">{macros.carbs}g</p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800 rounded p-2 text-center">
                        <p className="text-xs opacity-70 text-gray-900 dark:text-white">Fat</p>
                        <p className="font-bold text-green-600 dark:text-green-400">{macros.fat}g</p>
                      </div>
                    </div>

                    {/* Meals List */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white">🍽️ Meals Eaten</h4>
                      {dateMeals.length === 0 ? (
                        <p className="text-sm text-gray-900 dark:text-white opacity-70 italic">No meals logged on this date</p>
                      ) : (
                        <div className="space-y-2">
                          {dateMeals.map((meal) => (
                            <div
                              key={meal.id}
                              className="bg-white/60 dark:bg-gray-800/60 rounded p-2 text-sm"
                            >
                              <div className="font-medium text-gray-900 dark:text-white">{meal.name}</div>
                              <div className="text-xs opacity-70 text-gray-900 dark:text-white">
                                {meal.cal}cal | P:{meal.prot}g | C:{meal.carbs}g | F:{meal.fat}g | {meal.type}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
