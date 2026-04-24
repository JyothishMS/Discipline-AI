import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "redis";
import { analysisQueue } from "./queue.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;

function ensureApiKey(res) {
  if (!API_KEY) {
    res.status(500).json({ error: "GEMINI_API_KEY not configured" });
    return false;
  }
  return true;
}

// Redis setup
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

let isRedisConnected = false;

redisClient.on("error", (err) => {
  console.warn("⚠️  Redis connection error:", err.message);
  isRedisConnected = false;
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
  isRedisConnected = true;
});

// Connect to Redis (non-blocking)
try {
  redisClient.connect().catch((err) => {
    console.warn("⚠️  Redis unavailable, using direct API:", err.message);
  });
} catch (err) {
  console.warn("⚠️  Redis connection skipped, running in direct API mode");
}

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// Queue status endpoint
app.get("/queue/status", async (req, res) => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      analysisQueue.getWaitingCount(),
      analysisQueue.getActiveCount(),
      analysisQueue.getCompletedCount(),
      analysisQueue.getFailedCount(),
    ]);

    res.json({
      waiting,
      active,
      completed,
      failed,
      total: waiting + active + completed + failed,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get job status endpoint
app.get("/job/:jobId", async (req, res) => {
  try {
    const job = await analysisQueue.getJob(req.params.jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const state = await job.getState();
    const progress = job.progress();
    const result = job.data;

    if (job._result) {
      return res.json({
        jobId: job.id,
        state,
        progress,
        result: job._result,
      });
    }

    res.json({
      jobId: job.id,
      state,
      progress,
      result: null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analyze with Bull Queue (background job)
app.post("/analyze-queue", async (req, res) => {
  try {
    const userData = req.body;

    // Add job to queue
    const job = await analysisQueue.add(userData, {
      jobId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });

    console.log(`\n📌 Job ${job.id} added to queue`);

    res.json({
      jobId: job.id,
      message: "Job queued for processing",
      statusUrl: `/job/${job.id}`,
    });
  } catch (err) {
    console.error("❌ Queue error:", err.message);
    res.status(500).json({
      error: "Failed to queue job",
      message: err.message,
    });
  }
});

// AI Analysis endpoint with Redis caching
async function handleAnalyze(req, res) {
  try {
    if (!ensureApiKey(res)) return;
    const userData = req.body;

    // Create cache key from user data
    const cacheKey = `analyze:${JSON.stringify({
      meals: userData.meals,
      calories: userData.calories,
      protein: userData.protein,
      carbs: userData.carbs,
      fat: userData.fat,
    })}`;

    // Check Redis cache first
    if (isRedisConnected) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log("📦 Cache HIT - returning cached result");
          return res.json(JSON.parse(cached));
        }
      } catch (cacheErr) {
        console.warn("⚠️  Cache read failed:", cacheErr.message);
      }
    }

    console.log("🔄 Cache MISS - calling Gemini API");

    const prompt = `
You are "Discipline AI", a high-performance health coach. RESPOND ONLY WITH VALID JSON.

USER DATA:
- Meals logged: ${userData.meals || "None yet"}
- Calories: ${userData.calories}/${userData.goals.cal} (${Math.round((userData.calories / userData.goals.cal) * 100)}%)
- Protein: ${userData.protein}g/${userData.goals.prot}g
- Carbs: ${userData.carbs}g/${userData.goals.carbs}g
- Fat: ${userData.fat}g/${userData.goals.fat}g
- Water: ${userData.water} glasses
- Time: ${userData.timeContext || "afternoon"}

RESPOND WITH THIS JSON STRUCTURE ONLY (NO OTHER TEXT):
{
  "nutrition_analysis": "1 sentence analyzing their macro balance",
  "daily_advice": "1 actionable sentence (max 20 words) - specific and motivational",
  "next_action": "specific action in max 10 words",
  "meal_suggestion": "1 meal idea that fills their macro gap"
}

BE STRICT, MOTIVATIONAL, AND BRIEF. RESPOND WITH VALID JSON ONLY.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        nutrition_analysis: text,
        daily_advice: "Keep logging meals for better analysis.",
        next_action: "Continue tracking",
        meal_suggestion: "Balanced meal with protein and vegetables",
      };
    }

    // Store in Redis cache (1 hour TTL)
    if (isRedisConnected) {
      try {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(parsed));
        console.log("💾 Result cached for 1 hour");
      } catch (cacheErr) {
        console.warn("⚠️  Cache write failed:", cacheErr.message);
      }
    }

    res.json(parsed);
  } catch (err) {
    console.error("❌ AI ERROR:", err.message);
    res.status(500).json({
      nutrition_analysis: "Keep logging meals for better analysis.",
      daily_advice: "Stay consistent with your nutrition goals.",
      next_action: "Log your next meal",
      meal_suggestion: "Balanced meal with protein, carbs, and vegetables",
    });
  }
}

app.post("/analyze", handleAnalyze);
app.post("/api/analyze", handleAnalyze);

app.post("/api/coach", async (req, res) => {
  try {
    if (!ensureApiKey(res)) return;
    const { prompt } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    res.json({ text });
  } catch (err) {
    console.error("❌ Coach AI ERROR:", err.message);
    res.status(500).json({ error: "Coach AI failed" });
  }
});

app.post("/api/bmi-advice", async (req, res) => {
  try {
    if (!ensureApiKey(res)) return;
    const { prompt } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    res.json({ text });
  } catch (err) {
    console.error("❌ BMI AI ERROR:", err.message);
    res.status(500).json({ error: "BMI AI failed" });
  }
});

app.post("/api/goals", async (req, res) => {
  try {
    if (!ensureApiKey(res)) return;
    const { prompt } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }

    res.json({ result: parsed });
  } catch (err) {
    console.error("❌ Goals AI ERROR:", err.message);
    res.status(500).json({ error: "Goals AI failed" });
  }
});

app.post("/api/diet-plan", async (req, res) => {
  try {
    if (!ensureApiKey(res)) return;
    const { prompt } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }

    res.json({ result: parsed });
  } catch (err) {
    console.error("❌ Diet Plan AI ERROR:", err.message);
    res.status(500).json({ error: "Diet plan AI failed" });
  }
});

console.log("✅ API routes: /api/analyze, /api/coach, /api/bmi-advice, /api/goals, /api/diet-plan");

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 Shutting down...");
  server.close(async () => {
    if (isRedisConnected) {
      await redisClient.quit();
      console.log("🔌 Redis disconnected");
    }
    await analysisQueue.close();
    console.log("🛑 Queue closed");
    process.exit(0);
  });
});
