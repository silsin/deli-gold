import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { ok, error, serverError } from "@/lib/response";
import { getDb } from "@/lib/db";
import { THEME_PALETTES, FONT_SIZE_MIN, FONT_SIZE_MAX } from "@/lib/theme";

// Ensure settings table exists
function ensureSettingsTable() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

export async function GET(req: NextRequest) {
  try {
    ensureSettingsTable();
    const db = getDb();
    const rows = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    for (const row of rows) settings[row.key] = row.value;

    // Defaults
    if (!settings.gold_markup_percent) settings.gold_markup_percent = "5";
    if (!settings.gold_fixed_fee) settings.gold_fixed_fee = "0";
    if (!settings.theme_palette) settings.theme_palette = "gold-dark";
    if (!settings.font_size_mobile) settings.font_size_mobile = "14";
    if (!settings.font_size_desktop) settings.font_size_desktop = "16";

    return ok(settings);
  } catch (e) {
    console.error(e);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = requireAdmin(req);
    if ("error" in result) return error(result.error, result.status);

    ensureSettingsTable();
    const db = getDb();
    const body = await req.json();

    for (const [key, value] of Object.entries(body)) {
      if (key === "theme_palette") {
        const valid = THEME_PALETTES.some(p => p.id === String(value));
        if (!valid) return error("پالت رنگ نامعتبر است");
      }
      if (key === "font_size_mobile" || key === "font_size_desktop") {
        const n = parseInt(String(value), 10);
        if (Number.isNaN(n) || n < FONT_SIZE_MIN || n > FONT_SIZE_MAX) {
          return error(`اندازه فونت باید بین ${FONT_SIZE_MIN} تا ${FONT_SIZE_MAX} باشد`);
        }
      }
      db.prepare(`
        INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `).run(key, String(value));
    }

    return ok({ saved: true });
  } catch (e) {
    console.error(e);
    return serverError();
  }
}
