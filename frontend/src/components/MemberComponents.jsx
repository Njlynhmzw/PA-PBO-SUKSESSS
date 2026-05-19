import { useState } from "react";
import { Badge, Btn, InputField, SelectField } from "./UI.jsx";
import { formatRp, plusProgress, sisaMenujuPlus } from "../constants.js";

// ── MEMBER CARD ────────────────────────────────────────────────────
export function MemberCard({ member: m, onEdit, onDelete }) {
  const isRegular  = m.tier === "REGULAR";
  const progress   = plusProgress(m.totalBelanja);
  const sisa       = sisaMenujuPlus(m.totalBelanja);

  return (
    <div className="member-card">
      <div className="member-card-top">
        <div>
          <p className="member-id">{m.id}</p>
          <h3 className="member-name">{m.name}</h3>
        </div>
        <Badge label={m.tier} color={m.tier === "PLUS" ? "orange" : "blue"} />
      </div>

      <div className="member-info">
        <p>📞 {m.phone}</p>
        <p>✉️ {m.email || "—"}</p>
        <p>🛒 {m.totalTransaksi} transaksi</p>
        <p>
          💰 Total belanja:{" "}
          <span className="val">{formatRp(m.totalBelanja)}</span>
        </p>
      </div>

      {isRegular && (
        <div>
          <p className="progress-label">
            Menuju PLUS:{" "}
            <span style={{ fontFamily: "var(--font-mono)" }}>{formatRp(sisa)}</span> lagi
          </p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="member-actions">
        <Btn small variant="secondary" onClick={() => onEdit(m)}>Edit</Btn>
        <Btn small variant="danger"    onClick={() => onDelete(m.id)}>Hapus</Btn>
      </div>
    </div>
  );
}

// ── MEMBER FORM ────────────────────────────────────────────────────
export function MemberForm({ initial, onSave, onClose }) {
  const [nama,    setNama]    = useState(initial?.name  ?? "");
  const [phone,   setPhone]   = useState(initial?.phone ?? "");
  const [email,   setEmail]   = useState(initial?.email ?? "");
  const [tier,    setTier]    = useState(initial?.tier  ?? "REGULAR");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit() {
    if (!nama.trim() || !phone.trim()) {
      setError("Nama dan nomor telepon wajib diisi.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSave({ name: nama.trim(), phone: phone.trim(), email: email.trim(), tier });
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

      <InputField label="Nama"        value={nama}  onChange={setNama}  required />
      <InputField label="No. Telepon" value={phone} onChange={setPhone} required placeholder="08xxxxxxxxxx" />
      <InputField label="Email"       type="email" value={email} onChange={setEmail} />

      {/* Tier hanya untuk member baru */}
      {!initial && (
        <SelectField
          label="Tier"
          value={tier}
          onChange={setTier}
          options={[
            { value: "REGULAR", label: "Regular (diskon 10%)" },
            { value: "PLUS",    label: "Plus (diskon 15%)" },
          ]}
        />
      )}

      <div className="form-actions">
        <Btn variant="secondary" onClick={onClose}>Batal</Btn>
        <Btn onClick={handleSubmit} loading={loading}>
          {initial ? "Simpan Perubahan" : "Daftar Member"}
        </Btn>
      </div>
    </>
  );
}