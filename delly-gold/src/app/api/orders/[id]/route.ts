import { NextRequest } from "next/server";
import { orders } from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { ok, error, notFound, serverError } from "@/lib/response";

const VALID_STATUSES = ["PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED"];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = requireAuth(req);
    if ("error" in result) return error(result.error, result.status);
    const { id } = await params;
    const isAdmin = result.user.role === "ADMIN";
    const order = orders.findById(id, isAdmin ? undefined : result.user.userId);
    return order ? ok(order) : notFound("سفارش یافت نشد");
  } catch (e) { console.error(e); return serverError(); }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = requireAdmin(req);
    if ("error" in result) return error(result.error, result.status);
    const { id } = await params;
    const { status } = await req.json();
    if (!VALID_STATUSES.includes(status)) return error("وضعیت نامعتبر است");
    return ok(orders.updateStatus(id, status));
  } catch (e) { console.error(e); return serverError(); }
}
