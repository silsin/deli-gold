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
 * estjt is the primary source, so it gets two attempts (a timeout *or* a page
 * without the rate table — a Cloudflare hiccup — both count as a failure).
 * The whole request shares one deadline, so a fallback can still answer.
 */
async function fetchFromEstjt(deadline: number): Promise<GoldMarketData | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const left = deadline - Date.now();
    if (left < 1500) break;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(left, 3500));
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
      if (res.ok) {
        const built = parseEstjtHtml(await res.text());
        if (built) return built;
      }
    } catch {
      /* fall through to the retry */
    } finally {
      clearTimeout(timer);
    }
    if (deadline - Date.now() < 1500) break;
    await new Promise(r => setTimeout(r, 250));
  }
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

export async function GET(req: NextRequest) {
  const param = new URL(req.url).searchParams.get("source");
  const requested: PriceSourceChoice = isChoice(param) ? param : storedChoice() ?? "auto";

  try {
    const now = Date.now();

    const hit = caches[requested];
    if (hit && now - hit.updatedAt < CACHE_TTL) {
      return ok(respond(hit, requested, true));
    }
    // Upstream was flaky last cycle — serve the memo and give it a breather.
    if (hit && now < (holdUntil[requested] ?? 0)) {
      return ok(respond(hit, requested, true, true));
    }

    const wantEstjt = requested === "auto" || requested === "estjt";
    const known = loadSnapshot();
    // One budget for the whole request: a slow primary must still leave room
    // for the fallback (serverless functions are killed at ~10s).
    const deadline = now + 10_000;

    let estjt: GoldMarketData | null = null;
    let tgju: GoldMarketData | null = null;
    let fresh: GoldMarketData | null = null;

    if (requested === "tgju") {
      fresh = await fetchFromTgju(knownMemo(known), deadline);
    } else if (wantEstjt) {
      estjt = await fetchFromEstjt(deadline);
      if (requested === "estjt") {
        fresh = estjt;
      } else {
        // auto — TGJU is only consulted when estjt leaves a gap, so the
        // default path stays a single upstream request.
        const needGapFill = missingRateCount(estjt?.rates) > 0;
        if (needGapFill) tgju = await fetchFromTgju(knownMemo(known), deadline);
        fresh = mergeSources(estjt, tgju);
        if (!estjt && tgju) {
          fresh = { ...tgju, note: "اتحادیه طلا در دسترس نبود — نرخ‌ها از TGJU نمایش داده می‌شود" };
        }
      }
    }

    if (fresh) {
      fresh = markPartial({ ...fresh, updatedAt: now });
      caches[requested] = fresh;
      holdUntil[requested] = (fresh.staleRates?.length ?? 0) > 0 ? now + STALE_HOLD : 0;
      saveSnapshot(fresh);
      return ok(respond(fresh, requested, false));
    }

    if (caches[requested]) return ok(respond(caches[requested]!, requested, true, true));

    // Both upstreams are down — serve the last stored reading rather than a
    // blank board or a hard-coded number.
    if (known) {
      const restored = snapshotPayload(known);
      caches[requested] = restored;
      return ok(respond(restored, requested, true, true));
    }

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


