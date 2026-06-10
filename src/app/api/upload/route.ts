import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const PASSWORD_SECRET = "khairanadmin";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const password = formData.get("password") as string;
    const folder = (formData.get("folder") as string) || "misc";

    if (password !== PASSWORD_SECRET) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a safe filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
    const filename = `${timestamp}_${safeName}`;
    
    // Define relative and absolute paths
    // Using 2026/06 as a default like WordPress style
    const datePath = "2026/06";
    const relativeDir = path.join("wp-content", "uploads", datePath);
    const absoluteDir = path.join(process.cwd(), "public", relativeDir);

    // Ensure directory exists
    await fs.mkdir(absoluteDir, { recursive: true });

    const absoluteFilePath = path.join(absoluteDir, filename);
    await fs.writeFile(absoluteFilePath, buffer);

    const relativeUrl = `/${relativeDir}/${filename}`.replace(/\\/g, "/");

    return NextResponse.json({ 
      success: true, 
      url: relativeUrl 
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Upload failed." }, { status: 500 });
  }
}
