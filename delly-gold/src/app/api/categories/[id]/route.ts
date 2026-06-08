import { NextRequest } from "next/server";
import { categories } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, error, notFound, serverError } from "@/lib/response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cat = categories.findById(id);
    return cat ? ok(cat) : notFound();
  } catch (e) { console.error(e); return serverError(); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = requireAdmin(req);
    if ("error" in result) return error(result.error, result.status);
    const { id } = await params;
    const data = await req.json();
    return ok(categories.update(id, data));
  } catch (e) { console.error(e); return serverError(); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = requireAdmin(req);
    if ("error" in result) return error(result.error, result.status);
    const { id } = await params;
    categories.delete(id);
    return ok({ deleted: true });
  } catch (e) { console.error(e); return serverError(); }
}
