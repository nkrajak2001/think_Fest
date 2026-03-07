import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import API from "../../services/api";

const AdminAIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: "model",
      parts: [
        {
          text: "Welcome to the Admin AI Control Center. I have direct context of current system stats (slots, bookings, users). Ask me anything about the system health, revenue, or operations data!"
        }
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    const newMessages = [
      ...messages,
      { role: "user", parts: [{ text: userMessage }] }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await API.post("/ai/admin", {
        prompt: userMessage,
        history: messages.slice(1).map((m) => ({
          role: m.role,
          parts: m.parts.map((p) => ({ text: p.text }))
        }))
      });

      if (res.data.success) {
        setMessages([
          ...newMessages,
          { role: "model", parts: [{ text: res.data.response }] }
        ]);
      }
    } catch (error) {
      console.error("Admin AI Chat Error:", error);
      setMessages([
        ...newMessages,
        {
          role: "model",
          parts: [
            { text: "Error fetching data from the AI service. Verify API keys or check the console." }
          ]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[85vh] bg-zinc-900 border border-zinc-700/50 rounded-2xl shadow-2xl overflow-hidden mt-2">
      {/* Header */}
      <div className="bg-zinc-800/80 backdrop-blur-md border-b border-zinc-700/50 p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Admin AI Insights</h2>
            <p className="text-sm text-zinc-400">Powered by Gemini. System context included.</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-900/50 scrollbar-thin scrollbar-thumb-zinc-700">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl p-5 shadow-lg flex space-x-4 ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-none ml-auto"
                  : "bg-zinc-800 border border-zinc-700/50 text-zinc-100 rounded-bl-none"
              }`}
            >
              <div className="mt-1 flex-shrink-0">
                {msg.role === "user" ? <User size={20} className="text-indigo-200" /> : <Bot size={20} className="text-indigo-400" />}
              </div>
              <div className="flex-1 min-w-0">
                {msg.role === "model" ? (
                  <div className="prose prose-invert prose-indigo max-w-none text-sm leading-relaxed">
                    <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.parts[0].text}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 border border-zinc-700/50 rounded-2xl rounded-bl-none p-5 shadow-lg flex items-center space-x-4 max-w-[75%]">
               <div className="flex-shrink-0">
                  <Bot size={20} className="text-indigo-400" />
               </div>
               <Loader2 size={20} className="animate-spin text-indigo-400" />
               <span className="text-sm text-zinc-400">Analyzing live data...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-zinc-800/50 border-t border-zinc-700/50">
        <form
          onSubmit={handleSend}
          className="max-w-4xl flex items-center space-x-4 bg-zinc-800 border border-zinc-600 focus-within:border-indigo-500 rounded-xl px-4 py-2 transition-colors mx-auto"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="E.g., Which slot type brings the most revenue? What is the current occupancy?"
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white py-2 placeholder-zinc-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-all disabled:opacity-50 flex-shrink-0 flex items-center justify-center group"
          >
            <Send size={18} className={`transition-transform ${input.trim() ? "group-hover:translate-x-1" : ""}`} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAIAssistant;
