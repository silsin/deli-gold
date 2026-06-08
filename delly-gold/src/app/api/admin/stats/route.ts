import { NextRequest } from "next/server";
import { stats, orders } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, error, serverError } from "@/lib/response";

export async function GET(req: NextRequest) {
  try {
    const result = requireAdmin(req);
    if ("error" in result) return error(result.error, result.status);
    return ok({
      stats: stats.getDashboard(),
      recentOrders: stats.getRecentOrders(5),
    });
  } catch (e) { console.error(e); return serverError(); }
}
