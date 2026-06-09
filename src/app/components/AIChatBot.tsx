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
      placeholder: "Ask about Khairan...",
      title: "Assistant",
      welcome: "Hi! I'm Khairan's AI assistant. Ask me anything about his work!",
    },
    id: {
      placeholder: "Tanya soal Khairan...",
      title: "Asisten AI",
      welcome: "Halo! Saya asisten AI Khairan. Tanya saya apa saja tentang karyanya!",
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
        <div className="mb-4 w-[350px] sm:w-[380px] h-[520px] bg-[var(--bg-card)] rounded-[2rem] overflow-hidden flex flex-col border border-[var(--border-glass-hover)] shadow-[0_20px_60px_rgba(0,0,0,0.4)] animate-fade-in ring-1 ring-white/5">
          {/* Header */}
          <div className="p-6 border-b border-[var(--border-glass)] bg-[var(--bg-dark)]/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#50FFD9] to-[#a78bfa] p-[2px] shadow-lg shadow-[#50FFD9]/10">
                <div className="w-full h-full rounded-[14px] bg-[var(--bg-dark)] flex items-center justify-center text-base">🤖</div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-[var(--text-primary)]">{translations[lang].title}</span>
                <span className="text-[10px] font-bold text-[#50FFD9] uppercase tracking-widest">Active Now</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors text-[var(--text-secondary)] border border-transparent hover:border-[var(--border-glass)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-[var(--bg-dark)]/20">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[88%] px-5 py-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                  msg.role === "user" 
                    ? "bg-[#50FFD9] text-black font-bold rounded-tr-none" 
                    : "bg-[var(--bg-card)] border border-[var(--border-glass)] text-[var(--text-primary)] font-medium rounded-tl-none ring-1 ring-white/5"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--bg-card)] border border-[var(--border-glass)] text-[var(--text-primary)] px-5 py-3.5 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-[#50FFD9] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#50FFD9] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#50FFD9] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-5 border-t border-[var(--border-glass)] bg-[var(--bg-dark)]/40">
            <div className="relative flex items-center">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={translations[lang].placeholder}
                className="w-full bg-[var(--bg-dark)]/60 border border-[var(--border-glass)] rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-[#50FFD9]/50 transition-all pr-14 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-medium"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 w-10 h-10 flex items-center justify-center text-[#50FFD9] hover:bg-[#50FFD9]/10 rounded-xl transition-all disabled:opacity-20"
              >
                <svg className="w-6 h-6 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#50FFD9] to-[#a78bfa] shadow-[0_15px_40px_rgba(80,255,217,0.4)] flex items-center justify-center hover:scale-105 transition-all duration-500 active:scale-90 group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isOpen ? (
          <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative">
            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-bounce"></span>
          </div>
        )}
      </button>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border-glass);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--neon-cyan);
        }
      `}</style>
    </div>
  );
}
