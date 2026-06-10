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
  const [activeSlide, setActiveSlide] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);

  // Mouse move parallax ambient lighting effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 25, // max 25px offset
        y: (e.clientY / window.innerHeight - 0.5) * 25,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Sticky top reading scroll progress meter
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      [/🛠️\s*(?:<[^>]+>)*\s*Skills\s+Used\s*(?:<\/(?:strong|span|b|i)>)*/gi, "🛠️ Keahlian yang Digunakan"],
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
      [/Project\s*&gt;/gi, "Proyek &gt;"],
      
      // Global and Design Project specific bilingual sections (supports optional nested strong tags!)
      [/📂\s*(?:<[^>]+>)*\s*Content\s+Categories\s*(?:<\/(?:strong|span|b|i)>)*/gi, "📂 Kategori Konten"],
      [/📺\s*(?:<[^>]+>)*\s*Media\s*(?:<\/(?:strong|span|b|i)>)*/gi, "📺 Media"],
      [/🎯\s*(?:<[^>]+>)*\s*Design\s+Purpose\s*(?:<\/(?:strong|span|b|i)>)*/gi, "🎯 Tujuan Desain"],
      [/📚\s*(?:<[^>]+>)*\s*Poster\s+Type\s*(?:<\/(?:strong|span|b|i)>)*/gi, "📚 Tipe Poster"],
      [/📚\s*(?:<[^>]+>)*\s*Logo\s+Styles\s*(?:<\/(?:strong|span|b|i)>)*/gi, "📚 Gaya Logo"],
      [/🎯\s*(?:<[^>]+>)*\s*Target\s+Audience\s*(?:<\/(?:strong|span|b|i)>)*/gi, "🎯 Target Audiens"],
      [/Carousel\s+Content/gi, "Konten Korsel"],
      [/Promotional\s+Posts/gi, "Postingan Promosi"],
      [/Reels\s*\/\s*Shorts\s+Visual/gi, "Visual Reels / Shorts"],
      [/Branding\s+Templates/gi, "Templat Branding"],
      [/Educational\s+Infographics/gi, "Infografis Edukatif"],
      [/Research\s+Posters/gi, "Poster Penelitian"],
      [/Awareness\s+Campaigns/gi, "Kampanye Kesadaran"],
      [/Event\s+Infographic/gi, "Infografis Acara"],
      [/Students/gi, "Siswa / Mahasiswa"],
      [/Professionals/gi, "Profesional"],
      [/Public/gi, "Umum"],
      [/Healthcare/gi, "Kesehatan"],
      [/Attendees/gi, "Peserta"],
      [/Wordmarks/gi, "Logo Wordmark"],
      [/Emblems/gi, "Logo Emblem"],
      [/Lettermarks/gi, "Logo Lettermark"],
      [/Mascot\s+Logos/gi, "Logo Maskot"],
      
      // Social Media Design Purpose list translations
      [/Create content that’s not only visually appealing but also tailored to specific platform formats and user behavior\./gi, "Buat konten yang tidak hanya menarik secara visual tetapi juga disesuaikan dengan format platform spesifik dan perilaku pengguna."],
      [/Strengthen brand consistency and recognition through every visual element\./gi, "Perkuat konsistensi dan pengenalan merek melalui setiap elemen visual."],
      [/Help businesses communicate complex ideas in a simple, engaging way\./gi, "Bantu bisnis mengomunikasikan ide-ide kompleks dengan cara yang sederhana dan menarik."],
      [/Increase audience retention and interactions with data-backed design decisions\./gi, "Tingkatkan retensi audiens dan interaksi dengan keputusan desain yang didukung data."],
      
      // Logo Design Purpose list translations
      [/Craft iconic logos that instantly connect with audiences and leave a lasting impression\./gi, "Buat logo ikonik yang langsung terhubung dengan audiens dan meninggalkan kesan abadi."],
      [/Blend creativity and strategy, delivering designs that tell a brand’s unique story at a glance\./gi, "Padukan kreativitas dan strategi, menghadirkan desain yang menceritakan kisah unik merek secara sekilas."],
      [/Ensure every logo is versatile and impactful, shining equally on a business card or billboard\./gi, "Pastikan setiap logo serbaguna dan berdampak, bersinar sama baiknya di kartu nama atau papan reklame."],
      [/Create timeless marks that grow with the brand, staying relevant across trends and time\./gi, "Buat tanda abadi yang berkembang bersama merek, tetap relevan di berbagai tren dan waktu."],
      
      // Poster Design Purpose list translations
      [/Turn complex data and concepts into clear, compelling visuals that people actually want to read\./gi, "Ubah data dan konsep kompleks menjadi visual yang jelas dan menarik yang benar-benar ingin dibaca orang."],
      [/Capture attention instantly with layout and hierarchy built for quick scanning\./gi, "Tarik perhatian secara instan dengan tata letak dan hierarki yang dibangun untuk pemindaian cepat."],
      [/Elevate brand presence by aligning infographics with tone, style, and messaging\./gi, "Tingkatkan kehadiran merek dengan menyelaraskan infografis dengan nada, gaya, dan pesan."],
      [/Drive higher engagement and shares by making information both useful and beautiful\./gi, "Mendorong keterlibatan dan pembagian yang lebih tinggi dengan membuat informasi berguna sekaligus indah."]
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

  // Use actual project screenshots (images) as slides directly.
  // Exclude the redundant coverImage from slides if screenshots exist, ensuring no visual overlap with the beranda preview.
  const slides = (images && images.length > 0)
    ? Array.from(new Set(images)).filter((img) => img !== coverImage && Boolean(img))
    : [coverImage].filter(Boolean);

  // Intercept click on inline figures inside the raw HTML to trigger the immersive Lightbox
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === "img") {
      const src = target.getAttribute("src");
      if (src) {
        const index = slides.indexOf(src);
        if (index !== -1) {
          setLightboxIndex(index);
          setLightboxOpen(true);
        } else {
          // Fallback if not found
          const updatedImages = [...slides];
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
      
      {/* Premium Top Reading Progress Indicator */}
      <div 
        className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-[#50FFD9] via-teal-400 to-violet-500 z-[110] transition-all duration-100 pointer-events-none"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Interactive Floating Mouse Parallax Glow Orbs */}
      <div 
        className="absolute top-20 left-10 w-72 h-72 rounded-full bg-[#50FFD9]/6 blur-[100px] pointer-events-none transition-transform duration-700 ease-out z-0"
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      />
      <div 
        className="absolute top-[40vh] right-10 w-96 h-96 rounded-full bg-violet-500/5 blur-[120px] pointer-events-none transition-transform duration-1000 ease-out z-0"
        style={{ transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)` }}
      />
      
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
      <div className="relative z-10 pt-28 md:pt-32 pb-12 px-4 md:px-0 max-w-4xl mx-auto w-full flex flex-col gap-3.5 md:gap-4 animate-fade-in">
        
        {/* Minimal Breadcrumb Path */}
        <nav className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-[var(--text-muted)] select-none">
          <a href="/" className="hover:text-[#50FFD9] transition-colors">{TEXTS[lang].home}</a>
          <span>/</span>
          <a href="/#portfolio" className="hover:text-[#50FFD9] transition-colors">{TEXTS[lang].portfolio}</a>
          <span>/</span>
          <span className="text-[var(--text-secondary)] truncate">{activeTitle}</span>
        </nav>

        {/* Compact Hero Header */}
        <section className="pb-3 border-b border-[var(--border-glass)] flex flex-col gap-1.5">
          <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-glass)] text-[10px] md:text-[11px] font-bold text-[var(--neon-cyan)] tracking-wider backdrop-blur-md shadow-sm">
            <span className="w-1 h-1 rounded-full bg-[var(--neon-cyan)] shadow-[0_0_6px_var(--neon-cyan-glow)]"></span>
            {activeType}
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight leading-none font-display">
            {activeTitle}
          </h1>
          
          {activeDescription && (
            <p className="text-[var(--text-secondary)] text-sm md:text-[15px] leading-relaxed max-w-3xl font-medium">
              {activeDescription}
            </p>
          )}
        </section>

        {/* Immersive Interactive Slideshow Header with horizontal thumbnail previews */}
        <div className="flex flex-col gap-3">
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:h-[380px] md:aspect-auto rounded-2xl md:rounded-3xl overflow-hidden border border-[var(--border-glass)] bg-slate-950/40 shadow-2xl group/slider flex items-center justify-center">
            
            {/* Gorgeous color-matched ambient blur background */}
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center blur-2xl opacity-25 scale-110 pointer-events-none"
              style={{ backgroundImage: `url(${slides[activeSlide]})` }}
            />
            <div className="absolute inset-0 z-[1] bg-black/45 pointer-events-none" />

            {/* Main Slide Image Render */}
            <div 
              onClick={() => {
                setLightboxIndex(activeSlide);
                setLightboxOpen(true);
              }}
              className="relative z-10 w-full h-full cursor-zoom-in relative select-none overflow-hidden flex items-center justify-center p-2 sm:p-4"
            >
              <img 
                src={slides[activeSlide]} 
                alt={`${activeTitle} Slide ${activeSlide + 1}`} 
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg transition-all duration-700 hover:scale-[1.012]"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none z-20"></div>
            </div>

            {/* Slide Indicator Counter Pill (Top-Right) */}
            {slides.length > 1 && (
              <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-[var(--bg-dark)]/60 border border-[var(--border-glass)] text-[10px] font-black text-[var(--text-secondary)] backdrop-blur-md shadow-lg select-none">
                <span className="text-[var(--neon-cyan)] glow-text">{activeSlide + 1}</span> / {slides.length}
              </div>
            )}

            {/* Left Navigation Arrow */}
            {slides.length > 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-[var(--bg-dark)]/50 border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-primary)] hover:text-[var(--neon-cyan)] hover:border-[var(--neon-cyan)]/30 hover:bg-[var(--bg-dark)]/75 transition-all opacity-0 group-hover/slider:opacity-100 cursor-pointer z-20 focus:outline-none backdrop-blur-sm"
                aria-label="Previous Slide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            )}

            {/* Right Navigation Arrow */}
            {slides.length > 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlide((prev) => (prev + 1) % slides.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-[var(--bg-dark)]/50 border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-primary)] hover:text-[var(--neon-cyan)] hover:border-[var(--neon-cyan)]/30 hover:bg-[var(--bg-dark)]/75 transition-all opacity-0 group-hover/slider:opacity-100 cursor-pointer z-20 focus:outline-none backdrop-blur-sm"
                aria-label="Next Slide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            )}

            {/* Bottom Dots Strip */}
            {slides.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 items-center bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/5">
                {slides.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlide(idx);
                    }}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === activeSlide ? "bg-[var(--neon-cyan)] w-5 shadow-[0_0_8px_var(--neon-cyan-glow)]" : "bg-[var(--text-muted)]/30 w-2 hover:bg-[var(--text-muted)]/65"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}

          </div>

          {/* Compact Horizontal Thumbnail Row (No vertical stacking, extremely space-saving!) */}
          {slides.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none snap-x snap-mandatory">
              {slides.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`relative aspect-[16/10] w-20 sm:w-24 rounded-lg overflow-hidden border transition-all shrink-0 snap-start cursor-pointer ${
                    idx === activeSlide 
                      ? "border-[var(--neon-cyan)] ring-1 ring-[var(--neon-cyan)]/50 shadow-[0_0_10px_rgba(80,255,217,0.2)] opacity-100 scale-[0.98]" 
                      : "border-[var(--border-glass)] opacity-50 hover:opacity-100 hover:border-[var(--neon-cyan)]/30"
                  }`}
                  aria-label={`View slide ${idx + 1}`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3D-like Bento Grid Metadata & Cloud DevOps Automation Dashboard */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full relative z-10">
          
          {/* Card 1: Category */}
          <div className="glass-panel p-5 rounded-2xl border border-[var(--border-glass)] backdrop-blur-xl flex flex-col justify-between gap-4 group hover:border-[#50FFD9]/20 hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(80,255,217,0.03)] transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">{lang === "en" ? "Category" : "Kategori"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)] shadow-[0_0_8px_var(--neon-cyan-glow)] animate-pulse"></span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm sm:text-base font-black text-[var(--text-primary)] tracking-wide group-hover:text-[var(--neon-cyan)] transition-colors line-clamp-1">{activeType}</span>
              <span className="text-[12px] sm:text-[13px] text-[var(--text-muted)] font-semibold">{lang === "en" ? "Domain Scope" : "Bidang Keahlian"}</span>
            </div>
          </div>

          {/* Card 2: Engineered Stack */}
          <div className="glass-panel p-5 rounded-2xl border border-[var(--border-glass)] backdrop-blur-xl flex flex-col justify-between gap-4 sm:col-span-2 group hover:border-violet-500/20 hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(139,92,246,0.03)] transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">{TEXTS[lang].engineered_stack}</span>
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400"></span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {techStackBadges.length > 0 ? (
                techStackBadges.map((badge, bIdx) => (
                  <span key={bIdx} className="text-[11px] sm:text-xs font-black text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-glass)] px-2.5 py-1 rounded-lg hover:border-[var(--neon-cyan)]/20 hover:bg-[var(--bg-card)] transition-all">
                    {badge}
                  </span>
                ))
              ) : (
                <span className="text-[11px] sm:text-xs font-black text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-glass)] px-2.5 py-1 rounded-lg">
                  {activeType}
                </span>
              )}
            </div>
          </div>

          {/* Card 3: DevOps & Integrity Dashboard */}
          <div className="glass-panel p-5 rounded-2xl border border-[var(--border-glass)] backdrop-blur-xl flex flex-col justify-between gap-4 group hover:border-fuchsia-500/20 hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(217,70,239,0.03)] transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">{lang === "en" ? "DevOps & Cloud" : "DevOps & Cloud"}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-ping"></span>
            </div>
            <div className="flex flex-col gap-1 text-[12px] sm:text-[13px] font-bold text-[var(--text-secondary)]">
              <div className="flex items-center justify-between">
                <span>CI/CD Status</span>
                <span className="text-emerald-400">VERIFIED</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Hosting</span>
                <span className="text-[var(--neon-cyan)]">Vercel / Edge</span>
              </div>
            </div>
          </div>

        </section>

        {/* Core Case Study Content Card */}
        <main className="w-full">
          <article className="glass-panel p-4 sm:p-6 md:p-7 rounded-2xl border border-[var(--border-glass)] backdrop-blur-xl shadow-xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-violet)]"></div>

            {/* Rendered HTML content from WordPress */}
            <div 
              className="project-content-html text-sm leading-relaxed" 
              dangerouslySetInnerHTML={{ __html: localizedContent }} 
              onClick={handleContentClick}
            />
          </article>
        </main>

        {/* Gallery thumbnails removed and replaced by horizontal scrolling thumbnails above to save vertical space */}

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
                <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--neon-cyan)] transition-colors truncate">{prevTitle}</span>
              </div>
              <span className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--neon-cyan)] group-hover:bg-[var(--bg-card)] transition-all shrink-0">
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
                <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--neon-cyan)] transition-colors truncate">{nextTitle}</span>
              </div>
              <span className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--neon-cyan)] group-hover:bg-[var(--bg-card)] transition-all shrink-0">
                →
              </span>
            </a>
          )}
        </div>

        {/* Footer */}
        <footer className="w-full border-t border-[var(--border-glass)] pt-6 mt-4 text-center text-[10px] text-[var(--text-muted)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Khairan Noor Fadhlillah. {TEXTS[lang].all_rights}</p>
          <p>{TEXTS[lang].footer_alternative}</p>
        </footer>

      </div>

      {/* Immersive Lightbox Portal */}
      {lightboxOpen && slides && slides.length > 0 && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md transition-all duration-300 animate-fade-in select-none">
          
          {/* Top Bar Details */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-50">
            <div className="flex flex-col">
              <span className="text-xs font-black text-[var(--neon-cyan)] tracking-wider">{activeTitle}</span>
              <span className="text-[11px] text-[var(--text-muted)] font-bold">{TEXTS[lang].slide_text} {lightboxIndex + 1} {TEXTS[lang].of} {slides.length}</span>
            </div>
            <button 
              onClick={() => setLightboxOpen(false)}
              className="w-11 h-11 rounded-xl bg-[var(--bg-card)] border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--neon-cyan)] hover:bg-[var(--bg-card)] transition-all cursor-pointer focus:outline-none"
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
            {slides.length > 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev - 1 + slides.length) % slides.length);
                }}
                className="absolute left-4 md:left-6 w-12 h-12 rounded-xl bg-[var(--bg-dark)]/30 border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-primary)] hover:text-[var(--neon-cyan)] hover:border-[var(--neon-cyan)]/30 hover:bg-[var(--bg-dark)]/60 transition-all cursor-pointer z-30 focus:outline-none"
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
                src={slides[lightboxIndex]} 
                alt={`${activeTitle} full screen details`} 
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Right Arrow */}
            {slides.length > 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev + 1) % slides.length);
                }}
                className="absolute right-4 md:right-6 w-12 h-12 rounded-xl bg-[var(--bg-dark)]/30 border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-primary)] hover:text-[var(--neon-cyan)] hover:border-[var(--neon-cyan)]/30 hover:bg-[var(--bg-dark)]/60 transition-all cursor-pointer z-30 focus:outline-none"
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
            {slides.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === lightboxIndex ? "bg-[var(--neon-cyan)] w-5 shadow-[0_0_8px_var(--neon-cyan-glow)]" : "bg-[var(--text-muted)]/20 w-2 hover:bg-[var(--text-muted)]/45"
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
