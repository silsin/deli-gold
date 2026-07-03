import { NextRequest } from "next/server";
import { users } from "@/lib/db";
import { comparePassword } from "@/lib/password";
import { signToken } from "@/lib/jwt";
import { ok, error, serverError } from "@/lib/response";
import { COOKIE_CONFIG } from "@/lib/auth";

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (/^09\d{9}$/.test(digits)) return digits;
  if (/^98\d{10}$/.test(digits)) return "0" + digits.slice(2);
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();
    if (!phone?.trim() || !password) return error("شماره موبایل و رمز عبور الزامی است");

    const normalized = normalizePhone(phone.trim());
    if (!normalized) return error("شماره موبایل معتبر نیست");

    const user = users.findByPhone(normalized);
    // Constant-time: always run bcrypt to prevent timing attacks
    if (!user) {
      await comparePassword(password, "$2a$12$placeholder.hash.for.timing.safety.only");
      return error("شماره موبایل یا رمز عبور اشتباه است", 401);
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) return error("شماره موبایل یا رمز عبور اشتباه است", 401);

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const response = ok({
      user: { id: user.id, name: user.name, phone: user.phone_login, role: user.role }
    });
    response.cookies.set(COOKIE_CONFIG.name, token, COOKIE_CONFIG);
    return response;
  } catch (e) {
    console.error("Login error:", e);
    return serverError();
  }
}
