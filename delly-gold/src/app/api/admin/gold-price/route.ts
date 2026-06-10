import { NextRequest } from "next/server";
import { ok, serverError } from "@/lib/response";

// Cache price for 5 minutes to avoid hammering the external API
let cache: { price: number; history: number[]; updatedAt: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchGoldPrice(): Promise<{ price: number; history: number[] }> {
  // Use TGJU API — free, no auth, returns 18k gold price in Rial
  const res = await fetch(
    "https://api.tgju.org/v1/market/indicator/summary-table-data/geram18",
    { next: { revalidate: 300 } }
  );

  if (!res.ok) throw new Error(`TGJU API error: ${res.status}`);

  const json = await res.json();
  // data is array of rows, each row[0] is price string like "180,057,000"
  const rows: string[][] = json?.data ?? [];

  // Parse prices — convert Rial to Toman (÷10), remove commas
  const prices = rows
    .slice(0, 14)
    .map((row: string[]) => {
      const raw = String(row[0] ?? "").replace(/,/g, "").trim();
      const rial = parseFloat(raw);
      return isNaN(rial) ? 0 : Math.round(rial / 10); // Rial → Toman
    })
    .filter(p => p > 0)
    .reverse(); // oldest first for chart

  const currentPrice = prices[prices.length - 1] ?? 0;

  return { price: currentPrice, history: prices };
}

export async function GET(req: NextRequest) {
  try {
    const now = Date.now();

    // Return cached if fresh
    if (cache && now - cache.updatedAt < CACHE_TTL) {
      return ok({ ...cache, cached: true });
    }

    const { price, history } = await fetchGoldPrice();
    cache = { price, history, updatedAt: now };

    return ok({ price, history, cached: false, updatedAt: new Date(now).toISOString() });
  } catch (e) {
    console.error("Gold price fetch error:", e);

    // Return last cached value even if stale
    if (cache) {
      return ok({ ...cache, cached: true, stale: true });
    }

    // Fallback hardcoded price if API completely fails
    return ok({
      price: 6185000,
      history: [5800000, 5900000, 5950000, 6000000, 6050000, 6100000, 6150000, 6185000],
      cached: false,
      fallback: true,
    });
  }
}
