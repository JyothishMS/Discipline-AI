import React, { useEffect, useMemo, useRef } from "react";
import { Flame } from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { useAI } from "../hooks/useAI";

export default function Dashboard() {
  const { meals, goals } = useApp();
  const { data, loading, error, analyze } = useAI();
  const lastAdviceState = useRef("");

  const stats = useMemo(() => {
    return meals.reduce(
      (acc, m) => ({
        cal: acc.cal + m.cal,
        prot: acc.prot + m.prot,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
      }),
      { cal: 0, prot: 0, carbs: 0, fat: 0 }
    );
  }, [meals]);

  useEffect(() => {
    if (!goals) return;
    if (meals.length === 0) return;

    const statsStr = `Cal:${stats.cal},Prot:${stats.prot},Carbs:${stats.carbs},Fat:${stats.fat}`;
    if (lastAdviceState.current === statsStr) return;

    lastAdviceState.current = statsStr;
    const timer = setTimeout(() => {
      analyze({
        meals: meals.map((m) => m.name).join(", ") || "None yet",
        calories: stats.cal,
        protein: stats.prot,
        carbs: stats.carbs,
        fat: stats.fat,
        water: 0,
        goals: goals,
        timeContext: "afternoon",
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [meals, stats, goals, analyze]);

  const caloriePercent = goals ? Math.min((stats.cal / goals.cal) * 100, 100) : 0;
  const proteinPercent = goals ? Math.min((stats.prot / goals.prot) * 100, 100) : 0;
  const carbsPercent = goals ? Math.min((stats.carbs / goals.carbs) * 100, 100) : 0;
  const fatPercent = goals ? Math.min((stats.fat / goals.fat) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Macros Progress */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 space-y-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Macros Progress</h3>

        {/* Calories */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2 text-gray-900 dark:text-white">
              <Flame size={16} /> Calories
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.cal} / {goals?.cal ?? 0}</span>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${caloriePercent}%` }}
              className="bg-red-500 h-full"
            />
          </div>
        </div>

        {/* Protein */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Protein</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.prot}g / {goals?.prot ?? 0}g</span>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${proteinPercent}%` }}
              className="bg-blue-500 h-full"
            />
          </div>
        </div>

        {/* Carbs */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Carbs</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.carbs}g / {goals?.carbs ?? 0}g</span>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${carbsPercent}%` }}
              className="bg-yellow-500 h-full"
            />
          </div>
        </div>

        {/* Fat */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Fat</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.fat}g / {goals?.fat ?? 0}g</span>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fatPercent}%` }}
              className="bg-green-500 h-full"
            />
          </div>
        </div>

      </div>

      {/* AI Coaching */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg p-6 space-y-3">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">🤖 Discipline AI Coach</h3>
        {loading && <p className="text-sm opacity-70 italic text-gray-900 dark:text-white">Analyzing...</p>}
        {!loading && !data && <p className="text-sm opacity-70 italic text-gray-900 dark:text-white">No data yet</p>}
        {!loading && data && (
          <>
            <p className="text-sm leading-relaxed text-gray-900 dark:text-white">{data.daily_advice || "Stay consistent"}</p>
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
              💪 Next Action: {data.next_action || "Drink water"}
            </p>
          </>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </motion.div>
  );
}
