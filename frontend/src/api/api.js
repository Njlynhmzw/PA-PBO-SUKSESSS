/**
 * api.js — semua fungsi komunikasi ke Java REST API
 *
 * Base URL: Vite proxy akan forward /api → http://localhost:8080
 * sehingga tidak ada CORS issue di development.
 */

const BASE = "/api";

// ── Helper ────────────────────────────────────────────────────────────────────

async function request(url, options = {}) {
        const res = await fetch(BASE + url, {
    headers: { "Content-Type": "application/json" },
    ...options,
});
        const text = await res.text();
  const data = text ? JSON.parse(text) : {};
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
        return data;
}

// ── PRODUCTS ──────────────────────────────────────────────────────────────────

export const productApi = {
/** GET /api/products — ambil semua produk */
getAll: () => request("/products"),

/** GET /api/products/:id */
getById: (id) => request(`/products/${id}`),

/** POST /api/products — tambah produk baru
 * @param {Object} data - { name, price, stock, size, category, jenis, hasDiscount, discountPercent }
 */
create: (data) => request("/products", { method: "POST", body: JSON.stringify(data) }),

/** PUT /api/products/:id — update produk (nama, harga, stok)
 * @param {string} id
 * @param {Object} data - { name, price, stock }
 */
update: (id, data) => request(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),

/** DELETE /api/products/:id */
delete: (id) => request(`/products/${id}`, { method: "DELETE" }),
        };

// ── MEMBERS ───────────────────────────────────────────────────────────────────

export const memberApi = {
/** GET /api/members */
getAll: () => request("/members"),

/** GET /api/members/:id  (juga bisa pakai nomor telepon sebagai id) */
getById: (id) => request(`/members/${id}`),

/** POST /api/members — daftarkan member baru
 * @param {Object} data - { name, phone, email, tier }
 */
create: (data) => request("/members", { method: "POST", body: JSON.stringify(data) }),

/** PUT /api/members/:id */
update: (id, data) => request(`/members/${id}`, { method: "PUT", body: JSON.stringify(data) }),

/** DELETE /api/members/:id */
delete: (id) => request(`/members/${id}`, { method: "DELETE" }),

/** Cari member by phone — pakai endpoint GET /api/members/:phone */
findByPhone: (phone) => request(`/members/${phone}`),
        };

// ── TRANSACTIONS ──────────────────────────────────────────────────────────────

export const transactionApi = {
/** GET /api/transactions */
getAll: () => request("/transactions"),

/** GET /api/transactions/:id */
getById: (id) => request(`/transactions/${id}`),

/**
 * POST /api/transactions — buat transaksi baru
 * @param {Object} data - { memberPhone?: string, items: [{productId, qty}] }
 */
create: (data) => request("/transactions", { method: "POST", body: JSON.stringify(data) }),
        };