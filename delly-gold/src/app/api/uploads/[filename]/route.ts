/**
 * Serves uploaded files from UPLOAD_DIR.
 * Required in Next.js standalone mode because runtime-uploaded files
 * in public/uploads/ are NOT served statically.
 */
import { NextRequest, NextResponse } from "next/server";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Prevent path traversal
  const safe = path.basename(filename);
  const filePath = path.join(UPLOAD_DIR, safe);

  if (!existsSync(filePath)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const ext = safe.split(".").pop()?.toLowerCase() ?? "jpg";
  const contentType = MIME[ext] ?? "application/octet-stream";
  const size = statSync(filePath).size;

  const nodeStream = createReadStream(filePath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream;

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
