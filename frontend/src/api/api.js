/**
 * api.js — Semua fungsi komunikasi ke Java REST API.
 * Vite proxy meneruskan /api → http://localhost:8080
 */

const BASE = "/api";

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

// ── PRODUCTS ──────────────────────────────────────────────────────
export const productApi = {
  getAll:  ()        => request("/products"),
  getById: (id)      => request(`/products/${id}`),
  create:  (data)    => request("/products",    { method: "POST",   body: JSON.stringify(data) }),
  update:  (id, data)=> request(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete:  (id)      => request(`/products/${id}`, { method: "DELETE" }),
};

// ── MEMBERS ───────────────────────────────────────────────────────
export const memberApi = {
  getAll:      ()         => request("/members"),
  getById:     (id)       => request(`/members/${id}`),
  create:      (data)     => request("/members",    { method: "POST",   body: JSON.stringify(data) }),
  update:      (id, data) => request(`/members/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete:      (id)       => request(`/members/${id}`, { method: "DELETE" }),
  findByPhone: (phone)    => request(`/members/${phone}`),
};

// ── TRANSACTIONS ──────────────────────────────────────────────────
export const transactionApi = {
  getAll:  ()     => request("/transactions"),
  getById: (id)   => request(`/transactions/${id}`),
  /**
   * Body: { memberPhone?: string, items: [{productId, qty}] }
   */
  create:  (data) => request("/transactions", { method: "POST", body: JSON.stringify(data) }),
};