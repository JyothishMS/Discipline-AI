import React, { useState, useRef, useEffect, useMemo } from "react";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getCoachResponse } from "../lib/gemini";
import { useApp } from "../context/AppContext";
import type { ChatMessage } from "../types";

export default function Chat() {
  const { meals, goals } = useApp();
  const [chatInp, setChatInp] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const calories = useMemo(() => meals.reduce((sum, m) => sum + m.cal, 0), [meals]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendChat = async () => {
    if (!chatInp) return;

    const userMsg = chatInp;
    setChatInp("");

    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: "user", content: userMsg },
    ];
    setChatHistory(newHistory);
    setIsChatting(true);

    const context = `Eaten today: ${calories}kcal / ${goals?.cal ?? 0}kcal. Meals: ${meals
      .map((m) => m.name)
      .join(", ")}`;

    try {
      const response = await getCoachResponse(userMsg, newHistory, context);
      setChatHistory((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (e) {
      console.error("Chat error:", e);
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Communication bridge overloaded. Try again later.",
        },
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full space-y-4"
    >
      {/* Messages */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg p-4 overflow-y-auto space-y-3 max-h-96">
        {chatHistory.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            Start a conversation with your AI coach 🤖
          </p>
        ) : (
          <AnimatePresence>
            {chatHistory.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={chatInp}
          onChange={(e) => setChatInp(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
          placeholder="Ask me anything..."
          className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          disabled={isChatting}
        />
        <button
          onClick={handleSendChat}
          disabled={isChatting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </motion.div>
  );
}
