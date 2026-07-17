import { NextRequest } from "next/server";
import { orders } from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { serializeOrderDetail } from "@/lib/serialize";
import { ok, error, notFound, serverError } from "@/lib/response";
import { normalizePhone } from "@/lib/phone";
import { sendOrderStatusSms } from "@/lib/kavenegar";

const VALID_STATUSES = ["PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED"];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = requireAuth(req);
    if ("error" in result) return error(result.error, result.status);
    const { id } = await params;
    const isAdmin = result.user.role === "ADMIN";
    const order = orders.findById(id, isAdmin ? undefined : result.user.userId);
    return order ? ok(serializeOrderDetail(order)) : notFound("سفارش یافت نشد");
  } catch (e) { console.error(e); return serverError(); }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = requireAdmin(req);
    if ("error" in result) return error(result.error, result.status);
    const { id } = await params;
    const { status } = await req.json();
    if (!VALID_STATUSES.includes(status)) return error("وضعیت نامعتبر است");

    const existing = orders.findById(id);
    if (!existing) return notFound("سفارش یافت نشد");

    const previousStatus = existing.status;
    const updated = orders.updateStatus(id, status);

    if (previousStatus !== status) {
      const phoneRaw = updated?.recipient_phone || updated?.delivery_phone || "";
      const phone = normalizePhone(phoneRaw);
      if (phone) {
        try {
          await sendOrderStatusSms(phone, id, status);
        } catch (e) {
          console.error("Order status SMS error:", e);
        }
      } else {
        console.warn(`Order ${id}: no valid recipient phone for status SMS`);
      }
    }

    return ok(serializeOrderDetail(updated!));
  } catch (e) { console.error(e); return serverError(); }
}
