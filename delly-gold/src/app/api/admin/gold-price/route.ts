import { NextRequest } from "next/server";
import { ok, serverError } from "@/lib/response";

// Cache for 30 seconds for near-real-time updates
let cache: {
  price: number;
  history: number[];
  dates: string[];
  open: number;
  high: number;
  low: number;
  changeAmount: number;
  changePercent: string;
  isUp: boolean;
  updatedAt: number;
} | null = null;

const CACHE_TTL = 30 * 1000; // 30 seconds

interface TgjuRow {
  close: number;
  open: number;
  high: number;
  low: number;
  changeAmount: number;
  changePercent: string;
  isUp: boolean;
  date: string;
}

function parseRial(raw: string): number {
  const cleaned = String(raw ?? "").replace(/,/g, "").trim();
  const rial = parseFloat(cleaned);
  return isNaN(rial) ? 0 : Math.round(rial / 10); // Rial → Toman
}

function stripHtml(raw: string): string {
  return String(raw ?? "").replace(/<[^>]+>/g, "").trim();
}

async function fetchGoldPrice() {
  const res = await fetch(
    "https://api.tgju.org/v1/market/indicator/summary-table-data/geram18",
    {
      // No Next.js cache — we do our own in-memory cache
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error(`TGJU API error: ${res.status}`);

  const json = await res.json();
  // Each row: [close, open, high, low, changeHTML, changePctHTML, dateGregorian, dateJalali]
  const rows: string[][] = json?.data ?? [];

  const parsed: TgjuRow[] = rows
    .slice(0, 20)
    .map((row: string[]) => {
      const close = parseRial(row[0]);
      const open = parseRial(row[1]);
      const high = parseRial(row[2]);
      const low = parseRial(row[3]);
      const changeHtml = stripHtml(row[4] ?? "");
      const changePctHtml = stripHtml(row[5] ?? "");
      const date = String(row[6] ?? "").trim(); // Gregorian date

      const changeAmount = parseRial(changeHtml.replace(/[^0-9,]/g, ""));
      const changePercent = changePctHtml.replace(/[^0-9.%]/g, "");

      // Detect direction from the HTML class
      const isUp = String(row[4] ?? "").includes("high");

      return { close, open, high, low, changeAmount, changePercent, isUp, date };
    })
    .filter((r) => r.close > 0)
    .reverse(); // oldest first

  const latest = parsed[parsed.length - 1];

  return {
    price: latest?.close ?? 0,
    open: latest?.open ?? 0,
    high: latest?.high ?? 0,
    low: latest?.low ?? 0,
    changeAmount: latest?.changeAmount ?? 0,
    changePercent: latest?.changePercent ?? "0",
    isUp: latest?.isUp ?? false,
    history: parsed.map((r) => r.close),
    dates: parsed.map((r) => r.date),
  };
}

export async function GET(_req: NextRequest) {
  try {
    const now = Date.now();

    if (cache && now - cache.updatedAt < CACHE_TTL) {
      return ok({ ...cache, cached: true });
    }

    const data = await fetchGoldPrice();
    cache = { ...data, updatedAt: now };

    return ok({
      ...data,
      cached: false,
      updatedAt: new Date(now).toISOString(),
    });
  } catch (e) {
    console.error("Gold price fetch error:", e);

    if (cache) {
      return ok({ ...cache, cached: true, stale: true });
    }

    // Hardcoded fallback
    const now = Date.now();
    return ok({
      price: 18005700,
      open: 17891600,
      high: 18122700,
      low: 17925100,
      changeAmount: 138100,
      changePercent: "0.77",
      isUp: false,
      history: [
        19149800, 19217900, 19388400, 19506200, 19588500, 19586400, 19287600,
        19147900, 18259100, 18560200, 18281400, 18213200, 18230200, 18133200,
        18005700,
      ],
      dates: [],
      cached: false,
      fallback: true,
      updatedAt: new Date(now).toISOString(),
    });
  }
}
