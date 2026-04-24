import React from "react";
import { TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";

export default function History() {
  const { history } = useApp();
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const avgScore =
    history.length > 0
      ? (history.reduce((sum, r) => sum + r.score, 0) / history.length).toFixed(
          1
        )
      : 0;

  const bestDay = history.length > 0 ? Math.max(...history.map((r) => r.score)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4 text-center"
        >
          <div className="text-sm opacity-80 text-gray-900 dark:text-white">Days Tracked</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{history.length}</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-green-100 dark:bg-green-900 rounded-lg p-4 text-center"
        >
          <div className="text-sm opacity-80 text-gray-900 dark:text-white">Average Score</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{avgScore}%</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-purple-100 dark:bg-purple-900 rounded-lg p-4 text-center"
        >
          <div className="text-sm opacity-80 text-gray-900 dark:text-white">Best Day</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{bestDay}%</div>
        </motion.div>
      </div>

      {/* Daily Records */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 space-y-3">
        <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900 dark:text-white">
          <TrendingUp /> Daily Records
        </h3>

        {sortedHistory.length === 0 ? (
          <p className="text-sm opacity-70 italic text-gray-900 dark:text-white">No history yet</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {sortedHistory.map((record, idx) => (
                <motion.div
                  key={record.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {new Date(record.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        weekday: "short",
                      })}
                    </div>
                    <div className="text-xs opacity-70 text-gray-900 dark:text-gray-300">
                      {record.cal} cal | P:{record.prot}g C:{record.carbs}g
                      F:{record.fat}g | 💧{record.water}L
                    </div>
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      record.score >= 80
                        ? "text-green-600 dark:text-green-400"
                        : record.score >= 60
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {record.score}%
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-lg p-4 space-y-2">
        <h4 className="font-bold">📊 Insights</h4>
        <ul className="text-sm space-y-1 opacity-90">
          <li>
            ✅ You've logged {history.length} days of nutrition data
          </li>
          <li>
            🔥 Consistency is key - keep your streak alive!
          </li>
          <li>
            📈 Track trends over 4 weeks to see real progress
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
