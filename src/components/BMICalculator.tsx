import React, { useState } from "react";
import { Scale } from "lucide-react";
import { motion } from "motion/react";
import { getBMIDentalAdvice, getDietPlan } from "../lib/gemini";

interface BMIResult {
  bmi: string;
  cat: string;
  advice: string;
}

interface CalorieData {
  maintenance: number;
  bulking: number;
  cutting: number;
}

interface DietPlan {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

function calculateCalories(weight: number, height: number, age: number, gender: string, activity: number): CalorieData {
  // Mifflin-St Jeor Formula for BMR
  let bmr;

  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const maintenance = Math.round(bmr * activity); // activity multiplier
  const bulking = maintenance + 300;
  const cutting = maintenance - 300;

  return { maintenance, bulking, cutting };
}

export default function BMICalculator() {
  const [bmiData, setBmiData] = useState({ h: 170, w: 70, a: 25, g: "male" });
  const [activity, setActivity] = useState(1.55); // Default: Moderate
  const [bmiResult, setBmiResult] = useState<BMIResult | null>(null);
  const [calories, setCalories] = useState<CalorieData | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isGeneratingDiet, setIsGeneratingDiet] = useState(false);

  const calculateBMI = async () => {
    const { h, w, a, g } = bmiData;
    const bmi = (w / ((h / 100) ** 2)).toFixed(1);
    let cat = "";
    if (+bmi < 18.5) cat = "Underweight";
    else if (+bmi < 25) cat = "Normal Weight";
    else if (+bmi < 30) cat = "Overweight";
    else cat = "Obese";

    setBmiResult({ bmi, cat, advice: "Analyzing advice..." });
    setIsCalculating(true);

    try {
      // Calculate calories with activity level
      const calorieData = calculateCalories(w, h, a, g, activity);
      setCalories(calorieData);

      // Get BMI advice
      const advice = await getBMIDentalAdvice(bmi, cat, a, g);
      setBmiResult({ bmi, cat, advice });
    } catch (e) {
      console.error("BMI error:", e);
      setBmiResult({
        bmi,
        cat,
        advice: "Maintain a balanced diet and regular exercise.",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Separate function for diet plan generation
  const generateDietPlan = async () => {
    if (!calories) {
      alert("Please calculate BMI first!");
      return;
    }

    setIsGeneratingDiet(true);
    try {
      const { h, w, g } = bmiData;
      const plan = await getDietPlan({
        calories: calories.maintenance,
        goal: "maintenance",
        weight: w,
        height: h,
        gender: g
      });
      setDietPlan(plan);
    } catch (e) {
      console.error("Diet plan error:", e);
    } finally {
      setIsGeneratingDiet(false);
    }
  };

  const getCategoryColor = (category: string) => {
    if (category === "Normal Weight") return "text-green-600 dark:text-green-400";
    if (category === "Underweight") return "text-blue-600 dark:text-blue-400";
    if (category === "Overweight") return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto space-y-6"
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 space-y-4">
        <h2 className="font-bold text-2xl flex items-center gap-2">
          <Scale /> BMI Calculator
        </h2>

        {/* Height */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
            Height (cm): {bmiData.h}
          </label>
          <input
            type="range"
            min="100"
            max="220"
            value={bmiData.h}
            onChange={(e) =>
              setBmiData({ ...bmiData, h: parseInt(e.target.value) })
            }
            className="w-full"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
            Weight (kg): {bmiData.w}
          </label>
          <input
            type="range"
            min="20"
            max="200"
            value={bmiData.w}
            onChange={(e) =>
              setBmiData({ ...bmiData, w: parseInt(e.target.value) })
            }
            className="w-full"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
            Age (years): {bmiData.a}
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={bmiData.a}
            onChange={(e) =>
              setBmiData({ ...bmiData, a: parseInt(e.target.value) })
            }
            className="w-full"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Gender</label>
          <div className="flex gap-4">
            {["male", "female", "other"].map((g) => (
              <label key={g} className="flex items-center gap-2 text-gray-900 dark:text-white">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={bmiData.g === g}
                  onChange={(e) => setBmiData({ ...bmiData, g: e.target.value })}
                />
                <span className="capitalize">{g}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Activity Level</label>
          <select
            value={activity}
            onChange={(e) => setActivity(Number(e.target.value))}
            className="w-full border rounded p-2 text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700 bg-white border-gray-300"
          >
            <option value={1.2}>Sedentary (Little/No Exercise)</option>
            <option value={1.375}>Light (1-3 days/week)</option>
            <option value={1.55}>Moderate (3-5 days/week)</option>
            <option value={1.725}>Active (6-7 days/week)</option>
          </select>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateBMI}
          disabled={isCalculating}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg disabled:opacity-50"
        >
          {isCalculating ? "Analyzing..." : "Calculate BMI"}
        </button>
      </div>

      {/* Result */}
      {bmiResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {/* BMI Section */}
          <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg p-6 space-y-3">
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-600 dark:text-purple-400">
                {bmiResult.bmi}
              </div>
              <div className={`text-xl font-bold ${getCategoryColor(bmiResult.cat)}`}>
                {bmiResult.cat}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm leading-relaxed">{bmiResult.advice}</p>
            </div>
          </div>

          {/* Calorie Suggestions */}
          {calories && (
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-6 space-y-3 border border-green-200 dark:border-green-800">
              <h3 className="font-bold text-lg text-green-700 dark:text-green-400">📊 Daily Calorie Goals</h3>
              <div className="space-y-2">
                <div className="bg-white dark:bg-gray-800 rounded p-3">
                  <p className="text-sm">🔧 <span className="font-semibold">Maintenance:</span> <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{calories.maintenance} kcal</span></p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded p-3">
                  <p className="text-sm">💪 <span className="font-semibold">Bulking:</span> <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{calories.bulking} kcal</span></p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded p-3">
                  <p className="text-sm">⚡ <span className="font-semibold">Cutting:</span> <span className="text-lg font-bold text-red-600 dark:text-red-400">{calories.cutting} kcal</span></p>
                </div>
              </div>
              <button
                onClick={generateDietPlan}
                disabled={isGeneratingDiet}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg disabled:opacity-50 mt-3"
              >
                {isGeneratingDiet ? "Generating..." : "🍽️ Generate Diet Plan"}
              </button>
            </div>
          )}

          {/* Diet Plan */}
          {dietPlan && (
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6 space-y-3 border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-lg text-blue-700 dark:text-blue-400">🍽️ Daily Diet Plan</h3>
              <div className="space-y-2">
                <div className="bg-white dark:bg-gray-800 rounded p-3">
                  <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">Breakfast</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{dietPlan.breakfast}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded p-3">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">Lunch</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{dietPlan.lunch}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded p-3">
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">Dinner</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{dietPlan.dinner}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded p-3">
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Snacks</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{dietPlan.snacks}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
