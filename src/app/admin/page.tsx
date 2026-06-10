"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  
  // Theme state
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.className = savedTheme;
    }
  }, []);

  // Authentication states
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Navigation state: 'list' | 'create' | 'edit'
  const [adminTab, setAdminTab] = useState<"list" | "create" | "edit">("list");
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Interface language state for Admin Panel
  const [adminLang, setAdminLang] = useState<"en" | "id">("en");

  // Form states for project payloads (Create & Edit)
  const [originalSlug, setOriginalSlug] = useState("");
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleId, setTitleId] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<"visual_design" | "website">("website");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionId, setDescriptionId] = useState("");
  const [content, setContent] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [contentId, setContentId] = useState("");

  // Sub-tabs for the form editor language inputs
  const [formLang, setFormLang] = useState<"en" | "id">("en");

  // Helper helper to completely reset form inputs
  const resetFormStates = () => {
    setTitle("");
    setTitleEn("");
    setTitleId("");
    setSlug("");
    setImage("");
    setDescription("");
    setDescriptionEn("");
    setDescriptionId("");
    setContent("");
    setContentEn("");
    setContentId("");
    setOriginalSlug("");
  };

  // HTML Sanitization and Translation logic for the editor
  const handleSanitizeContent = (target: "en" | "id") => {
    let raw = target === "en" ? contentEn : contentId;
    if (!raw) return;

    // 1. Remove junk data attributes from visual editors / browser translate
    let clean = raw.replace(/\sdata-path-to-node="[^"]*"/g, "");
    clean = clean.replace(/\sdata-index-in-node="[^"]*"/g, "");
    clean = clean.replace(/\sdata-elementor-open-lightbox="[^"]*"/g, "");
    
    // 2. Remove "Back to Vault" unstyled links and breadcrumbs
    clean = clean.replace(/<a\s+href=["'](?:\/|#|\/#portofolio)?["'][^>]*>[\s\S]*?\bBack\b[\s\S]*?<\/a>/gi, "");
    clean = clean.replace(/<p>Project\s*&gt;<\/p>\s*<p>.*?<\/p>/gi, "");
    clean = clean.replace(/<p>Project\s*&gt;\s*.*?<\/p>/gi, "");
    
    // 3. Remove first duplicate H2 if it exists
    clean = clean.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/i, "");

    if (target === "en") setContentEn(clean.trim());
    else setContentId(clean.trim());
  };

  const handleTranslateHeaders = () => {
    if (!contentId && contentEn) {
      // Copy from EN to ID if ID is empty
      let translated = contentEn;
      
      const replacements: [RegExp, string][] = [
        [/Project Overview:/gi, "Ringkasan Proyek:"],
        [/The Challenge:/gi, "Tantangan Proyek:"],
        [/The Solution:/gi, "Solusi Teknis:"],
        [/The Result:/gi, "Hasil Akhir:"],
        [/Tech Stack/gi, "Teknologi yang Digunakan"],
        [/Topic Area/gi, "Area Topik"],
        [/Skills Used/gi, "Keahlian yang Digunakan"],
        [/Key Features/gi, "Fitur Utama"]
      ];

      replacements.forEach(([regex, replacement]) => {
        translated = translated.replace(regex, replacement);
      });

      setContentId(translated.trim());
      setFormLang("id");
    }
  };

  // Modal deletion target
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState("");

  // Submission tracker
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");

  // Automatically update slug from whichever title is typed first (ONLY in create mode)
  useEffect(() => {
    if (adminTab === "create") {
      const baseTitle = titleEn || titleId || title;
      const generatedSlug = baseTitle
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setSlug(generatedSlug);
    }
  }, [titleEn, titleId, title, adminTab]);

  // Fetch all existing projects from the catalog
  const fetchProjects = async () => {
    setIsLoadingList(true);
    try {
      const response = await fetch("/api/portfolio");
      if (response.ok) {
        const data = await response.json();
        // Compile all categories and label them accordingly
        const compiled = [
          ...(data.website || []).map((p: any) => ({ ...p, category: "website" })),
          ...(data.visual_design || []).map((p: any) => ({ ...p, category: "visual_design" }))
        ];
        // Ensure perfect unique slugs
        const unique = compiled.filter((v, i, a) => a.findIndex((t) => t.slug === v.slug) === i);
        setAllProjects(unique);
      }
    } catch (err) {
      console.error("Failed to fetch digital vault entries:", err);
    } finally {
      setIsLoadingList(false);
    }
  };

  // Run initial sync when passcode is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "khairanadmin") {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Invalid administrator passcode. Please try again.");
    }
  };

  // Fetch specific case study dynamic HTML payload and open populated Editor
  const handleEditClick = async (project: any) => {
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);
    try {
      const response = await fetch(`/api/portfolio?slug=${project.slug}`);
      if (!response.ok) {
        setSubmitError("Failed to fetch full dynamic content payload.");
        return;
      }
      const data = await response.json();
      
      // Populate input states safely
      setOriginalSlug(project.slug);
      
      const pTitle = data.title || project.title || "";
      const pTitleEn = data.title_en || project.title_en || pTitle;
      const pTitleId = data.title_id || project.title_id || pTitle;
      
      const pDesc = project.description || data.description || "";
      const pDescEn = project.description_en || data.description_en || pDesc;
      const pDescId = project.description_id || data.description_id || pDesc;
      
      const pContent = data.content || "";
      const pContentEn = data.content_en || pContent;
      const pContentId = data.content_id || pContent;

      setTitle(pTitle);
      setTitleEn(pTitleEn);
      setTitleId(pTitleId);
      setSlug(data.slug || project.slug || "");
      setType(project.category);
      setImage(project.image || "");
      setDescription(pDesc);
      setDescriptionEn(pDescEn);
      setDescriptionId(pDescId);
      setContent(pContent);
      setContentEn(pContentEn);
      setContentId(pContentId);
      
      setAdminTab("edit");
    } catch (err) {
      setSubmitError("An error occurred while communicating with the storage cluster.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Purge/delete project completely from the list and disk
  const handleDeleteProject = async (targetSlug: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, slug: targetSlug }),
      });
      if (response.ok) {
        setAllProjects((prev) => prev.filter((p) => p.slug !== targetSlug));
        setDeleteConfirmSlug("");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to purge project entry.");
      }
    } catch (err) {
      alert("Error communicating with API server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create new project OR update an existing project
  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();

    // Fallbacks
    const finalTitle = titleEn.trim() || titleId.trim() || title.trim();
    const finalDescription = descriptionEn.trim() || descriptionId.trim() || description.trim();
    const finalContent = contentEn.trim() || contentId.trim() || content.trim();

    if (!finalTitle || !slug || !image || !finalDescription || !finalContent) {
      setSubmitError("Verification failed: Please complete the title, description, and content for at least one language tab.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    const isEditMode = adminTab === "edit";
    const method = isEditMode ? "PUT" : "POST";
    const payload = isEditMode
      ? {
          password,
          originalSlug,
          title: finalTitle,
          title_en: titleEn.trim() || finalTitle,
          title_id: titleId.trim() || finalTitle,
          slug,
          type,
          image,
          description: finalDescription,
          description_en: descriptionEn.trim() || finalDescription,
          description_id: descriptionId.trim() || finalDescription,
          content: finalContent,
          content_en: contentEn.trim() || finalContent,
          content_id: contentId.trim() || finalContent
        }
      : {
          password,
          title: finalTitle,
          title_en: titleEn.trim() || finalTitle,
          title_id: titleId.trim() || finalTitle,
          slug,
          type,
          image,
          description: finalDescription,
          description_en: descriptionEn.trim() || finalDescription,
          description_id: descriptionId.trim() || finalDescription,
          content: finalContent,
          content_en: contentEn.trim() || finalContent,
          content_id: contentId.trim() || finalContent
        };

    try {
      const response = await fetch("/api/portfolio", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setSubmitSuccess(true);
        setCreatedSlug(data.slug);
        
        // Reset states
        resetFormStates();
        
        // Pull latest database list
        await fetchProjects();
        
        // Move back to manage list tab with a small delay for success animation
        setTimeout(() => {
          setAdminTab("list");
          setSubmitSuccess(false);
        }, 1500);
      } else {
        setSubmitError(data.error || "Write failed on database compilation.");
      }
    } catch (err) {
      setSubmitError("Failed to communicate with API server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.className = newTheme;
  };

  const toggleAdminLang = () => {
    setAdminLang(prev => prev === "en" ? "id" : "en");
  };

  const UI = {
    en: {
      gateway: "Admin Console Gateway",
      passcode: "Security Passcode",
      access: "Access Vault",
      compiler: "Data Compiler",
      case_studies: "Portfolio Case Studies",
      append_desc: "Append new projects, list, edit dynamic case study HTML records, and manage catalogs.",
      view_site: "View Live Site",
      manage: "Manage Vault",
      deploy: "Deploy New Element",
      editing: "Editing",
      querying: "Querying digital vault data...",
      no_projects: "No project nodes registered in this database compilation.",
      element: "Project Element",
      classification: "Classification",
      slug: "Slug ID",
      operations: "Database Operations",
      engineered: "engineered system",
      mockup: "visual mockup",
      parameters: "Global Parameters",
      global_desc: "These fields apply globally to all language variants.",
      autogenerated: "Autogenerated",
      locked: "Locked",
      categories: {
        website: "Websites (Engineered Platforms)",
        visual_design: "Visual Design (UI/UX Mockups)"
      },
      cover_url: "Cover Image URL",
      localized: "Localized Content",
      localized_desc: "Fill inputs for both variants to enable language switching on client pages.",
      sanitize: "Sanitize HTML junk",
      translate_headers: "Auto-translate Headers",
      title: "Project Title",
      desc_short: "Card Short Description",
      desc_tip: "Tip: Append \"Tech Stack: React, Laravel\" for auto badges",
      html_content: "Case Study HTML Content",
      html_tip: "Paste WordPress HTML or custom markup",
      compiled: "Node sequence compiled and saved!",
      inspect: "Inspect Live Page",
      cancel: "Cancel Edit",
      commit: "Commit Changes to Vault",
      deploy_btn: "Deploy Element Node to Vault",
      compiling: "Compiling Node...",
      decompile: "Decompile Node Sequence?",
      confirm_purge: "Confirm Purge",
      purge_desc: "Are you sure you want to permanently delete",
      purge_desc_2: "This action will permanently purge the metadata card from catalog indexing and delete the case study JSON payload from disk."
    },
    id: {
      gateway: "Gerbang Konsol Admin",
      passcode: "Kata Sandi Keamanan",
      access: "Buka Brankas",
      compiler: "Penyusun Data",
      case_studies: "Studi Kasus Portofolio",
      append_desc: "Tambah proyek baru, daftar, edit rekaman HTML studi kasus dinamis, dan kelola katalog.",
      view_site: "Lihat Situs Langsung",
      manage: "Kelola Brankas",
      deploy: "Pasang Elemen Baru",
      editing: "Mengedit",
      querying: "Meminta data brankas digital...",
      no_projects: "Tidak ada node proyek yang terdaftar dalam kompilasi database ini.",
      element: "Elemen Proyek",
      classification: "Klasifikasi",
      slug: "ID Slug",
      operations: "Operasi Database",
      engineered: "sistem rekayasa",
      mockup: "mockup visual",
      parameters: "Parameter Global",
      global_desc: "Bidang-bidang ini berlaku secara global untuk semua varian bahasa.",
      autogenerated: "Dibuat Otomatis",
      locked: "Terkunci",
      categories: {
        website: "Situs Web (Platform Rekayasa)",
        visual_design: "Desain Visual (Mockup UI/UX)"
      },
      cover_url: "URL Gambar Sampul",
      localized: "Konten Terlokalisasi",
      localized_desc: "Isi input untuk kedua varian untuk mengaktifkan perpindahan bahasa pada halaman klien.",
      sanitize: "Bersihkan Sampah HTML",
      translate_headers: "Terjemahkan Judul Otomatis",
      title: "Judul Proyek",
      desc_short: "Deskripsi Singkat Kartu",
      desc_tip: "Tip: Tambahkan \"Tech Stack: React, Laravel\" untuk lencana otomatis",
      html_content: "Konten HTML Studi Kasus",
      html_tip: "Tempel HTML WordPress atau markup kustom",
      compiled: "Urutan node dikompilasi dan disimpan!",
      inspect: "Periksa Halaman Langsung",
      cancel: "Batalkan Edit",
      commit: "Simpan Perubahan ke Brankas",
      deploy_btn: "Pasang Node Elemen ke Brankas",
      compiling: "Menyusun Node...",
      decompile: "Hapus Urutan Node?",
      confirm_purge: "Konfirmasi Penghapusan",
      purge_desc: "Apakah Anda yakin ingin menghapus permanen",
      purge_desc_2: "Tindakan ini akan menghapus permanen kartu metadata dari pengindeksan katalog dan menghapus payload JSON studi kasus dari disk."
    }
  };

  const t = UI[adminLang];

  // 1. Render Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center p-6 selection:bg-[#50FFD9]/15 selection:text-[#50FFD9] relative">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#50FFD9]/5 to-transparent blur-[120px] pointer-events-none -z-10"></div>
        
        <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-white/5 shadow-2xl relative">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black tracking-tight mb-2">
              Khairan<span className="text-[#50FFD9] glow-text">.tech</span>
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{t.gateway}</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="passcode" className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{t.passcode}</label>
              <input 
                id="passcode"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="contact-input text-center tracking-widest"
                required
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-400 font-semibold animate-fade-in text-center">
                ✗ {loginError}
              </p>
            )}

            <button 
              type="submit" 
              className="btn-neon w-full justify-center py-3.5 rounded-xl text-center cursor-pointer border border-transparent mt-2"
            >
              {t.access}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
            <button 
              onClick={toggleAdminLang}
              className="text-[10px] font-bold text-gray-500 hover:text-[#50FFD9] transition-colors"
            >
              {adminLang === "en" ? "🇮🇩 Beralih ke Bahasa Indonesia" : "🇬🇧 Switch to English"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Render Admin Dashboard Form
  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-[#50FFD9]/15 selection:text-[#50FFD9] relative pb-20">
      
      {/* Background radial spheres */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#50FFD9]/3 to-transparent pointer-events-none -z-10"></div>

      {/* Admin Navbar Header */}
      <header className="fixed top-6 left-0 right-0 z-50 px-4 md:px-8">
        <div className="max-w-5xl mx-auto glass-panel px-6 py-4 rounded-2xl flex items-center justify-between border border-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tighter text-white select-none">
              Khairan<span className="text-[#50FFD9]">.admin</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Admin Language Toggle */}
            <button 
              onClick={toggleAdminLang}
              className="text-[10px] font-bold text-gray-400 hover:text-white transition-colors px-2 py-1 rounded border border-white/5"
            >
              {adminLang === "en" ? "🇮🇩 ID" : "🇬🇧 EN"}
            </button>
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center hover:border-gray-500/30 transition-all text-xs focus:outline-none cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="btn-glass text-[10px] py-2.5 px-4.5 rounded-xl hover:text-red-400 border border-transparent cursor-pointer"
            >
              Lock Vault
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Wrapper */}
      <main className="max-w-5xl mx-auto px-6 pt-40 w-full">
        
        {/* Title block */}
        <div className="mb-8 text-center md:text-left flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="text-xs font-black text-[#50FFD9] uppercase tracking-widest mb-3 block">{t.compiler}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t.case_studies}</h2>
            <p className="text-gray-400 text-xs md:text-sm mt-1">{t.append_desc}</p>
          </div>
          <a href="/" target="_blank" className="btn-glass text-xs py-2 px-4 rounded-xl border border-transparent self-center md:self-auto hover:text-[#50FFD9]">
            {t.view_site} ↗
          </a>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-white/5 mb-8">
          <button 
            onClick={() => {
              setAdminTab("list");
              resetFormStates();
              setSubmitError("");
              setSubmitSuccess(false);
            }}
            className={`px-6 py-3 font-display font-semibold text-xs tracking-wider transition-all border-b-2 cursor-pointer focus:outline-none ${
              adminTab === "list" ? "border-[#50FFD9] text-[#50FFD9]" : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            📂 {t.manage} ({allProjects.length})
          </button>
          <button 
            onClick={() => {
              setAdminTab("create");
              resetFormStates();
              setSubmitError("");
              setSubmitSuccess(false);
            }}
            className={`px-6 py-3 font-display font-semibold text-xs tracking-wider transition-all border-b-2 cursor-pointer focus:outline-none ${
              adminTab === "create" ? "border-[#50FFD9] text-[#50FFD9]" : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            ➕ {t.deploy}
          </button>
          {adminTab === "edit" && (
            <span className="px-6 py-3 font-display font-semibold text-xs tracking-wider text-amber-400 border-b-2 border-amber-400">
              📝 {t.editing}: {title || "Selected Node"}
            </span>
          )}
        </div>

        {/* LIST TAB: MANAGE VAULT */}
        {adminTab === "list" && (
          <div className="flex flex-col gap-6">
            {isLoadingList ? (
              <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center text-gray-400">
                <span className="inline-block w-5 h-5 border-2 border-[#50FFD9] border-t-transparent rounded-full animate-spin mr-3 align-middle"></span>
                Querying digital vault data...
              </div>
            ) : allProjects.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center text-gray-400">
                No project nodes registered in this database compilation.
              </div>
            ) : (
              <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01] text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <th className="px-6 py-4.5">{t.element}</th>
                        <th className="px-6 py-4.5">{t.classification}</th>
                        <th className="px-6 py-4.5">{t.slug}</th>
                        <th className="px-6 py-4.5 text-right">{t.operations}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {allProjects.map((proj) => (
                        <tr key={proj.slug} className="hover:bg-white/[0.01] transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={proj.image || "/wp-content/uploads/2025/07/2-3.png"} 
                                alt="" 
                                className="w-10 h-7 object-cover rounded border border-white/10 flex-shrink-0"
                              />
                              <span className="font-extrabold text-white group-hover:text-[#50FFD9] transition-colors">{proj.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                              proj.category === "website" 
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/15" 
                                : "bg-purple-500/10 text-purple-400 border border-purple-500/15"
                            }`}>
                              {proj.category === "website" ? t.engineered : t.mockup}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-gray-400">{proj.slug}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a 
                                href={proj.link} 
                                target="_blank" 
                                className="px-2.5 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-gray-300 hover:text-white transition-all text-[10px] font-bold"
                              >
                                View ↗
                              </a>
                              <button 
                                onClick={() => handleEditClick(proj)}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/15 text-amber-400 transition-all text-[10px] font-bold cursor-pointer focus:outline-none"
                              >
                                Edit 📝
                              </button>
                              <button 
                                onClick={() => setDeleteConfirmSlug(proj.slug)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 text-red-400 transition-all text-[10px] font-bold cursor-pointer focus:outline-none"
                              >
                                Delete ✗
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CREATE & EDIT TABS: FORM */}
        {(adminTab === "create" || adminTab === "edit") && (
          <form onSubmit={handleSubmitProject} className="glass-panel p-8 md:p-10 rounded-3xl border border-white/5 flex flex-col gap-6 animate-fade-in">
            
            {/* Global configurations */}
            <div className="border-b border-white/5 pb-4 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#50FFD9] glow-text block mb-1">{t.parameters}</span>
              <p className="text-gray-500 text-[11px]">{t.global_desc}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Slug ID */}
              <div className="flex flex-col gap-2">
                <label htmlFor="proj-slug" className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                  {t.slug} {adminTab === "edit" ? `(${t.locked})` : `(${t.autogenerated})`}
                </label>
                <input 
                  id="proj-slug"
                  type="text" 
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="enterprise-fintech-redesign" 
                  className={`contact-input ${adminTab === "edit" ? "bg-white/[0.01] text-gray-500 cursor-not-allowed border-dashed" : ""}`}
                  disabled={adminTab === "edit"}
                  required
                />
              </div>

              {/* Classification Category */}
              <div className="flex flex-col gap-2">
                <label htmlFor="proj-type" className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{t.classification}</label>
                <select 
                  id="proj-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as "visual_design" | "website")}
                  className="contact-input appearance-none bg-[#030303] text-gray-300 border border-white/5 rounded-xl p-4 outline-none cursor-pointer focus:border-[#50FFD9] focus:ring-1 focus:ring-[#50FFD9]/30"
                >
                  <option value="website">{t.categories.website}</option>
                  <option value="visual_design">{t.categories.visual_design}</option>
                </select>
              </div>

              {/* Cover Image URL */}
              <div className="flex flex-col gap-2">
                <label htmlFor="proj-image" className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{t.cover_url}</label>
                <input 
                  id="proj-image"
                  type="text" 
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="/wp-content/uploads/2025/11/25.png" 
                  className="contact-input"
                  required
                />
              </div>
            </div>

            {/* Language Content Tabs */}
            <div className="border-b border-white/5 pb-2 mt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#50FFD9] glow-text block mb-1">{t.localized}</span>
                <p className="text-gray-500 text-[11px]">{t.localized_desc}</p>
              </div>
              
              {/* Glassmorphic tab selectors */}
              <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormLang("en")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer focus:outline-none ${
                    formLang === "en"
                      ? "bg-[#50FFD9]/15 text-[#50FFD9] border border-[#50FFD9]/10"
                      : "text-gray-400 hover:text-white border border-transparent"
                  }`}
                >
                  <span>🇬🇧 EN</span>
                  {titleEn.trim() && <span className="text-[10px] text-green-400 font-extrabold ml-1">✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => setFormLang("id")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer focus:outline-none ${
                    formLang === "id"
                      ? "bg-[#50FFD9]/15 text-[#50FFD9] border border-[#50FFD9]/10"
                      : "text-gray-400 hover:text-white border border-transparent"
                  }`}
                >
                  <span>🇮🇩 ID</span>
                  {titleId.trim() && <span className="text-[10px] text-green-400 font-extrabold ml-1">✓</span>}
                </button>
              </div>
            </div>

            {/* TAB CONTENT: ENGLISH */}
            {formLang === "en" && (
              <div className="flex flex-col gap-6 animate-fade-in">
                {/* Title */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="proj-title-en" className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{t.title} (English)</label>
                  <input 
                    id="proj-title-en"
                    type="text" 
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="Enterprise FinTech Redesign" 
                    className="contact-input"
                  />
                </div>

                {/* Short Card Description */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="proj-desc-en" className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{t.desc_short} (English)</label>
                    <span className="text-[9px] text-gray-500 font-bold">{t.desc_tip}</span>
                  </div>
                  <textarea 
                    id="proj-desc-en"
                    rows={3}
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    placeholder="E-commerce portal specializing in custom digital assets. Tech Stack: React, Tailwind, Supabase." 
                    className="contact-input"
                  />
                </div>

                {/* HTML Case Study Content */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="proj-content-en" className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{t.html_content} (English)</label>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => handleSanitizeContent("en")}
                        className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 hover:bg-amber-500/20 transition-all font-bold"
                      >
                        ⚡ {t.sanitize}
                      </button>
                      <span className="text-[9px] text-gray-500 font-bold">{t.html_tip}</span>
                    </div>
                  </div>
                  <textarea 
                    id="proj-content-en"
                    rows={12}
                    value={contentEn}
                    onChange={(e) => setContentEn(e.target.value)}
                    placeholder="<h2>Project Challenge</h2><p>Provide details here...</p>" 
                    className="contact-input font-mono text-xs leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: INDONESIAN */}
            {formLang === "id" && (
              <div className="flex flex-col gap-6 animate-fade-in">
                {/* Title */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="proj-title-id" className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{t.title} (Bahasa Indonesia)</label>
                  <input 
                    id="proj-title-id"
                    type="text" 
                    value={titleId}
                    onChange={(e) => setTitleId(e.target.value)}
                    placeholder="Redesain FinTech Korporat" 
                    className="contact-input"
                  />
                </div>

                {/* Short Card Description */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="proj-desc-id" className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{t.desc_short} (Bahasa Indonesia)</label>
                    <span className="text-[9px] text-gray-500 font-bold">{t.desc_tip}</span>
                  </div>
                  <textarea 
                    id="proj-desc-id"
                    rows={3}
                    value={descriptionId}
                    onChange={(e) => setDescriptionId(e.target.value)}
                    placeholder="Portal e-commerce yang berspesialisasi dalam aset digital kustom. Tech Stack: React, Tailwind, Supabase." 
                    className="contact-input"
                  />
                </div>

                {/* HTML Case Study Content */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="proj-content-id" className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{t.html_content} (Bahasa Indonesia)</label>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={handleTranslateHeaders}
                        className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 hover:bg-blue-500/20 transition-all font-bold"
                      >
                        🌐 {t.translate_headers}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleSanitizeContent("id")}
                        className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 hover:bg-amber-500/20 transition-all font-bold"
                      >
                        ⚡ {t.sanitize}
                      </button>
                    </div>
                  </div>
                  <textarea 
                    id="proj-content-id"
                    rows={12}
                    value={contentId}
                    onChange={(e) => setContentId(e.target.value)}
                    placeholder="<h2>Tantangan Proyek</h2><p>Berikan detail di sini...</p>" 
                    className="contact-input font-mono text-xs leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Submission Alerts */}
            {submitSuccess && (
              <div className="px-5 py-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs sm:text-sm font-semibold animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                  <span>✓</span> {t.compiled}
                </span>
                <a 
                  href={`/${createdSlug}`} 
                  target="_blank" 
                  className="text-xs bg-green-500/20 px-3.5 py-1.5 rounded-lg text-white font-extrabold border border-green-500/20 hover:bg-green-500/30 transition-all text-center self-center sm:self-auto"
                >
                  {t.inspect} ↗
                </a>
              </div>
            )}

            {submitError && (
              <div className="px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm font-semibold animate-fade-in flex items-center gap-2">
                <span>✗</span> {submitError}
              </div>
            )}

            {/* Button Actions */}
            <div className="flex items-center gap-3 border-t border-white/5 pt-6 mt-2">
              {adminTab === "edit" && (
                <button 
                  type="button"
                  onClick={() => {
                    setAdminTab("list");
                    resetFormStates();
                    setSubmitError("");
                    setSubmitSuccess(false);
                  }}
                  className="btn-glass flex-1 justify-center py-4 rounded-xl text-center cursor-pointer border border-transparent hover:text-red-400 focus:outline-none"
                >
                  {t.cancel}
                </button>
              )}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-neon flex-1 justify-center py-4 rounded-xl text-center cursor-pointer border border-transparent focus:outline-none font-bold"
              >
                {isSubmitting ? t.compiling : adminTab === "edit" ? t.commit : t.deploy_btn}
              </button>
            </div>

          </form>
        )}

      </main>

      {/* Beautiful Modal Dialog for Deletion Confirmation */}
      {deleteConfirmSlug && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in select-none">
          <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl relative mx-4">
            <h3 className="text-lg font-black text-white tracking-tight mb-2">{t.decompile}</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-6">
              {t.purge_desc} <span className="text-[#50FFD9] font-mono font-semibold">/{deleteConfirmSlug}</span>? 
              {t.purge_desc_2}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setDeleteConfirmSlug("")}
                className="btn-glass text-xs py-2.5 px-4.5 rounded-xl border border-transparent cursor-pointer hover:border-gray-500/30 focus:outline-none"
                disabled={isSubmitting}
              >
                {t.cancel}
              </button>
              <button 
                onClick={() => handleDeleteProject(deleteConfirmSlug)}
                className="px-4.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-display font-bold text-xs shadow-lg shadow-red-600/10 hover:shadow-red-700/20 hover:-translate-y-0.5 transition-all cursor-pointer focus:outline-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? "..." : `${t.confirm_purge} ✗`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
