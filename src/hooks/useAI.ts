import { useState } from "react";
import { getFullAnalysis } from "../lib/gemini";

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (input: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFullAnalysis(input);
      setData(res);
    } catch (e: any) {
      setError(e?.message || "AI request failed");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, analyze };
}
