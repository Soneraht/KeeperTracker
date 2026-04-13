import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const theme = {
  bg: "#0a0f1e",
  surface: "#111827",
  surfaceAlt: "#1a2235",
  border: "#1e3a5f",
  primary: "#1d6ef5",
  primaryHover: "#2d7fff",
  primaryLight: "#1d3a6e",
  accent: "#38bdf8",
  text: "#e8edf5",
  textMuted: "#8899b0",
  danger: "#ef4444",
  success: "#22c55e",
  warning: "#f59e0b",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${theme.bg};
    color: ${theme.text};
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
  }

  .app {
    max-width: 480px;
    margin: 0 auto;
    padding: 0 0 80px 0;
    min-height: 100vh;
    position: relative;
  }

  .header {
    background: #c0001a;
    border-bottom: 1px solid #8b0000;
    padding: 0 20px;
    position: sticky;
    top: 0;
    z-index: 100;
    height: 60px;
    display: flex;
    align-items: center;
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 18px;
    letter-spacing: -0.5px;
    color: #ffffff;
    display: flex;
    align-items: baseline;
    gap: 5px;
  }

  .logo-beta {
    font-size: 10px;
    font-weight: 400;
    color: rgba(255,255,255,0.7);
    letter-spacing: 0.5px;
    font-family: 'DM Sans', sans-serif;
    text-transform: lowercase;
  }

  .help-btn {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    color: white;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
    font-family: 'Syne', sans-serif;
    flex-shrink: 0;
  }
  .help-btn:hover { background: rgba(255,255,255,0.25); }

  .bottom-nav {
    position: fixed;
    bottom: 0; left: 50%;
    transform: translateX(-50%);
    width: 100%; max-width: 480px;
    background: ${theme.surface};
    border-top: 1px solid ${theme.border};
    display: flex;
    z-index: 100;
  }

  .nav-btn {
    flex: 1; background: none; border: none;
    color: ${theme.textMuted};
    padding: 10px 4px; cursor: pointer;
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    font-size: 10px; font-family: 'DM Sans', sans-serif; font-weight: 500;
    transition: color 0.2s;
    border-top: 2px solid transparent; margin-top: -1px;
  }
  .nav-btn.active { color: ${theme.accent}; border-top-color: ${theme.accent}; }
  .nav-icon { font-size: 18px; line-height: 1; }

  .content { padding: 20px; }

  .card {
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: 14px;
    padding: 18px;
    margin-bottom: 14px;
  }

  .card-title {
    font-family: 'Syne', sans-serif;
    font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1.2px;
    color: ${theme.textMuted};
    margin-bottom: 14px;
  }

  .btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 14px 18px; border-radius: 10px; border: none;
    font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 15px;
    cursor: pointer; transition: all 0.18s; width: 100%; margin-bottom: 10px;
  }
  .btn-primary { background: linear-gradient(135deg, ${theme.primary} 0%, #1456c8 100%); color: white; box-shadow: 0 4px 20px rgba(29,110,245,0.35); }
  .btn-primary:hover { background: linear-gradient(135deg, ${theme.primaryHover} 0%, ${theme.primary} 100%); transform: translateY(-1px); }
  .btn-secondary { background: ${theme.surfaceAlt}; color: ${theme.text}; border: 1px solid ${theme.border}; }
  .btn-secondary:hover { border-color: ${theme.primary}; color: ${theme.accent}; }
  .btn-danger { background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%); color: white; }
  .btn-success { background: linear-gradient(135deg, #15803d 0%, #22c55e 100%); color: white; box-shadow: 0 4px 20px rgba(34,197,94,0.3); }
  .btn-warning { background: linear-gradient(135deg, #b45309 0%, #f59e0b 100%); color: white; box-shadow: 0 4px 20px rgba(245,158,11,0.3); }
  .btn-sm { padding: 8px 14px; font-size: 13px; width: auto; margin-bottom: 0; border-radius: 8px; }
  .btn-row { display: flex; gap: 10px; }
  .btn-row .btn { margin-bottom: 0; }

  .active-route-card {
    background: linear-gradient(135deg, #0d2545 0%, #0a1929 100%);
    border: 1px solid ${theme.primary};
    border-radius: 14px; padding: 18px; margin-bottom: 14px;
    position: relative; overflow: hidden;
  }
  .active-route-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, ${theme.primary}, ${theme.accent});
    animation: shimmer 2s ease-in-out infinite;
  }
  @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .pulse-dot {
    display: inline-block; width: 8px; height: 8px;
    background: ${theme.success}; border-radius: 50%; margin-right: 8px;
    animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

  .route-info-label { font-size: 11px; color: ${theme.textMuted}; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 2px; }
  .route-info-value { font-size: 14px; color: ${theme.text}; font-weight: 500; }

  .route-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .route-table th {
    font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1px; color: ${theme.textMuted};
    padding: 8px 10px; text-align: left; border-bottom: 1px solid ${theme.border};
  }
  .route-table td { padding: 8px 10px; border-bottom: 1px solid ${theme.border}22; color: ${theme.text}; vertical-align: middle; }
  .route-table tr:last-child td { border-bottom: none; }

  .client-badge {
    display: inline-block; background: ${theme.primaryLight}; color: ${theme.accent};
    font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px;
  }

  .action-btns { display: flex; gap: 6px; align-items: center; }
  .icon-btn {
    background: none; border: none; cursor: pointer;
    font-size: 15px; padding: 4px 5px; border-radius: 6px;
    transition: background 0.15s; line-height: 1;
  }
  .icon-btn:hover { background: ${theme.surfaceAlt}; }
  .icon-btn-edit { color: ${theme.accent}; }
  .icon-btn-del { color: ${theme.danger}; }

  .input-group { margin-bottom: 12px; }
  .input-label { display: block; font-size: 12px; font-weight: 500; color: ${theme.textMuted}; margin-bottom: 6px; letter-spacing: 0.3px; }
  .input {
    width: 100%; background: ${theme.surfaceAlt}; border: 1px solid ${theme.border};
    border-radius: 9px; color: ${theme.text}; font-family: 'DM Sans', sans-serif;
    font-size: 15px; padding: 12px 14px; outline: none; transition: border-color 0.2s;
  }
  .input:focus { border-color: ${theme.primary}; }
  .input::placeholder { color: ${theme.textMuted}; }

  .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
  .stat-box { background: ${theme.surfaceAlt}; border: 1px solid ${theme.border}; border-radius: 10px; padding: 14px; }
  .stat-label { font-size: 11px; color: ${theme.textMuted}; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; }
  .stat-value { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 700; color: ${theme.accent}; }
  .stat-unit { font-size: 12px; color: ${theme.textMuted}; font-weight: 400; margin-left: 3px; }

  .overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.75);
    backdrop-filter: blur(4px); z-index: 200;
    display: flex; align-items: flex-end; justify-content: center;
  }
  .modal {
    background: ${theme.surface}; border: 1px solid ${theme.border};
    border-radius: 20px 20px 0 0; padding: 24px 20px 36px;
    width: 100%; max-width: 480px; animation: slideUp 0.25s ease;
    max-height: 85vh; overflow-y: auto;
  }
  @keyframes slideUp { from{transform:translateY(60px);opacity:0} to{transform:translateY(0);opacity:1} }
  .modal-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 6px; }
  .modal-subtitle { font-size: 13px; color: ${theme.textMuted}; margin-bottom: 20px; line-height: 1.5; }

  .address-box {
    background: ${theme.surfaceAlt}; border: 1px solid ${theme.border};
    border-radius: 10px; padding: 14px; margin-bottom: 18px;
    font-size: 14px; font-weight: 500; color: ${theme.text};
    word-break: break-word; line-height: 1.5;
  }

  .empty { text-align: center; color: ${theme.textMuted}; padding: 40px 20px; font-size: 14px; }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }

  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .section-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; }

  .filter-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 14px; }
  .filter-input {
    background: ${theme.surfaceAlt}; border: 1px solid ${theme.border};
    border-radius: 8px; color: ${theme.text}; font-family: 'DM Sans', sans-serif;
    font-size: 13px; padding: 9px 10px; outline: none; width: 100%;
  }
  .filter-input:focus { border-color: ${theme.primary}; }
  .filter-input::placeholder { color: ${theme.textMuted}; font-size: 12px; }

  .loc-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid ${theme.border}22; }
  .loc-row:last-child { border-bottom: none; }

  /* ── Live View ── */
  .live-view-card {
    background: ${theme.surface};
    border: 1px solid ${theme.primary};
    border-radius: 14px;
    margin-bottom: 14px;
    overflow: hidden;
    position: relative;
  }
  .live-view-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px;
    background: linear-gradient(135deg, #0d2545 0%, #0a1929 100%);
    border-bottom: 1px solid ${theme.border};
  }
  .live-view-title {
    display: flex; align-items: center; gap: 8px;
    font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1px; color: ${theme.accent};
  }
  .live-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: ${theme.success};
    animation: pulse 1.5s ease-in-out infinite;
    flex-shrink: 0;
  }
  .live-address {
    font-size: 11px; color: ${theme.textMuted};
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 200px;
  }
  .live-view-map {
    width: 100%; height: 220px; border: none; display: block;
  }
  .live-open-btn {
    display: flex; align-items: center; gap: 6px;
    background: none; border: none; cursor: pointer;
    color: ${theme.accent}; font-size: 12px; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    padding: 10px 16px;
    border-top: 1px solid ${theme.border}44;
    width: 100%; justify-content: center;
    transition: background 0.2s;
  }
  .live-open-btn:hover { background: ${theme.surfaceAlt}; }

  /* Help */
  .help-section { margin-bottom: 20px; }
  .help-section-title {
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
    color: ${theme.accent}; text-transform: uppercase; letter-spacing: 1px;
    margin-bottom: 10px; display: flex; align-items: center; gap: 8px;
  }
  .help-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 8px 0; border-bottom: 1px solid ${theme.border}33;
    font-size: 13px; line-height: 1.5; color: ${theme.text};
  }
  .help-item:last-child { border-bottom: none; }
  .help-item-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
  .help-item-text strong { color: ${theme.accent}; display: block; font-size: 13px; margin-bottom: 2px; }
  .help-item-text span { color: ${theme.textMuted}; font-size: 12px; }
`;

// ─── Live View Map ────────────────────────────────────────────────
function LiveView({ address }) {
  const encoded = encodeURIComponent(address);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  const embedUrl = `https://maps.google.com/maps?q=${encoded}&output=embed&z=16`;

  return (
    <div className="live-view-card">
      <div className="live-view-header">
        <div className="live-view-title">
          <span className="live-dot" />
          Live View
        </div>
        <div className="live-address" title={address}>{address}</div>
      </div>
      <iframe
        className="live-view-map"
        src={embedUrl}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Live View χάρτης"
      />
      <button className="live-open-btn" onClick={() => window.open(mapsUrl, "_blank")}>
        🗺️ Άνοιγμα στο Google Maps
      </button>
    </div>
  );
}

// ─── Help Modal ───────────────────────────────────────────────────
function HelpModal({ onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">📖 Οδηγίες Χρήσης</div>
        <div className="modal-subtitle">Τι μπορείς να κάνεις με το Keeper Tracker</div>

        <div className="help-section">
          <div className="help-section-title">🚗 Καταγραφή</div>
          <div className="help-item"><span className="help-item-icon">🏠</span><div className="help-item-text"><strong>Έναρξη από Έδρα</strong><span>Ξεκινά νέα διαδρομή από την αποθηκευμένη διεύθυνση έδρας σου</span></div></div>
          <div className="help-item"><span className="help-item-icon">📍</span><div className="help-item-text"><strong>Έναρξη από GPS</strong><span>Εντοπίζει αυτόματα την τρέχουσα τοποθεσία σου ως σημείο εκκίνησης</span></div></div>
          <div className="help-item"><span className="help-item-icon">✅</span><div className="help-item-text"><strong>Καταγραφή Άφιξης</strong><span>Όταν φτάσεις, πατάς το κουμπί — βρίσκει τη διεύθυνση μέσω GPS και ζητά επιβεβαίωση και όνομα πελάτη</span></div></div>
          <div className="help-item"><span className="help-item-icon">🔁</span><div className="help-item-text"><strong>Γνωστοί Προορισμοί</strong><span>Αν έχεις ξαναπάει σε μια διεύθυνση, την αναγνωρίζει αυτόματα και προτείνει το αποθηκευμένο όνομα</span></div></div>
        </div>

        <div className="help-section">
          <div className="help-section-title">📋 Ιστορικό</div>
          <div className="help-item"><span className="help-item-icon">🗺️</span><div className="help-item-text"><strong>Live View</strong><span>Εμφανίζει χάρτη Google Maps με την τελευταία καταχωρημένη διεύθυνση άφιξης. Πάτα "Άνοιγμα στο Google Maps" για πλήρη προβολή</span></div></div>
          <div className="help-item"><span className="help-item-icon">✏️</span><div className="help-item-text"><strong>Επεξεργασία</strong><span>Αλλαγή ονόματος πελάτη ή διεύθυνσης σε κάθε καταχώρηση</span></div></div>
          <div className="help-item"><span className="help-item-icon">🗑️</span><div className="help-item-text"><strong>Διαγραφή</strong><span>Αφαίρεση λανθασμένης καταχώρησης</span></div></div>
          <div className="help-item"><span className="help-item-icon">📥</span><div className="help-item-text"><strong>Export Excel</strong><span>Εξαγωγή όλων των διαδρομών της ημέρας σε .xlsx αρχείο με σύνολα χρόνου και χιλιομέτρων</span></div></div>
        </div>

        <div className="help-section">
          <div className="help-section-title">📊 Στατιστικά</div>
          <div className="help-item"><span className="help-item-icon">🔍</span><div className="help-item-text"><strong>Φίλτρα</strong><span>Αναζήτηση ανά πελάτη, μήνα ή έτος σε όλο το ιστορικό διαδρομών</span></div></div>
        </div>

        <div className="help-section">
          <div className="help-section-title">⛽ Καύσιμα</div>
          <div className="help-item"><span className="help-item-icon">➕</span><div className="help-item-text"><strong>Νέος Ανεφοδιασμός</strong><span>Καταγραφή λίτρων, κόστους και χιλιομέτρων — εμφανίζει σύνολα αυτόματα</span></div></div>
        </div>

        <div className="help-section">
          <div className="help-section-title">👤 Προφίλ</div>
          <div className="help-item"><span className="help-item-icon">💾</span><div className="help-item-text"><strong>Αυτόματη Αποθήκευση</strong><span>Τα στοιχεία σου (όνομα, πινακίδα, έδρα, χιλιόμετρα) αποθηκεύονται αυτόματα και παραμένουν</span></div></div>
          <div className="help-item"><span className="help-item-icon">📌</span><div className="help-item-text"><strong>Αποθηκευμένοι Προορισμοί</strong><span>Διαχείριση γνωστών διευθύνσεων — επεξεργασία ή διαγραφή</span></div></div>
        </div>

        <button className="btn btn-secondary" style={{ marginBottom: 0, marginTop: 6 }} onClick={onClose}>ΚΛΕΙΣΙΜΟ</button>
      </div>
    </div>
  );
}

// ─── Edit Route Modal ─────────────────────────────────────────────
function EditRouteModal({ route, onSave, onCancel }) {
  const [clientName, setClientName] = useState(route.end?.label || "");
  const [address, setAddress] = useState(route.end?.location || "");
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">✏️ ΕΠΕΞΕΡΓΑΣΙΑ</div>
        <div className="modal-subtitle">Αλλαγή στοιχείων διαδρομής</div>
        <div className="input-group">
          <label className="input-label">Όνομα Πελάτη</label>
          <input className="input" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Όνομα πελάτη" autoFocus />
        </div>
        <div className="input-group">
          <label className="input-label">Διεύθυνση Άφιξης</label>
          <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Οδός Αριθμός, Πόλη" />
        </div>
        <div className="btn-row">
          <button className="btn btn-success" style={{ marginBottom: 0 }}
            onClick={() => onSave({ ...route, end: { ...route.end, label: clientName.trim() || "Αγνωστο", location: address.trim() || route.end?.location } })}>
            ✓ ΑΠΟΘΗΚΕΥΣΗ
          </button>
          <button className="btn btn-secondary" style={{ marginBottom: 0 }} onClick={onCancel}>ΑΚΥΡΟ</button>
        </div>
      </div>
    </div>
  );
}

// ─── Arrival Modal ────────────────────────────────────────────────
function ArrivalModal({ rawAddress, knownEntry, onDone, onCancel }) {
  const [step, setStep] = useState(knownEntry ? "known" : "confirm_address");
  const [editedNumber, setEditedNumber] = useState("");
  const [finalAddress, setFinalAddress] = useState(rawAddress);
  const [clientName, setClientName] = useState(knownEntry?.name || "");

  if (step === "known") return (
    <div className="overlay"><div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-title">ΑΦΙΞΗ</div>
      <div className="modal-subtitle">Γνωστός προορισμός — επιβεβαίωση</div>
      <div className="address-box">{knownEntry.address}</div>
      <div style={{ fontSize: 15, color: theme.accent, fontWeight: 600, marginBottom: 20 }}>👤 {knownEntry.name}</div>
      <div className="btn-row">
        <button className="btn btn-success" onClick={() => onDone(knownEntry.address, knownEntry.name)}>✓ ΕΠΙΒΕΒΑΙΩΣΗ</button>
        <button className="btn btn-secondary" onClick={() => setStep("confirm_address")}>ΑΛΛΑΓΗ</button>
      </div>
      <button className="btn btn-secondary" style={{ marginTop: 10 }} onClick={onCancel}>ΑΚΥΡΟ</button>
    </div></div>
  );

  if (step === "confirm_address") return (
    <div className="overlay"><div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-title">ΑΦΙΞΗ</div>
      <div className="modal-subtitle">Η διεύθυνση που βρέθηκε είναι σωστή;</div>
      <div className="address-box">{rawAddress}</div>
      <div className="btn-row">
        <button className="btn btn-success" onClick={() => { setFinalAddress(rawAddress); setStep("name"); }}>✓ ΝΑΙ</button>
        <button className="btn btn-warning" onClick={() => setStep("edit_number")}>✏️ ΑΛΛΑΓΗ ΑΡΙΘΜΟΥ</button>
      </div>
      <button className="btn btn-secondary" style={{ marginTop: 10 }} onClick={onCancel}>ΑΚΥΡΟ</button>
    </div></div>
  );

  if (step === "edit_number") {
    const streetOnly = rawAddress.replace(/\s*\d+\s*,/, ",").replace(/\s+\d+$/, "").trim();
    return (
      <div className="overlay"><div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">ΔΙΟΡΘΩΣΗ ΑΡΙΘΜΟΥ</div>
        <div className="modal-subtitle">Οδός: <strong style={{ color: theme.text }}>{streetOnly}</strong></div>
        <div className="input-group">
          <label className="input-label">Αριθμός κτιρίου</label>
          <input className="input" type="text" placeholder="π.χ. 12" value={editedNumber} onChange={(e) => setEditedNumber(e.target.value)} autoFocus />
        </div>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => {
  let addr = rawAddress;
  if (editedNumber) {
    // Περίπτωση 1: υπάρχει ήδη αριθμός πριν το κόμμα → αντικατάστασέ τον
    // π.χ. "Κωνσταντίνου Παλαιολόγου 12, Δήμος..." → "Κωνσταντίνου Παλαιολόγου 80, Δήμος..."
    if (/\d+\s*,/.test(rawAddress)) {
      addr = rawAddress.replace(/\d+(\s*,)/, `${editedNumber}$1`);
    }
    // Περίπτωση 2: χωρίς αριθμό, υπάρχει κόμμα → βάλε αριθμό πριν το κόμμα
    // π.χ. "Κωνσταντίνου Παλαιολόγου, Δήμος..." → "Κωνσταντίνου Παλαιολόγου 80, Δήμος..."
    else if (rawAddress.includes(",")) {
      addr = rawAddress.replace(",", ` ${editedNumber},`);
    }
    // Περίπτωση 3: αριθμός στο τέλος χωρίς κόμμα → αντικατάστασέ τον
    // π.χ. "Κωνσταντίνου Παλαιολόγου 12" → "Κωνσταντίνου Παλαιολόγου 80"
    else if (/\s+\d+$/.test(rawAddress)) {
      addr = rawAddress.replace(/\s+\d+$/, ` ${editedNumber}`);
    }
    // Περίπτωση 4: δεν υπάρχει τίποτα → append
    else {
      addr = `${rawAddress} ${editedNumber}`;
    }
  }
  setFinalAddress(addr); setStep("name");
}}>ΕΠΟΜΕΝΟ →</button>
          <button className="btn btn-secondary" onClick={() => setStep("confirm_address")}>ΠΙΣΩ</button>
        </div>
      </div></div>
    );
  }

  if (step === "name") return (
    <div className="overlay"><div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-title">ΟΝΟΜΑ ΠΕΛΑΤΗ</div>
      <div className="modal-subtitle">Διεύθυνση: <strong style={{ color: theme.text }}>{finalAddress}</strong></div>
      <div className="input-group">
        <label className="input-label">Επωνυμία / Όνομα</label>
        <input className="input" type="text" placeholder="π.χ. Παπαδόπουλος Γιώργης" value={clientName} onChange={(e) => setClientName(e.target.value)} autoFocus />
      </div>
      <div className="btn-row">
        <button className="btn btn-success" onClick={() => onDone(finalAddress, clientName.trim() || "Αγνωστο")}>✓ ΑΠΟΘΗΚΕΥΣΗ</button>
        <button className="btn btn-secondary" onClick={() => setStep("confirm_address")}>ΠΙΣΩ</button>
      </div>
    </div></div>
  );
  return null;
}

// ─── Fuel Modal ───────────────────────────────────────────────────
function FuelModal({ onSave, onCancel }) {
  const [form, setForm] = useState({ liters: "", amount: "", km: "" });
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">⛽ ΑΝΕΦΟΔΙΑΣΜΟΣ</div>
        <div className="input-group"><label className="input-label">Λίτρα</label><input className="input" type="number" placeholder="45.5" value={form.liters} onChange={(e) => setForm({ ...form, liters: e.target.value })} /></div>
        <div className="input-group"><label className="input-label">Ποσό (€)</label><input className="input" type="number" placeholder="82.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
        <div className="input-group"><label className="input-label">Χιλιόμετρα (προαιρετικό)</label><input className="input" type="number" placeholder="125450" value={form.km} onChange={(e) => setForm({ ...form, km: e.target.value })} /></div>
        <div className="btn-row">
          <button className="btn btn-primary" style={{ marginBottom: 0 }} onClick={() => { if (form.liters && form.amount) onSave(form); }}>ΑΠΟΘΗΚΕΥΣΗ</button>
          <button className="btn btn-secondary" style={{ marginBottom: 0 }} onClick={onCancel}>ΑΚΥΡΟ</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────
export default function App() {
  const todayKey = new Date().toLocaleDateString("el-GR");
  const [tab, setTab] = useState("record");
  const [showHelp, setShowHelp] = useState(false);

  const [profile, setProfile] = useState({ firstName: "", lastName: "", plate: "", startKm: "", baseAddress: "" });
  const [routes, setRoutes] = useState([]);
  const [allRoutes, setAllRoutes] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  const [locations, setLocations] = useState({});
  const [fuels, setFuels] = useState([]);
  const [showFuel, setShowFuel] = useState(false);
  const [filters, setFilters] = useState({ client: "", month: "", year: "" });
  const [arrivalData, setArrivalData] = useState(null);
  const [editingRoute, setEditingRoute] = useState(null);

  const now = () => new Date().toLocaleString("el-GR");

  useEffect(() => {
    const savedDate = localStorage.getItem("kt_date");
    const savedProfile = localStorage.getItem("kt_profile");
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    setLocations(JSON.parse(localStorage.getItem("kt_locations") || "{}"));
    setAllRoutes(JSON.parse(localStorage.getItem("kt_allRoutes") || "[]"));
    setFuels(JSON.parse(localStorage.getItem("kt_fuels") || "[]"));
    if (savedDate !== todayKey) {
      setRoutes([]);
      localStorage.setItem("kt_date", todayKey);
    } else {
      setRoutes(JSON.parse(localStorage.getItem("kt_routes") || "[]"));
    }
  }, []);

  useEffect(() => { localStorage.setItem("kt_profile", JSON.stringify(profile)); }, [profile]);
  useEffect(() => {
    localStorage.setItem("kt_routes", JSON.stringify(routes));
    localStorage.setItem("kt_allRoutes", JSON.stringify(allRoutes));
    localStorage.setItem("kt_locations", JSON.stringify(locations));
    localStorage.setItem("kt_fuels", JSON.stringify(fuels));
  }, [routes, allRoutes, locations, fuels]);

  const getCoords = () => new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null)
    );
  });

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, { headers: { "Accept-Language": "el" } });
      const data = await res.json();
      const a = data.address || {};
      const road = a.road || a.pedestrian || a.footway || a.street || "";
      const house = a.house_number || "";
      const city = a.city || a.town || a.village || a.municipality || "";
      return [road, house].filter(Boolean).join(" ") + (city ? `, ${city}` : "") || data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    } catch { return `${lat.toFixed(5)}, ${lon.toFixed(5)}`; }
  };

  const gpsKey = (lat, lon) => `${parseFloat(lat).toFixed(3)},${parseFloat(lon).toFixed(3)}`;

  const startFromBase = () => setActiveRoute({ id: Date.now(), fromBase: true, start: { location: profile.baseAddress || "Εδρα", time: now(), timestamp: Date.now() } });

  const startFromGPS = async () => {
    const coords = await getCoords();
    const location = coords ? await reverseGeocode(coords.lat, coords.lon) : "Αγνωστη τοποθεσια";
    setActiveRoute({ id: Date.now(), fromBase: false, start: { location, time: now(), timestamp: Date.now() } });
  };

  const endRoute = async () => {
    if (!activeRoute) return;
    const coords = await getCoords();
    let rawAddress = "Αγνωστη τοποθεσια", key = null;
    if (coords) { rawAddress = await reverseGeocode(coords.lat, coords.lon); key = gpsKey(coords.lat, coords.lon); }
    setArrivalData({ rawAddress, key, knownEntry: key && locations[key] ? locations[key] : null });
  };

  const handleArrivalDone = (finalAddress, clientName) => {
    if (!activeRoute) return;
    if (arrivalData.key) setLocations((prev) => ({ ...prev, [arrivalData.key]: { address: finalAddress, name: clientName } }));
    const completed = { ...activeRoute, end: { location: finalAddress, time: now(), label: clientName, timestamp: Date.now() } };
    setRoutes((r) => [...r, completed]);
    setAllRoutes((r) => [...r, completed]);
    setActiveRoute(null); setArrivalData(null);
  };

  const handleEditSave = (updatedRoute) => {
    setRoutes((r) => r.map((x) => x.id === updatedRoute.id ? updatedRoute : x));
    setAllRoutes((r) => r.map((x) => x.id === updatedRoute.id ? updatedRoute : x));
    setEditingRoute(null);
  };

  const handleDelete = (id) => {
    setRoutes((r) => r.filter((x) => x.id !== id));
    setAllRoutes((r) => r.filter((x) => x.id !== id));
  };

  const saveFuel = (form) => { setFuels((f) => [...f, { id: Date.now(), ...form, date: todayKey }]); setShowFuel(false); };

  const exportExcel = () => {
    let totalTime = 0;
    const data = routes.map((r, i) => {
      if (r.end) totalTime += r.end.timestamp - r.start.timestamp;
      return { "#": i + 1, "Εναρξη": r.start.location, "Ωρα Εναρξης": r.start.time, "Αφιξη": r.end?.location || "", "Ωρα Αφιξης": r.end?.time || "", "Πελατης": r.end?.label || "" };
    });
    const finalKm = Number(prompt("Τελικα χιλιομετρα:"));
    data.push({}, { "Εναρξη": "Συνολικος χρονος (λεπτα)", "Ωρα Εναρξης": Math.round(totalTime / 60000) }, { "Εναρξη": "Συνολικα χιλιομετρα", "Ωρα Εναρξης": finalKm - Number(profile.startKm || 0) });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ιστορικο");
    XLSX.writeFile(wb, `routes_${todayKey.replace(/\//g, "-")}.xlsx`);
  };

  const applyFilters = (list) => list.filter((r) => {
    const date = new Date(r.start?.timestamp || new Date(r.start.time).getTime());
    const matchClient = filters.client ? (r.end?.label || "").toLowerCase().includes(filters.client.toLowerCase()) : true;
    const matchMonth = filters.month ? date.getMonth() + 1 === Number(filters.month) : true;
    const matchYear = filters.year ? date.getFullYear() === Number(filters.year) : true;
    return matchClient && matchMonth && matchYear;
  });

  const filteredRoutes = tab === "stats" ? applyFilters(allRoutes) : routes;
  const totalFuelCost = fuels.reduce((s, f) => s + Number(f.amount || 0), 0);
  const totalFuelLiters = fuels.reduce((s, f) => s + Number(f.liters || 0), 0);

  // Τελευταία ολοκληρωμένη διαδρομή με διεύθυνση για Live View
  const lastCompletedRoute = [...routes].reverse().find((r) => r.end?.location);

  const navItems = [
    { key: "record", icon: "🚗", label: "ΚΑΤΑΓΡΑΦΗ" },
    { key: "history", icon: "📋", label: "ΙΣΤΟΡΙΚΟ" },
    { key: "stats", icon: "📊", label: "ΣΤΑΤΙΣΤΙΚΑ" },
    { key: "fuel", icon: "⛽", label: "ΚΑΥΣΙΜΑ" },
    { key: "profile", icon: "👤", label: "ΠΡΟΦΙΛ" },
  ];

  const ActionBtns = ({ r }) => (
    <div className="action-btns">
      <button className="icon-btn icon-btn-edit" title="Επεξεργασία" onClick={() => setEditingRoute(r)}>✏️</button>
      <button className="icon-btn icon-btn-del" title="Διαγραφή" onClick={() => { if (window.confirm("Διαγραφή διαδρομής;")) handleDelete(r.id); }}>🗑️</button>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div className="app">

        <div className="header">
          <div className="header-inner">
            <span className="logo">Keeper Tracker<span className="logo-beta">beta</span></span>
            <button className="help-btn" onClick={() => setShowHelp(true)} title="Οδηγίες">?</button>
          </div>
        </div>

        <div className="content">

          {/* ── RECORD ── */}
          {tab === "record" && (
            <div>
              {activeRoute ? (
                <div className="active-route-card">
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
                    <span className="pulse-dot" />
                    <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, color: theme.accent }}>ΔΙΑΔΡΟΜΗ ΣΕ ΕΞΕΛΙΞΗ</span>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div className="route-info-label">ΕΝΑΡΞΗ ΑΠΟ</div>
                    <div className="route-info-value">{activeRoute.start.location}</div>
                    <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{activeRoute.start.time}</div>
                  </div>
                  <button className="btn btn-success" onClick={endRoute}>✓ &nbsp;ΚΑΤΑΓΡΑΦΗ ΑΦΙΞΗΣ</button>
                </div>
              ) : (
                <div className="card">
                  <div className="card-title">ΝΕΑ ΔΙΑΔΡΟΜΗ</div>
                  <button className="btn btn-primary" onClick={startFromBase}>🏠 &nbsp;ΕΝΑΡΞΗ ΑΠΟ ΕΔΡΑ</button>
                  <button className="btn btn-secondary" onClick={startFromGPS}>📍 &nbsp;ΕΝΑΡΞΗ ΑΠΟ GPS</button>
                </div>
              )}
              <div className="card">
                <div className="card-title">ΣΗΜΕΡΑ · {routes.length} ΔΙΑΔΡΟΜΕΣ</div>
                {routes.length === 0 ? (
                  <div className="empty"><div className="empty-icon">🗺️</div>Καμία διαδρομή ακόμα σήμερα</div>
                ) : (
                  <table className="route-table">
                    <thead><tr><th>#</th><th>ΠΕΛΑΤΗΣ</th><th>ΩΡΑ</th><th></th></tr></thead>
                    <tbody>
                      {routes.map((r, i) => (
                        <tr key={r.id}>
                          <td style={{ color: theme.textMuted }}>{i === 0 && r.fromBase ? "🏠" : i + 1}</td>
                          <td><span className="client-badge">{r.end?.label || "—"}</span></td>
                          <td style={{ color: theme.textMuted, fontSize: 12 }}>{r.end?.time?.split(",")[1]?.trim() || "—"}</td>
                          <td><ActionBtns r={r} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <button className="btn btn-secondary" onClick={() => setShowFuel(true)}>⛽ &nbsp;ΚΑΤΑΓΡΑΦΗ ΑΝΕΦΟΔΙΑΣΜΟΥ</button>
            </div>
          )}

          {/* ── HISTORY ── */}
          {tab === "history" && (
            <div>
              <div className="section-header">
                <div className="section-title">ΙΣΤΟΡΙΚΟ</div>
                <button className="btn btn-primary btn-sm" onClick={exportExcel}>📥 EXPORT</button>
              </div>

              {/* Live View — εμφανίζεται μόνο αν υπάρχει τελευταία διαδρομή */}
              {lastCompletedRoute && (
                <LiveView address={lastCompletedRoute.end.location} />
              )}

              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {routes.length === 0 ? (
                  <div className="empty"><div className="empty-icon">📋</div>Κανένα αρχείο ακόμα</div>
                ) : (
                  <table className="route-table">
                    <thead><tr><th>#</th><th>ΠΕΛΑΤΗΣ</th><th>ΕΝΑΡΞΗ</th><th>ΑΦΙΞΗ</th><th></th></tr></thead>
                    <tbody>
                      {routes.map((r, i) => (
                        <tr key={r.id}>
                          <td style={{ color: theme.textMuted }}>{i === 0 && r.fromBase ? "🏠" : i + 1}</td>
                          <td><span className="client-badge">{r.end?.label || "—"}</span></td>
                          <td style={{ color: theme.textMuted, fontSize: 12 }}>{r.start.time?.split(",")[1]?.trim()}</td>
                          <td style={{ color: theme.textMuted, fontSize: 12 }}>{r.end?.time?.split(",")[1]?.trim() || "—"}</td>
                          <td><ActionBtns r={r} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── STATS ── */}
          {tab === "stats" && (
            <div>
              <div className="section-title" style={{ marginBottom: 16 }}>ΣΤΑΤΙΣΤΙΚΑ</div>
              <div className="stat-grid">
                <div className="stat-box"><div className="stat-label">ΣΥΝΟΛΟ</div><div className="stat-value">{applyFilters(allRoutes).length}<span className="stat-unit">δρομ.</span></div></div>
                <div className="stat-box"><div className="stat-label">ΣΗΜΕΡΑ</div><div className="stat-value">{routes.length}<span className="stat-unit">δρομ.</span></div></div>
              </div>
              <div className="filter-row">
                <input className="filter-input" placeholder="Πελάτης" onChange={(e) => setFilters({ ...filters, client: e.target.value })} />
                <input className="filter-input" placeholder="Μήνας" type="number" min="1" max="12" onChange={(e) => setFilters({ ...filters, month: e.target.value })} />
                <input className="filter-input" placeholder="Έτος" type="number" onChange={(e) => setFilters({ ...filters, year: e.target.value })} />
              </div>
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {filteredRoutes.length === 0 ? (
                  <div className="empty"><div className="empty-icon">📊</div>Δεν βρέθηκαν αποτελέσματα</div>
                ) : (
                  <table className="route-table">
                    <thead><tr><th>#</th><th>ΠΕΛΑΤΗΣ</th><th>ΗΜ/ΝΙΑ</th><th>ΩΡΑ</th><th></th></tr></thead>
                    <tbody>
                      {filteredRoutes.map((r, i) => (
                        <tr key={r.id}>
                          <td style={{ color: theme.textMuted }}>{i === 0 && r.fromBase ? "🏠" : i + 1}</td>
                          <td><span className="client-badge">{r.end?.label || "—"}</span></td>
                          <td style={{ color: theme.textMuted, fontSize: 12 }}>{r.start.time?.split(",")[0]}</td>
                          <td style={{ color: theme.textMuted, fontSize: 12 }}>{r.start.time?.split(",")[1]?.trim()}</td>
                          <td><ActionBtns r={r} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── FUEL ── */}
          {tab === "fuel" && (
            <div>
              <div className="section-header">
                <div className="section-title">ΑΝΕΦΟΔΙΑΣΜΟΙ</div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowFuel(true)}>+ ΝΕΟΣ</button>
              </div>
              <div className="stat-grid">
                <div className="stat-box"><div className="stat-label">ΣΥΝΟΛΙΚΟ ΚΟΣΤΟΣ</div><div className="stat-value">{totalFuelCost.toFixed(1)}<span className="stat-unit">€</span></div></div>
                <div className="stat-box"><div className="stat-label">ΣΥΝΟΛΙΚΑ ΛΙΤΡΑ</div><div className="stat-value">{totalFuelLiters.toFixed(1)}<span className="stat-unit">L</span></div></div>
              </div>
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {fuels.length === 0 ? (
                  <div className="empty"><div className="empty-icon">⛽</div>Κανένας ανεφοδιασμός</div>
                ) : (
                  <table className="route-table">
                    <thead><tr><th>ΗΜ/ΝΙΑ</th><th>ΛΙΤΡΑ</th><th>ΠΟΣΟ</th><th>ΧΛΜ</th><th></th></tr></thead>
                    <tbody>
                      {fuels.map((f) => (
                        <tr key={f.id}>
                          <td style={{ color: theme.textMuted, fontSize: 12 }}>{f.date}</td>
                          <td>{f.liters}L</td>
                          <td style={{ color: theme.accent }}>{f.amount}€</td>
                          <td style={{ color: theme.textMuted }}>{f.km || "—"}</td>
                          <td><button className="icon-btn icon-btn-del" onClick={() => { if (window.confirm("Διαγραφή;")) setFuels((fls) => fls.filter((x) => x.id !== f.id)); }}>🗑️</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── PROFILE ── */}
          {tab === "profile" && (
            <div>
              <div className="section-title" style={{ marginBottom: 16 }}>ΣΤΟΙΧΕΙΑ ΟΔΗΓΟΥ</div>
              <div className="card">
                <div className="card-title">ΠΡΟΣΩΠΙΚΑ</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="input-group"><label className="input-label">Όνομα</label><input className="input" placeholder="Γιώργης" value={profile.firstName || ""} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} /></div>
                  <div className="input-group"><label className="input-label">Επίθετο</label><input className="input" placeholder="Παπαδόπουλος" value={profile.lastName || ""} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} /></div>
                </div>
              </div>
              <div className="card">
                <div className="card-title">ΟΧΗΜΑ</div>
                <div className="input-group"><label className="input-label">Πινακίδα</label><input className="input" placeholder="ΑΒΓ-1234" value={profile.plate || ""} onChange={(e) => setProfile({ ...profile, plate: e.target.value })} /></div>
                <div className="input-group"><label className="input-label">Χιλιόμετρα έναρξης ημέρας</label><input className="input" type="number" placeholder="125000" value={profile.startKm || ""} onChange={(e) => setProfile({ ...profile, startKm: e.target.value })} /></div>
              </div>
              <div className="card">
                <div className="card-title">ΕΔΡΑ</div>
                <div className="input-group"><label className="input-label">Διεύθυνση Έδρας</label><input className="input" placeholder="Αθήνα, Ελλάδα" value={profile.baseAddress || ""} onChange={(e) => setProfile({ ...profile, baseAddress: e.target.value })} /></div>
              </div>
              {Object.keys(locations).length > 0 && (
                <div className="card">
                  <div className="card-title">ΑΠΟΘΗΚΕΥΜΕΝΟΙ ΠΡΟΟΡΙΣΜΟΙ</div>
                  {Object.entries(locations).map(([key, val]) => (
                    <div key={key} className="loc-row">
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{val.name}</div>
                        <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>{val.address}</div>
                      </div>
                      <div className="action-btns">
                        <button className="icon-btn icon-btn-edit" onClick={() => {
                          const newName = prompt("Νέο όνομα:", val.name);
                          const newAddr = prompt("Νέα διεύθυνση:", val.address);
                          if (newName !== null || newAddr !== null) setLocations((prev) => ({ ...prev, [key]: { name: newName ?? val.name, address: newAddr ?? val.address } }));
                        }}>✏️</button>
                        <button className="icon-btn icon-btn-del" onClick={() => { const upd = { ...locations }; delete upd[key]; setLocations(upd); }}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="bottom-nav">
          {navItems.map((item) => (
            <button key={item.key} className={`nav-btn ${tab === item.key ? "active" : ""}`} onClick={() => setTab(item.key)}>
              <span className="nav-icon">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>

        {arrivalData && <ArrivalModal rawAddress={arrivalData.rawAddress} knownEntry={arrivalData.knownEntry} onDone={handleArrivalDone} onCancel={() => setArrivalData(null)} />}
        {showFuel && <FuelModal onSave={saveFuel} onCancel={() => setShowFuel(false)} />}
        {editingRoute && <EditRouteModal route={editingRoute} onSave={handleEditSave} onCancel={() => setEditingRoute(null)} />}
        {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      </div>
    </>
  );
}