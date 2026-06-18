/**
 * Map SQLite snake_case rows to the camelCase shapes expected by admin UI.
 */

type OrderRow = {
  id: string;
  status: string;
  total: number;
  address: string | null;
  note?: string | null;
  created_at: string;
  updated_at?: string;
  user_name?: string | null;
  user_email?: string | null;
  user_phone?: string | null;
};

type OrderItemRow = {
  id: string;
  quantity: number;
  price: number;
  product_name?: string | null;
  product_images?: string | null;
};

export function serializeOrder(row: OrderRow) {
  return {
    id: row.id,
    status: row.status,
    total: row.total,
    address: row.address ?? "",
    note: row.note ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    user: {
      name: row.user_name ?? "—",
      email: row.user_email ?? "",
      phone: row.user_phone ?? null,
    },
  };
}

export function serializeOrderDetail(
  order: OrderRow & { items?: OrderItemRow[] }
) {
  return {
    ...serializeOrder(order),
    items: (order.items ?? []).map(item => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      product: {
        name: item.product_name ?? "—",
        images: item.product_images ?? "[]",
      },
    })),
  };
}

type UserRow = {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: string;
  created_at: string;
  order_count?: number;
};

export function serializeUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone ?? null,
    role: row.role,
    createdAt: row.created_at,
    _count: { orders: row.order_count ?? 0 },
  };
}

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  product_count?: number;
};

export function serializeCategory(row: CategoryRow) {
  const count = row.product_count ?? 0;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? null,
    image: row.image ?? null,
    product_count: count,
    _count: { products: count },
  };
}

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  weight: number;
  karat: number;
  stock: number;
  images: string;
  featured: number;
  published: number;
  ajrat_override: number;
  ajrat_percent: number | null;
  ajrat_fixed: number | null;
  category_name?: string | null;
  category_slug?: string | null;
};

export function serializeProduct(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? null,
    price: row.price,
    weight: row.weight,
    karat: row.karat,
    stock: row.stock,
    images: row.images,
    featured: row.featured === 1,
    published: row.published === 1,
    ajrat_override: row.ajrat_override,
    ajrat_percent: row.ajrat_percent,
    ajrat_fixed: row.ajrat_fixed,
    category: row.category_name
      ? { name: row.category_name, slug: row.category_slug ?? "" }
      : null,
  };
}
