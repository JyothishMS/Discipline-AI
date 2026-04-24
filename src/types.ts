export interface DayRecord {
  date: string; // ISO date string YYYY-MM-DD
  cal: number;
  prot: number;
  carbs: number;
  fat: number;
  water: number;
  score: number;
}

export interface UserStats {
  streakCount: number;
  lastActiveDate: string; // ISO string
  bestStreak: number;
}

export interface Meal {
  id: string;
  name: string;
  cal: number;
  prot: number;
  carbs: number;
  fat: number;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  timestamp: string;
}

export interface Goals {
  cal: number;
  prot: number;
  carbs: number;
  fat: number;
  water: number;
  weight: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface NutritionInfo {
  name: string;
  cal: number;
  prot: number;
  carbs: number;
  fat: number;
}

export interface MealSuggestion {
  name: string;
  reason: string;
  macros: { p: number, c: number, f: number, cal: number };
}
