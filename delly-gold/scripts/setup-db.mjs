/**
 * Database setup + seed script
 * Uses Node.js 22 built-in SQLite — no extra dependencies.
 * Reads DATABASE_URL env var to find the DB file path.
 * Safe to run on every container start (fully idempotent).
 */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const bcrypt = require("bcryptjs");

// ── Resolve DB path ─────────────────────────────────────────────────────────
// DATABASE_URL can be:
//   file:/app/data/delly-gold.db   (Docker / absolute)
//   file:./prisma/dev.db           (local dev / relative)
function resolveDbPath() {
  const url = process.env.DATABASE_URL || "file:./prisma/dev.db";
  const filePart = url.replace(/^file:/, "");
  if (path.isAbsolute(filePart)) return filePart;
  return path.resolve(path.join(__dirname, ".."), filePart);
}

const DB_PATH = resolveDbPath();

// Ensure parent directory exists (important in Docker)
mkdirSync(path.dirname(DB_PATH), { recursive: true });

console.log("🗄️  Database path:", DB_PATH);

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode=WAL");
db.exec("PRAGMA foreign_keys=ON");

// ── Migrations ───────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT UNIQUE NOT NULL,
    applied_at TEXT DEFAULT (datetime('now'))
  );
`);

const migrations = [
  {
    name: "001_create_users",
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id         TEXT PRIMARY KEY,
        email      TEXT UNIQUE NOT NULL,
        password   TEXT NOT NULL,
        name       TEXT NOT NULL,
        phone      TEXT,
        role       TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK(role IN ('ADMIN','CUSTOMER')),
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `,
  },
  {
    name: "002_create_categories",
    sql: `
      CREATE TABLE IF NOT EXISTS categories (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        slug        TEXT UNIQUE NOT NULL,
        description TEXT,
        image       TEXT,
        created_at  TEXT DEFAULT (datetime('now'))
      );
    `,
  },
  {
    name: "003_create_products",
    sql: `
      CREATE TABLE IF NOT EXISTS products (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        slug        TEXT UNIQUE NOT NULL,
        description TEXT,
        price       REAL NOT NULL,
        weight      REAL NOT NULL,
        karat       INTEGER NOT NULL DEFAULT 18,
        stock       INTEGER NOT NULL DEFAULT 0,
        images      TEXT NOT NULL DEFAULT '[]',
        featured    INTEGER NOT NULL DEFAULT 0,
        published   INTEGER NOT NULL DEFAULT 1,
        category_id TEXT NOT NULL,
        created_at  TEXT DEFAULT (datetime('now')),
        updated_at  TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
    `,
  },
  {
    name: "004_create_orders",
    sql: `
      CREATE TABLE IF NOT EXISTS orders (
        id         TEXT PRIMARY KEY,
        status     TEXT NOT NULL DEFAULT 'PENDING'
                   CHECK(status IN ('PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED')),
        total      REAL NOT NULL,
        address    TEXT,
        note       TEXT,
        user_id    TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS order_items (
        id         TEXT PRIMARY KEY,
        quantity   INTEGER NOT NULL,
        price      REAL NOT NULL,
        order_id   TEXT NOT NULL,
        product_id TEXT NOT NULL,
        FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
      CREATE INDEX IF NOT EXISTS idx_orders_user   ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    `,
  },
  {
    name: "005_create_wishlist",
    sql: `
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id         TEXT PRIMARY KEY,
        user_id    TEXT NOT NULL,
        product_id TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE(user_id, product_id)
      );
    `,
  },
  {
    name: "006_user_address",
    sql: `ALTER TABLE users ADD COLUMN address TEXT;`,
  },
  {
    name: "007_product_ajrat",
    sql: `
      ALTER TABLE products ADD COLUMN ajrat_percent REAL;
      ALTER TABLE products ADD COLUMN ajrat_fixed REAL;
      ALTER TABLE products ADD COLUMN ajrat_override INTEGER NOT NULL DEFAULT 0;
    `,
  },
  {
    name: "008_category_image",
    sql: `ALTER TABLE categories ADD COLUMN banner_image TEXT;`,
  },
  {
    name: "009_hero_slides",
    sql: `
      CREATE TABLE IF NOT EXISTS hero_slides (
        id         TEXT PRIMARY KEY,
        sort_order INTEGER NOT NULL DEFAULT 0,
        tag        TEXT NOT NULL DEFAULT '',
        title1     TEXT NOT NULL DEFAULT '',
        title2     TEXT NOT NULL DEFAULT '',
        title3     TEXT NOT NULL DEFAULT '',
        subtitle   TEXT NOT NULL DEFAULT '',
        cta_label  TEXT NOT NULL DEFAULT 'مشاهده محصولات',
        cta_href   TEXT NOT NULL DEFAULT '/products',
        cta2_label TEXT NOT NULL DEFAULT '',
        cta2_href  TEXT NOT NULL DEFAULT '',
        image      TEXT NOT NULL DEFAULT '',
        bg_color   TEXT NOT NULL DEFAULT '#f2ebe0',
        accent     TEXT NOT NULL DEFAULT '#c8a12a',
        active     INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `,
  },
  {
    name: "010_site_settings_extended",
    sql: `
      INSERT OR IGNORE INTO settings (key, value) VALUES
        ('site_announcement', 'با اعتماد شما، سال‌ها طلایی ساختیم.'),
        ('site_phone1', ''),
        ('site_phone2', ''),
        ('site_address', ''),
        ('site_email', ''),
        ('site_instagram', ''),
        ('site_telegram', ''),
        ('site_whatsapp', ''),
        ('promo_banner1_title', ''),
        ('promo_banner1_sub', ''),
        ('promo_banner1_href', '/products'),
        ('promo_banner1_image', ''),
        ('promo_banner2_title', ''),
        ('promo_banner2_sub', ''),
        ('promo_banner2_href', '/products'),
        ('promo_banner2_image', '');
    `,
  },
  {
    name: "011_fix_promo_keys",
    sql: `
      INSERT OR IGNORE INTO settings (key, value)
        SELECT 'promo_b1_title', value FROM settings WHERE key = 'promo_banner1_title';
      INSERT OR IGNORE INTO settings (key, value)
        SELECT 'promo_b1_sub', value FROM settings WHERE key = 'promo_banner1_sub';
      INSERT OR IGNORE INTO settings (key, value)
        SELECT 'promo_b1_href', value FROM settings WHERE key = 'promo_banner1_href';
      INSERT OR IGNORE INTO settings (key, value)
        SELECT 'promo_b1_image', value FROM settings WHERE key = 'promo_banner1_image';
      INSERT OR IGNORE INTO settings (key, value)
        SELECT 'promo_b2_title', value FROM settings WHERE key = 'promo_banner2_title';
      INSERT OR IGNORE INTO settings (key, value)
        SELECT 'promo_b2_sub', value FROM settings WHERE key = 'promo_banner2_sub';
      INSERT OR IGNORE INTO settings (key, value)
        SELECT 'promo_b2_href', value FROM settings WHERE key = 'promo_banner2_href';
      INSERT OR IGNORE INTO settings (key, value)
        SELECT 'promo_b2_image', value FROM settings WHERE key = 'promo_banner2_image';
    `,
  },
  {
    name: "012_nav_links",
    sql: `
      INSERT OR IGNORE INTO settings (key, value) VALUES
        ('nav_links', '[{"label":"هدیه","href":"/products"},{"label":"کالکشن","href":"/collections"},{"label":"تخفیف‌دار","href":"/products"},{"label":"✨ پرو مجازی","href":"/tryon"},{"label":"گردنبند","href":"/products?category=necklaces"},{"label":"گوشواره","href":"/products?category=earrings"},{"label":"انگشتر","href":"/products?category=rings"},{"label":"دستبند","href":"/products?category=bracelets"},{"label":"ست و نیم‌ست","href":"/products"},{"label":"پابند","href":"/products"},{"label":"جاسوئیچی","href":"/products"},{"label":"بچه‌گانه","href":"/products"},{"label":"سکه","href":"/products"}]'),
        ('promo_strip_links', '[{"label":"جدیدترین محصولات","href":"/products"},{"label":"جدیدترین گردنبندها","href":"/products?category=necklaces"},{"label":"خرید اقساطی طلا","href":"/contact"},{"label":"جدیدترین کالکشن‌ها","href":"/collections"},{"label":"پرفروش‌ترین محصولات","href":"/products"},{"label":"جدیدترین دستبندها","href":"/products?category=bracelets"},{"label":"جدیدترین گوشواره‌ها","href":"/products?category=earrings"},{"label":"محصولات ویژه","href":"/products"}]');
    `,
  },
  {
    name: "013_phone_auth",
    sql: `
      ALTER TABLE users ADD COLUMN phone_login TEXT;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_login ON users(phone_login) WHERE phone_login IS NOT NULL;
    `,
  },
];

let appliedCount = 0;
for (const migration of migrations) {
  const exists = db.prepare("SELECT id FROM _migrations WHERE name = ?").get(migration.name);
  if (!exists) {
    db.exec(migration.sql);
    db.prepare("INSERT INTO _migrations (name) VALUES (?)").run(migration.name);
    console.log(`  ✅ Migration: ${migration.name}`);
    appliedCount++;
  }
}
if (appliedCount === 0) {
  console.log("  ℹ️  All migrations already applied");
}

// ── Seed ─────────────────────────────────────────────────────────────────────
function generateId() {
  return createHash("sha256")
    .update(Math.random().toString() + Date.now().toString())
    .digest("hex")
    .slice(0, 24);
}

// Admin user
const adminExists = db.prepare("SELECT id FROM users WHERE email = ?").get("admin@dellygold.com");
if (!adminExists) {
  const hash = await bcrypt.hash("Admin@1234", 12);
  db.prepare("INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)").run(
    generateId(), "admin@dellygold.com", hash, "مدیر سیستم", "ADMIN"
  );
  console.log("  ✅ Admin user created");
} else {
  console.log("  ℹ️  Admin user already exists");
}

// Categories
const categoryData = [
  { name: "گردنبند",  slug: "necklaces", description: "انواع گردنبندهای طلا" },
  { name: "انگشتر",  slug: "rings",      description: "انواع انگشترهای طلا" },
  { name: "دستبند",  slug: "bracelets",  description: "انواع دستبندهای طلا" },
  { name: "گوشواره", slug: "earrings",   description: "انواع گوشواره‌های طلا" },
];
const catIds = {};
for (const cat of categoryData) {
  const existing = db.prepare("SELECT id FROM categories WHERE slug = ?").get(cat.slug);
  if (!existing) {
    const id = generateId();
    db.prepare("INSERT INTO categories (id, name, slug, description) VALUES (?, ?, ?, ?)").run(
      id, cat.name, cat.slug, cat.description
    );
    catIds[cat.slug] = id;
  } else {
    catIds[cat.slug] = existing.id;
  }
}
console.log("  ✅ Categories ready");

// Products
const productData = [
  { name: "گردنبند قلبی طلا",      slug: "gold-heart-necklace",  price: 1750000, weight: 1.4,  karat: 18, stock: 5, category: "necklaces", featured: 1 },
  { name: "انگشتر ظریف نگین‌دار",  slug: "delicate-stone-ring",  price: 2450000, weight: 1.85, karat: 18, stock: 3, category: "rings",      featured: 1 },
  { name: "دستبند گارنت",          slug: "garnet-bracelet",      price: 3980000, weight: 2.1,  karat: 18, stock: 2, category: "bracelets",  featured: 0 },
  { name: "گوشواره حلقه‌ای",       slug: "hoop-earrings",        price: 1820000, weight: 1.3,  karat: 18, stock: 8, category: "earrings",   featured: 1 },
  { name: "گردنبند کلاسیک",        slug: "classic-necklace",     price: 2700000, weight: 1.42, karat: 18, stock: 4, category: "necklaces",  featured: 0 },
  { name: "النگوی طلا",            slug: "gold-bangle",          price: 4200000, weight: 2.1,  karat: 18, stock: 1, category: "bracelets",  featured: 1 },
];
let productCount = 0;
for (const p of productData) {
  const existing = db.prepare("SELECT id FROM products WHERE slug = ?").get(p.slug);
  if (!existing) {
    db.prepare(
      "INSERT INTO products (id, name, slug, description, price, weight, karat, stock, images, featured, published, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      generateId(), p.name, p.slug,
      `${p.name} از طلای ${p.karat} عیار`,
      p.price, p.weight, p.karat, p.stock,
      "[]", p.featured, 1, catIds[p.category]
    );
    productCount++;
  }
}
console.log(`  ✅ ${productCount} product(s) seeded`);

db.close();

console.log("\n🎉 Database ready!");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("Admin:    http://localhost:3000/admin");
console.log("Email:    admin@dellygold.com");
console.log("Password: Admin@1234");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
