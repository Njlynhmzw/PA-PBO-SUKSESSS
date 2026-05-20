import { useState, useEffect, useCallback } from "react";
import "./styles/global.css";

import { productApi, memberApi, transactionApi } from "./api/api.js";
import { KATEGORI_LIST, CATEGORY_ICONS, formatRp } from "./constants.js";

import { Badge, Btn, Modal }             from "./components/UI.jsx";
import { ProductCard, ProductForm }      from "./components/ProductComponents.jsx";
import { MemberCard, MemberForm }        from "./components/MemberComponents.jsx";
import { TransactionModal, StrukView }   from "./components/TransactionModal.jsx";

const TABS = [
  { id: "dashboard",    label: "Dashboard",  icon: "◈" },
  { id: "products",     label: "Produk",     icon: "▤" },
  { id: "members",      label: "Member",     icon: "◎" },
  { id: "transactions", label: "Transaksi",  icon: "≡" },
];

export default function App() {
  const [activeTab,    setActiveTab]    = useState("dashboard");
  const [products,     setProducts]     = useState([]);
  const [members,      setMembers]      = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [modal,        setModal]        = useState(null);
  const [editTarget,   setEditTarget]   = useState(null);
  const [filterKat,    setFilterKat]    = useState("Semua");
  const [toast,        setToast]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [serverError,  setServerError]  = useState(false);
  const [struk,        setStruk]        = useState(null); // untuk popup "Lihat Detail"

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setServerError(false);
    try {
      const [p, m, t] = await Promise.all([
        productApi.getAll(), memberApi.getAll(), transactionApi.getAll(),
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

  // ── CRUD Produk ──────────────────────────────────────────────────
  async function handleSaveProduct(id, data) {
    if (id) { await productApi.update(id, data); showToast("Produk berhasil diupdate!"); }
    else     { await productApi.create(data);    showToast("Produk berhasil ditambahkan!"); }
    await refreshAll();
  }

  async function handleDeleteProduct(id) {
    if (!window.confirm("Hapus produk ini?")) return;
    try { await productApi.delete(id); showToast("Produk dihapus."); await refreshAll(); }
    catch (e) { showToast(e.message, "error"); }
  }

  // ── CRUD Member ──────────────────────────────────────────────────
  async function handleSaveMember(data) {
    if (editTarget) { await memberApi.update(editTarget.id, data); showToast("Member berhasil diupdate!"); }
    else            { await memberApi.create(data);                showToast("Member berhasil didaftarkan!"); }
    await refreshAll();
  }

  async function handleDeleteMember(id) {
    if (!window.confirm("Hapus member ini?")) return;
    try { await memberApi.delete(id); showToast("Member dihapus."); await refreshAll(); }
    catch (e) { showToast(e.message, "error"); }
  }

  // ── Modal helpers ────────────────────────────────────────────────
  function openEditProduct(p) { setEditTarget(p); setModal("edit-product"); }
  function openEditMember(m)  { setEditTarget(m); setModal("edit-member"); }
  function closeModal()       { setModal(null); setEditTarget(null); }

  const filteredProducts = filterKat === "Semua"
    ? products
    : products.filter(p => p.category === filterKat);

  const totalRevenue = transactions.reduce((s, t) => s + (t.total ?? 0), 0);

  // ── Loading / Error screen ───────────────────────────────────────
  if (loading) return <div className="loading-screen">Menghubungkan ke server Java...</div>;

  if (serverError) return (
    <div className="server-error">
      <span className="server-error-icon">⚠️</span>
      <p className="server-error-title">Tidak dapat terhubung ke server Java</p>
      <p className="server-error-sub">
        Pastikan <strong>Main.java</strong> sudah dijalankan di IntelliJ (port 8080)
      </p>
      <Btn onClick={refreshAll} style={{ marginTop: "0.5rem" }}>Coba Lagi</Btn>
    </div>
  );

  return (
    <>
      {/* ── HEADER ───────────────────────────────────────────────── */}
      <header className="header">
        <div className="header-top">
          <div className="header-brand">
            <div className="brand-logo">M</div>
            <div>
              <div className="brand-title">McLAREN COLLECTION</div>
              <div className="brand-sub">MERCHANDISE MANAGEMENT SYSTEM</div>
            </div>
          </div>
          <span className="header-admin">ADMIN</span>
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

      {/* ── MAIN ─────────────────────────────────────────────────── */}
      <main className="main">

        {/* ══ DASHBOARD ══ */}
        {activeTab === "dashboard" && (
          <section>
            <h2 className="page-title" style={{ marginBottom: "1.5rem" }}>OVERVIEW</h2>

            <div className="grid-stats">
              {[
                { label: "Total Produk",  value: products.length,        icon: "▤", color: "var(--blue)"   },
                { label: "Total Member",  value: members.length,         icon: "◎", color: "var(--purple)" },
                { label: "Transaksi",     value: transactions.length,    icon: "≡", color: "var(--green)"  },
                { label: "Total Revenue", value: formatRp(totalRevenue), icon: "◈", color: "var(--accent)" },
              ].map(s => (
                <div className="stat-card" key={s.label}>
                  <div className="stat-icon" style={{ color: s.color }}>{s.icon}</div>
                  <p className="stat-label">{s.label}</p>
                  <p className="stat-value" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

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

        {/* ══ PRODUK ══ */}
        {activeTab === "products" && (
          <section>
            <div className="page-header">
              <h2 className="page-title">PRODUK</h2>
              <Btn onClick={() => setModal("add-product")}>+ Tambah Produk</Btn>
            </div>
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

        {/* ══ MEMBER ══ */}
        {activeTab === "members" && (
          <section>
            <div className="page-header">
              <h2 className="page-title">MEMBER</h2>
              <Btn onClick={() => { setEditTarget(null); setModal("add-member"); }}>
                + Daftar Member
              </Btn>
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

        {/* ══ TRANSAKSI — tabel list ══ */}
        {activeTab === "transactions" && (
          <section>
            <div className="page-header">
              <h2 className="page-title">RIWAYAT TRANSAKSI</h2>
              <Btn onClick={() => setModal("transaction")}>+ Transaksi Baru</Btn>
            </div>

            {transactions.length === 0
              ? <p className="empty">Belum ada transaksi.</p>
              : (
                <div className="trx-list">
                  {/* Header kolom — warna putih via CSS */}
                  <div className="trx-list-header">
                    <span>Invoice</span>
                    <span>Tanggal</span>
                    <span>Pelanggan</span>
                    <span style={{textAlign:"center"}}>Item</span>
                    <span>Total</span>
                  </div>

                  {[...transactions].reverse().map(t => (
                    <div className="trx-list-row" key={t.id}>

                      {/* Invoice */}
                      <span className="trx-list-id">{t.id}</span>

                      {/* Tanggal — putih */}
                      <span className="trx-list-date">{t.date}</span>

                      {/* Pelanggan — putih */}
                      <span className="trx-list-member">
                        {t.member ? (
                          <>
                            <span className="trx-member-name">{t.member.name}</span>
                            <span className={`trx-tier-tag ${t.member.tier === "PLUS" ? "plus" : "regular"}`}>
                              {t.member.tier}
                            </span>
                          </>
                        ) : (
                          <span className="trx-nonmember">Non-Member</span>
                        )}
                      </span>

                      {/* Item count — putih, center */}
                      <span className="trx-list-items" style={{textAlign:"center"}}>{t.items?.length ?? 0} item</span>

                      {/* Total + Lihat Detail — 1 kolom, flex space-between */}
                      <span className="trx-list-total-col">
                        <span className="trx-list-total">{formatRp(t.total)}</span>
                        <button className="trx-detail-btn" onClick={() => setStruk(t)}>
                          Lihat Detail →
                        </button>
                      </span>

                    </div>
                  ))}
                </div>
              )
            }
          </section>
        )}
      </main>

      {/* ── MODALS ───────────────────────────────────────────────── */}
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

      {/* ── STRUK POPUP dari "Lihat Detail" ──────────────────────── */}
      {struk && (
        <div
          className="modal-overlay"
          onClick={() => setStruk(null)}
        >
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">🧾 STRUK PEMBAYARAN</span>
              <button className="modal-close" onClick={() => setStruk(null)}>×</button>
            </div>
            <div className="modal-body">
              <StrukView trx={struk} onClose={() => setStruk(null)} />
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ────────────────────────────────────────────────── */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}