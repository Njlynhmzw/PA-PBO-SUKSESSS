import { useState } from "react";
import { Badge, Btn, InputField, SelectField } from "./UI.jsx";
import { KATEGORI_LIST, JENIS_MAP, CATEGORY_ICONS, formatRp, getFinalPrice, getStatusStok, statusColor } from "../constants.js";

// ── PRODUCT CARD ───────────────────────────────────────────────────
export function ProductCard({ product: p, onEdit, onDelete }) {
  const finalPrice = getFinalPrice(p);
  const status     = getStatusStok(p);
  const badgeColor = statusColor(status);

  return (
    <div className="product-card">
      <div className="product-card-body">
        <div className="product-top">
          <span className="product-emoji">{CATEGORY_ICONS[p.category] ?? "📦"}</span>
          <div className="product-badges">
            <Badge label={p.jenis}  color="blue" />
            <Badge label={status}   color={badgeColor.replace("badge-", "")} />
            {p.hasDiscount && p.discountPercent > 0 && (
              <Badge label={`-${p.discountPercent}%`} color="orange" />
            )}
          </div>
        </div>

        <p className="product-id">{p.id}</p>
        <h3 className="product-name">{p.name}</h3>
        <p className="product-meta">{p.category} · Size: {p.size}</p>

        {p.hasDiscount && p.price !== finalPrice && (
          <p className="product-orig">{formatRp(p.price)}</p>
        )}
        <p className="product-price">{formatRp(finalPrice)}</p>
        <p className="product-stock">Stok: <span>{p.stock}</span></p>
      </div>

      <div className="product-card-footer">
        <Btn small variant="secondary" onClick={() => onEdit(p)}>Edit</Btn>
        <Btn small variant="danger"    onClick={() => onDelete(p.id)}>Hapus</Btn>
      </div>
    </div>
  );
}

// ── PRODUCT FORM ───────────────────────────────────────────────────
export function ProductForm({ initial, onSave, onClose }) {
  const defaultKat = initial?.category || KATEGORI_LIST[0];

  const [nama,            setNama]            = useState(initial?.name            ?? "");
  const [harga,           setHarga]           = useState(initial?.price           ?? "");
  const [stok,            setStok]            = useState(initial?.stock           ?? "");
  const [size,            setSize]            = useState(initial?.size            ?? "");
  const [kategori,        setKategori]        = useState(defaultKat);
  const [jenis,           setJenis]           = useState(initial?.jenis           ?? JENIS_MAP[defaultKat][0]);
  const [hasDiscount,     setHasDiscount]     = useState(initial?.hasDiscount     ?? false);
  const [discountPercent, setDiscountPercent] = useState(initial?.discountPercent ?? "");
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");

  function handleKategoriChange(k) {
    setKategori(k);
    setJenis(JENIS_MAP[k][0]);
  }

  async function handleSubmit() {
    if (!nama.trim() || !harga || !stok) {
      setError("Nama, harga, dan stok wajib diisi.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (initial) {
        // UPDATE: hanya nama, harga, stok (sesuai ProductService.updateLengkap)
        await onSave(initial.id, {
          name:  nama.trim(),
          price: parseFloat(harga),
          stock: parseInt(stok),
        });
      } else {
        // CREATE
        await onSave(null, {
          name:            nama.trim(),
          price:           parseFloat(harga),
          stock:           parseInt(stok),
          size:            size.trim() || "-",
          category:        kategori,
          jenis,
          hasDiscount,
          discountPercent: hasDiscount ? parseFloat(discountPercent) || 0 : 0,
        });
      }
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {error && <div className="form-error">{error}</div>}

      <InputField label="Nama Produk" value={nama} onChange={setNama} required />

      {/* Kategori & jenis hanya untuk produk baru */}
      {!initial && (
        <>
          <SelectField
            label="Kategori"
            value={kategori}
            onChange={handleKategoriChange}
            options={KATEGORI_LIST}
          />
          <SelectField
            label="Jenis"
            value={jenis}
            onChange={setJenis}
            options={JENIS_MAP[kategori] || []}
          />
        </>
      )}

      <InputField label="Harga (Rp)" type="number" value={harga} onChange={setHarga} required />
      <InputField label="Stok"       type="number" value={stok}  onChange={setStok}  required />

      {!initial && (
        <>
          <InputField label="Size / Varian" value={size} onChange={setSize} placeholder="M, L, XL, Free Size, 42, ..." />

          <div className="form-checkbox-row">
            <input
              type="checkbox"
              id="hasDiscount"
              checked={hasDiscount}
              onChange={e => setHasDiscount(e.target.checked)}
            />
            <label htmlFor="hasDiscount">Ada Diskon?</label>
          </div>

          {hasDiscount && (
            <InputField
              label="Persentase Diskon (%)"
              type="number"
              value={discountPercent}
              onChange={setDiscountPercent}
              placeholder="Contoh: 10"
            />
          )}
        </>
      )}

      <div className="form-actions">
        <Btn variant="secondary" onClick={onClose}>Batal</Btn>
        <Btn onClick={handleSubmit} loading={loading}>
          {initial ? "Simpan Perubahan" : "Tambah Produk"}
        </Btn>
      </div>
    </>
  );
}