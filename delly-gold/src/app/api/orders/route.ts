import { NextRequest } from "next/server";
import { orders, products as productsDb } from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { ok, created, error, serverError } from "@/lib/response";

export async function GET(req: NextRequest) {
  try {
    const authResult = requireAuth(req);
    if ("error" in authResult) return error(authResult.error, authResult.status);
    const adminResult = requireAdmin(req);
    const isAdmin = !("error" in adminResult);
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
    const result = orders.list({ userId: isAdmin ? undefined : authResult.user.userId, limit, offset: (page - 1) * limit });
    return ok({ orders: result.rows, pagination: { page, limit, total: result.total, pages: Math.ceil(result.total / limit) } });
  } catch (e) { console.error(e); return serverError(); }
}

export async function POST(req: NextRequest) {
  try {
    const result = requireAuth(req);
    if ("error" in result) return error(result.error, result.status);
    const { items, address, note } = await req.json();
    if (!items?.length) return error("سبد خرید خالی است");
    if (!address?.trim()) return error("آدرس تحویل الزامی است");
    let total = 0;
    const orderItems: { productId: string; quantity: number; price: number }[] = [];
    for (const item of items) {
      const product = productsDb.findById(item.productId);
      if (!product) return error(`محصول یافت نشد`);
      if (product.published !== 1) return error(`محصول در دسترس نیست`);
      if (product.stock < item.quantity) return error(`موجودی ${product.name} کافی نیست`);
      total += product.price * item.quantity;
      orderItems.push({ productId: item.productId, quantity: item.quantity, price: product.price });
    }
    const order = orders.create({ userId: result.user.userId, total, address: address.trim(), note, items: orderItems });
    return created(order);
  } catch (e) { console.error(e); return serverError(); }
}
