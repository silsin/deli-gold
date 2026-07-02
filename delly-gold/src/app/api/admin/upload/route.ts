import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { error, serverError } from "@/lib/response";
import { NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
const MAX_SIZE   = 5 * 1024 * 1024; // 5MB
const ALLOWED    = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    const auth = requireAdmin(req);
    if ("error" in auth) return error(auth.error, auth.status);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return error("فایلی ارسال نشده");
    if (!ALLOWED.includes(file.type)) return error("فرمت فایل مجاز نیست (فقط JPG, PNG, WebP, GIF)");
    if (file.size > MAX_SIZE) return error("حجم فایل بیش از ۵ مگابایت است");

    // Create upload dir
    mkdirSync(UPLOAD_DIR, { recursive: true });

    // Unique filename
    const ext  = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, name);

    // Write to disk
    const buf = Buffer.from(await file.arrayBuffer());
    writeFileSync(filePath, buf);

    const publicUrl = `/uploads/${name}`;

    return NextResponse.json({ success: true, data: { url: publicUrl, name } });
  } catch (e) {
    console.error("Upload error:", e);
    return serverError();
  }
}

// Config to accept multipart
export const runtime = "nodejs";
