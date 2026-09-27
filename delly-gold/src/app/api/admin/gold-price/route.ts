import { NextRequest } from "next/server";
import { ok, serverError } from "@/lib/response";

export interface GoldRates {
  gold18k?: number;
  gold24k?: number;
  ounceDollar?: number;
  mazanehTehran?: number;
  coinOld?: number;
  coinNew?: number;
  coinHalf?: number;
  coinQuarter?: number;
  coinGram?: number;
}

export interface GoldMarketData {
  source: "estjt" | "tgju" | "fallback";
  sourceTitle: string;
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
  rates?: GoldRates;
  cached?: boolean;
  stale?: boolean;
  fallback?: boolean;
}

/** In-memory cache for 60s (1 minute). */
let cache: GoldMarketData | null = null;
const CACHE_TTL = 60 * 1000;

const p2e: Record<string, string> = {
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};

function parsePersianInt(str: string): number {
  const digits = String(str || "").replace(/[۰-۹]/g, (m) => p2e[m] ?? "").replace(/[^0-9]/g, "");
  return parseInt(digits, 10) || 0;
}

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

/**
 * Source 1: اتحادیه فروشندگان و سازندگان طلا و جواهر تهران (estjt.ir)
 * Fetches real-time reference rates for 18k/24k gold, mazaneh, and all coin variants.
 */
async function fetchFromEstjt(): Promise<GoldMarketData | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch("https://www.estjt.ir/price/", {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
    });

    if (!res.ok) return null;
    const html = await res.text();

    const trRegex = /<tr[\s\S]*?<\/tr>/gi;
    const thtdRegex = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi;

    const parsed: Record<
      string,
      { currentRial: number; yesterdayRial: number; isUp: boolean }
    > = {};

    const trs = html.match(trRegex) || [];
    for (const tr of trs) {
      const cells = (tr.match(thtdRegex) || []).map((c) =>
        c.replace(/<[^>]+>/g, "").trim().replace(/\s+/g, " ")
      );
      if (cells.length >= 6) {
        const title = cells[0];
        const currentRial = parsePersianInt(cells[1]);
        const yesterdayRial = parsePersianInt(cells[4]);
        const isUp = tr.includes('class="asc"') || !tr.includes('class="desc"');
        if (currentRial > 0) {
          parsed[title] = { currentRial, yesterdayRial, isUp };
        }
      }
    }

    const gold18 = parsed["طلای ۱۸ عیار"];
    if (!gold18 || gold18.currentRial <= 0) return null;

    const priceToman = Math.round(gold18.currentRial / 10);
    const yesterdayToman = Math.round(gold18.yesterdayRial / 10);
    const changeAmount = Math.abs(priceToman - yesterdayToman);
    const changePercentNum = yesterdayToman > 0
      ? (((priceToman - yesterdayToman) / yesterdayToman) * 100).toFixed(2)
      : "0.00";

    const rates: GoldRates = {
      gold18k: priceToman,
      gold24k: Math.round((parsed["طلای ۲۴ عیار"]?.currentRial ?? 0) / 10) || undefined,
      mazanehTehran: Math.round((parsed["مظنه تهران"]?.currentRial ?? 0) / 10) || undefined,
      ounceDollar: parsed["انس طلا"]?.currentRial || undefined,
      coinOld: Math.round((parsed["سکه طرح قدیم"]?.currentRial ?? 0) / 10) || undefined,
      coinNew: Math.round((parsed["سکه طرح جدید"]?.currentRial ?? 0) / 10) || undefined,
      coinHalf: Math.round((parsed["نیم سکه"]?.currentRial ?? 0) / 10) || undefined,
      coinQuarter: Math.round((parsed["ربع سکه"]?.currentRial ?? 0) / 10) || undefined,
      coinGram: Math.round((parsed["سکه یک گرمی"]?.currentRial ?? 0) / 10) || undefined,
    };

    const prevHist = cache?.history?.length ? cache.history : [yesterdayToman, priceToman];
    const history = [...prevHist.slice(-19), priceToman];

    return {
      source: "estjt",
      sourceTitle: "اتحادیه طلا و جواهر تهران",
      price: priceToman,
      open: yesterdayToman || priceToman,
      high: Math.max(priceToman, yesterdayToman),
      low: Math.min(priceToman, yesterdayToman || priceToman),
      changeAmount,
      changePercent: changePercentNum,
      isUp: gold18.isUp,
      history,
      dates: [new Date().toISOString().slice(0, 10)],
      updatedAt: Date.now(),
      rates,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Source 2: شبکه اطلاع‌رسانی طلا و ارز (TGJU) — reliable fallback
 */
async function fetchFromTgju(): Promise<GoldMarketData | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(
      "https://api.tgju.org/v1/market/indicator/summary-table-data/geram18",
      {
        cache: "no-store",
        signal: controller.signal,
      }
    );

    if (!res.ok) return null;

    const json = await res.json();
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
        const date = String(row[6] ?? "").trim();

        const changeAmount = parseRial(changeHtml.replace(/[^0-9,]/g, ""));
        const changePercent = changePctHtml.replace(/[^0-9.%]/g, "");
        const isUp = String(row[4] ?? "").includes("high");

        return { close, open, high, low, changeAmount, changePercent, isUp, date };
      })
      .filter((r) => r.close > 0)
      .reverse();

    if (parsed.length === 0) return null;
    const latest = parsed[parsed.length - 1];

    return {
      source: "tgju",
      sourceTitle: "شبکه اطلاع‌رسانی طلا و ارز (TGJU)",
      price: latest.close,
      open: latest.open,
      high: latest.high,
      low: latest.low,
      changeAmount: latest.changeAmount,
      changePercent: latest.changePercent || "0",
      isUp: latest.isUp,
      history: parsed.map((r) => r.close),
      dates: parsed.map((r) => r.date),
      updatedAt: Date.now(),
      rates: {
        gold18k: latest.close,
      },
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(_req: NextRequest) {
  try {
    const now = Date.now();

    if (cache && now - cache.updatedAt < CACHE_TTL) {
      return ok({ ...cache, cached: true });
    }

    // Priority 1: اتحادیه طلا و جواهر تهران (estjt.ir)
    let freshData = await fetchFromEstjt();

    // Priority 2: TGJU API as reliable fallback
    if (!freshData) {
      freshData = await fetchFromTgju();
    }

    if (freshData) {
      cache = { ...freshData, updatedAt: now };
      return ok({
        ...cache,
        cached: false,
        updatedAt: new Date(now).toISOString(),
      });
    }

    if (cache) {
      return ok({ ...cache, cached: true, stale: true });
    }

    // Priority 3: Fallback data
    const fallbackPrice = 23865400;
    return ok({
      source: "fallback",
      sourceTitle: "نرخ پایه سامانه",
      price: fallbackPrice,
      open: fallbackPrice,
      high: fallbackPrice,
      low: fallbackPrice,
      changeAmount: 0,
      changePercent: "0.00",
      isUp: true,
      history: [fallbackPrice],
      dates: [],
      cached: false,
      fallback: true,
      rates: {
        gold18k: fallbackPrice,
      },
      updatedAt: new Date(now).toISOString(),
    });
  } catch (e) {
    console.error("Gold price fetch error:", e);

    if (cache) {
      return ok({ ...cache, cached: true, stale: true });
    }

    const fallbackPrice = 23865400;
    return ok({
      source: "fallback",
      sourceTitle: "نرخ پایه سامانه",
      price: fallbackPrice,
      open: fallbackPrice,
      high: fallbackPrice,
      low: fallbackPrice,
      changeAmount: 0,
      changePercent: "0.00",
      isUp: true,
      history: [fallbackPrice],
      dates: [],
      cached: false,
      fallback: true,
      rates: {
        gold18k: fallbackPrice,
      },
      updatedAt: new Date().toISOString(),
    });
  }
}
