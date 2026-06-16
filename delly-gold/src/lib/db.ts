/**
 * Database layer using Node.js built-in SQLite (Node 22+)
 * Single file — no Prisma CLI required.
 * This module is SERVER ONLY — never imported by client components.
 */
import "server-only";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";

let _db: DatabaseSync | null = null;

function resolveDbPath(): string {
  const url = process.env.DATABASE_URL || "file:./prisma/dev.db";
  const filePart = url.replace(/^file:/, "");
  if (path.isAbsolute(filePart)) return filePart;
  // Use __dirname-relative path to keep Turbopack NFT trace bounded
  return path.join(process.cwd(), /*turbopackIgnore: true*/ filePart);
}

export function getDb(): DatabaseSync {
  if (!_db) {
    const dbPath = resolveDbPath();
    mkdirSync(path.dirname(dbPath), { recursive: true });
    _db = new DatabaseSync(dbPath);
    _db.exec("PRAGMA journal_mode=WAL");
    _db.exec("PRAGMA foreign_keys=ON");
  }
  return _db;
}

export function generateId(): string {
  return randomBytes(12).toString("hex");
}

// ── Users ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string | null;
  address: string | null;
  role: "ADMIN" | "CUSTOMER";
  created_at: string;
  updated_at: string;
}

export const users = {
  findByEmail(email: string): User | undefined {
    return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined;
  },
  findById(id: string): Omit<User, "password"> | undefined {
    return getDb()
      .prepare("SELECT id, email, name, phone, address, role, created_at, updated_at FROM users WHERE id = ?")
      .get(id) as Omit<User, "password"> | undefined;
  },
  update(id: string, data: { name?: string; phone?: string; address?: string }) {
    const fields = Object.entries(data)
      .filter(([, v]) => v !== undefined)
      .map(([k]) => `${k} = ?`).join(", ");
    const values = Object.values(data).filter(v => v !== undefined);
    if (!fields) return;
    getDb().prepare(`UPDATE users SET ${fields}, updated_at = datetime('now') WHERE id = ?`).run(...values, id);
  },
  create(data: { name: string; email: string; password: string; role?: string }): User {
    const id = generateId();
    getDb()
      .prepare("INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)")
      .run(id, data.email, data.password, data.name, data.role ?? "CUSTOMER");
    return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as User;
  },
  list(opts: { search?: string; limit?: number; offset?: number } = {}) {
    const { search, limit = 20, offset = 0 } = opts;
    const db = getDb();
    if (search) {
      const s = `%${search}%`;
      return {
        rows: db.prepare(`SELECT id, email, name, phone, role, created_at,
          (SELECT COUNT(*) FROM orders WHERE user_id = users.id) AS order_count
          FROM users WHERE name LIKE ? OR email LIKE ?
          ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(s, s, limit, offset) as (Omit<User, "password"> & { order_count: number })[],
        total: (db.prepare("SELECT COUNT(*) as cnt FROM users WHERE name LIKE ? OR email LIKE ?").get(s, s) as { cnt: number }).cnt,
      };
    }
    return {
      rows: db.prepare(`SELECT id, email, name, phone, role, created_at,
        (SELECT COUNT(*) FROM orders WHERE user_id = users.id) AS order_count
        FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(limit, offset) as (Omit<User, "password"> & { order_count: number })[],
      total: (db.prepare("SELECT COUNT(*) as cnt FROM users").get() as { cnt: number }).cnt,
    };
  },
};

// ── Categories ───────────────────────────────────────────────────────────────

export interface Category {
  id: string; name: string; slug: string; description: string | null; image: string | null; created_at: string;
}

export const categories = {
  list() {
    return getDb().prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count FROM categories c ORDER BY name ASC`
    ).all() as (Category & { product_count: number })[];
  },
  findById(id: string) {
    return getDb().prepare("SELECT * FROM categories WHERE id = ?").get(id) as Category | undefined;
  },
  findBySlug(slug: string) {
    return getDb().prepare("SELECT * FROM categories WHERE slug = ?").get(slug) as Category | undefined;
  },
  create(data: { name: string; slug: string; description?: string; image?: string }) {
    const id = generateId();
    getDb().prepare("INSERT INTO categories (id, name, slug, description, image) VALUES (?, ?, ?, ?, ?)").run(
      id, data.name, data.slug, data.description ?? null, data.image ?? null
    );
    return getDb().prepare("SELECT * FROM categories WHERE id = ?").get(id) as Category;
  },
  update(id: string, data: Partial<{ name: string; slug: string; description: string; image: string }>) {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(", ");
    getDb().prepare(`UPDATE categories SET ${fields} WHERE id = ?`).run(...Object.values(data), id);
    return getDb().prepare("SELECT * FROM categories WHERE id = ?").get(id) as Category;
  },
  delete(id: string) {
    getDb().prepare("DELETE FROM categories WHERE id = ?").run(id);
  },
};

// ── Products ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string; name: string; slug: string; description: string | null;
  price: number; weight: number; karat: number; stock: number;
  images: string; featured: number; published: number;
  ajrat_percent: number | null;  // per-product اجرت % override
  ajrat_fixed: number | null;    // per-product اجرت fixed (Toman) override
  ajrat_override: number;        // 1 = use per-product values, 0 = use global
  category_id: string; created_at: string; updated_at: string;
}

export const products = {
  list(opts: { categoryId?: string; featured?: boolean; search?: string; limit?: number; offset?: number; adminMode?: boolean } = {}) {
    const { categoryId, featured, search, limit = 12, offset = 0, adminMode = false } = opts;
    const db = getDb();
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (!adminMode) { conditions.push("p.published = 1"); }
    if (categoryId) { conditions.push("p.category_id = ?"); params.push(categoryId); }
    if (featured !== undefined) { conditions.push("p.featured = ?"); params.push(featured ? 1 : 0); }
    if (search) { conditions.push("(p.name LIKE ? OR p.description LIKE ?)"); params.push(`%${search}%`, `%${search}%`); }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = db.prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON c.id = p.category_id ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
    ).all(...params, limit, offset) as (Product & { category_name: string; category_slug: string })[];
    const total = (db.prepare(`SELECT COUNT(*) as cnt FROM products p ${where}`).get(...params) as { cnt: number }).cnt;
    return { rows, total };
  },
  findById(id: string) {
    return getDb().prepare(
      "SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ? OR p.slug = ?"
    ).get(id, id) as (Product & { category_name: string; category_slug: string }) | undefined;
  },
  create(data: Omit<Product, "created_at" | "updated_at">) {
    const id = generateId();
    getDb().prepare(
      "INSERT INTO products (id, name, slug, description, price, weight, karat, stock, images, featured, published, category_id, ajrat_percent, ajrat_fixed, ajrat_override) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(id, data.name, data.slug, data.description ?? null, data.price, data.weight, data.karat, data.stock, data.images, data.featured, data.published, data.category_id, data.ajrat_percent ?? null, data.ajrat_fixed ?? null, data.ajrat_override ?? 0);
    return products.findById(id)!;
  },
  update(id: string, data: Partial<Omit<Product, "id" | "created_at" | "updated_at">>) {
    const fields = Object.keys(data).map(k => `${k === "category_id" ? "category_id" : k} = ?`).join(", ");
    getDb().prepare(`UPDATE products SET ${fields}, updated_at = datetime('now') WHERE id = ?`).run(...Object.values(data), id);
    return products.findById(id)!;
  },
  delete(id: string) {
    getDb().prepare("DELETE FROM products WHERE id = ?").run(id);
  },
  countBySlug(slug: string, excludeId?: string) {
    if (excludeId) {
      return (getDb().prepare("SELECT COUNT(*) as cnt FROM products WHERE slug = ? AND id != ?").get(slug, excludeId) as { cnt: number }).cnt;
    }
    return (getDb().prepare("SELECT COUNT(*) as cnt FROM products WHERE slug = ?").get(slug) as { cnt: number }).cnt;
  },
};

// ── Orders ───────────────────────────────────────────────────────────────────

export interface Order {
  id: string; status: string; total: number; address: string | null;
  note: string | null; user_id: string; created_at: string; updated_at: string;
}

export interface OrderItem {
  id: string; quantity: number; price: number; order_id: string; product_id: string;
}

export const orders = {
  list(opts: { userId?: string; limit?: number; offset?: number } = {}) {
    const { userId, limit = 20, offset = 0 } = opts;
    const db = getDb();
    const where = userId ? "WHERE o.user_id = ?" : "";
    const params: unknown[] = userId ? [userId] : [];
    const rows = db.prepare(
      `SELECT o.*, u.name as user_name, u.email as user_email FROM orders o LEFT JOIN users u ON u.id = o.user_id ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`
    ).all(...params, limit, offset) as (Order & { user_name: string; user_email: string })[];
    const total = (db.prepare(`SELECT COUNT(*) as cnt FROM orders o ${where}`).get(...params) as { cnt: number }).cnt;
    return { rows, total };
  },
  findById(id: string, userId?: string) {
    const db = getDb();
    const where = userId ? "WHERE o.id = ? AND o.user_id = ?" : "WHERE o.id = ?";
    const params: unknown[] = userId ? [id, userId] : [id];
    const order = db.prepare(
      `SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone FROM orders o LEFT JOIN users u ON u.id = o.user_id ${where}`
    ).get(...params) as (Order & { user_name: string; user_email: string; user_phone: string }) | undefined;
    if (!order) return undefined;
    const items = db.prepare(
      "SELECT oi.*, p.name as product_name, p.images as product_images FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?"
    ).all(id) as (OrderItem & { product_name: string; product_images: string })[];
    return { ...order, items };
  },
  create(data: { userId: string; total: number; address: string; note?: string; items: { productId: string; quantity: number; price: number }[] }) {
    const db = getDb();
    const id = generateId();
    db.prepare("INSERT INTO orders (id, status, total, address, note, user_id) VALUES (?, ?, ?, ?, ?, ?)").run(
      id, "PENDING", data.total, data.address, data.note ?? null, data.userId
    );
    for (const item of data.items) {
      db.prepare("INSERT INTO order_items (id, quantity, price, order_id, product_id) VALUES (?, ?, ?, ?, ?)").run(
        generateId(), item.quantity, item.price, id, item.productId
      );
    }
    return orders.findById(id)!;
  },
  updateStatus(id: string, status: string) {
    getDb().prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
    return orders.findById(id)!;
  },
};

// ── Stats ────────────────────────────────────────────────────────────────────

export const stats = {
  getDashboard() {
    const db = getDb();
    return {
      totalUsers: (db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'CUSTOMER'").get() as { cnt: number }).cnt,
      totalProducts: (db.prepare("SELECT COUNT(*) as cnt FROM products WHERE published = 1").get() as { cnt: number }).cnt,
      totalOrders: (db.prepare("SELECT COUNT(*) as cnt FROM orders").get() as { cnt: number }).cnt,
      totalRevenue: (db.prepare("SELECT COALESCE(SUM(total),0) as rev FROM orders WHERE status IN ('CONFIRMED','PROCESSING','SHIPPED','DELIVERED')").get() as { rev: number }).rev,
      pendingOrders: (db.prepare("SELECT COUNT(*) as cnt FROM orders WHERE status = 'PENDING'").get() as { cnt: number }).cnt,
    };
  },
  getRecentOrders(limit = 5) {
    return getDb().prepare(
      `SELECT o.*, u.name as user_name, u.email as user_email FROM orders o LEFT JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC LIMIT ?`
    ).all(limit) as (Order & { user_name: string; user_email: string })[];
  },
};
