import { NextRequest } from "next/server";
import { users } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { ok, error, serverError } from "@/lib/response";

export async function GET(req: NextRequest) {
  try {
    const result = requireAuth(req);
    if ("error" in result) return error(result.error, result.status);
    const user = users.findById(result.user.userId);
    if (!user) return error("کاربر یافت نشد", 404);
    return ok(user);
  } catch (e) {
    console.error(e);
    return serverError();
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const result = requireAuth(req);
    if ("error" in result) return error(result.error, result.status);

    const body = await req.json();
    const { name, phone, address } = body;

    if (name !== undefined && !String(name).trim()) {
      return error("نام نمی‌تواند خالی باشد");
    }

    users.update(result.user.userId, {
      ...(name !== undefined ? { name: String(name).trim() } : {}),
      ...(phone !== undefined ? { phone: String(phone).trim() || null } : {}),
      ...(address !== undefined ? { address: String(address).trim() || null } : {}),
    } as { name?: string; phone?: string; address?: string });

    const updated = users.findById(result.user.userId);
    return ok(updated);
  } catch (e) {
    console.error(e);
    return serverError();
  }
}
