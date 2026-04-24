import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { analyzeNutrition } from "../lib/gemini";
import { saveMeal } from "../services/db";
import { useApp } from "../context/AppContext";
import type { Meal } from "../types";

const QUICK_ADD_OPTIONS = [
  { name: "Banana", desc: "1 medium banana", emoji: "🍌" },
  { name: "Chicken", desc: "100g chicken breast grilled", emoji: "🍗" },
  { name: "Oats", desc: "1 cup rolled oats with milk", emoji: "🥣" },
  { name: "Avocado", desc: "1 whole avocado", emoji: "🥑" },
  { name: "Eggs", desc: "2 whole boiled eggs", emoji: "🥚" },
];

export default function Diet() {
  const { meals, setMeals } = useApp();
  const [foodInp, setFoodInp] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mealType, setMealType] = useState<Meal["type"]>("Breakfast");

  const handleAddMeal = async () => {
    if (!foodInp) return;
    setIsAnalyzing(true);
    try {
      const info = await analyzeNutrition(foodInp);
      const meal: Meal = {
        id: Math.random().toString(36).substr(2, 9),
        name: info.name || foodInp,
        cal: info.cal || 0,
        prot: info.prot || 0,
        carbs: info.carbs || 0,
        fat: info.fat || 0,
        type: mealType,
        timestamp: new Date().toISOString(),
      };
      setMeals((prev) => [...prev, meal]);
      await saveMeal(meal);
      setFoodInp("");
    } catch (e) {
      console.error("Error analyzing nutrition:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const todayMeals = meals.filter((m) => {
    const mealDate = new Date(m.timestamp).toDateString();
    return mealDate === new Date().toDateString();
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Meal Type Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["Breakfast", "Lunch", "Dinner", "Snack"].map((type) => (
          <button
            key={type}
            onClick={() => setMealType(type as Meal["type"])}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition ${
              mealType === type
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Food Input */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 space-y-3">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Log a Meal</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={foodInp}
            onChange={(e) => setFoodInp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddMeal()}
            placeholder="e.g., chicken breast 100g, brown rice 1 cup"
            className="flex-1 px-3 py-2 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700 bg-white border-gray-300"
            disabled={isAnalyzing}
          />
          <button
            onClick={handleAddMeal}
            disabled={isAnalyzing}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {isAnalyzing ? "🔄" : "Add"}
          </button>
        </div>
      </div>

      {/* Quick Add */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 space-y-3">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Quick Add</h3>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ADD_OPTIONS.map((opt) => (
            <button
              key={opt.name}
              onClick={() => {
                setFoodInp(opt.name);
              }}
              className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 p-3 rounded-lg text-left transition"
            >
              <div className="text-lg">{opt.emoji}</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{opt.name}</div>
              <div className="text-xs opacity-70 text-gray-900 dark:text-white">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Meals */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 space-y-3">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Today's Meals ({todayMeals.length})</h3>
        <AnimatePresence>
          {todayMeals.length === 0 ? (
            <p className="text-sm opacity-70 italic text-gray-900 dark:text-white">No meals logged yet</p>
          ) : (
            todayMeals.map((meal) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{meal.name}</div>
                  <div className="text-xs opacity-70 text-gray-900 dark:text-white">
                    {meal.cal}cal | P:{meal.prot}g C:{meal.carbs}g F:{meal.fat}g
                  </div>
                </div>
                <button
                  onClick={() => setMeals((prev) => prev.filter((p) => p.id !== meal.id))}
                  className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900 p-2 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
