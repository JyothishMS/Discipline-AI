import React from "react";
import { Target } from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import type { Goals } from "../types";

export default function GoalsComponent() {
  const { goals, setGoals } = useApp();

  if (!goals) {
    return <p className="text-sm text-gray-500">No goals set</p>;
  }

  const handleChange = (key: keyof Goals, value: number) => {
    setGoals({ ...goals, [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto space-y-6"
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 space-y-5">
        <h2 className="font-bold text-2xl flex items-center gap-2 text-gray-900 dark:text-white">
          <Target /> Nutrition Goals
        </h2>

        {/* Calories */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
            Daily Calories: {goals.cal} kcal
          </label>
          <input
            type="range"
            min="1200"
            max="4000"
            step="100"
            value={goals.cal}
            onChange={(e) => handleChange("cal", parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-xs opacity-70 mt-1 text-gray-900 dark:text-gray-300">
            Typical range: 1500-3000 kcal
          </div>
        </div>

        {/* Protein */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
            Daily Protein: {goals.prot}g
          </label>
          <input
            type="range"
            min="50"
            max="300"
            step="5"
            value={goals.prot}
            onChange={(e) => handleChange("prot", parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-xs opacity-70 mt-1 text-gray-900 dark:text-gray-300">
            Rule of thumb: 1.6-2.2g per kg of body weight
          </div>
        </div>

        {/* Carbs */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
            Daily Carbs: {goals.carbs}g
          </label>
          <input
            type="range"
            min="100"
            max="500"
            step="10"
            value={goals.carbs}
            onChange={(e) => handleChange("carbs", parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-xs opacity-70 mt-1 text-gray-900 dark:text-gray-300">
            Typical range: 200-350g for moderate activity
          </div>
        </div>

        {/* Fat */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
            Daily Fat: {goals.fat}g
          </label>
          <input
            type="range"
            min="30"
            max="150"
            step="5"
            value={goals.fat}
            onChange={(e) => handleChange("fat", parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-xs opacity-70 mt-1 text-gray-900 dark:text-gray-300">
            Typical range: 50-100g (20-30% of calories)
          </div>
        </div>

        {/* Water */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
            Daily Water: {goals.water}L
          </label>
          <input
            type="range"
            min="2"
            max="20"
            step="0.5"
            value={goals.water}
            onChange={(e) => handleChange("water", parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs opacity-70 mt-1 text-gray-900 dark:text-gray-300">
            Recommended: 8-10L daily (3.7-3.8L minimum)
          </div>
        </div>

        {/* Weight Target */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
            Target Weight: {goals.weight} kg
          </label>
          <input
            type="range"
            min="40"
            max="150"
            step="0.5"
            value={goals.weight}
            onChange={(e) => handleChange("weight", parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs opacity-70 mt-1 text-gray-900 dark:text-gray-300">
            Set a realistic long-term goal
          </div>
        </div>

        {/* Quick Presets */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Quick Presets</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                setGoals({
                  cal: 2000,
                  prot: 150,
                  carbs: 250,
                  fat: 65,
                  water: 10,
                  weight: 70,
                })
              }
              className="bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 px-3 py-2 rounded text-sm font-medium text-gray-900 dark:text-white"
            >
              🔄 Balanced
            </button>
            <button
              onClick={() =>
                setGoals({
                  cal: 1800,
                  prot: 180,
                  carbs: 180,
                  fat: 60,
                  water: 10,
                  weight: 65,
                })
              }
              className="bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 px-3 py-2 rounded text-sm font-medium text-gray-900 dark:text-white"
            >
              💪 High Protein
            </button>
            <button
              onClick={() =>
                setGoals({
                  cal: 2200,
                  prot: 130,
                  carbs: 300,
                  fat: 70,
                  water: 12,
                  weight: 80,
                })
              }
              className="bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 px-3 py-2 rounded text-sm font-medium text-gray-900 dark:text-white"
            >
              ⚡ High Carb
            </button>
            <button
              onClick={() =>
                setGoals({
                  cal: 1600,
                  prot: 130,
                  carbs: 150,
                  fat: 55,
                  water: 9,
                  weight: 60,
                })
              }
              className="bg-orange-100 dark:bg-orange-900 hover:bg-orange-200 dark:hover:bg-orange-800 px-3 py-2 rounded text-sm font-medium text-gray-900 dark:text-white"
            >
              🎯 Low Cal
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
