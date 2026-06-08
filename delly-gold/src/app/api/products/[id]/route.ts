import { NextRequest } from "next/server";
import { products } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, error, notFound, serverError } from "@/lib/response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const p = products.findById(id);
    return p ? ok(p) : notFound("محصول یافت نشد");
  } catch (e) { console.error(e); return serverError(); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = requireAdmin(req);
    if ("error" in result) return error(result.error, result.status);
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.description !== undefined) data.description = body.description;
    if (body.price !== undefined) data.price = parseFloat(body.price);
    if (body.weight !== undefined) data.weight = parseFloat(body.weight);
    if (body.karat !== undefined) data.karat = parseInt(body.karat);
    if (body.stock !== undefined) data.stock = parseInt(body.stock);
    if (body.images !== undefined) data.images = JSON.stringify(body.images);
    if (body.categoryId !== undefined) data.category_id = body.categoryId;
    if (body.featured !== undefined) data.featured = body.featured ? 1 : 0;
    if (body.published !== undefined) data.published = body.published ? 1 : 0;
    return ok(products.update(id, data));
  } catch (e) { console.error(e); return serverError(); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = requireAdmin(req);
    if ("error" in result) return error(result.error, result.status);
    const { id } = await params;
    products.delete(id);
    return ok({ deleted: true });
  } catch (e) { console.error(e); return serverError(); }
}
