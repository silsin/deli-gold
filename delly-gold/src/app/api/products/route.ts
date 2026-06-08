import { NextRequest } from "next/server";
import { products } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, created, error, serverError } from "@/lib/response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "12"));
    const result = products.list({
      categoryId: searchParams.get("category") || undefined,
      featured: searchParams.get("featured") === "true" ? true : undefined,
      search: searchParams.get("search") || undefined,
      limit, offset: (page - 1) * limit,
    });
    return ok({ products: result.rows, pagination: { page, limit, total: result.total, pages: Math.ceil(result.total / limit) } });
  } catch (e) { console.error(e); return serverError(); }
}

export async function POST(req: NextRequest) {
  try {
    const result = requireAdmin(req);
    if ("error" in result) return error(result.error, result.status);
    const body = await req.json();
    const { name, slug, description, price, weight, karat, stock, images, categoryId, featured, published } = body;
    if (!name?.trim()) return error("نام محصول الزامی است");
    if (!slug?.trim()) return error("اسلاگ الزامی است");
    if (!price || price <= 0) return error("قیمت نامعتبر است");
    if (!weight || weight <= 0) return error("وزن نامعتبر است");
    if (!categoryId) return error("دسته‌بندی الزامی است");
    if (products.countBySlug(slug) > 0) return error("این اسلاگ قبلاً استفاده شده", 409);
    return created(products.create({
      id: "", name: name.trim(), slug: slug.trim(), description: description ?? null,
      price: parseFloat(price), weight: parseFloat(weight), karat: parseInt(karat ?? 18),
      stock: parseInt(stock ?? 0), images: JSON.stringify(images ?? []),
      featured: featured ? 1 : 0, published: published !== false ? 1 : 0,
      category_id: categoryId,
    }));
  } catch (e) { console.error(e); return serverError(); }
}
