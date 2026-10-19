import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    // Directory where generated artifacts reside
    const brainDir = "C:\\Users\\User\\.gemini\\antigravity\\brain\\63de0ce7-0158-4f4a-9749-bfcf6031eae6";
    const filePath = path.join(brainDir, filename);

    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      
      // Auto-mirror to public/assets for permanent static availability
      try {
        const publicDir = path.join(process.cwd(), "public", "assets");
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
        const publicTarget = path.join(publicDir, filename);
        if (!fs.existsSync(publicTarget)) fs.writeFileSync(publicTarget, fileBuffer);
      } catch {}

      const ext = path.extname(filename).toLowerCase();
      let contentType = "image/jpeg";
      if (ext === ".png") contentType = "image/png";
      if (ext === ".svg") contentType = "image/svg+xml";

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return new NextResponse("Asset not found", { status: 404 });
  } catch (error) {
    return new NextResponse("Error reading asset", { status: 500 });
  }
}
