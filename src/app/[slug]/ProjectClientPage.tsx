"use client";

import React, { useState, useEffect } from "react";
import ProjectNavbar from "../components/ProjectNavbar";

interface ProjectData {
  id: string;
  title: string;
  title_en?: string;
  title_id?: string;
  slug: string;
  type: string;
  type_en?: string;
  type_id?: string;
  content: string;
  content_en?: string;
  content_id?: string;
}

interface ProjectClientPageProps {
  project: ProjectData;
  prevProject: { 
    title: string; 
    slug: string;
    title_en?: string;
    title_id?: string;
  } | null;
  nextProject: { 
    title: string; 
    slug: string;
    title_en?: string;
    title_id?: string;
  } | null;
  techStackBadges: string[];
  coverImage: string;
  cleanedContent: string;
  cleanedContent_en?: string;
  cleanedContent_id?: string;
  isDesignProject?: boolean;
  images?: string[];
  description?: string;
  description_en?: string;
  description_id?: string;
}

export default function ProjectClientPage({
  project,
  prevProject,
  nextProject,
  techStackBadges,
  coverImage,
  cleanedContent,
  cleanedContent_en,
  cleanedContent_id,
  isDesignProject = false,
  images = [],
  description = "",
  description_en = "",
  description_id = "",
}: ProjectClientPageProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [lang, setLang] = useState<"id" | "en">("id");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Load and synchronize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    
    if (initialTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, []);

  // Load and synchronize language on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as "id" | "en" | null;
    if (savedLang) {
      setLang(savedLang);
    } else {
      const systemLang = navigator.language.toLowerCase().startsWith("id") ? "id" : "en";
      setLang(systemLang);
    }
  }, []);

  // Sync theme clicks from Navbar through global class modifications
  const handleToggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  const handleChangeLang = (newLang: "id" | "en") => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  // Localized static strings
  const TEXTS = {
    en: {
      home: "Home",
      portfolio: "Portfolio",
      engineered_stack: "Engineered Stack",
      visual_assets: "Project Visual Assets",
      zoom_asset: "Zoom Asset 🔍",
      prev_showcase: "Previous Showcase",
      next_showcase: "Up Next Showcase",
      read_project_prev: "← Read Project",
      read_project_next: "Read Project →",
      slide_text: "Slide Asset",
      of: "of",
      fallback_design: "Visual Design Showcase",
      fallback_web: "Web Development Showcase",
      all_rights: "All Rights Reserved.",
      footer_alternative: "WordPress Alternative Engine. Compiled using Next.js & React."
    },
    id: {
      home: "Beranda",
      portfolio: "Portofolio",
      engineered_stack: "Teknologi yang Digunakan",
      visual_assets: "Aset Visual Proyek",
      zoom_asset: "Perbesar Aset 🔍",
      prev_showcase: "Showcase Sebelumnya",
      next_showcase: "Showcase Berikutnya",
      read_project_prev: "← Baca Proyek",
      read_project_next: "Baca Proyek →",
      slide_text: "Slide Aset",
      of: "dari",
      fallback_design: "Showcase Desain Visual",
      fallback_web: "Showcase Pengembangan Web",
      all_rights: "Hak Cipta Dilindungi Undang-Undang.",
      footer_alternative: "Mesin Alternatif WordPress. Dikompilasi menggunakan Next.js & React."
    }
  };

  // Dynamic label translator for WordPress static HTML
  const localizeHtmlContent = (html: string, currentLang: "id" | "en") => {
    if (!html) return "";
    if (currentLang === "en") return html; // Default WP HTML is in English

    let localized = html;
    
    const replacements: [RegExp, string][] = [
      [/Project Overview:/gi, "Ringkasan Proyek:"],
      [/The Challenge:/gi, "Tantangan Proyek:"],
      [/The Solution \(Solusi Teknis\):/gi, "Solusi Teknis:"],
      [/The Solution:/gi, "Solusi Teknis:"],
      [/The Result:/gi, "Hasil Akhir:"],
      [/🔗\s*Live\s*Site/gi, "🔗 Kunjungi Situs"],
      [/🧩\s*(?:Topic\s+Area|Bidang\s+Topik)/gi, "🧩 Bidang Topik"],
      [/🛠️\s*(?:Skills\s+Used|Keahlian\s+yang\s+Digunakan)/gi, "🛠️ Keahlian yang Digunakan"],
      [/⭐\s*(?:Key\s+Features|Fitur\s+Utama)/gi, "⭐ Fitur Utama"],
      [/%\s*Experience/gi, "% Pengalaman"],
      [/Automated Access Control:/gi, "Kontrol Akses Otomatis:"],
      [/Custom UI\/UX:/gi, "UI/UX Kustom:"],
      [/SEO Optimization:/gi, "Optimasi SEO:"],
      [/Streamlined Checkout Process/gi, "Proses Pembayaran yang Ringkas"],
      [/Intuitive User Dashboard/gi, "Dasbor Pengguna yang Intuitif"],
      [/Seamless Social Login/gi, "Login Sosial yang Mulus"],
      [/Optimized for Mobile/gi, "Dioptimalkan untuk Seluler"],
      [/Open Live Site/gi, "Buka Situs Langsung"],
      [/Open GitHub Code/gi, "Buka Kode GitHub"],
      [/Open Figma Prototype/gi, "Buka Prototipe Figma"],
      [/Back to Vault/gi, "Kembali ke Gudang"],
      [/Back/gi, "Kembali"],
      [/Project\s*&gt;/gi, "Proyek &gt;"],
    ];

    replacements.forEach(([regex, replacement]) => {
      localized = localized.replace(regex, replacement);
    });

    return localized;
  };

  // Bilingual dynamic field selectors
  const activeTitle = lang === "en" ? (project.title_en || project.title) : (project.title_id || project.title);
  
  const defaultType = project.type && project.type !== "page" ? project.type : (isDesignProject ? TEXTS[lang].fallback_design : TEXTS[lang].fallback_web);
  const activeType = lang === "en" ? (project.type_en || defaultType) : (project.type_id || defaultType);
  
  const activeDescription = lang === "en" ? (description_en || description) : (description_id || description);
  const activeContent = lang === "en" ? (cleanedContent_en || cleanedContent) : (cleanedContent_id || cleanedContent);
  const localizedContent = localizeHtmlContent(activeContent, lang);

  const prevTitle = prevProject ? (lang === "en" ? (prevProject.title_en || prevProject.title) : (prevProject.title_id || prevProject.title)) : "";
  const nextTitle = nextProject ? (lang === "en" ? (nextProject.title_en || nextProject.title) : (nextProject.title_id || nextProject.title)) : "";

  // Combine cover image and all extracted screenshots as a single immersive stage
  const lightboxImages = images && images.length > 0 ? images : [coverImage];

  // Intercept click on inline figures inside the raw HTML to trigger the immersive Lightbox
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === "img") {
      const src = target.getAttribute("src");
      if (src) {
        const index = lightboxImages.indexOf(src);
        if (index !== -1) {
          setLightboxIndex(index);
          setLightboxOpen(true);
        } else {
          // Fallback if not found
          const updatedImages = [...lightboxImages];
          if (!updatedImages.includes(src)) {
            updatedImages.push(src);
          }
          setLightboxIndex(updatedImages.indexOf(src));
          setLightboxOpen(true);
        }
      }
    }
  };

  return (
    <div className={`min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)] transition-colors duration-500 relative overflow-x-hidden selection:bg-[#50FFD9]/15 selection:text-[#50FFD9] ${theme}`}>
      
      {/* Soft Blurred Background Radial Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-[#50FFD9]/4 via-transparent to-transparent pointer-events-none z-0"></div>
      
      {/* Floating Navbar Header */}
      <ProjectNavbar 
        theme={theme} 
        onToggleTheme={handleToggleTheme} 
        lang={lang}
        onChangeLang={handleChangeLang}
      />

      {/* Main Core Centered Wide Sheet */}
      <div className="relative z-10 pt-28 pb-16 px-4 md:px-8 max-w-4xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fade-in">
        
        {/* Minimal Breadcrumb Path */}
        <nav className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-[var(--text-muted)] select-none">
          <a href="/" className="hover:text-[#50FFD9] transition-colors">{TEXTS[lang].home}</a>
          <span>/</span>
          <a href="/#portfolio" className="hover:text-[#50FFD9] transition-colors">{TEXTS[lang].portfolio}</a>
          <span>/</span>
          <span className="text-[var(--text-secondary)] truncate">{activeTitle}</span>
        </nav>

        {/* Compact Hero Header (Without cover image duplication) */}
        <section className="pb-4 border-b border-[var(--border-glass)] flex flex-col gap-3">
          <div className="inline-flex self-start items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-glass)] text-[9px] font-bold text-[#50FFD9] tracking-wider backdrop-blur-md shadow-sm">
            <span className="w-1 h-1 rounded-full bg-[#50FFD9] shadow-[0_0_6px_#50FFD9]"></span>
            {activeType}
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight leading-none font-display">
            {activeTitle}
          </h1>
          
          {activeDescription && (
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed max-w-3xl font-medium">
              {activeDescription}
            </p>
          )}
        </section>

        {/* Immersive Cover Image Showcase Header */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl md:rounded-3xl overflow-hidden border border-[var(--border-glass)] bg-black/20 shadow-2xl">
          <img 
            src={coverImage} 
            alt={activeTitle} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.015]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
        </div>

        {/* Horizontal Metadata & Stack Dashboard Card */}
        <div className="glass-panel p-5 rounded-2xl border border-[var(--border-glass)] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{TEXTS[lang].engineered_stack}</span>
            <div className="flex flex-wrap gap-1.5">
              {techStackBadges.length > 0 ? (
                techStackBadges.map((badge, bIdx) => (
                  <span key={bIdx} className="text-[10px] font-bold text-[var(--text-secondary)] bg-white/[0.02] border border-[var(--border-glass)] px-2.5 py-1 rounded-lg hover:border-[#50FFD9]/20 transition-colors">
                    {badge}
                  </span>
                ))
              ) : (
                <span className="text-[10px] font-bold text-[var(--text-secondary)] bg-white/[0.02] border border-[var(--border-glass)] px-2.5 py-1 rounded-lg">
                  {activeType}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-1 sm:items-end shrink-0">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{lang === "en" ? "Category" : "Kategori"}</span>
            <span className="text-xs font-extrabold text-[#50FFD9] tracking-wide">{activeType}</span>
          </div>
        </div>

        {/* Core Case Study Content Card */}
        <main className="w-full">
          <article className="glass-panel p-5 sm:p-8 md:p-10 rounded-2xl border border-[var(--border-glass)] backdrop-blur-xl shadow-xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#50FFD9] to-violet-500"></div>

            {/* Rendered HTML content from WordPress with native click-to-lightbox interceptor */}
            <div 
              className="project-content-html text-sm leading-relaxed" 
              dangerouslySetInnerHTML={{ __html: localizedContent }} 
              onClick={handleContentClick}
            />
          </article>
        </main>

        {/* Compact Visual Assets Gallery at the bottom of the page */}
        {lightboxImages && lightboxImages.length > 1 && (
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-[var(--border-glass)] backdrop-blur-xl flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-xs font-black text-[var(--text-primary)] tracking-wider flex items-center gap-2 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#50FFD9] shadow-[0_0_6px_#50FFD9]"></span>
                {TEXTS[lang].visual_assets}
              </h3>
              <p className="text-[10px] font-bold text-[var(--text-muted)]">
                {lang === "en" ? "Click any screenshot to enter full screen gallery view." : "Klik cuplikan gambar untuk masuk ke mode galeri layar penuh."}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 mt-2">
              {lightboxImages.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setLightboxIndex(idx);
                    setLightboxOpen(true);
                  }}
                  className="group relative aspect-video rounded-xl overflow-hidden border border-[var(--border-glass)] bg-black/25 hover:border-[#50FFD9]/30 hover:shadow-[0_0_12px_rgba(80,255,217,0.08)] transition-all duration-300 cursor-pointer"
                >
                  <img 
                    src={img} 
                    alt={`${activeTitle} screenshot ${idx + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <span className="text-[9px] font-extrabold text-[#50FFD9] bg-black/60 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm shadow-md">🔍 {TEXTS[lang].zoom_asset}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Showcase Navigation Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevProject && (
            <a 
              href={`/${prevProject.slug}`} 
              className="glass-panel p-5 rounded-2xl border border-[var(--border-glass)] flex items-center justify-between group hover:border-[#50FFD9]/20 hover:shadow-[0_0_15px_rgba(80,255,217,0.03)] transition-all"
            >
              <div className="flex flex-col gap-1 truncate pr-3">
                <span className="text-[9px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                  <span>←</span> {TEXTS[lang].prev_showcase}
                </span>
                <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[#50FFD9] transition-colors truncate">{prevTitle}</span>
              </div>
              <span className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#50FFD9] group-hover:bg-white/[0.05] transition-all shrink-0">
                ←
              </span>
            </a>
          )}

          {nextProject && (
            <a 
              href={`/${nextProject.slug}`} 
              className="glass-panel p-5 rounded-2xl border border-[var(--border-glass)] flex items-center justify-between group hover:border-[#50FFD9]/20 hover:shadow-[0_0_15px_rgba(80,255,217,0.03)] transition-all"
            >
              <div className="flex flex-col gap-1 truncate pr-3">
                <span className="text-[9px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                  {TEXTS[lang].next_showcase} <span>→</span>
                </span>
                <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[#50FFD9] transition-colors truncate">{nextTitle}</span>
              </div>
              <span className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#50FFD9] group-hover:bg-white/[0.05] transition-all shrink-0">
                →
              </span>
            </a>
          )}
        </div>

        {/* Footer */}
        <footer className="w-full border-t border-[var(--border-glass)] pt-6 mt-4 text-center text-[10px] text-[var(--text-muted)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Khairan.tech. {TEXTS[lang].all_rights}</p>
          <p>{TEXTS[lang].footer_alternative}</p>
        </footer>

      </div>

      {/* Immersive Lightbox Portal */}
      {lightboxOpen && lightboxImages && lightboxImages.length > 0 && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md transition-all duration-300 animate-fade-in select-none">
          
          {/* Top Bar Details */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-50">
            <div className="flex flex-col">
              <span className="text-xs font-black text-[#50FFD9] tracking-wider">{activeTitle}</span>
              <span className="text-[11px] text-gray-400 font-bold">{TEXTS[lang].slide_text} {lightboxIndex + 1} {TEXTS[lang].of} {lightboxImages.length}</span>
            </div>
            <button 
              onClick={() => setLightboxOpen(false)}
              className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center text-gray-300 hover:text-[#50FFD9] hover:bg-white/[0.08] transition-all cursor-pointer focus:outline-none"
              aria-label="Close Lightbox"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Immersive Stage */}
          <div className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center px-4 md:px-12">
            {/* Left Arrow */}
            {lightboxImages.length > 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
                }}
                className="absolute left-4 md:left-6 w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white hover:text-[#50FFD9] hover:border-[#50FFD9]/30 hover:bg-white/[0.06] transition-all cursor-pointer z-30 focus:outline-none"
                aria-label="Previous Slide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            )}

            {/* Main High-Res Image Render Stage */}
            <div className="relative max-w-full max-h-full flex items-center justify-center overflow-hidden">
              <img 
                src={lightboxImages[lightboxIndex]} 
                alt={`${activeTitle} full screen details`} 
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Right Arrow */}
            {lightboxImages.length > 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
                }}
                className="absolute right-4 md:right-6 w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white hover:text-[#50FFD9] hover:border-[#50FFD9]/30 hover:bg-white/[0.06] transition-all cursor-pointer z-30 focus:outline-none"
                aria-label="Next Slide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            )}
          </div>

          {/* Slider Bottom Navigation Dots */}
          <div className="mt-8 flex gap-1.5 items-center">
            {lightboxImages.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  idx === lightboxIndex ? "bg-[#50FFD9] w-5 shadow-[0_0_8px_#50FFD9]" : "bg-white/20 hover:bg-white/45"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
