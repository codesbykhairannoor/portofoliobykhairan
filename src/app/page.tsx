"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import portfolioData from "../data/portfolio.json";
import AIChatBot from "./components/AIChatBot";
import { motion, AnimatePresence } from "framer-motion";

// Type structures for robust compilation
interface PortfolioItem {
  title: string;
  title_en?: string;
  title_id?: string;
  description: string;
  description_en?: string;
  description_id?: string;
  link: string;
  slug: string;
  image: string;
  tags?: string[];
  live_url?: string;
  logo?: string;
}

interface Skill {
  name: string;
  icon: string;
}

interface SkillCategory {
  category: string;
  items: Skill[];
}

const TRANSLATIONS = {
  en: {
    ready: "Ready for New Opportunities",
    hero_title_1: "Hey there! I'm Khairan.",
    hero_title_2: "I build software",
    hero_title_3: "that thinks.",
    hero_desc: "AI Software Engineer crafting intelligent web platforms, autonomous agents, and cloud-native systems — from Jakarta to the world.",
    get_in_touch: "Contact Me",
    view_my_work: "View My Work",
    profile_summary: "Profile Summary",
    meet_architect: "Meet The AI Software Engineer",
    biography: "Biography",
    bio_quote: "Making AI actually useful — not just impressive on a slide deck, but reliable in production.",
    bio_body: "I'm a Software Engineer from Jakarta who's obsessed with making AI actually useful. I work across the modern stack: Python and FastAPI for high-performance AI microservices, TypeScript with Next.js and React for responsive interfaces, and cloud-native Docker infrastructure. From automated NLP pipelines processing thousands of documents to autonomous AI agents running 24/7 on private cloud servers — I focus on systems that are observable, resilient, and production-ready. What drives me is the craft of building systems that are not just functional, but intentional: well-architected and built to last. Currently pursuing my degree in Information Systems while actively shipping production code and earning credentials from Harvard, Oracle, and Neo4j.",
    download_cv: "Download CV",
    my_projects: "My Projects",
    stat_1_val: "12",
    stat_1_title: "Professional Certifications",
    stat_1_desc: "Harvard CS50, Oracle Cloud, Neo4j Graph, and HackerRank credentials.",
    stat_2_val: "600 req/s",
    stat_2_title: "Peak Pipeline Throughput",
    stat_2_desc: "Production NLP classification & vetting pipeline handling large-scale throughput.",
    stat_3_val: "100%",
    stat_3_title: "Classification Accuracy",
    stat_3_desc: "Validated across 5,204 document samples, reducing cloud overhead by 63%.",
    classifications: "Classifications",
    main_vault: "Main Digital Vault",
    vault_desc: "Filter instantly through high-performance web products, autonomous AI agents, or complete technical stacks.",
    visual_design: "Visual Design",
    websites: "Websites & Systems",
    tooling_stack: "Tooling Stack",
    search_placeholder: "Search by title, stack, or term...",
    read_details: "Read Details",
    visit_website: "Visit Website",
    no_projects: "No Projects Found",
    no_projects_desc: "There are no projects matching other fields under this category. Try adjusting your keywords.",
    experience: "Experience",
    collaboration: "Collaboration",
    let_compile: "Let's Compile Something Outstanding",
    collab_desc: "Have a challenging project, full-time engineering opening, or structural consultation you'd like to work on? Shoot me a secure query, or reach out directly on instant profiles.",
    secure_email: "Secure Email",
    visit: "Visit",
    follow: "Follow",
    full_name: "Full Name",
    email_address: "Email Address",
    project_details: "Project / Scope details",
    describe_spec: "Describe your design specifications or software complexity...",
    msg_success: "Request compiled! I will verify your query and follow-up within 12 hours.",
    msg_error: "Verification failed: Please check empty form inputs before sending.",
    btn_send: "Compile & Send Message",
    btn_sending: "Compiling Query...",
    footer_alternative: "Custom Engineering System. Handcrafted with Next.js 15 & React 19.",
    theme_mode: "Theme Mode",
    lets_talk: "Contact Me",
    all_rights: "All Rights Reserved.",
    nav_home: "Home",
    nav_about: "About",
    nav_portfolio: "Portfolio",
    nav_contact: "Contact",
    ai: "Artificial Intelligence"
  },
  id: {
    ready: "Siap untuk Peluang Baru",
    hero_title_1: "Halo! Saya Khairan.",
    hero_title_2: "Membangun sistem cerdas",
    hero_title_3: "yang berpikir mandiri.",
    hero_desc: "AI Software Engineer yang merancang platform web cerdas, agen otonom, dan sistem cloud-native — dari Jakarta untuk dunia.",
    get_in_touch: "Hubungi Saya",
    view_my_work: "Lihat Karya Saya",
    profile_summary: "Ringkasan Profil",
    meet_architect: "Kenali Sang Engineer",
    biography: "Biografi",
    bio_quote: "Membuat AI benar-benar berguna — bukan sekadar memukau di slide presentasi, tapi tangguh di tahap produksi.",
    bio_body: "Saya adalah Software Engineer asal Jakarta yang berfokus membuat teknologi AI benar-benar bermanfaat di dunia nyata. Saya bekerja lintas stack modern: Python dan FastAPI untuk microservices AI berkinerja tinggi, TypeScript dengan Next.js dan React untuk antarmuka modern yang responsif, serta infrastruktur cloud-native berbasis Docker. Mulai dari pipeline NLP pemroses ribuan dokumen hingga agen AI otonom yang beroperasi 24/7 di server cloud pribadi — fokus saya adalah membangun sistem yang teruji, tangguh, dan siap produksi. Saat ini menempuh studi Sistem Informasi sambil aktif merilis kode produksi dan meraih sertifikasi profesional dari Harvard, Oracle, dan Neo4j.",
    download_cv: "Unduh CV",
    my_projects: "Proyek Saya",
    stat_1_val: "12",
    stat_1_title: "Sertifikasi Profesional",
    stat_1_desc: "Kredensial dari Harvard CS50, Oracle Cloud, Neo4j Graph, dan HackerRank.",
    stat_2_val: "600 req/s",
    stat_2_title: "Throughput Pipeline Puncak",
    stat_2_desc: "Kinerja produksi pipeline NLP vetting yang menangani throughput skala tinggi.",
    stat_3_val: "100%",
    stat_3_title: "Akurasi Klasifikasi",
    stat_3_desc: "Tervalidasi pada 5.204 sampel dokumen dan memangkas biaya cloud hingga 63%.",
    classifications: "Klasifikasi",
    main_vault: "Gudang Digital Utama",
    vault_desc: "Filter secara instan melalui sistem web berkinerja tinggi, agen AI otonom, atau tumpukan teknis lengkap.",
    visual_design: "Desain Visual",
    websites: "Sistem & Web",
    tooling_stack: "Alat & Teknologi",
    search_placeholder: "Cari berdasarkan judul, teknologi, atau kata kunci...",
    read_details: "Baca Detail",
    visit_website: "Lihat Website",
    no_projects: "Proyek Tidak Ditemukan",
    no_projects_desc: "Tidak ada proyek yang cocok dengan kata kunci di bawah kategori ini. Coba sesuaikan kata pencarian Anda.",
    experience: "Pengalaman",
    collaboration: "Kolaborasi",
    let_compile: "Mari Kita Bangun Sesuatu Yang Luar Biasa",
    collab_desc: "Memiliki proyek yang menantang, lowongan kerja penuh waktu, atau konsultasi struktural yang ingin Anda kerjakan? Kirim pesan aman Anda, atau hubungi saya langsung di profil sosial.",
    secure_email: "Email Aman",
    visit: "Kunjungi",
    follow: "Ikuti",
    full_name: "Nama Lengkap",
    email_address: "Alamat Email",
    project_details: "Detail Proyek / Ruang Lingkup",
    describe_spec: "Jelaskan spesifikasi kebutuhan atau arsitektur perangkat lunak Anda...",
    msg_success: "Permintaan terkirim! Saya akan memverifikasi pertanyaan Anda dan menindaklanjutinya dalam waktu 12 jam.",
    msg_error: "Verifikasi gagal: Silakan periksa kolom formulir yang kosong sebelum mengirim.",
    btn_send: "Kompilasi & Kirim Pesan",
    btn_sending: "Mengirim Pesan...",
    footer_alternative: "Sistem Rekayasa Mandiri. Dibuat dengan Next.js 15 & React 19.",
    theme_mode: "Mode Tema",
    lets_talk: "Hubungi Saya",
    all_rights: "Hak Cipta Dilindungi Undang-Undang.",
    nav_home: "Beranda",
    nav_about: "Tentang",
    nav_portfolio: "Portofolio",
    nav_contact: "Hubungi Saya",
    ai: "Artificial Intelligence"
  }
};

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<"visual_design" | "website" | "ai" | "skills">("website");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [carouselProgress, setCarouselProgress] = useState(0);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [lang, setLang] = useState<"id" | "en">("id");

  const handleTabChange = (tab: "visual_design" | "website" | "ai" | "skills") => {
    setActiveTab(tab);
    setSearchQuery("");
  };

  // Typing animation variants
  const typingVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const charVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 12, stiffness: 200 } }
  };

  const AnimatedText = ({ text, className = "" }: { text: string, className?: string }) => (
    <motion.span 
      variants={typingVariants} 
      initial="hidden" 
      animate="visible" 
      className={className}
      key={text}
    >
      {text.split(" ").map((word, wordIndex, array) => (
        <React.Fragment key={`word-${wordIndex}`}>
          <span className="inline-block whitespace-nowrap">
            {word.split("").map((char, charIndex) => (
              <motion.span key={`${char}-${charIndex}`} variants={charVariants} className="inline-block">
                {char}
              </motion.span>
            ))}
          </span>
          {wordIndex !== array.length - 1 && " "}
        </React.Fragment>
      ))}
    </motion.span>
  );

  // Sync language with localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as "id" | "en" | null;
    if (savedLang) {
      setLang(savedLang);
    } else {
      const systemLang = navigator.language.toLowerCase().startsWith("id") ? "id" : "en";
      setLang(systemLang);
    }
  }, []);

  const changeLanguage = (newLang: "id" | "en") => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  // Sync theme with localStorage and document element on mount
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

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  const carouselRef = useRef<HTMLDivElement>(null);

  // Scrollspy active section navigation
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 400) {
            setShowScrollTop(true);
          } else {
            setShowScrollTop(false);
          }

          const sections = ["home", "about", "portfolio", "contact"];
          const scrollPos = window.scrollY + 200;

          for (const section of sections) {
            const el = document.getElementById(section);
            if (el) {
              const top = el.offsetTop;
              const height = el.offsetHeight;
              if (scrollPos >= top && scrollPos < top + height) {
                setActiveSection(section);
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update carousel scroll indicator in real-time
  const handleCarouselScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setCarouselProgress((scrollLeft / maxScroll) * 100);
      }
    }
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 360;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Modern clipboard micro-interaction
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus("error");
      return;
    }
    setFormStatus("sending");
    setTimeout(() => {
      setFormStatus("success");
      setFormData({ name: "", email: "", message: "" });
    }, 1200);
  };

  // Helper parser: Extracts explicit 'Tech Stack: ...' tags from description fields to generate premium frontend badges
  const parseTechStack = (desc: string) => {
    const parts = desc.split(/Tech Stack\s*:\s*/i);
    if (parts.length > 1) {
      const cleanDesc = parts[0].trim();
      const tags = parts[1]
        .split(",")
        .map((t) => t.trim().replace(/\.$/, ""))
        .filter((t) => t.length > 0);
      return { cleanDesc, tags };
    }
    return { cleanDesc: desc, tags: [] };
  };

  // Search filter and tag matching across portfolio databases
  const filterItems = (items: PortfolioItem[]) => {
    return items.filter((item) => {
      const desc = lang === "en" ? (item.description_en || item.description) : (item.description_id || item.description);
      const title = lang === "en" ? (item.title_en || item.title) : (item.title_id || item.title);
      const { cleanDesc, tags } = parseTechStack(desc);
      const searchStr = `${title} ${cleanDesc} ${tags.join(" ")}`.toLowerCase();
      return searchStr.includes(searchQuery.toLowerCase());
    });
  };

  const activeCategoryItems = () => {
    if (activeTab === "visual_design") {
      return portfolioData.visual_design;
    } else if (activeTab === "website") {
      return portfolioData.website;
    } else if (activeTab === "ai") {
      return portfolioData.ai;
    }
    return [];
  };

  const filteredItems = filterItems(activeCategoryItems() as PortfolioItem[]);

  return (
    <div id="home" className="min-h-screen flex flex-col bg-[var(--bg-dark)] text-[var(--text-primary)] relative selection:bg-[#50FFD9]/15 selection:text-[#50FFD9] scroll-smooth overflow-x-hidden w-full max-w-[100vw]">
      
      {/* Background Ambience Overlays */}
      <div className="absolute top-0 left-[15%] w-[600px] h-[600px] bg-gradient-to-br from-[#50FFD9]/6 to-transparent blur-[140px] pointer-events-none -z-10"></div>
      <div className="absolute top-[25%] right-[10%] w-[700px] h-[700px] bg-gradient-to-tl from-[#a78bfa]/4 to-transparent blur-[160px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[20%] left-[5%] w-[650px] h-[650px] bg-gradient-to-tr from-[#50FFD9]/3 to-transparent blur-[150px] pointer-events-none -z-10"></div>

      {/* Floating Header */}
      <header className="fixed top-6 inset-x-4 md:inset-x-8 mx-auto z-50 max-w-5xl">
        <div className="glass-panel px-4 md:px-6 py-3 md:py-4 rounded-2xl flex items-center justify-between border border-[var(--border-glass)] bg-[var(--bg-card)] shadow-xl relative">
          <div className="flex items-center gap-2">
            <a href="#home" className="text-lg md:text-xl font-black tracking-tighter text-[var(--text-primary)] select-none">
              Khairan<span className="text-[var(--neon-cyan)] glow-text">.tech</span>
            </a>
          </div>

          {/* Desktop Navigation Links - Centered */}
          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-xs font-bold tracking-wider text-[var(--text-secondary)]">
            <a href="#home" className={`hover:text-[var(--neon-cyan)] transition-colors ${activeSection === "home" ? "text-[var(--neon-cyan)]" : ""}`}>{TRANSLATIONS[lang].nav_home}</a>
            <a href="#about" className={`hover:text-[var(--neon-cyan)] transition-colors ${activeSection === "about" ? "text-[var(--neon-cyan)]" : ""}`}>{TRANSLATIONS[lang].nav_about}</a>
            <a href="#portfolio" className={`hover:text-[var(--neon-cyan)] transition-colors ${activeSection === "portfolio" ? "text-[var(--neon-cyan)]" : ""}`}>{TRANSLATIONS[lang].nav_portfolio}</a>
            <a href="#contact" className={`hover:text-[var(--neon-cyan)] transition-colors ${activeSection === "contact" ? "text-[var(--neon-cyan)]" : ""}`}>{TRANSLATIONS[lang].nav_contact}</a>
          </nav>

          {/* Fallback for smaller desktops where absolute centering might overlap */}
          <nav className="hidden md:flex lg:hidden items-center gap-6 text-[10px] font-bold tracking-wider text-[var(--text-secondary)]">
            <a href="#home" className={`hover:text-[var(--neon-cyan)] transition-colors ${activeSection === "home" ? "text-[var(--neon-cyan)]" : ""}`}>{TRANSLATIONS[lang].nav_home}</a>
            <a href="#about" className={`hover:text-[var(--neon-cyan)] transition-colors ${activeSection === "about" ? "text-[var(--neon-cyan)]" : ""}`}>{TRANSLATIONS[lang].nav_about}</a>
            <a href="#portfolio" className={`hover:text-[var(--neon-cyan)] transition-colors ${activeSection === "portfolio" ? "text-[var(--neon-cyan)]" : ""}`}>{TRANSLATIONS[lang].nav_portfolio}</a>
            <a href="#contact" className={`hover:text-[var(--neon-cyan)] transition-colors ${activeSection === "contact" ? "text-[var(--neon-cyan)]" : ""}`}>{TRANSLATIONS[lang].nav_contact}</a>
          </nav>

          {/* Language Toggle, Theme Toggle and Let's Talk CTA button */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <button 
              onClick={() => changeLanguage(lang === "en" ? "id" : "en")}
              className="h-10 px-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-glass)] flex items-center gap-1.5 hover:border-[var(--neon-cyan)]/30 text-[10px] font-extrabold tracking-wider text-[var(--text-secondary)] hover:text-[var(--neon-cyan)] transition-all focus:outline-none cursor-pointer"
              title={lang === "en" ? "Ubah ke Bahasa Indonesia" : "Switch to English"}
            >
              <span>🌐</span>
              <span>{lang === "en" ? "EN" : "ID"}</span>
            </button>

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-glass)] flex items-center justify-center hover:border-[var(--neon-cyan)]/30 text-[var(--text-secondary)] hover:text-[var(--neon-cyan)] transition-all focus:outline-none cursor-pointer"
              aria-label="Toggle Theme"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
            <a href="/#contact" className="btn-neon text-[10px] sm:text-xs py-2 px-3 sm:px-4.5 rounded-xl border border-transparent transition-all">
              {TRANSLATIONS[lang].lets_talk}
            </a>
          </div>

          {/* Mobile Hamburguer Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-card)] border border-[var(--border-glass)] hover:border-[var(--neon-cyan)]/30 text-[var(--text-secondary)] transition-all focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation Dropdown Menu (Glassmorphism Overlay) */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 w-full glass-panel p-6 rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-card)] animate-fade-in flex flex-col gap-4 shadow-xl">
            <a 
              href="#home" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold tracking-wider text-[var(--text-secondary)] hover:text-[var(--neon-cyan)] py-2 border-b border-[var(--border-glass)]"
            >
              {TRANSLATIONS[lang].nav_home}
            </a>
            <a 
              href="#about" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold tracking-wider text-[var(--text-secondary)] hover:text-[var(--neon-cyan)] py-2 border-b border-[var(--border-glass)]"
            >
              {TRANSLATIONS[lang].nav_about}
            </a>
            <a 
              href="#portfolio" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold tracking-wider text-[var(--text-secondary)] hover:text-[var(--neon-cyan)] py-2 border-b border-[var(--border-glass)]"
            >
              {TRANSLATIONS[lang].nav_portfolio}
            </a>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold tracking-wider text-[var(--text-secondary)] hover:text-[var(--neon-cyan)] py-2 border-b border-[var(--border-glass)]"
            >
              {TRANSLATIONS[lang].nav_contact}
            </a>
            <button 
              onClick={() => { changeLanguage(lang === "en" ? "id" : "en"); setMobileMenuOpen(false); }}
              className="flex items-center justify-between text-sm font-semibold tracking-wider text-[var(--text-secondary)] hover:text-[var(--neon-cyan)] py-2 border-b border-[var(--border-glass)] w-full text-left cursor-pointer"
            >
              <span>🌐 Language / Bahasa</span>
              <span className="text-[var(--neon-cyan)] font-bold">{lang === "en" ? "English (EN)" : "Indonesia (ID)"}</span>
            </button>
            <button 
              onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
              className="flex items-center justify-between text-sm font-semibold tracking-wider text-[var(--text-secondary)] hover:text-[var(--neon-cyan)] py-2 border-b border-[var(--border-glass)] w-full text-left cursor-pointer"
            >
              <span>{TRANSLATIONS[lang].theme_mode}</span>
              <span>{theme === "dark" ? "☀️ Light" : "🌙 Dark"}</span>
            </button>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="btn-neon w-full text-center py-3 rounded-xl mt-2"
            >
              {TRANSLATIONS[lang].lets_talk}
            </a>
          </div>
        )}
      </header>

      {/* Hero Landing Section */}
      <section className="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">

        <h1 className="custom-hero-title mb-6 md:mb-8 font-extrabold leading-[1.1] tracking-tight">
          <AnimatedText text={TRANSLATIONS[lang].hero_title_1} />
          {" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-primary)] via-[var(--neon-cyan)] to-[var(--neon-violet)]">
            <AnimatedText text={TRANSLATIONS[lang].hero_title_2} />
          </span>
          {" "}
          <AnimatedText text={TRANSLATIONS[lang].hero_title_3} />
        </h1>

        <p className="max-w-2xl text-[var(--text-secondary)] text-xs md:text-base mb-10 md:mb-12 leading-relaxed font-medium px-4 md:px-0">
          {TRANSLATIONS[lang].hero_desc}
        </p>

        <div className="flex flex-col sm:flex-row gap-4.5 justify-center mb-16 w-full sm:w-auto">
          <a href="#contact" className="btn-neon w-full sm:w-auto">
            {TRANSLATIONS[lang].get_in_touch}
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
          <a href="#portfolio" className="btn-glass w-full sm:w-auto">
            {TRANSLATIONS[lang].view_my_work}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </a>
        </div>

        {/* Floating Social Icons */}
        <div className="flex gap-4 items-center justify-center">
          <a href="https://github.com/codesbykhairannoor" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="GitHub">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <a href="https://www.linkedin.com/in/khairannoorfadhlillah/" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="LinkedIn">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
          <a href="https://instagram.com/khairannoor.f" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Instagram">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
        </div>
      </section>

      {/* About Section in a Premium Bento Grid Layout */}
      <section id="about" className="py-16 md:py-28 px-4 max-w-5xl mx-auto w-full scroll-mt-24">
        <div className="mb-10 md:mb-14">
          <span className="text-[10px] md:text-xs font-black text-[var(--neon-cyan)] uppercase tracking-widest mb-2 md:mb-3 block">{TRANSLATIONS[lang].profile_summary}</span>
          <h2 className="text-2xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">{TRANSLATIONS[lang].meet_architect}</h2>
        </div>

        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Main Story Card (Spans 8 cols) */}
          <div className="md:col-span-8 glass-panel p-6 md:p-10 rounded-3xl border border-white/5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-3 md:mb-4">{TRANSLATIONS[lang].biography}</span>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-[var(--text-primary)]">Khairan Noor Fadhlillah</h3>
              <p className="text-[var(--neon-cyan)] font-medium text-xs md:text-sm italic mb-4 md:mb-6">"{TRANSLATIONS[lang].bio_quote}"</p>
              <p className="text-[var(--text-secondary)] text-xs md:text-[15px] leading-relaxed mb-6 md:mb-8">
                {TRANSLATIONS[lang].bio_body}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 items-center mt-4">
              <a 
                href="https://drive.google.com/drive/folders/1yFVit9tC_41PA1iyHpO6ByWZcKuRYq05?usp=drive_link" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-neon"
              >
                {TRANSLATIONS[lang].download_cv}
              </a>
              <a href="#portfolio" className="btn-glass">
                {TRANSLATIONS[lang].my_projects}
              </a>
            </div>
          </div>

          {/* Profile Picture Frame Card (Spans 4 cols) */}
          <div className="md:col-span-4 glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-center items-center group relative overflow-hidden bg-white/[0.005]">
            <div className="relative w-full aspect-[1024/660] md:aspect-square rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
              <Image 
                src="/foto.jpeg" 
                alt="Portrait of Khairan Noor Fadhlillah" 
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 350px"
                className="object-cover object-[center_15%] transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[var(--bg-dark)]/60 backdrop-blur-md px-3 py-1.5 rounded-md border border-[var(--border-glass)] text-[var(--text-secondary)]">
                  Jakarta, ID 🇮🇩
                </span>
              </div>
            </div>
          </div>

          {/* Stat Block 1: Certifications (Spans 4 cols) */}
          <div className="md:col-span-4 glass-panel p-6 md:p-8 rounded-3xl border border-white/5 flex flex-col justify-between group hover:border-[#50FFD9]/15">
            <div>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--neon-cyan)] transition-colors mb-4 md:mb-6">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h4 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-1 md:mb-2">{TRANSLATIONS[lang].stat_1_val}</h4>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{TRANSLATIONS[lang].stat_1_title}</p>
            </div>
            <p className="text-[10px] md:text-xs text-[var(--text-muted)] mt-4 md:mt-6 leading-relaxed">
              {TRANSLATIONS[lang].stat_1_desc}
            </p>
          </div>

          {/* Stat Block 2: Throughput (Spans 4 cols) */}
          <div className="md:col-span-4 glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between group hover:border-[#50FFD9]/15">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--neon-cyan)] transition-colors mb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">{TRANSLATIONS[lang].stat_2_val}</h4>
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">{TRANSLATIONS[lang].stat_2_title}</p>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-6 leading-relaxed">
              {TRANSLATIONS[lang].stat_2_desc}
            </p>
          </div>

          {/* Stat Block 3: Accuracy (Spans 4 cols) */}
          <div className="md:col-span-4 glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white/[0.005] to-transparent group hover:border-[#50FFD9]/15">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--neon-cyan)] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--neon-cyan)]/10 border border-[var(--neon-cyan)]/20 text-[10px] font-extrabold text-[var(--neon-cyan)] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)] animate-pulse"></span>
                  {TRANSLATIONS[lang].active}
                </span>
              </div>
              <h4 className="text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">{TRANSLATIONS[lang].stat_3_val}</h4>
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">{TRANSLATIONS[lang].stat_3_title}</p>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-6 leading-relaxed">
              {TRANSLATIONS[lang].stat_3_desc}
            </p>
          </div>

        </div>
      </section>

      {/* Grid Filtering Tabs Section */}
      <section id="portfolio" className="py-16 md:py-28 px-4 max-w-5xl mx-auto w-full scroll-mt-24">
        
        {/* Title and Action Blocks */}
        <div className="flex flex-col items-center justify-center text-center mb-10 md:mb-16">
          <span className="text-[10px] md:text-xs font-black text-[var(--neon-cyan)] uppercase tracking-widest mb-2 md:mb-3 block">{TRANSLATIONS[lang].classifications}</span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">{TRANSLATIONS[lang].main_vault}</h2>
          <p className="text-[var(--text-muted)] text-[10px] md:text-sm mt-2 max-w-md leading-relaxed">{TRANSLATIONS[lang].vault_desc}</p>
          
          <div className="mt-8 flex flex-col md:flex-row items-center gap-5 w-full justify-center">
            {/* Category Toggle Tabs */}
            <div className="tab-list-wrapper">
              <button 
                onClick={() => handleTabChange("website")} 
                className={`tab-btn ${activeTab === "website" ? "active" : ""}`}
              >
                {TRANSLATIONS[lang].websites}
              </button>
              {portfolioData.ai && portfolioData.ai.length > 0 && (
                <button 
                  onClick={() => handleTabChange("ai")} 
                  className={`tab-btn ${activeTab === "ai" ? "active" : ""}`}
                >
                  {TRANSLATIONS[lang].ai}
                </button>
              )}
              {portfolioData.visual_design && portfolioData.visual_design.length > 0 && (
                <button 
                  onClick={() => handleTabChange("visual_design")} 
                  className={`tab-btn ${activeTab === "visual_design" ? "active" : ""}`}
                >
                  {TRANSLATIONS[lang].visual_design}
                </button>
              )}
              <button 
                onClick={() => handleTabChange("skills")} 
                className={`tab-btn ${activeTab === "skills" ? "active" : ""}`}
              >
                {TRANSLATIONS[lang].tooling_stack}
              </button>
            </div>

            {/* Premium Deep-Search Bar (Hidden under skills tab) */}
            {activeTab !== "skills" && (
              <div className="search-input-wrapper">
                <input 
                  type="text" 
                  placeholder={TRANSLATIONS[lang].search_placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  aria-label="Search Projects"
                />
                <svg className="search-icon" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Tab 1 & Tab 2: Filterable Design and Code Grids */}
        {activeTab !== "skills" && (
          <div className="min-h-[120vh] w-full" style={{ overflowAnchor: 'none' }}>
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item, i) => {
                  const desc = lang === "en" ? (item.description_en || item.description) : (item.description_id || item.description);
                  const title = lang === "en" ? (item.title_en || item.title) : (item.title_id || item.title);
                  const { cleanDesc, tags } = parseTechStack(desc);
                  const itemLink = item.link ? item.link.replace(/\/+$/, '') : `/${item.slug}`;
                  return (
                    <div 
                      key={item.slug || i} 
                      className="group glass-panel glass-panel-hover rounded-3xl overflow-hidden flex flex-col border border-white/5 relative"
                    >
                      <a href={itemLink} className="absolute inset-0 z-20" aria-label={`View details of ${title}`}></a>
                      <div className="w-full aspect-[1024/660] overflow-hidden border-b border-white/5 relative bg-white/[0.003]">
                        <Image 
                          src={item.image} 
                          alt={title} 
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          priority={true}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020202]/40 to-transparent pointer-events-none"></div>

                        {/* Top-Left: Brand Logo Badge */}
                        {item.logo && (
                          <div className="badge-dark absolute top-3 left-3 z-30 flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-[#030712]/90 border border-white/20 backdrop-blur-md shadow-lg pointer-events-none">
                            <div className="w-5 h-5 rounded-md overflow-hidden relative flex-shrink-0 flex items-center justify-center bg-white/10 p-0.5">
                              <Image
                                src={item.logo}
                                alt={`${title} logo`}
                                width={20}
                                height={20}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <span className="text-[11px] font-extrabold !text-white tracking-wide truncate max-w-[105px]">
                              {title.split(" - ")[0]}
                            </span>
                          </div>
                        )}

                        {/* Floating Direct Visit Badge */}
                        {item.live_url && (
                          <a
                            href={item.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="badge-dark absolute top-3 right-3 z-30 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/95 hover:bg-black border border-emerald-400/80 hover:border-emerald-300 text-white hover:text-white text-[11px] font-bold backdrop-blur-md shadow-lg transition-all hover:scale-105 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] cursor-pointer"
                            title={`${TRANSLATIONS[lang].visit_website}: ${title}`}
                          >
                            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse flex-shrink-0"></span>
                            <span className="!text-white font-bold text-xs">{TRANSLATIONS[lang].visit_website}</span>
                            <svg className="w-3.5 h-3.5 ml-0.5 !text-white flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                      <div className="p-5 md:p-8 flex flex-col flex-grow">
                        <h3 className="text-sm md:text-lg font-bold text-[var(--text-primary)] mb-2 hover:text-[var(--neon-cyan)] transition-colors line-clamp-1">{title}</h3>
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed flex-grow">
                          {cleanDesc}
                        </p>

                        {/* Rendering explicit tags on grid items */}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                            {tags.slice(0, 3).map((tag, tagIdx) => (
                              <span key={tagIdx} className="text-[10px] font-bold text-slate-600 dark:text-gray-400 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-md">
                                {tag}
                              </span>
                            ))}
                            {tags.length > 3 && (
                              <span className="text-[10px] font-bold text-teal-700 dark:text-[#50FFD9] bg-teal-50 dark:bg-[#50FFD9]/10 border border-teal-200 dark:border-transparent px-1.5 py-0.5 rounded-md">
                                +{tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-black/5 dark:border-white/5 relative z-30">
                          <span 
                            className="text-[11px] md:text-xs font-bold text-teal-600 dark:text-[var(--neon-cyan)] group-hover:underline flex items-center gap-1.5 group/link"
                          >
                            {TRANSLATIONS[lang].read_details}
                            <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                              <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                          </span>

                          {item.live_url && (
                            <a
                              href={item.live_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-[11px] md:text-xs font-bold text-slate-700 dark:text-gray-200 hover:text-teal-600 dark:hover:text-[#50FFD9] transition-colors py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-teal-500/30"
                              title={`${TRANSLATIONS[lang].visit_website}: ${title}`}
                            >
                              <span>{TRANSLATIONS[lang].visit_website}</span>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-panel p-16 rounded-3xl text-center text-gray-500 border border-white/5 max-w-md mx-auto animate-fade-in">
                <svg className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h4 className="text-[var(--text-primary)] font-bold mb-2">{TRANSLATIONS[lang].no_projects}</h4>
                <p className="text-xs">{TRANSLATIONS[lang].no_projects_desc}</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Advanced Skills Categories Board - Modern Clean Badge Grid */}
        {activeTab === "skills" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            {(portfolioData.skills as SkillCategory[]).map((cat, i) => (
              <div key={i} className="glass-panel p-6 md:p-8 rounded-3xl border border-[var(--border-glass)] flex flex-col gap-5">
                <h3 className="text-sm md:text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2.5 pb-3 border-b border-[var(--border-glass)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--neon-cyan)] shadow-[0_0_8px_var(--neon-cyan-glow)]"></span>
                  {cat.category}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {cat.items.map((skill, j) => (
                    <div 
                      key={j} 
                      className="group flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-[var(--neon-cyan)]/30 hover:bg-[var(--neon-cyan)]/[0.04] transition-all duration-300"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white/[0.04] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 flex items-center justify-center p-1.5 flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                        <Image 
                          src={skill.icon} 
                          alt={skill.name} 
                          width={20} 
                          height={20} 
                          className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300" 
                          loading="lazy" 
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors line-clamp-1">
                        {skill.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Collaboration and Contact Section */}
      <section id="contact" className="py-16 md:py-28 px-6 max-w-5xl mx-auto w-full border-t border-white/5 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
          
          {/* Connection narrative pane */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] md:text-xs font-black text-[#50FFD9] uppercase tracking-widest mb-2 md:mb-3 block">{TRANSLATIONS[lang].collaboration}</span>
              <h2 className="text-2xl md:text-4xl font-extrabold mb-4 md:mb-6 text-[var(--text-primary)] tracking-tight">{TRANSLATIONS[lang].let_compile}</h2>
              <p className="text-gray-400 leading-relaxed mb-8 md:mb-10 text-[13px] md:text-[15px] font-medium">
                {TRANSLATIONS[lang].collab_desc}
              </p>
            </div>

            {/* Communication channels */}
            <div className="flex flex-col gap-4 text-xs sm:text-sm font-bold text-gray-300">
              
              {/* Copyable email element */}
              <button 
                onClick={() => copyToClipboard("mykhairannn@gmail.com")}
                className="flex items-center gap-4 text-left p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-[#50FFD9]/20 hover:bg-white/[0.02] transition-all group focus:outline-none cursor-pointer"
              >
                <span className="w-11 h-11 rounded-xl bg-white/[0.02] flex items-center justify-center border border-white/5 text-[#50FFD9] group-hover:scale-105 transition-all">
                  ✉
                </span>
                <div className="flex-grow">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold mb-0.5">{TRANSLATIONS[lang].secure_email}</p>
                  <p className="text-[var(--text-primary)] text-xs sm:text-sm font-bold">mykhairannn@gmail.com</p>
                </div>
                <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-[#50FFD9] px-2 py-1 rounded bg-white/[0.03]">
                  {emailCopied ? (lang === "en" ? "✓ Copied!" : "✓ Tersalin!") : (lang === "en" ? "Copy" : "Salin")}
                </span>
              </button>

              <a 
                href="https://www.linkedin.com/in/khairannoorfadhlillah/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-4 text-left p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-[#50FFD9]/20 hover:bg-white/[0.02] transition-all group"
              >
                <span className="w-11 h-11 rounded-xl bg-white/[0.02] flex items-center justify-center border border-white/5 text-[#50FFD9] group-hover:scale-105 transition-all">
                  in
                </span>
                <div className="flex-grow">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold mb-0.5">LinkedIn</p>
                  <p className="text-[var(--text-primary)] text-xs sm:text-sm font-bold">khairannoorfadhlillah</p>
                </div>
                <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-[#50FFD9] px-2 py-1 rounded bg-white/[0.03]">
                  {TRANSLATIONS[lang].visit}
                </span>
              </a>


            </div>
          </div>

          {/* Secure interactive request form pane */}
          <div className="lg:col-span-7">
            <form onSubmit={handleFormSubmit} className="glass-panel p-6 md:p-10 rounded-3xl border border-white/5 flex flex-col gap-5 md:gap-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="form-name" className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{TRANSLATIONS[lang].full_name}</label>
                  <input 
                    id="form-name"
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe" 
                    className="contact-input py-3 md:py-4 px-4 md:px-5"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="form-email" className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{TRANSLATIONS[lang].email_address}</label>
                  <input 
                    id="form-email"
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com" 
                    className="contact-input py-3 md:py-4 px-4 md:px-5"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="form-message" className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{TRANSLATIONS[lang].project_details}</label>
                <textarea 
                  id="form-message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={TRANSLATIONS[lang].describe_spec} 
                  className="contact-input py-3 md:py-4 px-4 md:px-5"
                  required
                />
              </div>

              {formStatus === "success" && (
                <div className="px-5 py-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs sm:text-sm font-semibold animate-fade-in flex items-center gap-2">
                  <span>✓</span> {TRANSLATIONS[lang].msg_success}
                </div>
              )}

              {formStatus === "error" && (
                <div className="px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm font-semibold animate-fade-in flex items-center gap-2">
                  <span>✗</span> {TRANSLATIONS[lang].msg_error}
                </div>
              )}

              <button 
                id="contact-submit"
                type="submit" 
                disabled={formStatus === "sending"}
                className="btn-neon w-full justify-center text-center cursor-pointer mt-2 border border-transparent"
              >
                {formStatus === "sending" ? TRANSLATIONS[lang].btn_sending : TRANSLATIONS[lang].btn_send}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Floating back-to-top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 w-11 h-11 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#50FFD9]/30 hover:text-[#50FFD9] text-gray-300 flex items-center justify-center transition-all cursor-pointer shadow-2xl backdrop-blur-xl animate-fade-in"
          aria-label="Back to Top"
        >
          <svg className="w-4 h-4 rotate-270" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      )}

      {/* Footer */}
      <footer className="py-10 md:py-14 px-6 max-w-5xl mx-auto w-full border-t border-white/5 text-center text-[10px] md:text-[11px] text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Khairan Noor Fadhlillah. {TRANSLATIONS[lang].all_rights}</p>
        <p className="hidden sm:block">{TRANSLATIONS[lang].footer_alternative}</p>
      </footer>

      {/* AI Assistant */}
      <AIChatBot lang={lang} />
    </div>
  );
}
