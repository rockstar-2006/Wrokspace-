import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const assetsDir = path.join(process.cwd(), "public", "assets", "add-project");
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    const brainDir = "C:\\Users\\User\\.gemini\\antigravity\\brain\\63de0ce7-0158-4f4a-9749-bfcf6031eae6";

    const files = [
      {
        src: path.join(brainDir, "add_project_hero_isometric_1791697756277.jpg"),
        dest: path.join(assetsDir, "hero-isometric.jpg"),
      },
      {
        src: path.join(brainDir, "standout_gallery_cards_1791697788745.jpg"),
        dest: path.join(assetsDir, "standout-gallery.jpg"),
      },
      {
        src: path.join(brainDir, "turn_ideas_into_amazing_1791697808750.jpg"),
        dest: path.join(assetsDir, "turn-ideas.jpg"),
      },
    ];

    const copied = [];
    for (const f of files) {
      if (fs.existsSync(f.src)) {
        fs.copyFileSync(f.src, f.dest);
        copied.push(path.basename(f.dest));
      }
    }

    return NextResponse.json({ success: true, copied });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
