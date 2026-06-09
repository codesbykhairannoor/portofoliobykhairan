"use client";

import React, { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function AIChatBot({ lang }: { lang: "id" | "en" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const translations = {
    en: {
      placeholder: "Ask me about Khairan...",
      title: "Chat with Khairan AI",
      welcome: "Hi! I'm Khairan's AI assistant. How can I help you today?",
    },
    id: {
      placeholder: "Tanya soal Khairan...",
      title: "Chat dengan AI Khairan",
      welcome: "Halo! Saya asisten AI Khairan. Ada yang bisa saya bantu hari ini?",
    }
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: "ai", content: translations[lang].welcome }]);
    }
  }, [lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history }),
      });

      const data = await response.json();
      if (data.text) {
        setMessages((prev) => [...prev, { role: "ai", content: data.text }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", content: "Error: " + (data.error || "Unknown error") }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", content: "Sorry, something went wrong." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] glass-panel rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl animate-fade-in">
          {/* Header */}
          <div className="p-5 border-b border-[var(--border-glass)] bg-[var(--bg-card)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#50FFD9] to-[#a78bfa] p-[2px]">
                <div className="w-full h-full rounded-full bg-[var(--bg-dark)] flex items-center justify-center text-[10px]">🤖</div>
              </div>
              <span className="font-bold text-sm tracking-tight text-[var(--text-primary)]">{translations[lang].title}</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-[var(--text-secondary)]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[var(--bg-dark)]/50">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-[#50FFD9] text-black font-semibold rounded-tr-none shadow-lg shadow-[#50FFD9]/20" 
                    : "bg-[var(--bg-card)] border border-[var(--border-glass)] text-[var(--text-primary)] rounded-tl-none"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--bg-card)] border border-[var(--border-glass)] text-[var(--text-primary)] px-4 py-3 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[var(--border-glass)] bg-[var(--bg-card)]">
            <div className="relative flex items-center">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={translations[lang].placeholder}
                className="w-full bg-[var(--bg-dark)]/50 border border-[var(--border-glass)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#50FFD9]/50 transition-all pr-12 text-[var(--text-primary)]"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 text-[#50FFD9] hover:bg-[#50FFD9]/10 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#50FFD9] to-[#a78bfa] shadow-[0_0_30px_rgba(80,255,217,0.3)] flex items-center justify-center hover:scale-110 transition-transform duration-300 active:scale-95 group relative"
      >
        <div className="absolute inset-0 rounded-full bg-[#50FFD9] animate-ping opacity-20 group-hover:opacity-0 transition-opacity"></div>
        {isOpen ? (
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(80, 255, 217, 0.3);
        }
      `}</style>
    </div>
  );
}
