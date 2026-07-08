import { NextRequest } from "next/server";
import { requireAdmin, getAuthUser } from "@/lib/auth";
import { ok, error, serverError } from "@/lib/response";
import { getDb } from "@/lib/db";
import { THEME_PALETTES, FONT_SIZE_MIN, FONT_SIZE_MAX } from "@/lib/theme";
import { TYPO_SECTIONS, getDefaultTypoSettings } from "@/lib/typography";

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

    // Defaults — empty strings, no hardcoded fake data
    if (!settings.gold_markup_percent) settings.gold_markup_percent = "5";
    if (!settings.gold_fixed_fee)      settings.gold_fixed_fee = "0";
    if (!settings.theme_palette)       settings.theme_palette = "gold-dark";
    if (!settings.font_size_mobile)    settings.font_size_mobile = "14";
    if (!settings.font_size_desktop)   settings.font_size_desktop = "16";
    if (!settings.site_announcement)   settings.site_announcement = "";
    if (!settings.site_phone1)         settings.site_phone1 = "";
    if (!settings.site_phone2)         settings.site_phone2 = "";
    if (!settings.site_address)        settings.site_address = "";
    if (!settings.site_email)          settings.site_email = "";
    if (!settings.site_instagram)      settings.site_instagram = "";
    if (!settings.site_telegram)       settings.site_telegram = "";
    if (!settings.site_bale)           settings.site_bale = "";
    if (!settings.site_whatsapp)       settings.site_whatsapp = "";
    if (!settings.site_install_url)    settings.site_install_url = "";
    if (!settings.site_brand_desc)     settings.site_brand_desc = "";
    if (!settings.promo_b1_title)      settings.promo_b1_title = "";
    if (!settings.promo_b1_sub)        settings.promo_b1_sub = "";
    if (!settings.promo_b1_href)       settings.promo_b1_href = "/products";
    if (!settings.promo_b1_image)      settings.promo_b1_image = "";
    if (!settings.promo_b2_title)      settings.promo_b2_title = "";
    if (!settings.promo_b2_sub)        settings.promo_b2_sub = "";
    if (!settings.promo_b2_href)       settings.promo_b2_href = "/products";
    if (!settings.promo_b2_image)      settings.promo_b2_image = "";
    if (!settings.trust_items)         settings.trust_items = JSON.stringify([]);
    if (!settings.tawk_property_id)    settings.tawk_property_id = "";
    if (!settings.tawk_widget_id)      settings.tawk_widget_id = "default";
    if (!settings.tryon_enabled)       settings.tryon_enabled = "1";

    // Typography defaults
    const typoDefaults = getDefaultTypoSettings();
    for (const [k, v] of Object.entries(typoDefaults)) {
      if (!settings[k]) settings[k] = v;
    }
    if (!settings.nav_links)           settings.nav_links = JSON.stringify([
      {"label":"هدیه","href":"/products"},{"label":"کالکشن","href":"/collections"},
      {"label":"تخفیف‌دار","href":"/products"},{"label":"✨ پرو مجازی","href":"/tryon"},
      {"label":"گردنبند","href":"/products?category=necklaces"},{"label":"گوشواره","href":"/products?category=earrings"},
      {"label":"انگشتر","href":"/products?category=rings"},{"label":"دستبند","href":"/products?category=bracelets"},
      {"label":"ست و نیم‌ست","href":"/products"},{"label":"پابند","href":"/products"},
      {"label":"جاسوئیچی","href":"/products"},{"label":"بچه‌گانه","href":"/products"},{"label":"سکه","href":"/products"}
    ]);
    if (!settings.promo_strip_links)   settings.promo_strip_links = JSON.stringify([
      {"label":"جدیدترین محصولات","href":"/products"},
      {"label":"جدیدترین گردنبندها","href":"/products?category=necklaces"},
      {"label":"خرید اقساطی طلا","href":"/contact"},
      {"label":"جدیدترین کالکشن‌ها","href":"/collections"},
      {"label":"پرفروش‌ترین محصولات","href":"/products"},
      {"label":"جدیدترین دستبندها","href":"/products?category=bracelets"},
      {"label":"جدیدترین گوشواره‌ها","href":"/products?category=earrings"},
      {"label":"محصولات ویژه","href":"/products"}
    ]);

    const user = getAuthUser(req);
    const isAdmin = user?.role === "ADMIN";
    if (isAdmin) {
      if (!settings.huggingface_api_token) settings.huggingface_api_token = "";
    } else {
      delete settings.huggingface_api_token;
    }

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
