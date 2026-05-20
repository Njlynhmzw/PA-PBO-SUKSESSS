import { useState } from "react";
import { Btn } from "./UI.jsx";
import { formatRp, getFinalPrice, memberDiscountRate } from "../constants.js";
import { transactionApi } from "../api/api.js";

// ══════════════════════════════════════════════════════════════════
//  TransactionModal — form buat transaksi baru
//  Setelah checkout langsung tampilkan StrukView di dalam modal
// ══════════════════════════════════════════════════════════════════
export function TransactionModal({ products, members, onDone, onClose }) {
  const [isMember,    setIsMember]    = useState(false);
  const [phoneInput,  setPhoneInput]  = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [foundMember, setFoundMember] = useState(null);
  const [cart,        setCart]        = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [receipt,     setReceipt]     = useState(null); // ← null = belum checkout

  // ── Autocomplete ────────────────────────────────────────────────
  function handlePhoneInput(val) {
    setPhoneInput(val);
    setFoundMember(null);
    if (!val.trim()) { setSuggestions([]); return; }
    setSuggestions(
      members.filter(m =>
        m.phone.includes(val.trim()) ||
        m.name.toLowerCase().includes(val.toLowerCase())
      )
    );
  }

  function selectMember(m) {
    setFoundMember(m);
    setPhoneInput(m.phone);
    setSuggestions([]);
  }

  function handleCheckbox(checked) {
    setIsMember(checked);
    if (!checked) { setFoundMember(null); setPhoneInput(""); setSuggestions([]); }
  }

  // ── Cart ────────────────────────────────────────────────────────
  function addToCart(product) {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      if (ex) {
        if (ex.qty >= product.stock) return prev;
        return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { product, qty: 1 }];
    });
  }
  function removeFromCart(id) { setCart(prev => prev.filter(i => i.product.id !== id)); }
  function updateQty(id, qty) {
    if (qty <= 0) { removeFromCart(id); return; }
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, qty } : i));
  }

  // ── Kalkulasi ───────────────────────────────────────────────────
  const discountRate   = foundMember ? memberDiscountRate(foundMember.tier) : 0;
  const subtotal       = cart.reduce((s, i) => s + getFinalPrice(i.product) * i.qty, 0);
  const memberDiscount = subtotal * discountRate;
  const total          = subtotal - memberDiscount;

  // ── Checkout ────────────────────────────────────────────────────
  async function checkout() {
    if (cart.length === 0) return;

    setLoading(true);
    setError("");

    try {
      const trx = await transactionApi.create({
        memberPhone: foundMember?.phone ?? "",
        items: cart.map(i => ({
          productId: i.product.id,
          qty: i.qty
        })),
      });

      console.log("TRX:", trx);

      if (!trx) {
        throw new Error("Transaksi gagal dibuat");
      }

      setReceipt(trx);

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (receipt) {
    return (
      <StrukView
        trx={receipt}
        onClose={() => {
          onDone();
          onClose();
        }}
      />
    );
  }

  const availableProducts = products.filter(p => p.stock > 0);

  return (
    <div className="trx-form">

      {/* 1. Pilih Produk */}
      <div className="trx-block">
        <p className="trx-block-title">Pilih Produk</p>
        {availableProducts.length === 0
          ? <p className="empty">Tidak ada produk tersedia.</p>
          : (
            <div className="product-pick-list">
              {availableProducts.map(p => (
                <div className="product-pick-item" key={p.id}>
                  <div>
                    <p className="product-pick-name">{p.name}</p>
                    <p className="product-pick-price">
                      {formatRp(getFinalPrice(p))}
                      <span className="product-pick-stok"> · Stok: {p.stock}</span>
                    </p>
                  </div>
                  <Btn small onClick={() => addToCart(p)}>+ Tambah</Btn>
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* 2. Keranjang */}
      {cart.length > 0 && (
        <div className="trx-block">
          <p className="trx-block-title">Keranjang</p>
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

            {/* Summary */}
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{formatRp(subtotal)}</span>
              </div>
              {memberDiscount > 0 && (
                <div className="summary-row discount">
                  <span>Diskon Member ({foundMember.tier})</span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>− {formatRp(memberDiscount)}</span>
                </div>
              )}
              <div className="summary-total">
                <span className="summary-total-label">TOTAL</span>
                <span className="summary-total-val">{formatRp(total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Konfirmasi Member */}
      {cart.length > 0 && (
        <div className="trx-member-block">
          <label className="member-question-label" htmlFor="is-member-chk">
            Apakah pelanggan ini terdaftar sebagai member?
          </label>
          <div className="member-question-row">
            <input
              type="checkbox"
              id="is-member-chk"
              className="member-chk"
              checked={isMember}
              onChange={e => handleCheckbox(e.target.checked)}
            />
            <span className="member-chk-text">Ya, pelanggan ini adalah member</span>
          </div>

          {isMember && (
            <div className="member-search-wrap">
              <div className="member-search-field">
                <span className="member-search-icon">📞</span>
                <input
                  className="member-search-input"
                  value={phoneInput}
                  onChange={e => handlePhoneInput(e.target.value)}
                  placeholder="Ketik nomor telepon atau nama member..."
                  autoFocus
                />
              </div>

              {suggestions.length > 0 && (
                <div className="member-suggest-list">
                  {suggestions.map(m => (
                    <button
                      key={m.id}
                      className="member-suggest-item"
                      onClick={() => selectMember(m)}
                      type="button"
                    >
                      <span className="suggest-phone">{m.phone}</span>
                      <span className="suggest-name">
                        <strong>{m.name}</strong> · {m.tier}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {foundMember && (
                <div className="member-status found">
                  <span className="member-status-icon">✅</span>
                  <div>
                    <span className="member-status-name">{foundMember.name}</span>
                    <span className="member-status-tier">
                      {" "}— Tier <strong>{foundMember.tier}</strong> · Diskon {discountRate * 100}%
                    </span>
                  </div>
                </div>
              )}

              {!foundMember && phoneInput && suggestions.length === 0 && (
                <div className="member-status notfound">
                  <span className="member-status-icon">❌</span>
                  <span>Member tidak ditemukan. Lanjutkan sebagai non-member.</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && <div className="form-error">{error}</div>}

      {cart.length > 0 && (
        <div className="trx-checkout-row">
          <Btn onClick={checkout} loading={loading}>🏁 Checkout</Btn>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  StrukView — komponen struk, dipakai setelah checkout
//  DAN dari riwayat transaksi (klik "Lihat Detail")
// ══════════════════════════════════════════════════════════════════
export function StrukView({ trx, onClose }) {
  return (
    <div className="struk-wrap">

      {/* Header brand */}
      <div className="struk-header">
        <div className="struk-logo-row">
          <span className="struk-flag">🏁</span>
          <div>
            <div className="struk-brand">McLAREN COLLECTION</div>
            <div className="struk-brand-sub">STRUK PEMBAYARAN</div>
          </div>
        </div>
      </div>

      <div className="struk-divider" />

      {/* Meta — Invoice, Tanggal, Pelanggan → semua PUTIH */}
      <div className="struk-meta">
        <div className="struk-meta-row">
          <span className="struk-meta-key">Invoice</span>
          <span className="struk-meta-val">{trx.id}</span>
        </div>
        <div className="struk-meta-row">
          <span className="struk-meta-key">Tanggal</span>
          <span className="struk-meta-val">{trx.date}</span>
        </div>
        <div className="struk-meta-row">
          <span className="struk-meta-key">Pelanggan</span>
          <span className="struk-meta-val">
            {trx.member ? `${trx.member.name} (${trx.member.tier})` : "Non-Member"}
          </span>
        </div>
      </div>

      <div className="struk-divider dashed" />

      {/* Item-item */}
      <div className="struk-items">
        {trx.items?.map(i => (
          <div className="struk-item-row" key={i.productId}>
            <div className="struk-item-left">
              <span className="struk-item-name">{i.productName}</span>
              <span className="struk-item-qty"> ×{i.qty}</span>
            </div>
            <span className="struk-item-val">{formatRp(i.subtotal)}</span>
          </div>
        ))}
      </div>

      <div className="struk-divider dashed" />

      {/* Kalkulasi — Subtotal PUTIH, diskon orange */}
      <div className="struk-calc">
        <div className="struk-calc-row subtotal">
          <span>Subtotal</span>
          <span>{formatRp(trx.subtotal ?? trx.total)}</span>
        </div>
        {trx.memberDiscount > 0 && (
          <div className="struk-calc-row discount">
            <span>Diskon Member ({trx.member?.tier})</span>
            <span>− {formatRp(trx.memberDiscount)}</span>
          </div>
        )}
      </div>

      <div className="struk-divider" />

      {/* Total */}
      <div className="struk-total-row">
        <span className="struk-total-label">TOTAL BAYAR</span>
        <span className="struk-total-val">{formatRp(trx.total)}</span>
      </div>

    </div>
  );
}