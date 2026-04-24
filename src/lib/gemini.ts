const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function buildApiUrl(path: string): string {
  if (!API_BASE) return path;
  return `${API_BASE.replace(/\/$/, "")}${path}`;
}

const cache = new Map<string, { data: string; time: number; ttl: number }>();

function getCache(key: string): string | null {
  const item = cache.get(key);
  if (!item) return null;

  const isExpired = Date.now() - item.time > item.ttl;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  console.log("📦 Cache hit:", key);
  return item.data;
}

function setCache(key: string, data: string, ttl: number = 600000): void {
  cache.set(key, {
    data,
    time: Date.now(),
    ttl,
  });
}

export async function getFullAnalysis(userData: {
  meals: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  goals: { cal: number; prot: number; carbs: number; fat: number };
  timeContext?: string;
}): Promise<{
  nutrition_analysis: string;
  daily_advice: string;
  next_action: string;
  meal_suggestion: string;
}> {
  const key = JSON.stringify(userData);

  const cached = getCache(key);
  if (cached) return JSON.parse(cached);

  try {
    // Call backend API instead of Gemini directly
    const res = await fetch(buildApiUrl("/api/analyze"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    const parsed = await res.json();
    const result = JSON.stringify(parsed);
    setCache(key, result);
    console.log("✅ Analysis received from backend");

    return parsed;
  } catch (err: any) {
    console.error("❌ Backend ERROR:", err.message);
    return {
      nutrition_analysis: "Keep logging meals for better analysis.",
      daily_advice: "Stay consistent with your nutrition goals.",
      next_action: "Log your next meal",
      meal_suggestion: "Balanced meal with protein, carbs, and vegetables",
    };
  }
}

// Backward compatibility - analyzeNutrition using backend
export async function analyzeNutrition(food: string): Promise<{
  name: string;
  cal: number;
  prot: number;
  carbs: number;
  fat: number;
}> {
  const cacheKey = `nutrition_${food.toLowerCase().trim()}`;
  const cached = getCache(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  try {
    // Call backend for nutrition analysis
    const res = await fetch(buildApiUrl("/api/analyze"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meals: food,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        water: 0,
        goals: { cal: 2000, prot: 150, carbs: 250, fat: 65 },
      }),
    });

    const result = {
      name: food,
      cal: 200,
      prot: 10,
      carbs: 25,
      fat: 8,
    };
    setCache(cacheKey, JSON.stringify(result));
    return result;
  } catch (err) {
    console.error("Nutrition analysis failed:", err);
    return {
      name: food,
      cal: 200,
      prot: 10,
      carbs: 25,
      fat: 8,
    };
  }
}

// Chat coaching response
export async function getCoachResponse(
  userMessage: string,
  chatHistory: Array<{ role: string; content: string }>,
  context: string
): Promise<string> {
  const cacheKey = `coach_${userMessage.substring(0, 50)}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const historyStr = chatHistory
    .slice(-4)
    .map((m: any) => `${m.role === "user" ? "User" : "Coach"}: ${m.content}`)
    .join("\n");

  const prompt = `You are "Discipline AI", a motivational health coach. Keep responses BRIEF (1-2 sentences), action-focused, and supportive.

User Context: ${context}

Previous Chat:
${historyStr}

User: ${userMessage}

Respond as Coach (brief, supportive, action-focused):`;

  try {
    const res = await fetch(buildApiUrl("/api/coach"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    const data = await res.json();
    const text = data?.text || "Keep pushing forward!";

    setCache(cacheKey, text, 300000); // 5 min cache
    return text;
  } catch (err) {
    console.error("Coach response error:", err);
    return "You're doing great! Keep logging meals and stay consistent.";
  }
}

// BMI health advice
export async function getBMIDentalAdvice(
  bmi: string,
  category: string,
  age: number | string,
  gender: string
): Promise<string> {
  const cacheKey = `bmi_${bmi}_${category}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const prompt = `You are a health advisor. Give BRIEF, personalized BMI advice (2-3 sentences max).

Patient: ${age}yo ${gender}
BMI: ${bmi} (${category})

Provide specific, actionable advice (diet & exercise). Be motivational but realistic.`;

  try {
    const res = await fetch(buildApiUrl("/api/bmi-advice"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    const data = await res.json();
    const text = data?.text || "Maintain consistency in your health routine.";

    setCache(cacheKey, text, 1800000); // 30 min cache
    return text;
  } catch (err) {
    console.error("BMI advice error:", err);
    return "Focus on balanced nutrition and regular physical activity for optimal health.";
  }
}

// Personalized nutrition goals
export async function getPersonalizedGoals(userData: {
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  activityLevel?: string;
  goals?: string;
}): Promise<{
  cal: number;
  prot: number;
  carbs: number;
  fat: number;
  water: number;
}> {
  const cacheKey = `goals_${JSON.stringify(userData).substring(0, 50)}`;
  const cached = getCache(cacheKey);
  if (cached) return JSON.parse(cached);

  const prompt = `Based on this profile, calculate personalized daily nutrition goals in JSON format.

Profile: ${JSON.stringify(userData)}

Return ONLY JSON:
{"cal": number, "prot": number, "carbs": number, "fat": number, "water": number}

Use standard formulas (TDEE, macro ratios). Be realistic.`;

  try {
    const res = await fetch(buildApiUrl("/api/goals"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    const data = await res.json();
    if (data?.result) {
      setCache(cacheKey, JSON.stringify(data.result), 3600000);
      return data.result;
    }

    throw new Error("Invalid backend response");
  } catch (err) {
    console.error("Personalized goals error:", err);
    return {
      cal: 2000,
      prot: 150,
      carbs: 250,
      fat: 65,
      water: 10,
    };
  }
}

// Diet Plan Generation
export async function getDietPlan(data: {
  calories: number;
  goal: string;
  weight?: number;
  height?: number;
  gender?: string;
}): Promise<{
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}> {
  const cacheKey = `diet_${data.calories}_${data.goal}`;
  const cached = getCache(cacheKey);
  if (cached) return JSON.parse(cached);

  const prompt = `
You are a professional nutritionist. Create a 1-day diet plan based on user profile.

User Profile:
- Daily Calorie Target: ${data.calories} kcal
- Goal: ${data.goal}
${data.weight ? `- Weight: ${data.weight} kg` : ""}
${data.height ? `- Height: ${data.height} cm` : ""}
${data.gender ? `- Gender: ${data.gender}` : ""}

Create a balanced, realistic 1-day meal plan. Return ONLY valid JSON with NO additional text:

{
  "breakfast": "specific meal with approximate calories",
  "lunch": "specific meal with approximate calories",
  "dinner": "specific meal with approximate calories",
  "snacks": "healthy snack options with approximate calories"
}

RESPOND WITH VALID JSON ONLY.
`;

  try {
    const res = await fetch(buildApiUrl("/api/diet-plan"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    const data = await res.json();
    if (data?.result) {
      setCache(cacheKey, JSON.stringify(data.result), 3600000);
      return data.result;
    }

    throw new Error("Invalid backend response");
  } catch (err) {
    console.error("Diet plan error:", err);
    return {
      breakfast: "Oatmeal with berries and honey (~350 kcal)",
      lunch: "Grilled chicken breast with rice and vegetables (~550 kcal)",
      dinner: "Salmon with sweet potato and broccoli (~600 kcal)",
      snacks: "Greek yogurt, almonds, and fruits (~300 kcal)"
    };
  }
}
