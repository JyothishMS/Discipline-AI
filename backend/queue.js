import Queue from "bull";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

// Create Bull Queue for AI analysis jobs
const analysisQueue = new Queue("ai-analysis", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
  },
});

// Process AI analysis jobs
analysisQueue.process(async (job) => {
  console.log(`\n📋 Processing job ${job.id}: AI Analysis`);
  console.log(`📊 Progress: 0%`);

  try {
    const userData = job.data;

    // Update progress
    job.progress(25);
    console.log(`📊 Progress: 25% - Building prompt`);

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

    job.progress(50);
    console.log(`📊 Progress: 50% - Calling Gemini API`);

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

    job.progress(75);
    console.log(`📊 Progress: 75% - Parsing response`);

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

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

    job.progress(100);
    console.log(`✅ Job ${job.id} completed successfully`);

    return parsed;
  } catch (err) {
    console.error(`❌ Job ${job.id} failed:`, err.message);
    throw err;
  }
});

// Handle job events
analysisQueue.on("completed", (job) => {
  console.log(`\n🎉 Job ${job.id} completed!`);
});

analysisQueue.on("failed", (job, err) => {
  console.error(`\n❌ Job ${job.id} failed after ${job.attemptsMade} attempts:`, err.message);
});

analysisQueue.on("active", (job) => {
  console.log(`\n▶️  Job ${job.id} started processing`);
});

analysisQueue.on("waiting", (jobId) => {
  console.log(`\n⏳ Job ${jobId} waiting in queue`);
});

export { analysisQueue };
