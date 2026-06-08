import { NextRequest } from "next/server";
import { users } from "@/lib/db";
import { hashPassword, validatePassword } from "@/lib/password";
import { signToken } from "@/lib/jwt";
import { ok, error, serverError } from "@/lib/response";
import { COOKIE_CONFIG } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name?.trim()) return error("نام الزامی است");
    if (!email?.trim()) return error("ایمیل الزامی است");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return error("فرمت ایمیل نامعتبر است");
    if (!password) return error("رمز عبور الزامی است");
    const pwErr = validatePassword(password);
    if (pwErr) return error(pwErr);

    const existing = users.findByEmail(email.toLowerCase());
    if (existing) return error("این ایمیل قبلاً ثبت شده است", 409);

    const hashed = await hashPassword(password);
    const user = users.create({ name: name.trim(), email: email.toLowerCase(), password: hashed });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const response = ok({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 201);
    response.cookies.set(COOKIE_CONFIG.name, token, COOKIE_CONFIG);
    return response;
  } catch (e) {
    console.error("Register error:", e);
    return serverError();
  }
}
