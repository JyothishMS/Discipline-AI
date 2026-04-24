import { supabase } from "../lib/supabaseClient";

export async function saveMeal(meal: any) {
  if (!supabase) {
    console.warn("Supabase unavailable. Skipping saveMeal.");
    return null;
  }

  try {
    return await supabase.from("meals").insert([meal]);
  } catch (err) {
    console.error("❌ Error saving meal:", err);
    return null;
  }
}

export async function saveDayRecord(record: any) {
  if (!supabase) {
    console.warn("Supabase unavailable. Skipping saveDayRecord.");
    return null;
  }

  try {
    return await supabase.from("daily_records").insert([record]);
  } catch (err) {
    console.error("❌ Error saving day record:", err);
    return null;
  }
}

export async function updateUserStats(userId: string, stats: any) {
  if (!supabase) {
    console.warn("Supabase unavailable. Skipping updateUserStats.");
    return null;
  }

  try {
    return await supabase
      .from("user_stats")
      .update(stats)
      .eq("id", userId);
  } catch (err) {
    console.error("❌ Error updating user stats:", err);
    return null;
  }
}

export async function getMealHistory(userId: string, days: number = 30) {
  if (!supabase) {
    console.warn("Supabase unavailable. Skipping getMealHistory.");
    return null;
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await supabase
      .from("meals")
      .select("*")
      .eq("user_id", userId)
      .gte("timestamp", cutoffDate.toISOString())
      .order("timestamp", { ascending: false });
  } catch (err) {
    console.error("❌ Error fetching meal history:", err);
    return null;
  }
}
