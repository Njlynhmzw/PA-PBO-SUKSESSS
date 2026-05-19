import { useState } from "react";
import { Btn } from "./UI.jsx";
import { formatRp, getFinalPrice, memberDiscountRate } from "../constants.js";
import { transactionApi } from "../api/api.js";

// ── TRANSACTION MODAL ──────────────────────────────────────────────
export function TransactionModal({ products, members, onDone, onClose }) {
  const [memberPhone, setMemberPhone]   = useState("");
  const [foundMember, setFoundMember]   = useState(null);
  const [searched,    setSearched]      = useState(false);
  const [cart,        setCart]          = useState([]);
  const [loading,     setLoading]       = useState(false);
  const [error,       setError]         = useState("");
  const [receipt,     setReceipt]       = useState(null);

  // ── Cari member by phone (dari state lokal) ──────────────────────
  function searchMember() {
    const found = members.find(m => m.phone === memberPhone.trim());
    setFoundMember(found ?? null);
    setSearched(true);
  }

  // ── Cart operations ──────────────────────────────────────────────
  function addToCart(product) {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        // Cek tidak melebihi stok
        if (existing.qty >= product.stock) return prev;
        return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { product, qty: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(i => i.product.id !== id));
  }

  function updateQty(id, qty) {
    if (qty <= 0) { removeFromCart(id); return; }
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, qty } : i));
  }

  // ── Kalkulasi total ──────────────────────────────────────────────
  const discountRate     = foundMember ? memberDiscountRate(foundMember.tier) : 0;
  const subtotal         = cart.reduce((s, i) => s + getFinalPrice(i.product) * i.qty, 0);
  const memberDiscount   = subtotal * discountRate;
  const total            = subtotal - memberDiscount;

  // ── Checkout ─────────────────────────────────────────────────────
  async function checkout() {
    if (cart.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const payload = {
        memberPhone: foundMember?.phone ?? "",
        items: cart.map(i => ({ productId: i.product.id, qty: i.qty })),
      };
      const trx = await transactionApi.create(payload);
      setReceipt(trx);
      onDone(); // refresh data di parent (products stok berkurang, member update)
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Tampilan struk setelah checkout ──────────────────────────────
  if (receipt) {
    return (
      <div className="receipt">
        <div className="receipt-icon">🏁</div>
        <h3 className="receipt-title">Transaksi Berhasil!</h3>
        <p className="receipt-id">{receipt.id} · {receipt.date}</p>

        <div className="receipt-box">
          {/* Items dari response Java */}
          {receipt.items?.map(i => (
            <div className="receipt-row" key={i.productId}>
              <span className="receipt-name">{i.productName} × {i.qty}</span>
              <span className="receipt-val">{formatRp(i.subtotal)}</span>
            </div>
          ))}

          <div className="receipt-row">
            <span className="receipt-name" style={{ color: "var(--text-muted)" }}>Subtotal</span>
            <span className="receipt-val">{formatRp(receipt.subtotal)}</span>
          </div>

          {receipt.memberDiscount > 0 && (
            <div className="receipt-row">
              <span className="receipt-name" style={{ color: "#fb923c" }}>
                Diskon Member ({receipt.member?.tier})
              </span>
              <span className="receipt-val" style={{ color: "#fb923c" }}>
                - {formatRp(receipt.memberDiscount)}
              </span>
            </div>
          )}

          <div className="summary-total" style={{ paddingTop: "0.75rem" }}>
            <span className="summary-total-label">TOTAL</span>
            <span className="summary-total-val">{formatRp(receipt.total)}</span>
          </div>
        </div>

        <Btn onClick={onClose}>Selesai</Btn>
      </div>
    );
  }

  // ── Form transaksi ────────────────────────────────────────────────
  const availableProducts = products.filter(p => p.stock > 0);

  return (
    <>
      {/* 1. Identifikasi Member */}
      <div className="trx-section">
        <p className="trx-section-title">Identifikasi Member (opsional)</p>
        <div className="member-search-row">
          <input
            className="form-input"
            value={memberPhone}
            onChange={e => setMemberPhone(e.target.value)}
            placeholder="Nomor telepon member..."
            onKeyDown={e => e.key === "Enter" && searchMember()}
          />
          <Btn small onClick={searchMember}>Cari</Btn>
        </div>
        {searched && (
          foundMember
            ? <p className="member-found">✅ {foundMember.name} — Tier <strong>{foundMember.tier}</strong> (diskon {discountRate * 100}%)</p>
            : <p className="member-missing">❌ Member tidak ditemukan. Lanjut sebagai Non-Member.</p>
        )}
      </div>

      {/* 2. Pilih Produk */}
      <p className="trx-section-title" style={{ marginBottom: "0.5rem" }}>Pilih Produk</p>

      {availableProducts.length === 0 && (
        <p className="empty">Tidak ada produk tersedia.</p>
      )}

      <div className="product-pick-list">
        {availableProducts.map(p => (
          <div className="product-pick-item" key={p.id}>
            <div>
              <p className="product-pick-name">{p.name}</p>
              <p className="product-pick-price">{formatRp(getFinalPrice(p))} · Stok: {p.stock}</p>
            </div>
            <Btn small onClick={() => addToCart(p)}>+ Tambah</Btn>
          </div>
        ))}
      </div>

      {/* 3. Keranjang */}
      {cart.length > 0 && (
        <>
          <p className="trx-section-title" style={{ marginBottom: "0.5rem" }}>Keranjang</p>
          <div className="cart">
            {cart.map(item => (
              <div className="cart-item" key={item.product.id}>
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.product.name}</p>
                  <p className="cart-item-sub">
                    {formatRp(getFinalPrice(item.product))} × {item.qty}
                    {" = "}
                    {formatRp(getFinalPrice(item.product) * item.qty)}
                  </p>
                </div>
                <div className="cart-item-qty">
                  <button className="qty-btn" onClick={() => updateQty(item.product.id, item.qty - 1)}>−</button>
                  <span className="qty-num">{item.qty}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQty(item.product.id, item.qty + 1)}
                    disabled={item.qty >= item.product.stock}
                  >+</button>
                  <button className="qty-del" onClick={() => removeFromCart(item.product.id)}>×</button>
                </div>
              </div>
            ))}

            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{formatRp(subtotal)}</span>
              </div>
              {memberDiscount > 0 && (
                <div className="summary-row discount">
                  <span>Diskon Member ({foundMember.tier})</span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>- {formatRp(memberDiscount)}</span>
                </div>
              )}
              <div className="summary-total">
                <span className="summary-total-label">TOTAL</span>
                <span className="summary-total-val">{formatRp(total)}</span>
              </div>
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Btn onClick={checkout} loading={loading}>🏁 Checkout</Btn>
          </div>
        </>
      )}
    </>
  );
}