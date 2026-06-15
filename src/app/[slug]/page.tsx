import { promises as fs } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import portfolioData from "../../data/portfolio.json";
import ProjectClientPage from "./ProjectClientPage";

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
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Dynamically generate metadata for perfect SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await getProjectData(slug);
    const titleText = data.title_en || data.title;
    const typeText = data.type_en || data.type;
    return {
      title: `${titleText} | Khairan Noor Fadhlillah - AI, DevOps & Engineering`,
      description: `In-depth architectural analysis of ${titleText} (${typeText}), engineered by Khairan Noor Fadhlillah with specialized AI algorithms, cloud DevOps automation, and robust system designs.`,
      openGraph: {
        title: `${titleText} | Khairan Noor Fadhlillah - AI, DevOps & Engineering`,
        description: `Explore the code architecture, CI/CD pipelines, and custom designs of ${titleText} built by Khairan Noor Fadhlillah.`,
        type: "article",
        url: `https://khairan.tech/${slug}`,
        siteName: "Khairan Noor Fadhlillah Portfolio",
      },
      twitter: {
        card: "summary_large_image",
        title: `${titleText} | Khairan Noor Fadhlillah Showcase`,
        description: `In-depth architectural analysis of ${titleText} (${typeText}), engineered by Khairan Noor Fadhlillah with specialized AI algorithms and cloud DevOps automation.`,
      }
    };
  } catch {
    return {
      title: "Showcase Not Found | Khairan Noor Fadhlillah - AI, DevOps & Engineering Specialist",
    };
  }
}

async function getProjectData(slug: string): Promise<ProjectData> {
  const safeSlug = path.basename(slug);
  const filePath = path.join(process.cwd(), "src", "data", "projects", `${safeSlug}.json`);
  
  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    return JSON.parse(fileContent) as ProjectData;
  } catch (error) {
    throw new Error("Project not found");
  }
}

// Comprehensive sanitizer and layout compiler for raw WordPress content
// Comprehensive sanitizer and layout compiler for raw WordPress content
function cleanProjectHtml(html: string): string {
  if (!html) return "";

  // Strip all inline unstyled style blocks first to prevent CSS rules leaking as plain text
  let clean = html.replace(/<style[\s\S]*?<\/style>/gi, "");

  // 1. Remove Back to Vault unstyled links & inline SVGs completely on the server-side
  clean = clean.replace(/<a\s+href=["'](?:\/|#|\/#portofolio)?["'][^>]*>[\s\S]*?\bBack\b[\s\S]*?<\/a>/gi, "");

  // 2. Remove breadcrumb structures
  clean = clean.replace(/<p>Project\s*&gt;<\/p>\s*<p>.*?<\/p>/gi, "");
  clean = clean.replace(/<p>Project\s*&gt;\s*.*?<\/p>/gi, "");

  // 2b. Remove the very first duplicate h2 title since it is already beautifully rendered in the neon Hero heading
  clean = clean.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/i, "");

  // 3. Convert Link / Live Site section to premium action buttons
  // Match any h2 containing Link, Links, Live Site, Live Demo, Website, Site, Documentation, Figma, etc.
  const linkHeaderRegex = /<h2[^>]*>([\s\S]*?)<\/h2>(\s*<a\s+href="([^"]+)">([\s\S]*?)<\/a>)?/gi;
  clean = clean.replace(linkHeaderRegex, (match: string, headerContent: string, anchorFull: string, nextHref: string, nextText: string) => {
    const isLinkHeader = /🔗|Link|Links|Live\s*Site|Live\s*Demo|Live\s*Website|Website|Site|Documentation|Figma/i.test(headerContent);
    if (!isLinkHeader) return match;

    // Check if there is a link INSIDE the h2 itself (e.g. DopaMind page)
    const innerAnchorRegex = /<a\s+href="([^"]+)">([\s\S]*?)<\/a>/i;
    const innerMatch = headerContent.match(innerAnchorRegex);

    let href = "";
    let displayLabel = "Live Site";

    if (innerMatch) {
      href = innerMatch[1];
      const innerText = innerMatch[2].replace(/<[^>]*>/g, "").trim();
      displayLabel = innerText && innerText.toLowerCase() !== "link" ? innerText : "Live Site";
    } else if (nextHref) {
      href = nextHref;
      const cleanNextText = nextText.replace(/<[^>]*>/g, "").trim();
      displayLabel = cleanNextText && cleanNextText.toLowerCase() !== "link" ? cleanNextText : "Live Site";
    } else {
      // If there is no link at all, return the match
      return match;
    }

    // Clean display label (remove emojis if any, we will add a nice consistent one)
    displayLabel = displayLabel.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji}/gu, "").trim();
    if (!displayLabel || displayLabel.toLowerCase() === "link") {
      displayLabel = "Live Site";
    }

    // Use appropriate emoji based on the link destination
    let emoji = "🌐";
    if (href.includes("github.com")) {
      emoji = "💻";
      displayLabel = displayLabel === "Live Site" ? "GitHub Code" : displayLabel;
    } else if (href.includes("figma.com")) {
      emoji = "🎨";
      displayLabel = displayLabel === "Live Site" ? "Figma Prototype" : displayLabel;
    }

    return `
      <div class="my-6">
        <a href="${href}" target="_blank" rel="noopener noreferrer" class="btn-neon text-xs py-2.5 px-5 rounded-xl border border-transparent inline-flex items-center gap-2 font-bold shadow-lg hover:-translate-y-0.5 transition-all">
          <span>${emoji}</span> Open ${displayLabel}
        </a>
      </div>
    `;
  });

  // 3b. Remove empty paragraphs or paragraphs containing only spaces, non-breaking spaces, or line breaks to fix gap issues
  clean = clean.replace(/<p[^>]*>(?:\s|&nbsp;| |<br\s*\/?>)*<\/p>/gi, "");

  // 4. Remove redundant unstyled svg navigation blocks that fill the screen
  clean = clean.replace(/<svg[\s\S]*?<\/svg>/gi, "");

  // 5. Convert unstyled Topic Area items to premium capsules
  // Terminate match immediately if we encounter <p>, <li>, <ul>, <ol>, <table> or other block tags
  const topicHeaderRegex = /<h2[^>]*>(?:(?!<\/h2>)[\s\S])*?🧩(?:(?!<\/h2>)[\s\S])*?Topic\s+Area(?:(?!<\/h2>)[\s\S])*?<\/h2>([\s\S]*?)(?=<h2[^>]*>|<\/div>|$|<ul>|<style>|<figure>|<p>|<li>|<table>|<ol>)/gi;
  clean = clean.replace(topicHeaderRegex, (match: string, topicText: string) => {
    const cleanTopicText = topicText.replace(/<style[\s\S]*?<\/style>/gi, "").trim();
    let topics: string[] = [];
    if (cleanTopicText.includes("<a")) {
      const anchorRegex = /<a[^>]*>([\s\S]*?)<\/a>/gi;
      let m;
      while ((m = anchorRegex.exec(cleanTopicText)) !== null) {
        topics.push(m[1].replace(/<[^>]*>/g, "").trim());
      }
    } else {
      topics = cleanTopicText
        .replace(/<br\s*\/?>/gi, "\n")
        .split("\n")
        .map((t: string) => t.replace(/<[^>]*>/g, "").trim())
        .filter((t: string) => t.length > 0);
    }

    if (topics.length === 0) return match;

    const pillsHtml = topics.map((topic: string) => {
      let icon = "✦";
      let text = topic;
      const emojiMatch = topic.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji})\s*(.*)$/u);
      if (emojiMatch) {
        icon = emojiMatch[1];
        text = emojiMatch[2];
      }
      return `<span class="topic-pill-v2"><span class="topic-icon">${icon}</span>${text}</span>`;
    }).join("");

    return `
      <h2>🧩 Topic Area</h2>
      <div class="topic-container-horizontal my-4 flex flex-wrap gap-2">
        ${pillsHtml}
      </div>
    `;
  });

  // 6. Convert unstyled Tech Stack items to premium badges
  const techHeaderRegex = /<h2[^>]*>(?:(?!<\/h2>)[\s\S])*?🛠️?(?:(?!<\/h2>)[\s\S])*?Tech\s+Stack(?:(?!<\/h2>)[\s\S])*?<\/h2>([\s\S]*?)(?=<h2[^>]*>|<\/div>|$|<ul>|<style>|<figure>|<p>|<li>|<table>|<ol>)/gi;
  clean = clean.replace(techHeaderRegex, (match: string, techText: string) => {
    const cleanTechText = techText.replace(/<style[\s\S]*?<\/style>/gi, "").trim();
    const techs = cleanTechText
      .replace(/<br\s*\/?>/gi, "\n")
      .split("\n")
      .map((t: string) => t.replace(/<[^>]*>/g, "").trim())
      .filter((t: string) => t.length > 0);

    if (techs.length === 0) return match;

    const badgesHtml = techs.map((tech: string) => {
      const lower = tech.toLowerCase();
      let customClass = "bg-white/[0.02] border border-white/5 text-gray-300";
      
      if (lower.includes("laravel")) customClass = "laravel bg-[#FF2D20]/10 text-[#FF2D20] border border-[#FF2D20]/20";
      else if (lower.includes("vue")) customClass = "vue bg-[#42b883]/10 text-[#42b883] border border-[#42b883]/20";
      else if (lower.includes("inertia")) customClass = "inertia bg-[#9553e9]/10 text-[#9553e9] border border-[#9553e9]/20";
      else if (lower.includes("tailwind")) customClass = "tailwind bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20";
      else if (lower.includes("react")) customClass = "react bg-[#61dafb]/10 text-[#61dafb] border border-[#61dafb]/20";
      else if (lower.includes("next")) customClass = "next-badge bg-black/40 text-white border border-white/10";
      else if (lower.includes("node")) customClass = "node bg-[#68a063]/10 text-[#68a063] border border-[#68a063]/20";
      else if (lower.includes("typescript")) customClass = "typescript bg-[#3178c6]/10 text-[#3178c6] border border-[#3178c6]/20";
      else if (lower.includes("php")) customClass = "php bg-[#777bb4]/10 text-[#777bb4] border border-[#777bb4]/20";
      else if (lower.includes("mysql")) customClass = "sql bg-[#00758f]/10 text-[#00758f] border border-[#00758f]/20";
      else if (lower.includes("angular")) customClass = "angular bg-[#dd0031]/10 text-[#dd0031] border border-[#dd0031]/20";
      else if (lower.includes(".net")) customClass = "dotnet bg-[#512bd4]/10 text-[#512bd4] border border-[#512bd4]/20";
      else if (lower.includes("gemini")) customClass = "ai bg-[#1a73e8]/10 text-[#1a73e8] border border-[#1a73e8]/20";
      
      return `<span class="kh-badge ${customClass}">${tech}</span>`;
    }).join("");

    return `
      <h2>🛠️ Tech Stack</h2>
      <div class="kh-stack-grid my-4 flex flex-wrap gap-2">
        ${badgesHtml}
      </div>
    `;
  });

  // 7. Transform raw unstyled text Skills and Percentages into premium progress meters
  const skillsHeaderRegex = /<h2[^>]*>(?:(?!<\/h2>)[\s\S])*?🛠️?(?:(?!<\/h2>)[\s\S])*?Skills\s+Used(?:(?!<\/h2>)[\s\S])*?<\/h2>([\s\S]*?)(?=<h2[^>]*>|<\/div>|$|<ul>|<style>|<figure>|<p>|<li>|<table>|<ol>)/gi;
  clean = clean.replace(skillsHeaderRegex, (match: string, skillsText: string) => {
    const cleanSkillsText = skillsText.replace(/<style[\s\S]*?<\/style>/gi, "").trim();
    const lines = cleanSkillsText
      .replace(/<br\s*\/?>/gi, "\n")
      .split("\n")
      .map((l: string) => l.replace(/<[^>]*>/g, "").trim())
      .filter((l: string) => l.length > 0);

    const skillsList: { name: string; percentage: string }[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const pctMatch = line.match(/^(\d+)\s*%$/);
      if (pctMatch && i > 0) {
        const pct = pctMatch[1];
        const skillName = lines[i - 1];
        if (skillsList.length > 0 && skillsList[skillsList.length - 1].name === skillName) {
          skillsList[skillsList.length - 1].percentage = pct;
        } else {
          if (!lines[i - 1].match(/^\d+\s*%$/)) {
            skillsList.push({ name: skillName, percentage: pct });
          }
        }
      } else if (!line.match(/^\d+\s*%$/)) {
        skillsList.push({ name: line, percentage: "85" });
      }
    }

    const finalSkills = skillsList.filter(s => !s.name.match(/^\d+\s*%$/) && s.name.length > 1);

    if (finalSkills.length === 0) return match;

    const metersHtml = finalSkills.map((skill: { name: string; percentage: string }) => `
      <div class="flex flex-col gap-1 w-full my-2 group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">${skill.name}</span>
          <span class="text-[10px] font-bold text-gray-500 group-hover:text-[#50FFD9] transition-colors">${skill.percentage}% Experience</span>
        </div>
        <div class="w-full h-1 bg-white/[0.02] border border-white/5 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-[#50FFD9] to-[#a78bfa] rounded-full transition-all duration-1000 opacity-80 group-hover:opacity-100" style="style: width: ${skill.percentage}%" style="width: ${skill.percentage}%"></div>
        </div>
      </div>
    `).join("");

    return `
      <h2>🛠️ Skills Used</h2>
      <div class="skills-used-container my-4 flex flex-col gap-3 w-full">
        ${metersHtml}
      </div>
    `;
  });

  // 7b. Convert any sequence of <a> text </a> tags under h2 headings into premium capsules
  // This handles customized sections like Poster Type, Target Audience, Logo Styles, Content Categories, etc.
  const headingAndAnchorsRegex = /(<h2[^>]*>(?:(?!<\/h2>)[\s\S])*?<\/h2>)\s*((?:<a(?![^>]*data-elementor-open-lightbox)[^>]*>(?:(?!<\/a>)(?!<img)(?!<figure)[\s\S])*?<\/a>\s*)+)/gi;
  clean = clean.replace(headingAndAnchorsRegex, (match: string, heading: string, anchorsText: string) => {
    const anchorRegex = /<a[^>]*>([\s\S]*?)<\/a>/gi;
    const items: string[] = [];
    let m;
    while ((m = anchorRegex.exec(anchorsText)) !== null) {
      const txt = m[1].replace(/<[^>]*>/g, "").trim();
      if (txt) {
        items.push(txt);
      }
    }

    if (items.length === 0) return match;

    const pillsHtml = items.map((item: string) => {
      let icon = "✦";
      let text = item;
      const emojiMatch = item.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji})\s*(.*)$/u);
      if (emojiMatch) {
        icon = emojiMatch[1];
        text = emojiMatch[2];
      }
      return `<span class="topic-pill-v2"><span class="topic-icon">${icon}</span>${text}</span>`;
    }).join("");

    return `
      ${heading}
      <div class="topic-container-horizontal my-4 flex flex-wrap gap-2">
        ${pillsHtml}
      </div>
    `;
  });

  // 8. Style raw images beautifully and prevent stacking layout break
  clean = clean.replace(/<style[\s\S]*?<\/style>/gi, "");

  // 9. Strip all image tags, figures, and lightbox anchor containers from the rich text body
  // since they are already beautifully rendered in our interactive slider at the top!
  clean = clean.replace(/<a[^>]*data-elementor-open-lightbox[^>]*>[\s\S]*?<\/a>/gi, "");
  clean = clean.replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, "");
  clean = clean.replace(/<img[^>]*>/gi, "");

  return clean;
}

// Extract all images inside the project content to feed into an interactive Client Slider
function extractProjectImages(html: string): { strippedHtml: string; images: string[] } {
  if (!html) return { strippedHtml: "", images: [] };

  const images: string[] = [];
  
  // 1. Extract image URLs
  const imgRegex = /<img[^>]+src=["']([^">]+)["']/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    if (match[1] && !images.includes(match[1])) {
      images.push(match[1]);
    }
  }

  // To preserve 100% of description text, lists, and headings, we DO NOT destructively strip figure tags.
  // Instead, the CSS styled classes inside globals.css will hide raw inline image tags and empty spacers.
  return { strippedHtml: html, images };
}


export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  let project: ProjectData;

  try {
    project = await getProjectData(slug);
  } catch (error) {
    notFound();
  }

  // Compile a list of unique projects from our database to provide Prev/Next recommendation blocks
  // Prioritize websites and visual designs over carousel array to get rich specific descriptions and full content paths
  const allProjects = [
    ...portfolioData.website,
    ...portfolioData.visual_design,
    ...portfolioData.carousel
  ];
  
  // Filter unique items by slug
  const uniqueProjects: PortfolioItem[] = allProjects.filter(
    (v, i, a) => a.findIndex((t) => t.slug === v.slug) === i
  ) as any[];

  const currentIndex = uniqueProjects.findIndex((p) => p.slug === slug);
  const nextProject = currentIndex !== -1 && currentIndex < uniqueProjects.length - 1 
    ? uniqueProjects[currentIndex + 1] 
    : uniqueProjects[0]; // Wrap around to first if last page
    
  const prevProject = currentIndex !== -1 && currentIndex > 0 
    ? uniqueProjects[currentIndex - 1] 
    : uniqueProjects[uniqueProjects.length - 1]; // Wrap around to last if first page

  // Parse custom tech stack list if written inside description fields
  const parseTechStack = (desc: string) => {
    const parts = desc.split(/Tech Stack\s*:\s*/i);
    if (parts.length > 1) {
      return parts[1]
        .split(",")
        .map((t) => t.trim().replace(/\.$/, ""))
        .filter((t) => t.length > 0);
    }
    return [];
  };

  const projectDetails = uniqueProjects.find((p) => p.slug === slug);
  const techStackBadges = projectDetails ? parseTechStack(projectDetails.description) : [];
  
  const cleanDescription = (desc: string) => {
    if (!desc) return "";
    return desc.split(/Tech Stack\s*:\s*/i)[0].trim();
  };

  const projectDescription = projectDetails ? cleanDescription(projectDetails.description) : "";
  const projectDescription_en = projectDetails ? cleanDescription(projectDetails.description_en || projectDetails.description) : "";
  const projectDescription_id = projectDetails ? cleanDescription(projectDetails.description_id || projectDetails.description) : "";

  // Process English Content
  const content_en = project.content_en || project.content;
  const { strippedHtml: strippedHtml_en, images: images_en } = extractProjectImages(content_en);
  const cleanedContent_en = cleanProjectHtml(strippedHtml_en);

  // Process Indonesian Content
  const content_id = project.content_id || project.content;
  const { strippedHtml: strippedHtml_id, images: images_id } = extractProjectImages(content_id);
  const cleanedContent_id = cleanProjectHtml(strippedHtml_id);

  // Process Legacy Default Content
  const { strippedHtml, images } = extractProjectImages(project.content);
  const cleanedContent = cleanProjectHtml(strippedHtml);

  // Combine unique screenshots extracted across all languages
  const combinedImages = Array.from(new Set([...images, ...images_en, ...images_id]));

  const coverImage = projectDetails?.image || "/wp-content/uploads/2025/07/2-3.png";

  const isDesignProject = 
    project.type?.toLowerCase().includes("design") || 
    project.type?.toLowerCase().includes("poster") || 
    project.type?.toLowerCase().includes("logo") || 
    project.type?.toLowerCase().includes("social media") || 
    slug.toLowerCase().includes("design") || 
    slug.toLowerCase().includes("poster") || 
    slug.toLowerCase().includes("logo") || 
    slug.toLowerCase().includes("social-media");

  const isAIProject = 
    project.type?.toLowerCase().includes("ai") || 
    project.type?.toLowerCase().includes("artificial") || 
    slug.toLowerCase().includes("ai") ||
    slug.toLowerCase().includes("dopamind");

  return (
    <ProjectClientPage
      project={project}
      prevProject={prevProject}
      nextProject={nextProject}
      techStackBadges={techStackBadges}
      coverImage={coverImage}
      cleanedContent={cleanedContent}
      cleanedContent_en={cleanedContent_en}
      cleanedContent_id={cleanedContent_id}
      isDesignProject={isDesignProject}
      isAIProject={isAIProject}
      images={combinedImages}
      description={projectDescription}
      description_en={projectDescription_en}
      description_id={projectDescription_id}
    />
  );
}
