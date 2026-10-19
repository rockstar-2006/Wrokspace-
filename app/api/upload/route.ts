import { NextRequest, NextResponse } from "next/server";

const FREEIMAGE_API_KEY = process.env.FREEIMAGE_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!FREEIMAGE_API_KEY) {
      return NextResponse.json(
        { error: "Image upload service is not configured" },
        { status: 500 }
      );
    }

    const data = await req.json();
    const { base64, filename } = data;

    if (!base64) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: "Invalid base64 string" }, { status: 400 });
    }

    const buffer = Buffer.from(matches[2], "base64");
    const mimeType = matches[1] || "image/jpeg";
    const cleanName = filename ? filename.replace(/[^a-zA-Z0-9.-]/g, "_") : `img_${Date.now()}`;

    // 1. Upload directly to Freeimage.host API (Returns permanent public CDN link https://iili.io/...)
    try {
      const formData = new FormData();
      formData.append("key", FREEIMAGE_API_KEY);
      formData.append("action", "upload");
      formData.append("format", "json");

      const fileBlob = new Blob([buffer], { type: mimeType });
      formData.append("source", fileBlob, `${cleanName}.jpg`);

      const res = await fetch("https://freeimage.host/api/1/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        const publicUrl = json?.image?.display_url || json?.image?.url;
        if (publicUrl) {
          return NextResponse.json({ success: true, url: publicUrl });
        }
      } else {
        console.warn("Freeimage upload failed with status:", res.status);
      }
    } catch (apiErr) {
      console.warn("Freeimage API fetch error:", apiErr);
    }

    // Fallback: return compressed base64 so client never breaks
    return NextResponse.json({ success: true, url: base64 });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process image upload" },
      { status: 500 }
    );
  }
}
