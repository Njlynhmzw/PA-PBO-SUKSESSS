import { useState, useEffect, useCallback } from "react";
import { productApi, memberApi, transactionApi } from "./api/api";

// ── KONSTANTA (sama persis, tidak berubah) ─────────────────────────────────────
        const KATEGORI_LIST = ["T-Shirts", "Headwear", "Outerwear", "Footwear", "Gift & Accessories"];
        const JENIS_MAP = {
        "T-Shirts":           ["Polo Shirt","Crew Neck","V-Neck","Oversized","Racing Tee"],
        "Headwear":           ["Snapback Cap","Fitted Cap","Bucket Hat","Beanie","Visor"],
        "Outerwear":          ["Jacket","Hoodie","Windbreaker","Rain Jacket","Varsity Jacket"],
        "Footwear":           ["Sneakers","Sandals","Boots","Slip-On","Racing Shoes"],
        "Gift & Accessories": ["Keychain","Mug","Phone Case","Lanyard","Sticker Pack","Model Car","Backpack","Wallet"],
        };
        const CATEGORY_ICONS = {
        "T-Shirts":"👕","Headwear":"🧢","Outerwear":"🧥","Footwear":"👟","Gift & Accessories":"🎁",
        };

function formatRp(n) {
    return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(n);
}

// ── UI COMPONENTS (sama persis, tidak berubah) ─────────────────────────────────
function Badge({ label, color }) {
        const colors = {
green:  "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
yellow: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
red:    "bg-red-500/20 text-red-400 border border-red-500/40",
orange: "bg-orange-500/20 text-orange-300 border border-orange-500/40",
blue:   "bg-sky-500/20 text-sky-300 border border-sky-500/40",
        };
        return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold tracking-wide ${colors[color] || colors.blue}`}>
        {label}
    </span>
        );
        }

function Modal({ title, onClose, children }) {
        return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
style={{ background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor:"var(--border)" }}>
          <h2 className="text-lg font-bold tracking-tight"
style={{ color:"var(--accent)", fontFamily:"var(--font-display)" }}>{title}</h2>
          <button onClick={onClose} className="text-2xl leading-none opacity-50 hover:opacity-100 transition-opacity"
style={{ color:"var(--text-primary)" }}>×</button>
        </div>
        <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
        );
        }

function InputField({ label, type="text", value, onChange, required }) {
        return (
    <div className="mb-4">
      <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
style={{ color:"var(--text-muted)" }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
style={{ background:"var(--surface-elevated)", border:"1px solid var(--border)",
color:"var(--text-primary)", fontFamily:"var(--font-mono)" }}
onFocus={e => e.target.style.borderColor = "var(--accent)"}
onBlur={e  => e.target.style.borderColor = "var(--border)"} />
    </div>
        );
        }

function SelectField({ label, value, onChange, options }) {
        return (
    <div className="mb-4">
      <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
style={{ color:"var(--text-muted)" }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
style={{ background:"var(--surface-elevated)", border:"1px solid var(--border)",
color:"var(--text-primary)", fontFamily:"var(--font-mono)" }}>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
        );
        }

function Btn({ children, onClick, variant="primary", disabled, small, loading }) {
        const styles = {
primary:   { background:"var(--accent)", color:"#000", border:"none" },
secondary: { background:"transparent", color:"var(--text-primary)", border:"1px solid var(--border)" },
danger:    { background:"rgba(239,68,68,0.15)", color:"#f87171", border:"1px solid rgba(239,68,68,0.4)" },
        };
        return (
    <button onClick={onClick} disabled={disabled || loading}
className={`rounded-lg font-semibold tracking-wide transition-all hover:opacity-85 active:scale-95 ${small?"px-3 py-1.5 text-xs":"px-4 py-2.5 text-sm"}`}
style={{ ...styles[variant], opacity:(disabled||loading)?0.5:1,
cursor:(disabled||loading)?"not-allowed":"pointer", fontFamily:"var(--font-display)" }}>
        {loading ? "..." : children}
    </button>
        );
        }

// ── PRODUCT CARD ───────────────────────────────────────────────────────────────
function ProductCard({ product: p, onEdit, onDelete }) {
        const status = p.statusStok || (p.stock === 0 ? "Habis" : p.stock <= 5 ? "Menipis" : "Tersedia");
        const statusColor = status === "Tersedia" ? "green" : status === "Menipis" ? "yellow" : "red";
        return (
    <div className="rounded-xl overflow-hidden flex flex-col transition-all hover:-translate-y-1"
style={{ background:"var(--surface)", border:"1px solid var(--border)", boxShadow:"0 4px 24px rgba(0,0,0,0.3)" }}>
      <div className="px-5 py-4 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-2xl">{CATEGORY_ICONS[p.category]}</span>
          <div className="flex gap-1.5 flex-wrap justify-end">
            <Badge label={p.jenis} color="blue" />
            <Badge label={status} color={statusColor} />
        {p.hasDiscount && <Badge label={`-${p.discountPercent}%`} color="orange" />}
          </div>
        </div>
        <p className="text-xs font-mono mb-1" style={{ color:"var(--accent)" }}>{p.id}</p>
        <h3 className="font-bold text-base mb-1 leading-snug"
style={{ color:"var(--text-primary)", fontFamily:"var(--font-display)" }}>{p.name}</h3>
        <p className="text-xs mb-3" style={{ color:"var(--text-muted)" }}>{p.category} · Size: {p.size}</p>
        {p.hasDiscount && <p className="text-xs line-through mb-0.5" style={{ color:"var(--text-muted)" }}>{formatRp(p.price)}</p>}
        <p className="text-xl font-black" style={{ color:"var(--accent)", fontFamily:"var(--font-display)" }}>{formatRp(p.finalPrice)}</p>
        <p className="text-xs mt-1" style={{ color:"var(--text-muted)" }}>Stok: <span className="font-mono">{p.stock}</span></p>
      </div>
      <div className="px-4 py-3 flex gap-2 border-t" style={{ borderColor:"var(--border)" }}>
<Btn small variant="secondary" onClick={() => onEdit(p)}>Edit</Btn>
<Btn small variant="danger"    onClick={() => onDelete(p.id)}>Hapus</Btn>
      </div>
    </div>
        );
        }

// ── PRODUCT FORM ───────────────────────────────────────────────────────────────
function ProductForm({ initial, onSave, onClose }) {
        const [nama,            setNama]            = useState(initial?.name            || "");
  const [harga,           setHarga]           = useState(initial?.price           || "");
  const [stok,            setStok]            = useState(initial?.stock           || "");
  const [size,            setSize]            = useState(initial?.size            || "");
  const [kategori,        setKategori]        = useState(initial?.category        || KATEGORI_LIST[0]);
  const [jenis,           setJenis]           = useState(initial?.jenis           || JENIS_MAP[initial?.category || KATEGORI_LIST[0]][0]);
  const [hasDiscount,     setHasDiscount]     = useState(initial?.hasDiscount     || false);
  const [discountPercent, setDiscountPercent] = useState(initial?.discountPercent || "");
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");

function handleKategoriChange(k) { setKategori(k); setJenis(JENIS_MAP[k][0]); }

async function handleSubmit() {
    if (!nama || !harga || !stok) { setError("Nama, harga, dan stok wajib diisi."); return; }
    setLoading(true);
    setError("");
    try {
        if (initial) {
            // UPDATE — hanya nama, harga, stok (sesuai ProductService.updateLengkap)
            await productApi.update(initial.id, { name: nama, price: parseFloat(harga), stock: parseInt(stok) });
        } else {
            // CREATE
            await productApi.create({
                    name: nama, price: parseFloat(harga), stock: parseInt(stok), size,
                    category: kategori, jenis,
                    hasDiscount, discountPercent: hasDiscount ? parseFloat(discountPercent) || 0 : 0,
        });
        }
        onSave();
        onClose();
    } catch (e) {
        setError(e.message);
    } finally {
        setLoading(false);
    }
}

  return (
<>
{error && <p className="mb-3 text-xs px-3 py-2 rounded-lg" style={{ background:"rgba(239,68,68,0.1)", color:"#f87171" }}>{error}</p>}
      <InputField label="Nama Produk" value={nama} onChange={setNama} required />
        {!initial && <>
        <SelectField label="Kategori" value={kategori} onChange={handleKategoriChange} options={KATEGORI_LIST} />
        <SelectField label="Jenis" value={jenis} onChange={setJenis} options={JENIS_MAP[kategori] || []} />
      </>}
      <InputField label="Harga (Rp)" type="number" value={harga} onChange={setHarga} required />
      <InputField label="Stok"       type="number" value={stok}  onChange={setStok}  required />
        {!initial && <InputField label="Size / Varian" value={size} onChange={setSize} />}
        {!initial && (
        <>
          <div className="mb-4 flex items-center gap-3">
            <input type="checkbox" id="disc" checked={hasDiscount} onChange={e => setHasDiscount(e.target.checked)} className="w-4 h-4 rounded" />
            <label htmlFor="disc" className="text-sm" style={{ color:"var(--text-primary)" }}>Ada Diskon?</label>
          </div>
        {hasDiscount && <InputField label="Persentase Diskon (%)" type="number" value={discountPercent} onChange={setDiscountPercent} />}
        </>
        )}
      <div className="flex gap-3 justify-end mt-6">
        <Btn variant="secondary" onClick={onClose}>Batal</Btn>
        <Btn onClick={handleSubmit} loading={loading}>{initial ? "Simpan Perubahan" : "Tambah Produk"}</Btn>
      </div>
    </>
        );
        }

// ── MEMBER FORM ────────────────────────────────────────────────────────────────
function MemberForm({ initial, onSave, onClose }) {
        const [nama,    setNama]    = useState(initial?.name  || "");
  const [phone,   setPhone]   = useState(initial?.phone || "");
  const [email,   setEmail]   = useState(initial?.email || "");
  const [tier,    setTier]    = useState(initial?.tier  || "REGULAR");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

async function handleSubmit() {
    if (!nama || !phone) { setError("Nama dan telepon wajib diisi."); return; }
    setLoading(true);
    setError("");
    try {
        if (initial) {
            await memberApi.update(initial.id, { name: nama, phone, email });
        } else {
            await memberApi.create({ name: nama, phone, email, tier });
        }
        onSave();
        onClose();
    } catch (e) {
        setError(e.message);
    } finally {
        setLoading(false);
    }
}

  return (
<>
{error && <p className="mb-3 text-xs px-3 py-2 rounded-lg" style={{ background:"rgba(239,68,68,0.1)", color:"#f87171" }}>{error}</p>}
      <InputField label="Nama"       value={nama}  onChange={setNama}  required />
      <InputField label="No. Telepon" value={phone} onChange={setPhone} required />
      <InputField label="Email"      type="email" value={email} onChange={setEmail} />
        {!initial && (
        <SelectField label="Tier" value={tier} onChange={setTier}
options={[{value:"REGULAR",label:"Regular (-10%)"},{value:"PLUS",label:"Plus (-15%)"}]} />
        )}
      <div className="flex gap-3 justify-end mt-6">
        <Btn variant="secondary" onClick={onClose}>Batal</Btn>
        <Btn onClick={handleSubmit} loading={loading}>{initial ? "Simpan Perubahan" : "Daftar Member"}</Btn>
      </div>
    </>
        );
        }

// ── TRANSACTION MODAL ──────────────────────────────────────────────────────────
function TransactionModal({ products, members, onDone, onClose }) {
        const [cart,          setCart]          = useState([]);
  const [memberPhone,   setMemberPhone]   = useState("");
  const [foundMember,   setFoundMember]   = useState(null);
  const [searched,      setSearched]      = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [receipt,       setReceipt]       = useState(null);
  const [error,         setError]         = useState("");

function searchMember() {
    const m = members.find(x => x.phone === memberPhone);
    setFoundMember(m || null);
    setSearched(true);
}

function addToCart(p) {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === p.id);
    if (ex) return prev.map(i => i.product.id === p.id ? {...i, qty: i.qty + 1} : i);
    return [...prev, { product: p, qty: 1 }];
    });
}

function removeFromCart(id)    { setCart(prev => prev.filter(i => i.product.id !== id)); }
function updateQty(id, qty)    { qty <= 0 ? removeFromCart(id) : setCart(prev => prev.map(i => i.product.id === id ? {...i, qty} : i)); }

  const memberDiscount  = foundMember ? (foundMember.tier === "PLUS" ? 0.15 : 0.10) : 0;
        const subtotal        = cart.reduce((s, i) => s + i.product.finalPrice * i.qty, 0);
        const discountAmount  = subtotal * memberDiscount;
  const total           = subtotal - discountAmount;

async function checkout() {
    if (cart.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const trxData = {
                memberPhone: foundMember?.phone || "",
                items: cart.map(i => ({ productId: i.product.id, qty: i.qty })),
      };
      const trx = await transactionApi.create(trxData);
        setReceipt(trx);
        onDone(); // refresh data di parent
    } catch (e) {
        setError(e.message);
    } finally {
        setLoading(false);
    }
}

// ── Struk setelah checkout ───────────────────────────────────────
  if (receipt) {
        return (
      <div className="text-center">
        <div className="text-4xl mb-3">🏁</div>
        <h3 className="text-lg font-bold mb-1" style={{ color:"var(--accent)", fontFamily:"var(--font-display)" }}>Transaksi Berhasil!</h3>
        <p className="text-xs font-mono mb-4" style={{ color:"var(--text-muted)" }}>{receipt.id} · {receipt.date}</p>
        <div className="rounded-xl p-4 mb-4 text-left" style={{ background:"var(--surface-elevated)", border:"1px solid var(--border)" }}>
        {receipt.items?.map(i => (
        <div key={i.productId} className="flex justify-between text-sm py-1.5 border-b" style={{ borderColor:"var(--border)" }}>
              <span style={{ color:"var(--text-primary)" }}>{i.productName} × {i.qty}</span>
              <span className="font-mono" style={{ color:"var(--text-muted)" }}>{formatRp(i.subtotal)}</span>
            </div>
        ))}
          <div className="flex justify-between text-sm py-1.5" style={{ color:"var(--text-muted)" }}>
            <span>Subtotal</span><span>{formatRp(receipt.subtotal)}</span>
          </div>
        {receipt.memberDiscount > 0 && (
            <div className="flex justify-between text-sm py-1" style={{ color:"#f97316" }}>
<span>Diskon Member</span><span>- {formatRp(receipt.memberDiscount)}</span>
            </div>
        )}
          <div className="flex justify-between font-black text-base pt-2 mt-1 border-t"
style={{ borderColor:"var(--border)", color:"var(--accent)" }}>
            <span>TOTAL</span><span>{formatRp(receipt.total)}</span>
          </div>
        </div>
        <Btn onClick={onClose}>Selesai</Btn>
      </div>
        );
        }

        // ── Form transaksi ───────────────────────────────────────────────
        return (
<div>
{/* Cari member */}
      <div className="mb-5 p-4 rounded-xl" style={{ background:"var(--surface-elevated)", border:"1px solid var(--border)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color:"var(--text-muted)" }}>Identifikasi Member</p>
        <div className="flex gap-2">
          <input value={memberPhone} onChange={e => setMemberPhone(e.target.value)}
placeholder="No. Telepon Member..."
className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
style={{ background:"var(--surface)", border:"1px solid var(--border)", color:"var(--text-primary)", fontFamily:"var(--font-mono)" }} />
<Btn small onClick={searchMember}>Cari</Btn>
        </div>
        {searched && (
                <p className="mt-2 text-sm" style={{ color: foundMember ? "#4ade80" : "#f87171" }}>
        {foundMember
              ? `✅ ${foundMember.name} — Tier ${foundMember.tier} (diskon ${foundMember.tier === "PLUS" ? "15" : "10"}%)`
        : "❌ Member tidak ditemukan. Lanjut sebagai Non-Member."}
          </p>
        )}
      </div>

        {/* Pilih produk */}
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color:"var(--text-muted)" }}>Pilih Produk</p>
      <div className="grid grid-cols-1 gap-2 mb-5 max-h-52 overflow-y-auto pr-1">
        {products.filter(p => p.stock > 0).map(p => (
        <div key={p.id} className="flex items-center justify-between p-3 rounded-lg"
style={{ background:"var(--surface-elevated)", border:"1px solid var(--border)" }}>
            <div>
              <p className="text-sm font-semibold" style={{ color:"var(--text-primary)" }}>{p.name}</p>
              <p className="text-xs font-mono" style={{ color:"var(--accent)" }}>{formatRp(p.finalPrice)}</p>
            </div>
<Btn small onClick={() => addToCart(p)}>+ Tambah</Btn>
        </div>
        ))}
      </div>

        {/* Keranjang */}
        {cart.length > 0 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color:"var(--text-muted)" }}>Keranjang</p>
          <div className="rounded-xl overflow-hidden mb-4" style={{ border:"1px solid var(--border)" }}>
        {cart.map(item => (
        <div key={item.product.id} className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor:"var(--border)" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color:"var(--text-primary)" }}>{item.product.name}</p>
                  <p className="text-xs font-mono" style={{ color:"var(--text-muted)" }}>{formatRp(item.product.finalPrice)} × {item.qty}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button onClick={() => updateQty(item.product.id, item.qty - 1)} className="w-6 h-6 rounded text-sm font-bold flex items-center justify-center" style={{ background:"var(--border)", color:"var(--text-primary)" }}>−</button>
                  <span className="text-sm font-mono w-5 text-center" style={{ color:"var(--text-primary)" }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.product.id, item.qty + 1)} className="w-6 h-6 rounded text-sm font-bold flex items-center justify-center" style={{ background:"var(--border)", color:"var(--text-primary)" }}>+</button>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 text-lg leading-none ml-1">×</button>
                </div>
              </div>
        ))}
            <div className="px-4 py-3" style={{ background:"var(--surface-elevated)" }}>
              <div className="flex justify-between text-sm mb-1" style={{ color:"var(--text-muted)" }}>
                <span>Subtotal</span><span className="font-mono">{formatRp(subtotal)}</span>
              </div>
        {discountAmount > 0 && (
                <div className="flex justify-between text-sm mb-1" style={{ color:"#f97316" }}>
<span>Diskon Member</span><span className="font-mono">- {formatRp(discountAmount)}</span>
                </div>
        )}
              <div className="flex justify-between font-black text-base pt-2 border-t" style={{ borderColor:"var(--border)", color:"var(--accent)" }}>
                <span>TOTAL</span><span>{formatRp(total)}</span>
              </div>
            </div>
          </div>
        {error && <p className="mb-3 text-xs text-red-400">{error}</p>}
          <div className="flex justify-end">
            <Btn onClick={checkout} loading={loading}>🏁 Checkout</Btn>
          </div>
        </>
        )}
    </div>
        );
        }

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab,    setActiveTab]    = useState("dashboard");
  const [products,     setProducts]     = useState([]);
  const [members,      setMembers]      = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [modal,        setModal]        = useState(null);
  const [filterKat,    setFilterKat]    = useState("Semua");
  const [toast,        setToast]        = useState(null);
  const [loadingData,  setLoadingData]  = useState(true);
  const [serverError,  setServerError]  = useState(false);

    function showToast(msg, type = "success") {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }

    // ── Fetch data dari Java backend ──────────────────────────────────
  const refreshAll = useCallback(async () => {
            setLoadingData(true);
    setServerError(false);
    try {
      const [p, m, t] = await Promise.all([
                productApi.getAll(),
                memberApi.getAll(),
                transactionApi.getAll(),
      ]);
        setProducts(p);
        setMembers(m);
        setTransactions(t);
    } catch {
        setServerError(true);
    } finally {
        setLoadingData(false);
    }
  }, []);

    useEffect(() => { refreshAll(); }, [refreshAll]);

    // ── Aksi CRUD ─────────────────────────────────────────────────────
    async function deleteProduct(id) {
        try {
            await productApi.delete(id);
            showToast("Produk dihapus.");
            refreshAll();
        } catch (e) { showToast(e.message, "error"); }
    }

    async function deleteMember(id) {
        try {
            await memberApi.delete(id);
            showToast("Member dihapus.");
            refreshAll();
        } catch (e) { showToast(e.message, "error"); }
    }

  const filteredProducts = filterKat === "Semua" ? products : products.filter(p => p.category === filterKat);
  const totalRevenue     = transactions.reduce((s, t) => s + (t.total || 0), 0);

  const tabs = [
    { id:"dashboard",    label:"Dashboard",  icon:"◈" },
    { id:"products",     label:"Produk",     icon:"▤" },
    { id:"members",      label:"Member",     icon:"◎" },
    { id:"transactions", label:"Transaksi",  icon:"≡" },
  ];

    // ── Loading / Error state ─────────────────────────────────────────
    if (loadingData) return (
            <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0a0a0b", color:"#FF7800", fontFamily:"monospace", fontSize:14 }}>
    Menghubungkan ke server Java...
    </div>
  );

    if (serverError) return (
            <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#0a0a0b", color:"#f87171", fontFamily:"monospace", fontSize:14, gap:12 }}>
      <span style={{ fontSize:32 }}>⚠️</span>
            <p>Tidak dapat terhubung ke server Java di <strong>localhost:8080</strong>.</p>
            <p style={{ color:"#6b6b7a" }}>Pastikan Main.java sudah dijalankan di IntelliJ.</p>
            <button onClick={refreshAll} style={{ marginTop:8, padding:"8px 20px", background:"#FF7800", color:"#000", border:"none", borderRadius:8, cursor:"pointer", fontWeight:"bold" }}>
    Coba Lagi
      </button>
            </div>
  );

    return (
            <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        :root {
        --accent: #FF7800; --accent-dim: rgba(255,120,0,0.15);
        --bg: #0a0a0b; --surface: #111114; --surface-elevated: #18181c;
        --border: rgba(255,255,255,0.08);
        --text-primary: #f0f0f0; --text-muted: #6b6b7a;
        --font-display: 'Bebas Neue', sans-serif; --font-mono: 'Space Mono', monospace;
    }
        * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); font-family: var(--font-mono); }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: var(--surface); }
        ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 2px; }
    select option { background: #18181c; }
      `}</style>

            <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text-primary)" }}>

    {/* HEADER */}
        <header style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:40 }}>
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center font-black text-black text-sm"
    style={{ background:"var(--accent)", fontFamily:"var(--font-display)" }}>M</div>
            <div>
            <h1 className="text-base font-bold leading-none tracking-widest"
    style={{ fontFamily:"var(--font-display)", color:"var(--text-primary)", letterSpacing:"0.15em" }}>
    McLAREN COLLECTION
                </h1>
            <p className="text-xs" style={{ color:"var(--text-muted)" }}>MERCHANDISE MANAGEMENT SYSTEM</p>
            </div>
            </div>
            <Btn onClick={() => setModal("transaction")}>🛒 Transaksi Baru</Btn>
            </div>
            <div className="max-w-7xl mx-auto px-4 flex gap-0 border-t" style={{ borderColor:"var(--border)" }}>
    {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="px-5 py-2.5 text-sm font-semibold tracking-widest transition-all"
            style={{
                    color: activeTab === t.id ? "var(--accent)" : "var(--text-muted)",
            fontFamily:"var(--font-display)", letterSpacing:"0.1em", background:"none",
            border:"none", cursor:"pointer",
            borderBottom: activeTab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
                }}>
        {t.icon} {t.label}
              </button>
            ))}
          </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">

            {/* DASHBOARD */}
    {activeTab === "dashboard" && (
            <div>
            <h2 className="text-4xl mb-6" style={{ fontFamily:"var(--font-display)", letterSpacing:"0.05em" }}>OVERVIEW</h2>
            <div className="grid grid-cols-2 gap-4 mb-8" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))" }}>
        {[
            { label:"Total Produk",  value: products.length,      icon:"▤", color:"#60a5fa" },
            { label:"Total Member",  value: members.length,       icon:"◎", color:"#a78bfa" },
            { label:"Transaksi",     value: transactions.length,  icon:"≡", color:"#34d399" },
            { label:"Total Revenue", value: formatRp(totalRevenue),icon:"◈", color:"var(--accent)" },
                ].map(s => (
                <div key={s.label} className="rounded-xl p-5" style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
                    <div className="flex items-start justify-between mb-3">
                <span className="text-xl" style={{ color:s.color }}>{s.icon}</span>
                </div>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color:"var(--text-muted)" }}>{s.label}</p>
                <p className="text-2xl font-bold" style={{ fontFamily:"var(--font-display)", color:s.color, letterSpacing:"0.03em" }}>{s.value}</p>
                </div>
                ))}
              </div>

            <h3 className="text-xl mb-3" style={{ fontFamily:"var(--font-display)", color:"var(--text-muted)", letterSpacing:"0.1em" }}>BREAKDOWN KATEGORI</h3>
            <div className="grid grid-cols-1 gap-3 mb-8" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))" }}>
        {KATEGORI_LIST.map(k => {
                  const count    = products.filter(p => p.category === k).length;
                  const totalStk = products.filter(p => p.category === k).reduce((s, p) => s + p.stock, 0);
            return (
                    <div key={k} className="rounded-xl p-4 flex items-center gap-3" style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
                      <span className="text-2xl">{CATEGORY_ICONS[k]}</span>
                <div>
                <p className="text-sm font-bold" style={{ color:"var(--text-primary)" }}>{k}</p>
                <p className="text-xs" style={{ color:"var(--text-muted)" }}>{count} produk · {totalStk} stok</p>
                </div>
                </div>
                  );
                })}
              </div>

            <h3 className="text-xl mb-3" style={{ fontFamily:"var(--font-display)", color:"var(--text-muted)", letterSpacing:"0.1em" }}>MEMBER TIER</h3>
            <div className="grid grid-cols-2 gap-3" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))" }}>
        {["REGULAR","PLUS"].map(tier => (
                <div key={tier} className="rounded-xl p-4" style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
                    <Badge label={tier} color={tier === "PLUS" ? "orange" : "blue"} />
                <p className="text-3xl font-black mt-2" style={{ fontFamily:"var(--font-display)", color:"var(--text-primary)" }}>
            {members.filter(m => m.tier === tier).length}
                    </p>
                <p className="text-xs" style={{ color:"var(--text-muted)" }}>member</p>
                </div>
                ))}
              </div>
            </div>
          )}

    {/* PRODUCTS */}
    {activeTab === "products" && (
            <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-4xl" style={{ fontFamily:"var(--font-display)", letterSpacing:"0.05em" }}>PRODUK</h2>
            <Btn onClick={() => setModal("add-product")}>+ Tambah Produk</Btn>
            </div>
            <div className="flex gap-2 flex-wrap mb-5">
            {["Semua",...KATEGORI_LIST].map(k => (
                    <button key={k} onClick={() => setFilterKat(k)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all"
            style={{ background: filterKat===k?"var(--accent)":"var(--surface)", color:filterKat===k?"#000":"var(--text-muted)",
            border:filterKat===k?"none":"1px solid var(--border)", fontFamily:"var(--font-display)",
            letterSpacing:"0.08em", cursor:"pointer" }}>
        {k}
                  </button>
                ))}
              </div>
            {filteredProducts.length === 0
                    ? <p style={{ color:"var(--text-muted)" }}>Belum ada produk.</p>
                : <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))" }}>
        {filteredProducts.map(p => (
                        <ProductCard key={p.id} product={p}
                onEdit={prod => setModal({ type:"edit-product", data:prod })}
            onDelete={deleteProduct} />
                    ))}
                  </div>}
            </div>
          )}

    {/* MEMBERS */}
    {activeTab === "members" && (
            <div>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-4xl" style={{ fontFamily:"var(--font-display)", letterSpacing:"0.05em" }}>MEMBER</h2>
            <Btn onClick={() => setModal("add-member")}>+ Daftar Member</Btn>
            </div>
            {members.length === 0
                    ? <p style={{ color:"var(--text-muted)" }}>Belum ada member.</p>
                : <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))" }}>
        {members.map(m => (
                <div key={m.id} className="rounded-xl p-5" style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
                        <div className="flex items-start justify-between mb-3">
                <div>
                <p className="text-xs font-mono mb-1" style={{ color:"var(--accent)" }}>{m.id}</p>
                <h3 className="font-bold text-base" style={{ color:"var(--text-primary)", fontFamily:"var(--font-display)", letterSpacing:"0.05em" }}>{m.name}</h3>
                </div>
                <Badge label={m.tier} color={m.tier==="PLUS"?"orange":"blue"} />
                </div>
                <div className="text-xs space-y-1 mb-4" style={{ color:"var(--text-muted)" }}>
                          <p>📞 {m.phone}</p>
                <p>✉️ {m.email}</p>
                <p>🛒 {m.totalTransaksi} transaksi</p>
                <p>💰 Total belanja: <span className="font-mono" style={{ color:"var(--text-primary)" }}>{formatRp(m.totalBelanja)}</span></p>
                {m.tier === "REGULAR" && (
                        <div>
                        <p>Menuju PLUS: <span className="font-mono">{formatRp(Math.max(0, 5_000_000 - m.totalBelanja))} lagi</span></p>
                <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background:"var(--border)" }}>
                                <div style={{ width:`${Math.min(100,(m.totalBelanja/5_000_000)*100)}%`, background:"var(--accent)", height:"100%", borderRadius:"9999px" }} />
                              </div>
                </div>
                          )}
                        </div>
                <div className="flex gap-2">
                <Btn small variant="secondary" onClick={() => setModal({type:"edit-member", data:m})}>Edit</Btn>
                <Btn small variant="danger"    onClick={() => deleteMember(m.id)}>Hapus</Btn>
                </div>
                </div>
                    ))}
                  </div>}
            </div>
          )}

    {/* TRANSACTIONS */}
    {activeTab === "transactions" && (
            <div>
            <h2 className="text-4xl mb-5" style={{ fontFamily:"var(--font-display)", letterSpacing:"0.05em" }}>RIWAYAT TRANSAKSI</h2>
            {transactions.length === 0
                    ? <p style={{ color:"var(--text-muted)" }}>Belum ada transaksi.</p>
                : <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))" }}>
        {[...transactions].reverse().map(t => (
                <div key={t.id} className="rounded-xl p-5" style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
                        <div className="flex items-center justify-between mb-2">
                <p className="font-mono text-sm font-bold" style={{ color:"var(--accent)" }}>{t.id}</p>
                <p className="text-xs" style={{ color:"var(--text-muted)" }}>{t.date}</p>
                </div>
                <p className="text-xs mb-3" style={{ color:"var(--text-muted)" }}>
            {t.member ? `👤 ${t.member.name} (${t.member.tier})` : "👤 Non-Member"}
                        </p>
                <div className="text-xs space-y-1 mb-3">
                {t.items?.map(i => (
                        <div key={i.productId} className="flex justify-between" style={{ color:"var(--text-muted)" }}>
                              <span className="truncate mr-2">{i.productName} ×{i.qty}</span>
                <span className="font-mono flex-shrink-0">{formatRp(i.subtotal)}</span>
                </div>
                          ))}
                        </div>
                <div className="pt-2 border-t flex justify-between items-center" style={{ borderColor:"var(--border)" }}>
                          <span className="text-xs" style={{ color:"var(--text-muted)" }}>Total</span>
                <span className="font-black text-base" style={{ fontFamily:"var(--font-display)", color:"var(--accent)" }}>{formatRp(t.total)}</span>
                </div>
                </div>
                    ))}
                  </div>}
            </div>
          )}
        </main>

            {/* MODALS */}
    {modal === "add-product" && (
            <Modal title="Tambah Produk Baru" onClose={() => setModal(null)}>
            <ProductForm onSave={refreshAll} onClose={() => setModal(null)} />
            </Modal>
        )}
    {modal?.type === "edit-product" && (
            <Modal title="Edit Produk" onClose={() => setModal(null)}>
            <ProductForm initial={modal.data} onSave={refreshAll} onClose={() => setModal(null)} />
            </Modal>
        )}
    {modal === "add-member" && (
            <Modal title="Daftar Member Baru" onClose={() => setModal(null)}>
            <MemberForm onSave={refreshAll} onClose={() => setModal(null)} />
            </Modal>
        )}
    {modal?.type === "edit-member" && (
            <Modal title="Edit Member" onClose={() => setModal(null)}>
            <MemberForm initial={modal.data} onSave={refreshAll} onClose={() => setModal(null)} />
            </Modal>
        )}
    {modal === "transaction" && (
            <Modal title="Transaksi Baru" onClose={() => setModal(null)}>
            <TransactionModal
        products={products} members={members}
        onDone={refreshAll} onClose={() => setModal(null)} />
            </Modal>
        )}

    {/* TOAST */}
    {toast && (
            <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl"
        style={{ background:toast.type==="success"?"#16a34a":"#dc2626", color:"#fff", fontFamily:"var(--font-mono)" }}>
        {toast.msg}
          </div>
        )}
      </div>
            </>
  );
}