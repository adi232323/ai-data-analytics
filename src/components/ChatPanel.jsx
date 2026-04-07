import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { buildDataContext } from "../utils/csvParser";

const SUGGESTIONS = [
  "Summarize this dataset for me",
  "What are the top 5 rows by value?",
  "Are there any outliers in the data?",
  "Show the average per category",
  "What insights can you find?",
  "Which column has the most variation?",
];

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
        }`}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div
        className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-blue-600 text-white rounded-tr-sm"
            : "bg-white border border-gray-200 text-gray-700 rounded-tl-sm"
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Bot size={14} className="text-gray-600" />
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-gray-300 rounded-full inline-block"
            style={{ animation: "bounce 1.2s infinite", animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatPanel({ data }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your AI data analyst. Upload a CSV file and ask me anything about your data — summaries, trends, comparisons, or specific queries.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    if (!data) {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: msg },
        { role: "assistant", text: "Please upload a CSV file first so I can analyze your data!" },
      ]);
      setInput("");
      return;
    }

    const userMsg = { role: "user", text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Build conversation history (skip the welcome message)
    const history = [...messages.slice(1), userMsg].map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    }));

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey || apiKey === "your_api_key_here") {
        throw new Error("API key not configured. Please add your key to the .env file.");
      }

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an expert data analyst. The user has loaded a CSV dataset. Analyze it and answer questions clearly and concisely. Provide specific numbers, insights, and actionable observations. Here is the full dataset context:\n\n${buildDataContext(data)}`,
          messages: history,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "API request failed");
      }

      const result = await res.json();
      const reply =
        result.content?.map((b) => b.text || "").join("") ||
        "Sorry, I couldn't process that request.";

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Error: ${err.message}. Please check your API key in the .env file.`,
        },
      ]);
    }

    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      {/* Suggestion chips */}
      <div className="px-5 pt-4 pb-3 border-b border-gray-200 bg-white">
        <p className="text-xs text-gray-400 mb-2">Try asking:</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 text-gray-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        {messages.map((m, i) => (
          <Message key={i} msg={m} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-5 py-4 bg-white border-t border-gray-200">
        <div className="flex gap-3 items-end bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-blue-400 focus-within:bg-white transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKey}
            placeholder={data ? "Ask anything about your data…" : "Upload a CSV file first…"}
            disabled={loading}
            rows={1}
            className="flex-1 text-sm resize-none outline-none bg-transparent text-gray-700 placeholder-gray-400 disabled:opacity-50"
            style={{ maxHeight: 120 }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send size={14} className={loading || !input.trim() ? "text-gray-400" : "text-white"} />
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
