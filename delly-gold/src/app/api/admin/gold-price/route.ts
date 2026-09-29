import { NextRequest } from "next/server";
import { ok } from "@/lib/response";
import { getSetting, setSetting } from "@/lib/settings";

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

/** Per-rate delta vs. yesterday (Toman — USD for the ounce). */
export interface RateChange {
  amount: number;
  percent: number;
  isUp: boolean;
}

/** Which source to read: auto = estjt first with TGJU gap-fill. */
export type PriceSourceChoice = "auto" | "estjt" | "tgju";

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
  changes?: Partial<Record<keyof GoldRates, RateChange>>;
  cached?: boolean;
  stale?: boolean;
  fallback?: boolean;
  /** Primary source that produced this payload. */
  sourceKey?: "estjt" | "tgju";
  /** Echo of what the caller requested (auto | estjt | tgju). */
  requested?: PriceSourceChoice;
  /** True when the chosen source does not cover every rate. */
  partial?: boolean;
  /** True when estjt + TGJU were combined (auto mode). */
  merged?: boolean;
  /** Rate keys shown from the in-memory memo (source hiccup this cycle). */
  staleRates?: string[];
  /** Why the payload came from a different source than requested (e.g. a fallback). */
  note?: string;
  /** The union's own «آخرین بروزرسانی قیمت» stamp, when the board supplied it. */
  unionUpdatedAt?: string;
}

const ESTJT_TV_URL = "https://www.estjt.ir/tv/";
const ESTJT_PRICE_URL = "https://www.estjt.ir/price/";

/** `data-field` codes used by the union's board at /tv/. */
const ESTJT_TV_FIELDS: Record<string, keyof GoldRates> = {
  IRG18: "gold18k",
  IRG24: "gold24k",
  IRG17: "mazanehTehran",
  GOLD: "ounceDollar",
  IRCOLD: "coinOld",
  IRCNEW: "coinNew",
  IRC2: "coinHalf",
  IRC4: "coinQuarter",
  IRCGRAM: "coinGram",
};

/**
 * `▲ ۱٫۵۹٪` → +1.59, `▼ ۳٫۱۶٪` → -3.16.
 * The union uses `٫` as a DECIMAL point here (unlike the price cells, where it
 * is a thousands separator), so only the first separator is kept.
 */
function parsePctCell(raw: string): number | null {
  const text = String(raw ?? "").replace(/\s+/g, " ").trim();
  const token = text.match(/[۰-۹٠-٩0-9][۰-۹٠-٩0-9.,٫٬]*/);
  if (!token) return null;
  const digits = toAscii(token[0]);
  const decimal = digits.match(/^(\d+)[.,٫٬](\d+)/);
  const n = decimal
    ? parseInt(decimal[1], 10) + parseInt(decimal[2], 10) / Math.pow(10, decimal[2].length)
    : parseInt(digits.replace(/[^0-9]/g, ""), 10);
  if (!isFinite(n)) return null;
  return text.includes("▼") || text.includes("↓") ? -n : n;
}

const ALL_RATE_KEYS: (keyof GoldRates)[] = [
  "gold18k", "gold24k", "mazanehTehran", "ounceDollar",
  "coinOld", "coinNew", "coinHalf", "coinQuarter", "coinGram",
];

/** In-memory cache — one entry per requested source, 60s TTL. */
const caches: Partial<Record<PriceSourceChoice, GoldMarketData>> = {};
/** Set when an upstream came back partly cached — hold off re-polling it. */
const holdUntil: Partial<Record<PriceSourceChoice, number>> = {};
const CACHE_TTL = 60 * 1000;
const STALE_HOLD = 3 * 60 * 1000;

const p2e: Record<string, string> = {
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};
const a2e: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

function toAscii(raw: string): string {
  return String(raw ?? "")
    .replace(/[۰-۹]/g, (m) => p2e[m] ?? "")
    .replace(/[٠-٩]/g, (m) => a2e[m] ?? "");
}

/**
 * Parse a price cell like `۲۳٫۸۴۶٫۹۰۰` / `$ ۴۲۸۵` → integer.
 * NOTE: estjt.ir prints **Toman** (its `٫` is a thousands separator),
 * while the TGJU API prints Rial — callers convert Rial → Toman themselves.
 */
function parsePriceCell(raw: string): number {
  const digits = toAscii(raw).replace(/[^0-9]/g, "");
  return parseInt(digits, 10) || 0;
}

/** Parse `۳۴٫۵۸۶ (۰٫۱۵)` → { amount: 34586, percent: 0.15 }. */
function parseChangeCell(raw: string): { amount: number; percent: number } {
  const ascii = toAscii(raw ?? "");
  const paren = ascii.match(/\(([^)]*)\)/);
  const main = ascii.split("(")[0];
  const amount = parseInt(main.replace(/[^0-9]/g, ""), 10) || 0;
  const percent = paren ? parseFloat(paren[1].replace(/[^0-9.]/g, "")) || 0 : 0;
  return { amount, percent };
}

/** Map an estjt row title to a rates key. Null for header/unknown rows. */
function estjtKey(name: string): keyof GoldRates | null {
  const n = name.replace(/\s+/g, "");
  if (n.includes("انس")) return "ounceDollar";
  if (n.includes("مظنه")) return "mazanehTehran";
  if (n.includes("۱۸") || n.includes("18")) return "gold18k";
  if (n.includes("۲۴") || n.includes("24")) return "gold24k";
  if (n.includes("قدیم")) return "coinOld";
  if (n.includes("جدید") || n.includes("امامی")) return "coinNew";
  if (n.includes("نیم")) return "coinHalf";
  if (n.includes("ربع")) return "coinQuarter";
  if (n.includes("گرمی")) return "coinGram";
  return null;
}

/**
 * Source 1 — اتحادیه طلا و جواهر تهران (estjt.ir/price).
 * Columns: [name, current, high, low, yesterday avg, change `۳۴٫۵۸۶ (۰٫۱۵)`].
 * Values on that page are already in **Toman** — no conversion applied.
 */
function parseEstjtHtml(html: string): GoldMarketData | null {
  const found: Partial<Record<keyof GoldRates, {
    value: number; yesterday: number; high: number; low: number; delta: number; pct: number;
  }>> = {};

  const trs = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  for (const tr of trs) {
    const cells = (tr.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) || []).map((c) =>
      c.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()
    );
    if (cells.length < 2) continue;
    const key = estjtKey(cells[0]);
    if (!key) continue;
    const value = parsePriceCell(cells[1]);
    if (!value) continue;

    let yesterday = 0, high = 0, low = 0, delta = 0, pct = 0;
    if (cells.length >= 6) {
      high = parsePriceCell(cells[2]);
      low = parsePriceCell(cells[3]);
      yesterday = parsePriceCell(cells[4]);
      const ch = parseChangeCell(cells[5]);
      delta = ch.amount; pct = ch.percent;
    } else if (cells.length >= 3) {
      const ch = parseChangeCell(cells[2]);
      delta = ch.amount; pct = ch.percent;
    }
    // Derive delta from yesterday's value whenever possible (sign-safe).
    if (yesterday > 0) {
      delta = value - yesterday;
      pct = (delta / yesterday) * 100;
    }
    found[key] = { value, yesterday, high, low, delta, pct };
  }

  const g18 = found.gold18k;
  if (!g18 || !g18.value) return null;

  const rates: GoldRates = {};
  const changes: Partial<Record<keyof GoldRates, RateChange>> = {};
  for (const key of ALL_RATE_KEYS) {
    const hit = found[key];
    if (!hit || !hit.value) continue;
    rates[key] = hit.value;
    changes[key] = {
      amount: Math.round(hit.delta),
      percent: Math.round(hit.pct * 100) / 100,
      isUp: hit.delta >= 0,
    };
  }

  const head = changes.gold18k;
  const price = rates.gold18k ?? 0;
  return {
    source: "estjt",
    sourceTitle: "اتحادیه طلا و جواهر تهران (estjt.ir)",
    price,
    history: [price],
    dates: [],
    open: g18.yesterday || price,
    high: g18.high || price,
    low: g18.low || price,
    changeAmount: head?.amount ?? 0,
    changePercent: String(head?.percent ?? 0),
    isUp: head?.isUp ?? true,
    updatedAt: Date.now(),
    rates,
    changes,
    sourceKey: "estjt",
  };
}

/**
 * The union's own board (estjt.ir/tv) — this is the canonical «نرخ اتحادیه».
 * Same numbers as /price/ but with stable `data-field` keys and their own
 * «آخرین بروزرسانی قیمت» stamp, which we pass through to the storefront.
 */
function parseEstjtTvHtml(html: string): GoldMarketData | null {
  const rates: GoldRates = {};
  const changes: Partial<Record<keyof GoldRates, RateChange>> = {};

  const cardRe = /tt-price-card__label">([^<]+)<\/span>\s*<span[^>]*data-field="([A-Z0-9_]+)"[^>]*>\s*([^<]+?)\s*<\/span>\s*<span[^>]*data-field-delta="[A-Z0-9_]+"[^>]*>\s*([^<]+?)\s*<\/span>/gi;
  for (const m of html.matchAll(cardRe)) {
    const key = ESTJT_TV_FIELDS[m[2]];
    if (!key) continue;
    const value = parsePriceCell(m[3]);
    if (!value) continue;
    rates[key] = value;
    const pct = parsePctCell(m[4]);
    // The board only publishes a percentage — recover the absolute change.
    const prev = pct !== null && pct > -100 ? value / (1 + pct / 100) : 0;
    changes[key] = {
      amount: prev ? Math.round(value - prev) : 0,
      percent: pct === null ? 0 : Math.round(pct * 100) / 100,
      isUp: (pct ?? 0) >= 0,
    };
  }

  if (!rates.gold18k) return null;

  // Their own «آخرین بروزرسانی قیمت» stamp — proves how fresh the board is.
  const stampMatch = html.match(/id="tt-price-date"[^>]*>\s*([^<]{5,60}?)\s*</);
  const unionUpdatedAt = stampMatch ? stampMatch[1].replace(/\s+/g, " ").trim() : undefined;

  const head = changes.gold18k;
  const price = rates.gold18k;
  return {
    source: "estjt",
    sourceTitle: "اتحادیه طلا و جواهر تهران — تابلو رسمی (estjt.ir)",
    price,
    history: [price],
    dates: [],
    open: head?.amount ? price - head.amount : price,
    high: price,
    low: price,
    changeAmount: head?.amount ?? 0,
    changePercent: String(head?.percent ?? 0),
    isUp: head?.isUp ?? true,
    updatedAt: Date.now(),
    rates,
    changes,
    sourceKey: "estjt",
    unionUpdatedAt,
  };
}

/** One HTML fetch with its own timeout slice, never exceeding the route budget. */
/**
 * How long we let the union answer.
 *
 * Measured on 2026-09-28 the union alternates between ~1.5s (fine) and
 * ~30-40s TTFB (its origin is saturated). A short cap meant every single
 * fetch was aborted before it replied, so the displayed «نرخ اتحادیه» stayed
 * frozen on an old snapshot. The upstream is far slower than any shopper's
 * patience, but NOT slower than a background job, so the generous cap lives
 * here — while user requests keep being served instantly from the cache.
 *
 * 75s is still far below the 300s serverless ceiling.
 */
const ESTJT_TV_CAP = 75_000;

/** One fetch with its own cap, never exceeding the caller's budget. */
async function fetchHtml(url: string, deadline: number, cap: number): Promise<string | null> {
  const left = deadline - Date.now();
  if (left < 1500) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.min(left, cap));
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
/**
 * Primary rate read: the union's board first (it is what customers compare
 * against), then their price table (which also carries yesterday's average).
 * Both are Toman; no conversion is applied.
 *
 * The board gets the full `ESTJT_TV_CAP`; the price table is only a backup, so
 * it gets whatever is left of the budget. One retry: when the union is
 * saturated a second attempt frequently lands in ~2s instead of 40s.
 */
async function fetchFromEstjt(deadline: number): Promise<GoldMarketData | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const left = deadline - Date.now();
    if (left < 3000) return null;

    const tv = await fetchHtml(ESTJT_TV_URL, deadline, Math.min(left, ESTJT_TV_CAP));
    if (tv) {
      const board = parseEstjtTvHtml(tv);
      if (board) return board;
    }

    // Saturated origin — give it a short breath, then try once more.
    if (deadline - Date.now() > 3000) {
      await new Promise(r => setTimeout(r, 400));
    }
  }

  const left = deadline - Date.now();
  if (left < 2000) return null;
  const price = await fetchHtml(ESTJT_PRICE_URL, deadline, left);
  if (price) return parseEstjtHtml(price);
  return null;
}

/* ─────────────────────────  Source 2 — TGJU  ───────────────────────── */

const TGJU_INDICATORS: { slug: string; key: keyof GoldRates }[] = [
  { slug: "geram18", key: "gold18k" },     // طلای ۱۸ عیار (Rial)
  { slug: "geram24", key: "gold24k" },     // طلای ۲۴ عیار (Rial)
  { slug: "ons",     key: "ounceDollar" }, // انس (USD)
  { slug: "sekee",   key: "coinNew" },     // سکه امامی / طرح جدید
  { slug: "sekeb",   key: "coinOld" },     // سکه طرح قدیم
  { slug: "nim",     key: "coinHalf" },    // نیم سکه
  { slug: "rob",     key: "coinQuarter" }, // ربع سکه
  { slug: "gerami",  key: "coinGram" },    // سکه گرمی
];

interface TgjuRow { close: number; change: number; pct: number; date: string }

/** Last good value per indicator — keeps cards filled through TGJU outages. */
const tgjuMemo: Partial<Record<keyof GoldRates, RateChange & { value: number }>> = {};

async function fetchTgjuRowOnce(slug: string, signal: AbortSignal): Promise<TgjuRow | null> {
  const res = await fetch(
    `https://api.tgju.org/v1/market/indicator/summary-table-data/${slug}`,
    {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal,
    }
  );
  if (!res.ok) return null;
  const json = await res.json();
  const row = Array.isArray(json?.data) ? json.data[0] : null;
  if (!Array.isArray(row)) return null;
  const close = parseFloat(String(row[0] ?? "").replace(/,/g, ""));
  if (!isFinite(close) || close <= 0) return null;
  const change = parseFloat(String(row[4] ?? "").replace(/[^0-9.\-]/g, ""));
  const pct = parseFloat(String(row[5] ?? "").replace(/[^0-9.]/g, ""));
  return {
    close,
    change: isFinite(change) ? change : 0,
    pct: isFinite(pct) ? pct : 0,
    date: String(row[7] ?? ""),
  };
}

/**
 * TGJU throttles bursts and answers 500 under load, so every indicator is
 * retried once — all inside one deadline so a slow upstream can never hang
 * the request (serverless kills the function long before that).
 */
async function fetchTgjuRow(slug: string, deadline: number): Promise<TgjuRow | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const left = deadline - Date.now();
    if (left < 1200) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(left, 2500));
    try {
      const hit = await fetchTgjuRowOnce(slug, controller.signal);
      if (hit) return hit;
    } catch {
      /* fall through to the retry */
    } finally {
      clearTimeout(timer);
    }
    if (deadline - Date.now() < 1200) return null;
    await new Promise(r => setTimeout(r, 250));
  }
  return null;
}

/** TGJU quotes Rial — divide by 10 → Toman (the ounce stays in USD). */
async function fetchFromTgju(
  fallback?: Partial<Record<keyof GoldRates, RateChange & { value: number }>>,
  hardDeadline?: number
): Promise<GoldMarketData | null> {
  const rates: GoldRates = {};
  const changes: Partial<Record<keyof GoldRates, RateChange>> = {};
  const staleRates: string[] = [];
  const dates: string[] = [];
  const budget = Math.min(Date.now() + 9_000, hardDeadline ?? Infinity);
  const deadline = budget;

  // 3 indicators at a time: a burst of 8 reliably trips TGJU's rate limiter.
  for (let i = 0; i < TGJU_INDICATORS.length; i += 3) {
    if (Date.now() >= deadline) break;
    const chunk = TGJU_INDICATORS.slice(i, i + 3);
    const rows = await Promise.all(chunk.map(c => fetchTgjuRow(c.slug, deadline)));

    chunk.forEach((ind, j) => {
      const row = rows[j];
      const isUsd = ind.key === "ounceDollar";

      if (!row) {
        // Keep the last known figure (in-memory, then the DB snapshot)
        // instead of showing an empty card.
        const memo = tgjuMemo[ind.key] ?? fallback?.[ind.key];
        if (!memo) return;
        rates[ind.key] = memo.value;
        changes[ind.key] = { amount: memo.amount, percent: memo.percent, isUp: memo.isUp };
        staleRates.push(ind.key);
        return;
      }
      const value = isUsd ? Math.round(row.close) : Math.round(row.close / 10);
      const amount = isUsd ? Math.round(row.change) : Math.round(row.change / 10);
      const percent = Math.round(row.pct * 100) / 100;
      const isUp = row.change >= 0;

      rates[ind.key] = value;
      changes[ind.key] = { amount, percent, isUp };
      tgjuMemo[ind.key] = { value, amount, percent, isUp };
      if (row.date) dates.push(row.date);
    });

    // The first chunk answers the question: if even the three core indicators
    // failed the source is down — stop instead of burning the whole budget.
    if (i === 0 && !rows.some(Boolean)) break;

    if (i + 3 < TGJU_INDICATORS.length) await new Promise(r => setTimeout(r, 200));
  }

  // Anything we could not reach this cycle keeps its last known value —
  // a tight budget must never turn into an empty card.
  for (const ind of TGJU_INDICATORS) {
    if (rates[ind.key]) continue;
    const memo = tgjuMemo[ind.key] ?? fallback?.[ind.key];
    if (!memo) continue;
    rates[ind.key] = memo.value;
    changes[ind.key] = { amount: memo.amount, percent: memo.percent, isUp: memo.isUp };
    staleRates.push(ind.key);
  }

  if (!rates.gold18k) return null;
  const head = changes.gold18k;
  const price = rates.gold18k;
  return {
    source: "tgju",
    sourceTitle: "شبکه اطلاع‌رسانی طلا و ارز (TGJU)",
    price,
    history: [price],
    dates,
    open: price - (head?.amount ?? 0),
    high: price,
    low: price,
    changeAmount: head?.amount ?? 0,
    changePercent: String(head?.percent ?? 0),
    isUp: head?.isUp ?? true,
    updatedAt: Date.now(),
    rates,
    changes,
    staleRates,
    sourceKey: "tgju",
  };
}

/* ───────────────────────────  Orchestration  ─────────────────────────── */

function isChoice(v: string | null): v is PriceSourceChoice {
  return v === "auto" || v === "estjt" || v === "tgju";
}

/** Site-wide default chosen in Admin → تنظیمات (gold_price_source). */
function storedChoice(): PriceSourceChoice | null {
  try {
    const v = getSetting("gold_price_source")?.trim() ?? "";
    return isChoice(v) ? v : null;
  } catch {
    return null;
  }
}

function markPartial(d: GoldMarketData): GoldMarketData {
  const r = d.rates ?? {};
  return { ...d, partial: ALL_RATE_KEYS.some((k) => !r[k]) };
}

/** How many of the nine published rates a payload is missing. */
function missingRateCount(rates: GoldRates | undefined): number {
  return ALL_RATE_KEYS.reduce((n, k) => (rates?.[k] ? n : n + 1), 0);
}

/** auto mode: estjt is primary, TGJU fills any rate estjt did not return. */
function mergeSources(
  estjt: GoldMarketData | null,
  tgju: GoldMarketData | null
): GoldMarketData | null {
  if (!estjt && !tgju) return null;
  if (!estjt) return tgju;
  if (!tgju) return estjt;
  return {
    ...estjt,
    rates: { ...(tgju.rates ?? {}), ...(estjt.rates ?? {}) },
    changes: { ...(tgju.changes ?? {}), ...(estjt.changes ?? {}) },
    merged: true,
    sourceTitle: `${estjt.sourceTitle} + TGJU`,
  };
}

/** Serialize for the response — `updatedAt` is always an ISO string. */
function respond(d: GoldMarketData, requested: PriceSourceChoice, cached: boolean, stale = false) {
  const { updatedAt, ...rest } = d;
  return {
    ...rest,
    requested,
    cached,
    ...(stale ? { stale: true } : {}),
    updatedAt: new Date(updatedAt).toISOString(),
  };
}

/* ── Durable snapshot: survives a cold start / total upstream outage ── */

interface RateSnapshot {
  at: number;
  sourceKey?: "estjt" | "tgju" | "fallback";
  sourceTitle: string;
  price: number;
  changeAmount: number;
  changePercent: string;
  isUp: boolean;
  rates?: GoldRates;
  changes?: Partial<Record<keyof GoldRates, RateChange>>;
  unionUpdatedAt?: string;
}

const SNAPSHOT_KEY = "gold_rates_cache";
let snapshot: RateSnapshot | null = null;

function loadSnapshot(): RateSnapshot | null {
  if (snapshot) return snapshot;
  try {
    const raw = getSetting(SNAPSHOT_KEY);
    const parsed = raw ? (JSON.parse(raw) as RateSnapshot) : null;
    if (parsed && parsed.rates?.gold18k) snapshot = parsed;
  } catch {
    snapshot = null;
  }
  return snapshot;
}

function saveSnapshot(d: GoldMarketData): void {
  if (d.source === "fallback" || !d.rates?.gold18k) return;
  const prev = loadSnapshot();
  // Merge with what we already stored: a partial read (TGJU has no مظنه)
  // must never wipe a rate the union source gave us earlier.
  const rates: GoldRates = { ...(prev?.rates ?? {}), ...d.rates };
  const changes = { ...(prev?.changes ?? {}), ...(d.changes ?? {}) };
  if (missingRateCount(rates) > 2) return;

  snapshot = {
    at: Date.now(),
    sourceKey: d.sourceKey,
    sourceTitle: d.sourceTitle,
    price: d.price,
    changeAmount: d.changeAmount,
    changePercent: d.changePercent,
    isUp: d.isUp,
    rates,
    changes,
    unionUpdatedAt: d.unionUpdatedAt,
  };
  try {
    setSetting(SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    /* read-only database — the in-memory copy still works */
  }
}

/** Rebuild a payload from the stored snapshot (flagged as stale). */
function snapshotPayload(snap: RateSnapshot): GoldMarketData {
  return {
    source: snap.sourceKey === "tgju" ? "tgju" : "estjt",
    sourceTitle: `${snap.sourceTitle} — آخرین داده ذخیره‌شده`,
    price: snap.price,
    history: [snap.price],
    dates: [],
    open: snap.price,
    high: snap.price,
    low: snap.price,
    changeAmount: snap.changeAmount,
    changePercent: snap.changePercent,
    isUp: snap.isUp,
    updatedAt: snap.at,
    rates: snap.rates,
    changes: snap.changes,
    sourceKey: snap.sourceKey === "tgju" ? "tgju" : "estjt",
    unionUpdatedAt: snap.unionUpdatedAt,
    staleRates: ALL_RATE_KEYS,
  };
}

/** Snapshot → per-rate memo shape, so TGJU can reuse the last known values. */
function knownMemo(
  snap: RateSnapshot | null
): Partial<Record<keyof GoldRates, RateChange & { value: number }>> | undefined {
  if (!snap?.rates) return undefined;
  const out: Partial<Record<keyof GoldRates, RateChange & { value: number }>> = {};
  for (const key of ALL_RATE_KEYS) {
    const value = snap.rates[key];
    if (!value) continue;
    const chg = snap.changes?.[key];
    out[key] = {
      value,
      amount: chg?.amount ?? 0,
      percent: chg?.percent ?? 0,
      isUp: chg?.isUp ?? true,
    };
  }
  return Object.keys(out).length ? out : undefined;
}

function fallbackPayload(requested: PriceSourceChoice, at: number) {
  const price = 23865400;
  return {
    source: "fallback",
    sourceTitle: "نرخ پایه سامانه",
    price,
    open: price,
    high: price,
    low: price,
    changeAmount: 0,
    changePercent: "0.00",
    isUp: true,
    history: [price],
    dates: [],
    rates: { gold18k: price },
    cached: false,
    fallback: true,
    requested,
    partial: true,
    updatedAt: new Date(at).toISOString(),
  };
}

/**
 * Budget for a background refresh.
 *
 * Must comfortably cover the union's worst case (2 attempts × 75s cap) plus the
 * TGJU gap-fill, so a saturated origin no longer kills the cycle. Only
 * background jobs use this — shoppers are always served from the cache.
 */
const REFRESH_BUDGET = 190_000;

/**
 * Fetch a fresh reading and store it.
 *
 * The union's server can take 30-40s at peak (and occasionally retries), so this
 * is normally run in the background (see scheduleRefresh) and by the poller in
 * `lib/gold-price-poller` — never while a shopper waits.
 */
async function refreshChoice(choice: PriceSourceChoice, budgetMs: number): Promise<GoldMarketData | null> {
  const now = Date.now();
  const deadline = now + budgetMs;
  const knownMemoForChoice = knownMemo(loadSnapshot());

  let estjt: GoldMarketData | null = null;
  let tgju: GoldMarketData | null = null;
  let fresh: GoldMarketData | null = null;

  if (choice === "tgju") {
    fresh = await fetchFromTgju(knownMemoForChoice, deadline);
  } else {
    estjt = await fetchFromEstjt(deadline);
    if (choice === "estjt") {
      fresh = estjt;
    } else {
      // auto — TGJU is only consulted when estjt leaves a gap.
      if (missingRateCount(estjt?.rates) > 0) {
        tgju = await fetchFromTgju(knownMemoForChoice, deadline);
      }
      fresh = mergeSources(estjt, tgju);
      if (!estjt && tgju) {
        fresh = { ...tgju, note: "اتحادیه طلا در دسترس نبود — نرخ‌ها از TGJU نمایش داده می‌شود" };
      }
    }
  }

  if (!fresh) return null;
  const ready = markPartial({ ...fresh, updatedAt: now });
  caches[choice] = ready;
  holdUntil[choice] = (ready.staleRates?.length ?? 0) > 0 ? now + STALE_HOLD : 0;
  saveSnapshot(ready);
  // Publish the fresh 18k rate into settings: every storefront component already
  // reads /api/admin/settings, so live pricing (lib/pricing.ts) gets the newest
  // rate with no extra request. Toman per gram.
  if (ready.price > 0) {
    try {
      setSetting("gold_live_rate", String(ready.price));
      setSetting("gold_live_rate_at", new Date(now).toISOString());
    } catch (e) {
      console.error("[gold-price] could not persist live rate:", e);
    }
  }
  return ready;
}

const refreshing: Partial<Record<PriceSourceChoice, boolean>> = {};

/** True while a background refresh for this source is in flight. */
function isRefreshing(choice: PriceSourceChoice): boolean {
  return refreshing[choice] === true;
}

/** Kick off a refresh without blocking the shopper — one in flight per source. */
function scheduleRefresh(choice: PriceSourceChoice): Promise<GoldMarketData | null> {
  if (refreshing[choice]) return Promise.resolve(caches[choice] ?? null);
  refreshing[choice] = true;
  return refreshChoice(choice, REFRESH_BUDGET)
    .catch(() => null)
    .finally(() => {
      refreshing[choice] = false;
    });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const param = url.searchParams.get("source");
  const requested: PriceSourceChoice = isChoice(param) ? param : storedChoice() ?? "auto";

  /**
   * `?refresh=1` — the shopper explicitly asked for a new price (the refresh
   * button). The request waits for a real upstream read instead of the cache,
   * so the number they see is genuinely new. It is rate-limited per source so a
   * held-down button cannot hammer the union; if a read is already running we
   * join it rather than starting a second one.
   */
  const wantsRefresh =
    url.searchParams.get("refresh") === "1" || url.searchParams.get("force") === "1";

  try {
    const now = Date.now();

    if (wantsRefresh) {
      if (isRefreshing(requested)) {
        // Someone (probably the poller) is already pulling — use the cache.
        const hit = caches[requested];
        if (hit) return ok(respond(hit, requested, true, true));
      } else {
        const fresh = await scheduleRefresh(requested);
        if (fresh) return ok(respond(fresh, requested, false));
        const staleHit = caches[requested];
        if (staleHit) return ok(respond(staleHit, requested, true, true));
        const known = loadSnapshot();
        if (known) return ok(respond(snapshotPayload(known), requested, true, true));
        return ok(fallbackPayload(requested, now));
      }
    }

    const hit = caches[requested];
    if (hit && now - hit.updatedAt < CACHE_TTL) {
      return ok(respond(hit, requested, true));
    }
    // Upstream was flaky last cycle — serve the memo and give it a breather.
    if (hit && now < (holdUntil[requested] ?? 0)) {
      return ok(respond(hit, requested, true, true));
    }

    const known = loadSnapshot();

    // Warm path: answer instantly with the last known rates and refresh in the
    // background, so a slow union server can never delay the page.
    if (hit || known) {
      scheduleRefresh(requested);
      const base = hit ?? (known ? snapshotPayload(known) : null);
      if (!base) return ok(fallbackPayload(requested, now));
      if (!hit) caches[requested] = base;
      return ok(respond(base, requested, true, true));
    }

    // Cold start: nothing stored yet, so we have to wait for a real reading.
    const cold = await scheduleRefresh(requested);
    if (cold) return ok(respond(cold, requested, false));

    return ok(fallbackPayload(requested, now));
  } catch (e) {
    console.error("Gold price fetch error:", e);

    const staleHit = caches[requested];
    if (staleHit) return ok(respond(staleHit, requested, true, true));

    const known = loadSnapshot();
    if (known) return ok(respond(snapshotPayload(known), requested, true, true));

    return ok(fallbackPayload(requested, Date.now()));
  }
}


