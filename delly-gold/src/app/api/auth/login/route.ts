import { NextRequest } from "next/server";
import { users } from "@/lib/db";
import { comparePassword } from "@/lib/password";
import { signToken } from "@/lib/jwt";
import { ok, error, serverError } from "@/lib/response";
import { COOKIE_CONFIG } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email?.trim() || !password) return error("ایمیل و رمز عبور الزامی است");

    const user = users.findByEmail(email.toLowerCase());
    // Constant-time: always run bcrypt to prevent timing attacks
    if (!user) {
      await comparePassword(password, "$2a$12$placeholder.hash.for.timing.safety.only");
      return error("ایمیل یا رمز عبور اشتباه است", 401);
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) return error("ایمیل یا رمز عبور اشتباه است", 401);

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const response = ok({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    response.cookies.set(COOKIE_CONFIG.name, token, COOKIE_CONFIG);
    return response;
  } catch (e) {
    console.error("Login error:", e);
    return serverError();
  }
}
