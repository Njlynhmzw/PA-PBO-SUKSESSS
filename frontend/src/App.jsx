import { useState, useEffect, useCallback } from "react";
import "./styles/global.css";

import { productApi, memberApi, transactionApi } from "./api/api.js";
import { KATEGORI_LIST, CATEGORY_ICONS, formatRp } from "./constants.js";

import { Badge, Btn, Modal }             from "./components/UI.jsx";
import { ProductCard, ProductForm }      from "./components/ProductComponents.jsx";
import { MemberCard, MemberForm }        from "./components/MemberComponents.jsx";
import { TransactionModal }              from "./components/TransactionModal.jsx";

// ── TABS CONFIG ────────────────────────────────────────────────────
const TABS = [
  { id: "dashboard",    label: "Dashboard",  icon: "◈" },
  { id: "products",     label: "Produk",     icon: "▤" },
  { id: "members",      label: "Member",     icon: "◎" },
  { id: "transactions", label: "Transaksi",  icon: "≡" },
];

// ── MAIN APP ───────────────────────────────────────────────────────
export default function App() {
  const [activeTab,    setActiveTab]    = useState("dashboard");
  const [products,     setProducts]     = useState([]);
  const [members,      setMembers]      = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [modal,        setModal]        = useState(null); // null | "add-product" | "edit-product" | "add-member" | "edit-member" | "transaction"
  const [editTarget,   setEditTarget]   = useState(null); // data yang sedang diedit
  const [filterKat,    setFilterKat]    = useState("Semua");
  const [toast,        setToast]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [serverError,  setServerError]  = useState(false);

  // ── Toast helper ─────────────────────────────────────────────────
  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Fetch semua data dari Java ────────────────────────────────────
  const refreshAll = useCallback(async () => {
    setLoading(true);
    setServerError(false);
    try {
      const [p, m, t] = await Promise.all([
        productApi.getAll(),
        memberApi.getAll(),
        transactionApi.getAll(),
      ]);
      setProducts(Array.isArray(p) ? p : []);
      setMembers(Array.isArray(m) ? m : []);
      setTransactions(Array.isArray(t) ? t : []);
    } catch {
      setServerError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  // ── PRODUCT CRUD ──────────────────────────────────────────────────
  async function handleSaveProduct(id, data) {
    if (id) {
      await productApi.update(id, data);
      showToast("Produk berhasil diupdate!");
    } else {
      await productApi.create(data);
      showToast("Produk berhasil ditambahkan!");
    }
    await refreshAll();
  }

  async function handleDeleteProduct(id) {
    if (!window.confirm("Hapus produk ini?")) return;
    try {
      await productApi.delete(id);
      showToast("Produk dihapus.");
      await refreshAll();
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  // ── MEMBER CRUD ───────────────────────────────────────────────────
  async function handleSaveMember(data) {
    if (editTarget) {
      await memberApi.update(editTarget.id, data);
      showToast("Member berhasil diupdate!");
    } else {
      await memberApi.create(data);
      showToast("Member berhasil didaftarkan!");
    }
    await refreshAll();
  }

  async function handleDeleteMember(id) {
    if (!window.confirm("Hapus member ini?")) return;
    try {
      await memberApi.delete(id);
      showToast("Member dihapus.");
      await refreshAll();
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  // ── Modal helpers ─────────────────────────────────────────────────
  function openEditProduct(p) { setEditTarget(p); setModal("edit-product"); }
  function openEditMember(m)  { setEditTarget(m); setModal("edit-member"); }

  function closeModal() { setModal(null); setEditTarget(null); }

  // ── Derived state ─────────────────────────────────────────────────
  const filteredProducts = filterKat === "Semua"
    ? products
    : products.filter(p => p.category === filterKat);

  const totalRevenue = transactions.reduce((s, t) => s + (t.total ?? 0), 0);

  // ── Loading screen ────────────────────────────────────────────────
  if (loading) return (
    <div className="loading-screen">Menghubungkan ke server Java...</div>
  );

  // ── Server error screen ───────────────────────────────────────────
  if (serverError) return (
    <div className="server-error">
      <span className="server-error-icon">⚠️</span>
      <p className="server-error-title">Tidak dapat terhubung ke server Java</p>
      <p className="server-error-sub">Pastikan <strong>Main.java</strong> sudah dijalankan di IntelliJ (port 8080)</p>
      <Btn onClick={refreshAll} style={{ marginTop: "0.5rem" }}>Coba Lagi</Btn>
    </div>
  );

  // ── Main UI ───────────────────────────────────────────────────────
  return (
    <>
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="header">
        <div className="header-top">
          <div className="header-brand">
            <div className="brand-logo">M</div>
            <div>
              <div className="brand-title">McLAREN COLLECTION</div>
              <div className="brand-sub">MERCHANDISE MANAGEMENT SYSTEM</div>
            </div>
          </div>
          <Btn onClick={() => setModal("transaction")}>🛒 Transaksi Baru</Btn>
        </div>

        <nav className="tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────────── */}
      <main className="main">

        {/* ════════════════ DASHBOARD ════════════════ */}
        {activeTab === "dashboard" && (
          <section>
            <h2 className="page-title" style={{ marginBottom: "1.5rem" }}>OVERVIEW</h2>

            {/* Stat cards */}
            <div className="grid-stats">
              {[
                { label: "Total Produk",  value: products.length,         icon: "▤", color: "var(--blue)" },
                { label: "Total Member",  value: members.length,          icon: "◎", color: "var(--purple)" },
                { label: "Transaksi",     value: transactions.length,     icon: "≡", color: "var(--green)" },
                { label: "Total Revenue", value: formatRp(totalRevenue),  icon: "◈", color: "var(--accent)" },
              ].map(s => (
                <div className="stat-card" key={s.label}>
                  <div className="stat-icon" style={{ color: s.color }}>{s.icon}</div>
                  <p className="stat-label">{s.label}</p>
                  <p className="stat-value" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Kategori */}
            <h3 className="section-title">BREAKDOWN KATEGORI</h3>
            <div className="grid-cats">
              {KATEGORI_LIST.map(k => {
                const count = products.filter(p => p.category === k).length;
                const stok  = products.filter(p => p.category === k).reduce((s, p) => s + p.stock, 0);
                return (
                  <div className="cat-card" key={k}>
                    <span className="cat-icon">{CATEGORY_ICONS[k]}</span>
                    <div>
                      <p className="cat-name">{k}</p>
                      <p className="cat-meta">{count} produk · {stok} stok</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tier member */}
            <h3 className="section-title" style={{ marginTop: "1.75rem" }}>MEMBER TIER</h3>
            <div className="grid-tiers">
              {["REGULAR", "PLUS"].map(tier => (
                <div className="tier-card" key={tier}>
                  <Badge label={tier} color={tier === "PLUS" ? "orange" : "blue"} />
                  <p className="tier-count">{members.filter(m => m.tier === tier).length}</p>
                  <p className="tier-label">member</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ════════════════ PRODUK ════════════════ */}
        {activeTab === "products" && (
          <section>
            <div className="page-header">
              <h2 className="page-title">PRODUK</h2>
              <Btn onClick={() => setModal("add-product")}>+ Tambah Produk</Btn>
            </div>

            {/* Filter kategori */}
            <div className="filter-bar">
              {["Semua", ...KATEGORI_LIST].map(k => (
                <button
                  key={k}
                  className={`filter-btn ${filterKat === k ? "active" : ""}`}
                  onClick={() => setFilterKat(k)}
                >
                  {k}
                </button>
              ))}
            </div>

            {filteredProducts.length === 0
              ? <p className="empty">Belum ada produk.</p>
              : (
                <div className="grid-cards">
                  {filteredProducts.map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onEdit={openEditProduct}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
                </div>
              )
            }
          </section>
        )}

        {/* ════════════════ MEMBER ════════════════ */}
        {activeTab === "members" && (
          <section>
            <div className="page-header">
              <h2 className="page-title">MEMBER</h2>
              <Btn onClick={() => { setEditTarget(null); setModal("add-member"); }}>+ Daftar Member</Btn>
            </div>

            {members.length === 0
              ? <p className="empty">Belum ada member.</p>
              : (
                <div className="grid-members">
                  {members.map(m => (
                    <MemberCard
                      key={m.id}
                      member={m}
                      onEdit={openEditMember}
                      onDelete={handleDeleteMember}
                    />
                  ))}
                </div>
              )
            }
          </section>
        )}

        {/* ════════════════ TRANSAKSI ════════════════ */}
        {activeTab === "transactions" && (
          <section>
            <h2 className="page-title" style={{ marginBottom: "1.25rem" }}>RIWAYAT TRANSAKSI</h2>

            {transactions.length === 0
              ? <p className="empty">Belum ada transaksi.</p>
              : (
                <div className="grid-trx">
                  {[...transactions].reverse().map(t => (
                    <div className="trx-card" key={t.id}>
                      <div className="trx-card-top">
                        <span className="trx-id">{t.id}</span>
                        <span className="trx-date">{t.date}</span>
                      </div>
                      <p className="trx-member">
                        👤 {t.member ? `${t.member.name} (${t.member.tier})` : "Non-Member"}
                      </p>
                      <div className="trx-items">
                        {t.items?.map(i => (
                          <div className="trx-item-row" key={i.productId}>
                            <span className="trx-item-name">{i.productName} ×{i.qty}</span>
                            <span className="trx-item-val">{formatRp(i.subtotal)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="trx-card-footer">
                        <span className="trx-footer-label">Total</span>
                        <span className="trx-total">{formatRp(t.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </section>
        )}
      </main>

      {/* ── MODALS ─────────────────────────────────────────────── */}
      {modal === "add-product" && (
        <Modal title="Tambah Produk Baru" onClose={closeModal}>
          <ProductForm onSave={handleSaveProduct} onClose={closeModal} />
        </Modal>
      )}

      {modal === "edit-product" && editTarget && (
        <Modal title="Edit Produk" onClose={closeModal}>
          <ProductForm initial={editTarget} onSave={handleSaveProduct} onClose={closeModal} />
        </Modal>
      )}

      {modal === "add-member" && (
        <Modal title="Daftar Member Baru" onClose={closeModal}>
          <MemberForm onSave={handleSaveMember} onClose={closeModal} />
        </Modal>
      )}

      {modal === "edit-member" && editTarget && (
        <Modal title="Edit Member" onClose={closeModal}>
          <MemberForm initial={editTarget} onSave={handleSaveMember} onClose={closeModal} />
        </Modal>
      )}

      {modal === "transaction" && (
        <Modal title="Transaksi Baru" onClose={closeModal}>
          <TransactionModal
            products={products}
            members={members}
            onDone={refreshAll}
            onClose={closeModal}
          />
        </Modal>
      )}

      {/* ── TOAST ──────────────────────────────────────────────── */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}