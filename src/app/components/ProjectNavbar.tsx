"use client";

import React, { useState, useEffect } from "react";

interface ProjectNavbarProps {
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
  lang?: "id" | "en";
  onChangeLang?: (lang: "id" | "en") => void;
}

export default function ProjectNavbar({ 
  theme: propTheme, 
  onToggleTheme,
  lang: propLang,
  onChangeLang
}: ProjectNavbarProps = {}) {
  const [internalTheme, setInternalTheme] = useState<"dark" | "light">("dark");
  const [internalLang, setInternalLang] = useState<"id" | "en">("id");
  
  const isControlledTheme = propTheme !== undefined && onToggleTheme !== undefined;
  const isControlledLang = propLang !== undefined && onChangeLang !== undefined;
  
  const currentTheme = isControlledTheme ? propTheme : internalTheme;
  const currentLang = isControlledLang ? propLang : internalLang;

  // Sync theme
  useEffect(() => {
    if (isControlledTheme) return;
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;
    
    setInternalTheme(initialTheme);
    if (initialTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [isControlledTheme]);

  // Sync language
  useEffect(() => {
    if (isControlledLang) return;
    const savedLang = localStorage.getItem("lang") as "id" | "en" | null;
    if (savedLang) {
      setInternalLang(savedLang);
    } else {
      const systemLang = navigator.language.toLowerCase().startsWith("id") ? "id" : "en";
      setInternalLang(systemLang);
    }
  }, [isControlledLang]);

  const toggleTheme = () => {
    if (isControlledTheme) {
      onToggleTheme();
      return;
    }
    const newTheme = internalTheme === "dark" ? "light" : "dark";
    setInternalTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  const toggleLang = () => {
    const newLang = currentLang === "en" ? "id" : "en";
    if (isControlledLang) {
      onChangeLang(newLang);
    } else {
      setInternalLang(newLang);
      localStorage.setItem("lang", newLang);
    }
  };

  // Translations
  const navText = {
    en: {
      back: "Back to Vault",
      consult: "Contact Me"
    },
    id: {
      back: "Kembali ke Gudang",
      consult: "Hubungi Saya"
    }
  };

  return (
    <header className="fixed top-4 md:top-6 inset-x-4 md:inset-x-8 mx-auto z-50 max-w-4xl">
      <nav className="glass-panel px-3 md:px-6 py-2.5 md:py-4 rounded-2xl flex items-center justify-between border border-[var(--border-glass)] shadow-xl bg-[var(--bg-card)]">
        <a 
          href="/#portfolio" 
          className="btn-glass text-[9px] sm:text-xs py-2 px-3 sm:px-4.5 rounded-xl flex items-center gap-1.5 sm:gap-2 hover:text-[var(--neon-cyan)] transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-180" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
          <span className="hidden xs:inline">{navText[currentLang].back}</span>
          <span className="xs:hidden">Back</span>
        </a>
        
        <span className="text-sm font-black tracking-tighter text-[var(--text-primary)] hidden md:inline select-none">
          Khairan<span className="text-[var(--neon-cyan)] glow-text">.tech</span>
        </span>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Language Switcher Button */}
          <button 
            onClick={toggleLang}
            className="h-8 sm:h-10 px-2 sm:px-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-glass)] flex items-center gap-1 hover:border-[var(--neon-cyan)]/30 text-[9px] sm:text-[10px] font-extrabold tracking-wider text-[var(--text-secondary)] hover:text-[var(--neon-cyan)] transition-all focus:outline-none cursor-pointer"
            title={currentLang === "en" ? "Ubah ke Bahasa Indonesia" : "Switch to English"}
          >
            <span className="hidden sm:inline">🌐</span>
            <span>{currentLang === "en" ? "EN" : "ID"}</span>
          </button>

          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-glass)] flex items-center justify-center hover:border-[var(--neon-cyan)]/30 text-[var(--text-secondary)] hover:text-[var(--neon-cyan)] transition-all focus:outline-none cursor-pointer"
            aria-label="Toggle Theme"
            title={currentTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {currentTheme === "dark" ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          <a href="/#contact" className="btn-neon text-[10px] sm:text-xs py-2 px-3 sm:px-4.5 rounded-xl border border-transparent transition-all">
            {navText[currentLang].consult}
          </a>
        </div>
      </nav>
    </header>
  );
}
