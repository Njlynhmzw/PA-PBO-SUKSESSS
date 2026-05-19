// ── BADGE ─────────────────────────────────────────────────────────
export function Badge({ label, color = "blue" }) {
  return <span className={`badge badge-${color}`}>{label}</span>;
}

// ── BUTTON ────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = "primary", disabled, small, large, loading, type = "button" }) {
  const size = small ? "btn-sm" : large ? "btn-lg" : "";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} ${size} ${loading ? "btn-loading" : ""}`}
    >
      {loading ? "..." : children}
    </button>
  );
}

// ── MODAL ─────────────────────────────────────────────────────────
export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ── INPUT FIELD ───────────────────────────────────────────────────
export function InputField({ label, type = "text", value, onChange, required, placeholder }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && " *"}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="form-input"
      />
    </div>
  );
}

// ── SELECT FIELD ──────────────────────────────────────────────────
export function SelectField({ label, value, onChange, options }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="form-select"
      >
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? o}
          </option>
        ))}
      </select>
    </div>
  );
}