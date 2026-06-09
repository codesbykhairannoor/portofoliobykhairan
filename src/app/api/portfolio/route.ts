import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const PASSWORD_SECRET = "khairanadmin";

// GET handler: Fetch all project metadata or a specific project's details
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const safeSlug = path.basename(slug).trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
      const projectPath = path.join(process.cwd(), "src", "data", "projects", `${safeSlug}.json`);
      
      try {
        const fileContent = await fs.readFile(projectPath, "utf8");
        const projectData = JSON.parse(fileContent);
        return NextResponse.json(projectData);
      } catch (err) {
        return NextResponse.json({ error: "Project details not found." }, { status: 404 });
      }
    }

    // Default: return list of metadata from portfolio.json
    const portfolioPath = path.join(process.cwd(), "src", "data", "portfolio.json");
    const portfolioContent = await fs.readFile(portfolioPath, "utf8");
    return NextResponse.json(JSON.parse(portfolioContent));
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server read failed." }, { status: 500 });
  }
}

// POST handler: Create a new project and case study detail file
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      password, 
      title, 
      title_en,
      title_id,
      slug, 
      type, 
      image, 
      description, 
      description_en,
      description_id,
      content,
      content_en,
      content_id
    } = body;

    if (password !== PASSWORD_SECRET) {
      return NextResponse.json({ error: "Unauthorized access code." }, { status: 401 });
    }

    if (!title || !slug || !type || !image || !description || !content) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");

    // 1. UPDATE portfolio.json metadata list
    const portfolioPath = path.join(process.cwd(), "src", "data", "portfolio.json");
    const portfolioContent = await fs.readFile(portfolioPath, "utf8");
    const portfolioData = JSON.parse(portfolioContent);

    const newMetadataItem = {
      title: title.trim(),
      title_en: title_en ? title_en.trim() : title.trim(),
      title_id: title_id ? title_id.trim() : title.trim(),
      description: description.trim(),
      description_en: description_en ? description_en.trim() : description.trim(),
      description_id: description_id ? description_id.trim() : description.trim(),
      link: `/${cleanSlug}/`,
      slug: cleanSlug,
      image: image.trim()
    };

    // Push to correct classification list
    if (type === "visual_design" && Array.isArray(portfolioData.visual_design)) {
      portfolioData.visual_design.unshift(newMetadataItem);
    } else if (type === "website" && Array.isArray(portfolioData.website)) {
      portfolioData.website.unshift(newMetadataItem);
    } else {
      return NextResponse.json({ error: "Invalid project classification." }, { status: 400 });
    }

    // Push to carousel
    if (Array.isArray(portfolioData.carousel)) {
      portfolioData.carousel.unshift(newMetadataItem);
      if (portfolioData.carousel.length > 12) {
        portfolioData.carousel.pop();
      }
    }

    await fs.writeFile(portfolioPath, JSON.stringify(portfolioData, null, 2), "utf8");

    // 2. WRITE project details file [slug].json
    const projectPath = path.join(process.cwd(), "src", "data", "projects", `${cleanSlug}.json`);
    const projectDataPayload = {
      id: String(Date.now()).slice(-4),
      title: title.trim(),
      title_en: title_en ? title_en.trim() : title.trim(),
      title_id: title_id ? title_id.trim() : title.trim(),
      slug: cleanSlug,
      type: type === "website" ? "engineered system" : "visual design node",
      type_en: type === "website" ? "engineered system" : "visual design node",
      type_id: type === "website" ? "sistem rekayasa" : "node desain visual",
      content: content.trim(),
      content_en: content_en ? content_en.trim() : content.trim(),
      content_id: content_id ? content_id.trim() : content.trim()
    };

    await fs.writeFile(projectPath, JSON.stringify(projectDataPayload, null, 2), "utf8");

    return NextResponse.json({ success: true, slug: cleanSlug });
  } catch (error: any) {
    console.error("API error adding project:", error);
    return NextResponse.json({ error: error.message || "Server write failed." }, { status: 500 });
  }
}

// PUT handler: Edit an existing project's metadata and case study detail file
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { 
      password, 
      originalSlug, 
      title, 
      title_en,
      title_id,
      slug, 
      type, 
      image, 
      description, 
      description_en,
      description_id,
      content,
      content_en,
      content_id
    } = body;

    if (password !== PASSWORD_SECRET) {
      return NextResponse.json({ error: "Unauthorized access code." }, { status: 401 });
    }

    if (!originalSlug || !title || !slug || !type || !image || !description || !content) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const cleanOriginalSlug = originalSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
    const cleanNewSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");

    // 1. UPDATE portfolio.json metadata references
    const portfolioPath = path.join(process.cwd(), "src", "data", "portfolio.json");
    const portfolioContent = await fs.readFile(portfolioPath, "utf8");
    const portfolioData = JSON.parse(portfolioContent);

    const updatedMetadataItem = {
      title: title.trim(),
      title_en: title_en ? title_en.trim() : title.trim(),
      title_id: title_id ? title_id.trim() : title.trim(),
      description: description.trim(),
      description_en: description_en ? description_en.trim() : description.trim(),
      description_id: description_id ? description_id.trim() : description.trim(),
      link: `/${cleanNewSlug}/`,
      slug: cleanNewSlug,
      image: image.trim()
    };

    // Helper helper to update item inside an array by slug
    const updateInArray = (arr: any[]) => {
      if (!Array.isArray(arr)) return;
      const idx = arr.findIndex((item) => item.slug === cleanOriginalSlug);
      if (idx !== -1) {
        arr[idx] = updatedMetadataItem;
      }
    };

    // Remove from original array if category changed, add to new array
    let originalType: "visual_design" | "website" | null = null;
    if (portfolioData.visual_design?.some((item: any) => item.slug === cleanOriginalSlug)) {
      originalType = "visual_design";
    } else if (portfolioData.website?.some((item: any) => item.slug === cleanOriginalSlug)) {
      originalType = "website";
    }

    if (originalType && originalType !== type) {
      // Remove from old array
      portfolioData[originalType] = portfolioData[originalType].filter((item: any) => item.slug !== cleanOriginalSlug);
      // Add to new array
      portfolioData[type] = portfolioData[type] || [];
      portfolioData[type].unshift(updatedMetadataItem);
    } else {
      // Update in place
      if (type === "visual_design") {
        updateInArray(portfolioData.visual_design);
      } else {
        updateInArray(portfolioData.website);
      }
    }

    // Update inside carousel
    if (Array.isArray(portfolioData.carousel)) {
      const carouselIdx = portfolioData.carousel.findIndex((item: any) => item.slug === cleanOriginalSlug);
      if (carouselIdx !== -1) {
        portfolioData.carousel[carouselIdx] = updatedMetadataItem;
      } else {
        portfolioData.carousel.unshift(updatedMetadataItem);
        if (portfolioData.carousel.length > 12) {
          portfolioData.carousel.pop();
        }
      }
    }

    await fs.writeFile(portfolioPath, JSON.stringify(portfolioData, null, 2), "utf8");

    // 2. UPDATE OR RENAME detailed case study JSON payload
    const originalProjectPath = path.join(process.cwd(), "src", "data", "projects", `${cleanOriginalSlug}.json`);
    const newProjectPath = path.join(process.cwd(), "src", "data", "projects", `${cleanNewSlug}.json`);

    let existingId = String(Date.now()).slice(-4);
    try {
      const originalFileContent = await fs.readFile(originalProjectPath, "utf8");
      const parsedOriginal = JSON.parse(originalFileContent);
      existingId = parsedOriginal.id || existingId;
    } catch (e) {
      // Original project file might not exist or be named differently, proceed with write
    }

    const updatedProjectPayload = {
      id: existingId,
      title: title.trim(),
      title_en: title_en ? title_en.trim() : title.trim(),
      title_id: title_id ? title_id.trim() : title.trim(),
      slug: cleanNewSlug,
      type: type === "website" ? "engineered system" : "visual design node",
      type_en: type === "website" ? "engineered system" : "visual design node",
      type_id: type === "website" ? "sistem rekayasa" : "node desain visual",
      content: content.trim(),
      content_en: content_en ? content_en.trim() : content.trim(),
      content_id: content_id ? content_id.trim() : content.trim()
    };

    // If slug changed, delete original detail file first
    if (cleanOriginalSlug !== cleanNewSlug) {
      try {
        await fs.unlink(originalProjectPath);
      } catch (err) {
        // Might already be deleted or missing
      }
    }

    await fs.writeFile(newProjectPath, JSON.stringify(updatedProjectPayload, null, 2), "utf8");

    return NextResponse.json({ success: true, slug: cleanNewSlug });
  } catch (error: any) {
    console.error("API error updating project:", error);
    return NextResponse.json({ error: error.message || "Server update failed." }, { status: 500 });
  }
}

// DELETE handler: Remove project metadata and case study detail file
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { password, slug } = body;

    if (password !== PASSWORD_SECRET) {
      return NextResponse.json({ error: "Unauthorized access code." }, { status: 401 });
    }

    if (!slug) {
      return NextResponse.json({ error: "Missing slug parameter." }, { status: 400 });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");

    // 1. UPDATE portfolio.json
    const portfolioPath = path.join(process.cwd(), "src", "data", "portfolio.json");
    const portfolioContent = await fs.readFile(portfolioPath, "utf8");
    const portfolioData = JSON.parse(portfolioContent);

    if (Array.isArray(portfolioData.visual_design)) {
      portfolioData.visual_design = portfolioData.visual_design.filter((item: any) => item.slug !== cleanSlug);
    }
    if (Array.isArray(portfolioData.website)) {
      portfolioData.website = portfolioData.website.filter((item: any) => item.slug !== cleanSlug);
    }
    if (Array.isArray(portfolioData.carousel)) {
      portfolioData.carousel = portfolioData.carousel.filter((item: any) => item.slug !== cleanSlug);
    }

    await fs.writeFile(portfolioPath, JSON.stringify(portfolioData, null, 2), "utf8");

    // 2. DELETE projects/[slug].json
    const projectPath = path.join(process.cwd(), "src", "data", "projects", `${cleanSlug}.json`);
    try {
      await fs.unlink(projectPath);
    } catch (err) {
      // File may already be deleted or missing
    }

    return NextResponse.json({ success: true, slug: cleanSlug });
  } catch (error: any) {
    console.error("API error deleting project:", error);
    return NextResponse.json({ error: error.message || "Server delete failed." }, { status: 500 });
  }
}
