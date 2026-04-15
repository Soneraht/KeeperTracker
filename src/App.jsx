import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { db, collection, doc, setDoc, deleteDoc, onSnapshot } from "./firebase";

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
  html, body { background: ${theme.bg}; color: ${theme.text}; font-family: 'DM Sans', sans-serif; min-height: 100vh; width: 100%; overflow-x: hidden; }

  .app-shell { width: 100%; max-width: 480px; min-height: 100vh; margin: 0 auto; background: ${theme.bg}; border-left: 1px solid ${theme.border}; border-right: 1px solid ${theme.border}; display: flex; flex-direction: column; position: relative; }

  .header { background: #c0001a; border-bottom: 2px solid #8b0000; padding: 0 20px; height: 60px; display: flex; align-items: center; flex-shrink: 0; width: 100%; }
  .header-inner { display: flex; align-items: center; justify-content: space-between; width: 100%; }
  .logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; letter-spacing: -0.5px; color: #ffffff; display: flex; align-items: baseline; gap: 5px; }
  .logo-beta { font-size: 10px; font-weight: 400; color: rgba(255,255,255,0.7); letter-spacing: 0.5px; font-family: 'DM Sans', sans-serif; text-transform: lowercase; }
  .help-btn { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white; font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; font-family: 'Syne', sans-serif; flex-shrink: 0; }
  .help-btn:hover { background: rgba(255,255,255,0.25); }

  .tab-bar { background: ${theme.surface}; border: 1px solid ${theme.border}; border-radius: 14px; margin: 14px 16px 0 16px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; height: 64px; flex-shrink: 0; }
  .tab-bar-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: ${theme.text}; }
  .tab-bar-sub { font-size: 12px; color: ${theme.textMuted}; margin-top: 2px; }

  .content { flex: 1; padding: 14px 16px 20px 16px; overflow-y: auto; overflow-x: hidden; }

  .bottom-nav { position: sticky; bottom: 0; background: ${theme.surface}; border-top: 1px solid ${theme.border}; display: flex; flex-shrink: 0; width: 100%; z-index: 100; }
  .nav-btn { flex: 1; background: none; border: none; color: ${theme.textMuted}; padding: 10px 4px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 10px; font-family: 'DM Sans', sans-serif; font-weight: 500; transition: color 0.2s; border-top: 2px solid transparent; margin-top: -1px; }
  .nav-btn.active { color: ${theme.accent}; border-top-color: ${theme.accent}; }
  .nav-icon { font-size: 18px; line-height: 1; }

  .card { background: ${theme.surface}; border: 1px solid ${theme.border}; border-radius: 14px; padding: 18px; margin-bottom: 14px; }
  .card-title { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: ${theme.textMuted}; margin-bottom: 14px; }

  .btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 18px; border-radius: 10px; border: none; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.18s; width: 100%; margin-bottom: 10px; }
  .btn-primary { background: linear-gradient(135deg, ${theme.primary} 0%, #1456c8 100%); color: white; box-shadow: 0 4px 20px rgba(29,110,245,0.35); }
  .btn-primary:hover { background: linear-gradient(135deg, ${theme.primaryHover} 0%, ${theme.primary} 100%); transform: translateY(-1px); }
  .btn-secondary { background: ${theme.surfaceAlt}; color: ${theme.text}; border: 1px solid ${theme.border}; }
  .btn-secondary:hover { border-color: ${theme.primary}; color: ${theme.accent}; }
  .btn-success { background: linear-gradient(135deg, #15803d 0%, #22c55e 100%); color: white; box-shadow: 0 4px 20px rgba(34,197,94,0.3); }
  .btn-warning { background: linear-gradient(135deg, #b45309 0%, #f59e0b 100%); color: white; }
  .btn-sm { padding: 8px 14px; font-size: 13px; width: auto; margin-bottom: 0; border-radius: 8px; }
  .btn-row { display: flex; gap: 10px; }
  .btn-row .btn { margin-bottom: 0; }

  .active-route-card { background: linear-gradient(135deg, #0d2545 0%, #0a1929 100%); border: 1px solid ${theme.primary}; border-radius: 14px; padding: 18px; margin-bottom: 14px; position: relative; overflow: hidden; }
  .active-route-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, ${theme.primary}, ${theme.accent}); animation: shimmer 2s ease-in-out infinite; }
  @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .pulse-dot { display: inline-block; width: 8px; height: 8px; background: ${theme.success}; border-radius: 50%; margin-right: 8px; animation: pulse 1.5s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

  .route-info-label { font-size: 11px; color: ${theme.textMuted}; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 2px; }
  .route-info-value { font-size: 14px; color: ${theme.text}; font-weight: 500; }

  .route-table { width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed; }
  .route-table th { font-family: 'Syne', sans-serif; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: ${theme.textMuted}; padding: 6px 6px; text-align: left; border-bottom: 1px solid ${theme.border}; overflow: hidden; white-space: nowrap; }
  .route-table td { padding: 6px 6px; border-bottom: 1px solid ${theme.border}22; color: ${theme.text}; vertical-align: middle; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .route-table tr:last-child td { border-bottom: none; }

  .client-badge { display: inline-block; background: ${theme.primaryLight}; color: ${theme.accent}; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 20px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .action-btns { display: flex; gap: 2px; align-items: center; }
  .icon-btn { background: none; border: none; cursor: pointer; font-size: 14px; padding: 3px 3px; border-radius: 6px; transition: background 0.15s; line-height: 1; flex-shrink: 0; }
  .icon-btn:hover { background: ${theme.surfaceAlt}; }
  .icon-btn-edit { color: ${theme.accent}; }
  .icon-btn-del { color: ${theme.danger}; }

  .input-group { margin-bottom: 12px; }
  .input-label { display: block; font-size: 12px; font-weight: 500; color: ${theme.textMuted}; margin-bottom: 6px; }
  .input { width: 100%; background: ${theme.surfaceAlt}; border: 1px solid ${theme.border}; border-radius: 9px; color: ${theme.text}; font-family: 'DM Sans', sans-serif; font-size: 15px; padding: 12px 14px; outline: none; transition: border-color 0.2s; }
  .input:focus { border-color: ${theme.primary}; }
  .input::placeholder { color: ${theme.textMuted}; }

  .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
  .stat-box { background: ${theme.surfaceAlt}; border: 1px solid ${theme.border}; border-radius: 10px; padding: 14px; }
  .stat-label { font-size: 11px; color: ${theme.textMuted}; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; }
  .stat-value { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 700; color: ${theme.accent}; }
  .stat-unit { font-size: 12px; color: ${theme.textMuted}; font-weight: 400; margin-left: 3px; }

  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: flex-end; justify-content: center; }
  .modal { background: ${theme.surface}; border: 1px solid ${theme.border}; border-radius: 20px 20px 0 0; padding: 24px 20px 36px; width: 100%; max-width: 480px; animation: slideUp 0.25s ease; max-height: 85vh; overflow-y: auto; }
  @keyframes slideUp { from{transform:translateY(60px);opacity:0} to{transform:translateY(0);opacity:1} }
  .modal-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 6px; }
  .modal-subtitle { font-size: 13px; color: ${theme.textMuted}; margin-bottom: 20px; line-height: 1.5; }

  .address-box { background: ${theme.surfaceAlt}; border: 1px solid ${theme.border}; border-radius: 10px; padding: 14px; margin-bottom: 18px; font-size: 14px; font-weight: 500; color: ${theme.text}; word-break: break-word; line-height: 1.5; }

  .empty { text-align: center; color: ${theme.textMuted}; padding: 40px 20px; font-size: 14px; }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }

  .filter-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 14px; }
  .filter-input { background: ${theme.surfaceAlt}; border: 1px solid ${theme.border}; border-radius: 8px; color: ${theme.text}; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 9px 10px; outline: none; width: 100%; }
  .filter-input:focus { border-color: ${theme.primary}; }
  .filter-input::placeholder { color: ${theme.textMuted}; font-size: 12px; }

  .loc-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid ${theme.border}22; }
  .loc-row:last-child { border-bottom: none; }

  .live-view-card { background: ${theme.surface}; border: 1px solid ${theme.primary}; border-radius: 14px; margin-bottom: 14px; overflow: hidden; }
  .live-view-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: linear-gradient(135deg, #0d2545 0%, #0a1929 100%); border-bottom: 1px solid ${theme.border}; }
  .live-view-title { display: flex; align-items: center; gap: 8px; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${theme.accent}; }
  .live-dot { width: 7px; height: 7px; border-radius: 50%; background: ${theme.success}; animation: pulse 1.5s ease-in-out infinite; flex-shrink: 0; }
  .live-address { font-size: 11px; color: ${theme.textMuted}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
  .live-view-map { width: 100%; height: 220px; border: none; display: block; }
  .live-open-btn { display: flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; color: ${theme.accent}; font-size: 12px; font-weight: 600; font-family: 'DM Sans', sans-serif; padding: 10px 16px; border-top: 1px solid ${theme.border}44; width: 100%; justify-content: center; transition: background 0.2s; }
  .live-open-btn:hover { background: ${theme.surfaceAlt}; }

  .sync-indicator { display: flex; align-items: center; gap: 6px; font-size: 11px; }
  .sync-dot { width: 6px; height: 6px; border-radius: 50%; background: ${theme.success}; }
  .sync-dot.syncing { background: ${theme.warning}; animation: pulse 1s ease-in-out infinite; }
  .sync-dot.offline { background: ${theme.danger}; animation: pulse 1s ease-in-out infinite; }

  .help-section { margin-bottom: 20px; }
  .help-section-title { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: ${theme.accent}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
  .help-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid ${theme.border}33; font-size: 13px; line-height: 1.5; color: ${theme.text}; }
  .help-item:last-child { border-bottom: none; }
  .help-item-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
  .help-item-text strong { color: ${theme.accent}; display: block; font-size: 13px; margin-bottom: 2px; }
  .help-item-text span { color: ${theme.textMuted}; font-size: 12px; }
`;

// ─── Firebase helpers ─────────────────────────────────────────────
const saveRoute    = (r)   => setDoc(doc(db, "routes",    String(r.id)), r);
const saveLocation = (k,v) => setDoc(doc(db, "locations", k.replace(/\./g,"_")), v);
const saveFuelEntry= (e)   => setDoc(doc(db, "fuels",     String(e.id)), e);
const saveProfile  = (p)   => setDoc(doc(db, "profile",   "driver"), p);

// ─── LiveView ─────────────────────────────────────────────────────
function LiveView({ address }) {
  const encoded = encodeURIComponent(address);
  return (
    <div className="live-view-card">
      <div className="live-view-header">
        <div className="live-view-title"><span className="live-dot"/>Live View</div>
        <div className="live-address" title={address}>{address}</div>
      </div>
      <iframe className="live-view-map" src={`https://maps.google.com/maps?q=${encoded}&output=embed&z=16`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Live View χάρτης"/>
      <button className="live-open-btn" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`,"_blank")}>🗺️ Άνοιγμα στο Google Maps</button>
    </div>
  );
}

// ─── HelpModal ────────────────────────────────────────────────────
function HelpModal({ onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-title">📖 Οδηγίες Χρήσης</div>
        <div className="modal-subtitle">Τι μπορείς να κάνεις με το Keeper Tracker</div>
        <div className="help-section">
          <div className="help-section-title">🚗 ΚΑΤΑΓΡΑΦΗ</div>
          <div className="help-item"><span className="help-item-icon">🏠</span><div className="help-item-text"><strong>Έναρξη από Έδρα</strong><span>Ξεκινά νέα διαδρομή από την αποθηκευμένη διεύθυνση έδρας σου</span></div></div>
          <div className="help-item"><span className="help-item-icon">📍</span><div className="help-item-text"><strong>Έναρξη από GPS</strong><span>Εντοπίζει αυτόματα την τρέχουσα τοποθεσία σου ως σημείο εκκίνησης</span></div></div>
          <div className="help-item"><span className="help-item-icon">✅</span><div className="help-item-text"><strong>Καταγραφή Άφιξης</strong><span>Βρίσκει τη διεύθυνση μέσω GPS και ζητά επιβεβαίωση και όνομα πελάτη</span></div></div>
          <div className="help-item"><span className="help-item-icon">🔁</span><div className="help-item-text"><strong>Γνωστοί Προορισμοί</strong><span>Αναγνωρίζει αυτόματα διευθύνσεις που έχεις ξαναεπισκεφτεί</span></div></div>
          <div className="help-item"><span className="help-item-icon">📵</span><div className="help-item-text"><strong>Κλείδωμα Οθόνης</strong><span>Αν κλειδώσει η οθόνη, η ενεργή διαδρομή αποθηκεύεται αυτόματα και επανέρχεται όταν ξανανοίξεις την εφαρμογή</span></div></div>
        </div>
        <div className="help-section">
          <div className="help-section-title">📋 ΙΣΤΟΡΙΚΟ</div>
          <div className="help-item"><span className="help-item-icon">☁️</span><div className="help-item-text"><strong>Cloud Sync</strong><span>Όλα τα δεδομένα αποθηκεύονται στο Firebase σε real-time</span></div></div>
          <div className="help-item"><span className="help-item-icon">✏️</span><div className="help-item-text"><strong>Επεξεργασία</strong><span>Αλλαγή ονόματος πελάτη ή διεύθυνσης — ενημερώνεται αυτόματα στο cloud</span></div></div>
          <div className="help-item"><span className="help-item-icon">🗑️</span><div className="help-item-text"><strong>Διαγραφή</strong><span>Αφαίρεση καταχώρησης από όλες τις συσκευές</span></div></div>
          <div className="help-item"><span className="help-item-icon">📥</span><div className="help-item-text"><strong>Export Excel</strong><span>Εξαγωγή διαδρομών ημέρας σε .xlsx αρχείο</span></div></div>
        </div>
        <div className="help-section">
          <div className="help-section-title">📊 ΣΤΑΤΙΣΤΙΚΑ</div>
          <div className="help-item"><span className="help-item-icon">🔍</span><div className="help-item-text"><strong>Φίλτρα</strong><span>Αναζήτηση ανά πελάτη, μήνα ή έτος σε όλο το ιστορικό</span></div></div>
        </div>
        <div className="help-section">
          <div className="help-section-title">⛽ ΚΑΥΣΙΜΑ</div>
          <div className="help-item"><span className="help-item-icon">➕</span><div className="help-item-text"><strong>Νέος Ανεφοδιασμός</strong><span>Καταγραφή λίτρων, κόστους και χιλιομέτρων</span></div></div>
        </div>
        <button className="btn btn-secondary" style={{marginBottom:0,marginTop:6}} onClick={onClose}>ΚΛΕΙΣΙΜΟ</button>
      </div>
    </div>
  );
}

// ─── EditRouteModal ───────────────────────────────────────────────
function EditRouteModal({ route, onSave, onCancel }) {
  const [clientName, setClientName] = useState(route.end?.label || "");
  const [address,    setAddress]    = useState(route.end?.location || "");
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-title">✏️ ΕΠΕΞΕΡΓΑΣΙΑ</div>
        <div className="modal-subtitle">Αλλαγή στοιχείων διαδρομής</div>
        <div className="input-group"><label className="input-label">Όνομα Πελάτη</label><input className="input" value={clientName} onChange={e=>setClientName(e.target.value)} placeholder="Όνομα πελάτη" autoFocus/></div>
        <div className="input-group"><label className="input-label">Διεύθυνση Άφιξης</label><input className="input" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Οδός Αριθμός, Πόλη"/></div>
        <div className="btn-row">
          <button className="btn btn-success" style={{marginBottom:0}} onClick={()=>onSave({...route,end:{...route.end,label:clientName.trim()||"Άγνωστο",location:address.trim()||route.end?.location}})}>✓ ΑΠΟΘΗΚΕΥΣΗ</button>
          <button className="btn btn-secondary" style={{marginBottom:0}} onClick={onCancel}>ΑΚΥΡΟ</button>
        </div>
      </div>
    </div>
  );
}

// ─── ArrivalModal ─────────────────────────────────────────────────
function ArrivalModal({ rawAddress, knownEntry, onDone, onCancel }) {
  const [step,         setStep]         = useState(knownEntry ? "known" : "confirm_address");
  const [editedNumber, setEditedNumber] = useState("");
  const [finalAddress, setFinalAddress] = useState(rawAddress);
  const [clientName,   setClientName]   = useState(knownEntry?.name || "");

  if (step === "known") return (
    <div className="overlay"><div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="modal-title">ΑΦΙΞΗ</div>
      <div className="modal-subtitle">Γνωστός προορισμός — επιβεβαίωση</div>
      <div className="address-box">{knownEntry.address}</div>
      <div style={{fontSize:15,color:"#38bdf8",fontWeight:600,marginBottom:20}}>👤 {knownEntry.name}</div>
      <div className="btn-row">
        <button className="btn btn-success" onClick={()=>onDone(knownEntry.address,knownEntry.name)}>✓ ΕΠΙΒΕΒΑΙΩΣΗ</button>
        <button className="btn btn-secondary" onClick={()=>setStep("confirm_address")}>ΑΛΛΑΓΗ</button>
      </div>
      <button className="btn btn-secondary" style={{marginTop:10}} onClick={onCancel}>ΑΚΥΡΟ</button>
    </div></div>
  );

  if (step === "confirm_address") return (
    <div className="overlay"><div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="modal-title">ΑΦΙΞΗ</div>
      <div className="modal-subtitle">Η διεύθυνση που βρέθηκε είναι σωστή;</div>
      <div className="address-box">{rawAddress}</div>
      <div className="btn-row">
        <button className="btn btn-success" onClick={()=>{setFinalAddress(rawAddress);setStep("name");}}>✓ ΝΑΙ</button>
        <button className="btn btn-warning" onClick={()=>setStep("edit_number")}>✏️ ΑΛΛΑΓΗ ΑΡΙΘΜΟΥ</button>
      </div>
      <button className="btn btn-secondary" style={{marginTop:10}} onClick={onCancel}>ΑΚΥΡΟ</button>
    </div></div>
  );

  if (step === "edit_number") {
    const streetOnly = rawAddress.replace(/\s*\d+\s*,/,",").replace(/\s+\d+$/,"").trim();
    return (
      <div className="overlay"><div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-title">ΔΙΟΡΘΩΣΗ ΑΡΙΘΜΟΥ</div>
        <div className="modal-subtitle">Οδός: <strong style={{color:"#e8edf5"}}>{streetOnly}</strong></div>
        <div className="input-group"><label className="input-label">Αριθμός κτιρίου</label><input className="input" type="text" placeholder="π.χ. 12" value={editedNumber} onChange={e=>setEditedNumber(e.target.value)} autoFocus/></div>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={()=>{
            let addr = rawAddress;
            if (editedNumber) {
              if (/\d+\s*,/.test(rawAddress)) addr = rawAddress.replace(/\d+(\s*,)/,`${editedNumber}$1`);
              else if (rawAddress.includes(",")) addr = rawAddress.replace(","," "+editedNumber+",");
              else if (/\s+\d+$/.test(rawAddress)) addr = rawAddress.replace(/\s+\d+$/," "+editedNumber);
              else addr = rawAddress+" "+editedNumber;
            }
            setFinalAddress(addr); setStep("name");
          }}>ΕΠΟΜΕΝΟ →</button>
          <button className="btn btn-secondary" onClick={()=>setStep("confirm_address")}>ΠΙΣΩ</button>
        </div>
      </div></div>
    );
  }

  if (step === "name") return (
    <div className="overlay"><div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="modal-title">ΟΝΟΜΑ ΠΕΛΑΤΗ</div>
      <div className="modal-subtitle">Διεύθυνση: <strong style={{color:"#e8edf5"}}>{finalAddress}</strong></div>
      <div className="input-group"><label className="input-label">Επωνυμία / Όνομα</label><input className="input" type="text" placeholder="π.χ. Παπαδόπουλος Γιώργης" value={clientName} onChange={e=>setClientName(e.target.value)} autoFocus/></div>
      <div className="btn-row">
        <button className="btn btn-success" onClick={()=>onDone(finalAddress,clientName.trim()||"Άγνωστο")}>✓ ΑΠΟΘΗΚΕΥΣΗ</button>
        <button className="btn btn-secondary" onClick={()=>setStep("confirm_address")}>ΠΙΣΩ</button>
      </div>
    </div></div>
  );
  return null;
}

// ─── FuelModal ────────────────────────────────────────────────────
function FuelModal({ onSave, onCancel }) {
  const [form, setForm] = useState({liters:"",amount:"",km:"",receipt:""});
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-title">⛽ ΑΝΕΦΟΔΙΑΣΜΟΣ</div>
        <div className="input-group"><label className="input-label">Λίτρα</label><input className="input" type="number" placeholder="45.5" value={form.liters} onChange={e=>setForm({...form,liters:e.target.value})}/></div>
        <div className="input-group"><label className="input-label">Ποσό (€)</label><input className="input" type="number" placeholder="82.00" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></div>
        <div className="input-group"><label className="input-label">Χιλιόμετρα (προαιρετικό)</label><input className="input" type="number" placeholder="125450" value={form.km} onChange={e=>setForm({...form,km:e.target.value})}/></div>
        <div className="input-group"><label className="input-label">Αρ. Παραστατικού (προαιρετικό)</label><input className="input" type="text" placeholder="π.χ. ΑΑ-12345" value={form.receipt} onChange={e=>setForm({...form,receipt:e.target.value})}/></div>
        <div className="btn-row">
          <button className="btn btn-primary" style={{marginBottom:0}} onClick={()=>{if(form.liters&&form.amount)onSave(form);}}>ΑΠΟΘΗΚΕΥΣΗ</button>
          <button className="btn btn-secondary" style={{marginBottom:0}} onClick={onCancel}>ΑΚΥΡΟ</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────
export default function App() {
  const todayKey = new Date().toLocaleDateString("el-GR");

  const [tab,          setTab]          = useState("record");
  const [showHelp,     setShowHelp]     = useState(false);
  const [syncing,      setSyncing]      = useState(false);
  const [isOnline,     setIsOnline]     = useState(navigator.onLine);
  const [profile,      setProfile]      = useState({firstName:"",lastName:"",plate:"",startKm:"",baseAddress:""});
  const [routes,       setRoutes]       = useState([]);
  const [allRoutes,    setAllRoutes]    = useState([]);
  const [activeRoute,  setActiveRoute]  = useState(null);
  const [locations,    setLocations]    = useState({});
  const [fuels,        setFuels]        = useState([]);
  const [showFuel,     setShowFuel]     = useState(false);
  const [filters,      setFilters]      = useState({client:"",month:"",year:""});
  const [arrivalData,  setArrivalData]  = useState(null);
  const [editingRoute, setEditingRoute] = useState(null);
  const [wakeLock,     setWakeLock]     = useState(null);

  const now = () => new Date().toLocaleString("el-GR");

  // ─── Online/Offline detection ─────────────────────────────────
  useEffect(() => {
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online",  goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // ─── WakeLock ─────────────────────────────────────────────────
  const requestWakeLock = async () => {
    try { if ("wakeLock" in navigator) { const lock = await navigator.wakeLock.request("screen"); setWakeLock(lock); } }
    catch(e) { console.log("WakeLock:", e); }
  };
  const releaseWakeLock = async () => {
    if (wakeLock) { await wakeLock.release(); setWakeLock(null); }
  };
  useEffect(() => {
    const handleVisibility = () => { if (document.visibilityState==="visible" && activeRoute) requestWakeLock(); };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [activeRoute]);

  // ─── Firestore real-time listeners + sessionStorage restore ───
  useEffect(() => {
    // Επαναφορά ενεργής διαδρομής από sessionStorage
    const savedActive = sessionStorage.getItem("kt_activeRoute");
    if (savedActive) setActiveRoute(JSON.parse(savedActive));

    const unsubRoutes = onSnapshot(collection(db,"routes"), (snap) => {
      const data = snap.docs.map(d=>d.data()).sort((a,b)=>a.start.timestamp-b.start.timestamp);
      setAllRoutes(data);
      setRoutes(data.filter(r => new Date(r.start.timestamp).toLocaleDateString("el-GR")===todayKey));
    });
    const unsubLocations = onSnapshot(collection(db,"locations"), (snap) => {
      const data = {};
      snap.docs.forEach(d=>{ data[d.id]=d.data(); });
      setLocations(data);
    });
    const unsubFuels = onSnapshot(collection(db,"fuels"), (snap) => {
      setFuels(snap.docs.map(d=>d.data()).sort((a,b)=>b.id-a.id));
    });
    const unsubProfile = onSnapshot(collection(db,"profile"), (snap) => {
      const driver = snap.docs.find(d=>d.id==="driver");
      if (driver) setProfile(driver.data());
    });

    return () => { unsubRoutes(); unsubLocations(); unsubFuels(); unsubProfile(); };
  }, []);

  // ─── Profile debounce save ────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { saveProfile(profile); }, 800);
    return () => clearTimeout(t);
  }, [profile]);

  // ─── sessionStorage για activeRoute ──────────────────────────
  useEffect(() => {
    if (activeRoute) {
      sessionStorage.setItem("kt_activeRoute", JSON.stringify(activeRoute));
    } else {
      sessionStorage.removeItem("kt_activeRoute");
    }
  }, [activeRoute]);

  // ─── Geolocation helpers ──────────────────────────────────────
  const getCoords = () => new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve({lat:pos.coords.latitude, lon:pos.coords.longitude}),
      ()  => resolve(null)
    );
  });

  const reverseGeocode = async (lat, lon) => {
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,{headers:{"Accept-Language":"el"}});
      const data = await res.json();
      const a    = data.address || {};
      const road = a.road||a.pedestrian||a.footway||a.street||"";
      const house= a.house_number||"";
      const city = a.city||a.town||a.village||a.municipality||"";
      return [road,house].filter(Boolean).join(" ")+(city?`, ${city}`:"") || data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    } catch { return `${lat.toFixed(5)}, ${lon.toFixed(5)}`; }
  };

  const gpsKey = (lat,lon) => `${parseFloat(lat).toFixed(3)}_${parseFloat(lon).toFixed(3)}`;

  // ─── Route actions ────────────────────────────────────────────
  const startFromBase = async () => {
    await requestWakeLock();
    setActiveRoute({id:Date.now(), fromBase:true, start:{location:profile.baseAddress||"Έδρα", time:now(), timestamp:Date.now()}});
  };

  const startFromGPS = async () => {
    await requestWakeLock();
    const coords   = await getCoords();
    const location = coords ? await reverseGeocode(coords.lat,coords.lon) : "Άγνωστη τοποθεσία";
    setActiveRoute({id:Date.now(), fromBase:false, start:{location, time:now(), timestamp:Date.now()}});
  };

  const continueFromLast = async () => {
    const lastRoute = [...routes].reverse().find(r => r.end?.location);
    if (!lastRoute) return;
    await requestWakeLock();
    const newRoute = {
      id: Date.now(),
      fromBase: false,
      start: { location: lastRoute.end.location, time: now(), timestamp: Date.now() }
    };
    setActiveRoute(newRoute);
    await saveRoute(newRoute);
  };

  const endRoute = async () => {
    if (!activeRoute) return;
    const coords = await getCoords();
    let rawAddress="Άγνωστη τοποθεσία", key=null;
    if (coords) { rawAddress=await reverseGeocode(coords.lat,coords.lon); key=gpsKey(coords.lat,coords.lon); }
    setArrivalData({rawAddress, key, knownEntry: key&&locations[key] ? locations[key] : null});
  };

  const handleArrivalDone = async (finalAddress, clientName) => {
    if (!activeRoute) return;
    setSyncing(true);
    if (arrivalData.key) await saveLocation(arrivalData.key,{address:finalAddress,name:clientName});
    const completed = {...activeRoute, gpsKey:arrivalData.key, end:{location:finalAddress, time:now(), label:clientName, timestamp:Date.now()}};
    await saveRoute(completed);
    setSyncing(false);
    setActiveRoute(null); setArrivalData(null);
    releaseWakeLock();
  };

  const handleEditSave = async (updatedRoute) => {
    setSyncing(true);
    await saveRoute(updatedRoute);
    if (updatedRoute.gpsKey) await saveLocation(updatedRoute.gpsKey,{address:updatedRoute.end.location,name:updatedRoute.end.label});
    setSyncing(false);
    setEditingRoute(null);
  };

  const handleDelete = async (id) => {
    setSyncing(true);
    await deleteDoc(doc(db,"routes",String(id)));
    setSyncing(false);
  };

  const saveFuel = async (form) => {
    const entry = {id:Date.now(),...form,date:todayKey};
    setSyncing(true);
    await saveFuelEntry(entry);
    setSyncing(false);
    setShowFuel(false);
  };

  const deleteFuel = async (id) => {
    setSyncing(true);
    await deleteDoc(doc(db,"fuels",String(id)));
    setSyncing(false);
  };

  const deleteLocation = async (key) => {
    setSyncing(true);
    await deleteDoc(doc(db,"locations",key));
    setSyncing(false);
  };

  const exportExcel = () => {
    let totalTime = 0;
    const data = routes.map((r,i) => {
      if (r.end) totalTime += r.end.timestamp - r.start.timestamp;
      return {"#":i+1,"Εναρξη":r.start.location,"Ωρα Εναρξης":r.start.time,"Αφιξη":r.end?.location||"","Ωρα Αφιξης":r.end?.time||"","Πελατης":r.end?.label||""};
    });
    const finalKm = Number(prompt("Τελικά χιλιόμετρα:"));
    data.push({},{"Εναρξη":"Συνολικος χρονος (λεπτα)","Ωρα Εναρξης":Math.round(totalTime/60000)},{"Εναρξη":"Συνολικα χιλιομετρα","Ωρα Εναρξης":finalKm-Number(profile.startKm||0)});
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ιστορικο");
    XLSX.writeFile(wb,`routes_${todayKey.replace(/\//g,"-")}.xlsx`);
  };

  const applyFilters = (list) => list.filter(r => {
    const date = new Date(r.start?.timestamp||0);
    const matchClient = filters.client ? (r.end?.label||"").toLowerCase().includes(filters.client.toLowerCase()) : true;
    const matchMonth  = filters.month  ? date.getMonth()+1===Number(filters.month) : true;
    const matchYear   = filters.year   ? date.getFullYear()===Number(filters.year)  : true;
    return matchClient && matchMonth && matchYear;
  });

  const lastCompletedRoute = [...routes].reverse().find(r=>r.end?.location);
  const totalFuelCost      = fuels.reduce((s,f)=>s+Number(f.amount||0),0);
  const totalFuelLiters    = fuels.reduce((s,f)=>s+Number(f.liters||0),0);

  const navItems = [
    {key:"record",  icon:"🚗", label:"ΚΑΤΑΓΡΑΦΗ"},
    {key:"history", icon:"📋", label:"ΙΣΤΟΡΙΚΟ"},
    {key:"stats",   icon:"📊", label:"ΣΤΑΤΙΣΤΙΚΑ"},
    {key:"fuel",    icon:"⛽", label:"ΚΑΥΣΙΜΑ"},
    {key:"profile", icon:"👤", label:"ΠΡΟΦΙΛ"},
  ];

  const ActionBtns = ({r}) => (
    <div className="action-btns">
      <button className="icon-btn icon-btn-edit" onClick={()=>setEditingRoute(r)}>✏️</button>
      <button className="icon-btn icon-btn-del"  onClick={()=>{if(window.confirm("Διαγραφή διαδρομής;"))handleDelete(r.id);}}>🗑️</button>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div className="app-shell">

        {/* HEADER */}
        <div className="header">
          <div className="header-inner">
            <span className="logo">Keeper Tracker<span className="logo-beta">beta</span></span>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div className="sync-indicator">
                <div className={`sync-dot ${!isOnline?"offline":syncing?"syncing":""}`}/>
                <span style={{color:!isOnline?theme.danger:syncing?theme.warning:theme.textMuted}}>
                  {!isOnline?"Offline":syncing?"Sync...":"Cloud ✓"}
                </span>
              </div>
              <button className="help-btn" onClick={()=>setShowHelp(true)}>?</button>
            </div>
          </div>
        </div>

        {/* TAB BAR */}
        <div className="tab-bar">
          <div>
            <div className="tab-bar-title">
              {tab==="record"  && "Καταγραφή Διαδρομής"}
              {tab==="history" && "Ιστορικό"}
              {tab==="stats"   && "Στατιστικά"}
              {tab==="fuel"    && "Ανεφοδιασμοί"}
              {tab==="profile" && "Στοιχεία Οδηγού"}
            </div>
            <div className="tab-bar-sub">
              {tab==="record"  && `${routes.length} διαδρομές σήμερα`}
              {tab==="history" && `${routes.length} καταχωρήσεις`}
              {tab==="stats"   && `${allRoutes.length} συνολικά`}
              {tab==="fuel"    && `${fuels.length} ανεφοδιασμοί`}
              {tab==="profile" && (profile.plate||"Χωρίς πινακίδα")}
            </div>
          </div>
          {tab==="history" && <button className="btn btn-primary btn-sm" onClick={exportExcel}>📥 EXPORT</button>}
          {tab==="fuel"    && <button className="btn btn-primary btn-sm" onClick={()=>setShowFuel(true)}>+ ΝΕΟΣ</button>}
        </div>

        {/* CONTENT */}
        <div className="content">

          {/* ── RECORD ── */}
          {tab==="record" && (
            <div>
              {activeRoute ? (
                <div className="active-route-card">
                  <div style={{display:"flex",alignItems:"center",marginBottom:14}}>
                    <span className="pulse-dot"/>
                    <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:15,color:"#38bdf8"}}>ΔΙΑΔΡΟΜΗ ΣΕ ΕΞΕΛΙΞΗ</span>
                  </div>
                  <div style={{marginBottom:14}}>
                    <div className="route-info-label">ΕΝΑΡΞΗ ΑΠΟ</div>
                    <div className="route-info-value">{activeRoute.start.location}</div>
                    <div style={{fontSize:12,color:"#8899b0",marginTop:2}}>{activeRoute.start.time}</div>
                  </div>
                  <button className="btn btn-success" onClick={endRoute}>✓ &nbsp;ΚΑΤΑΓΡΑΦΗ ΑΦΙΞΗΣ</button>
                </div>
              ) : (
                <div className="card">
                  <div className="card-title">ΝΕΑ ΔΙΑΔΡΟΜΗ</div>
                  <button className="btn btn-primary"   onClick={startFromBase}>🏠 &nbsp;ΕΝΑΡΞΗ ΑΠΟ ΕΔΡΑ</button>
                  <button className="btn btn-secondary" onClick={startFromGPS}>📍 &nbsp;ΕΝΑΡΞΗ ΑΠΟ GPS</button>
                  <button className="btn btn-secondary" onClick={continueFromLast}
                    disabled={![...routes].reverse().find(r=>r.end?.location)}>
                    🔁 &nbsp;ΕΠΟΜΕΝΗ ΣΤΑΣΗ
                  </button>
                </div>
              )}
              <div className="card">
                <div className="card-title">ΣΗΜΕΡΑ · {routes.length} ΔΙΑΔΡΟΜΕΣ</div>
                {routes.length===0 ? (
                  <div className="empty"><div className="empty-icon">🗺️</div>Καμία διαδρομή ακόμα σήμερα</div>
                ) : (
                  <table className="route-table">
                    <thead><tr>
                      <th style={{width:"8%"}}>#</th>
                      <th style={{width:"42%"}}>ΠΕΛΑΤΗΣ</th>
                      <th style={{width:"32%"}}>ΩΡΑ</th>
                      <th style={{width:"18%"}}></th>
                    </tr></thead>
                    <tbody>{routes.map((r,i)=>(
                      <tr key={r.id}>
                        <td style={{color:"#8899b0"}}>{i===0&&r.fromBase?"🏠":i+1}</td>
                        <td><span className="client-badge">{r.end?.label||"—"}</span></td>
                        <td style={{color:"#8899b0",fontSize:11}}>{r.end?.time?.split(",")[1]?.trim()||"—"}</td>
                        <td><ActionBtns r={r}/></td>
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
              <button className="btn btn-secondary" onClick={()=>setShowFuel(true)}>⛽ &nbsp;ΚΑΤΑΓΡΑΦΗ ΑΝΕΦΟΔΙΑΣΜΟΥ</button>
            </div>
          )}

          {/* ── HISTORY ── */}
          {tab==="history" && (
            <div>
              {lastCompletedRoute && <LiveView address={lastCompletedRoute.end.location}/>}
              <div className="card" style={{padding:0,overflow:"hidden"}}>
                {routes.length===0 ? (
                  <div className="empty"><div className="empty-icon">📋</div>Κανένα αρχείο ακόμα</div>
                ) : (
                  <table className="route-table">
                    <thead><tr>
                      <th style={{width:"7%"}}>#</th>
                      <th style={{width:"30%"}}>ΠΕΛΑΤΗΣ</th>
                      <th style={{width:"23%"}}>ΕΝΑΡΞΗ</th>
                      <th style={{width:"23%"}}>ΑΦΙΞΗ</th>
                      <th style={{width:"17%"}}></th>
                    </tr></thead>
                    <tbody>{routes.map((r,i)=>(
                      <tr key={r.id}>
                        <td style={{color:"#8899b0"}}>{i===0&&r.fromBase?"🏠":i+1}</td>
                        <td><span className="client-badge">{r.end?.label||"—"}</span></td>
                        <td style={{color:"#8899b0",fontSize:11}}>{r.start.time?.split(",")[1]?.trim()}</td>
                        <td style={{color:"#8899b0",fontSize:11}}>{r.end?.time?.split(",")[1]?.trim()||"—"}</td>
                        <td><ActionBtns r={r}/></td>
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── STATS ── */}
          {tab==="stats" && (
            <div>
              <div className="stat-grid">
                <div className="stat-box"><div className="stat-label">ΣΥΝΟΛΟ</div><div className="stat-value">{applyFilters(allRoutes).length}<span className="stat-unit">δρομ.</span></div></div>
                <div className="stat-box"><div className="stat-label">ΣΗΜΕΡΑ</div><div className="stat-value">{routes.length}<span className="stat-unit">δρομ.</span></div></div>
              </div>
              <div className="filter-row">
                <input className="filter-input" placeholder="Πελάτης"   onChange={e=>setFilters({...filters,client:e.target.value})}/>
                <input className="filter-input" placeholder="Μήνας" type="number" min="1" max="12" onChange={e=>setFilters({...filters,month:e.target.value})}/>
                <input className="filter-input" placeholder="Έτος"  type="number" onChange={e=>setFilters({...filters,year:e.target.value})}/>
              </div>
              <div className="card" style={{padding:0,overflow:"hidden"}}>
                {applyFilters(allRoutes).length===0 ? (
                  <div className="empty"><div className="empty-icon">📊</div>Δεν βρέθηκαν αποτελέσματα</div>
                ) : (
                  <table className="route-table">
                    <thead><tr>
                      <th style={{width:"7%"}}>#</th>
                      <th style={{width:"32%"}}>ΠΕΛΑΤΗΣ</th>
                      <th style={{width:"25%"}}>ΗΜ/ΝΙΑ</th>
                      <th style={{width:"20%"}}>ΩΡΑ</th>
                      <th style={{width:"16%"}}></th>
                    </tr></thead>
                    <tbody>{applyFilters(allRoutes).map((r,i)=>(
                      <tr key={r.id}>
                        <td style={{color:"#8899b0"}}>{i===0&&r.fromBase?"🏠":i+1}</td>
                        <td><span className="client-badge">{r.end?.label||"—"}</span></td>
                        <td style={{color:"#8899b0",fontSize:11}}>{r.start.time?.split(",")[0]}</td>
                        <td style={{color:"#8899b0",fontSize:11}}>{r.start.time?.split(",")[1]?.trim()}</td>
                        <td><ActionBtns r={r}/></td>
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── FUEL ── */}
          {tab==="fuel" && (
            <div>
              <div className="stat-grid">
                <div className="stat-box"><div className="stat-label">ΣΥΝΟΛΙΚΟ ΚΟΣΤΟΣ</div><div className="stat-value">{totalFuelCost.toFixed(1)}<span className="stat-unit">€</span></div></div>
                <div className="stat-box"><div className="stat-label">ΣΥΝΟΛΙΚΑ ΛΙΤΡΑ</div><div className="stat-value">{totalFuelLiters.toFixed(1)}<span className="stat-unit">L</span></div></div>
              </div>
              <div className="card" style={{padding:0,overflow:"hidden"}}>
                {fuels.length===0 ? (
                  <div className="empty"><div className="empty-icon">⛽</div>Κανένας ανεφοδιασμός</div>
                ) : (
                  <table className="route-table">
                    <thead><tr>
                      <th style={{width:"22%"}}>ΗΜ/ΝΙΑ</th>
                      <th style={{width:"14%"}}>ΛΙΤΡΑ</th>
                      <th style={{width:"14%"}}>ΠΟΣΟ</th>
                      <th style={{width:"14%"}}>ΧΛΜ</th>
                      <th style={{width:"24%"}}>ΠΑΡΑΣΤΑΤΙΚΟ</th>
                      <th style={{width:"12%"}}></th>
                    </tr></thead>
                    <tbody>{fuels.map(f=>(
                      <tr key={f.id}>
                        <td style={{color:"#8899b0",fontSize:11}}>{f.date}</td>
                        <td>{f.liters}L</td>
                        <td style={{color:"#38bdf8"}}>{f.amount}€</td>
                        <td style={{color:"#8899b0"}}>{f.km||"—"}</td>
                        <td style={{color:"#8899b0",fontSize:11}}>{f.receipt||"—"}</td>
                        <td><button className="icon-btn icon-btn-del" onClick={()=>{if(window.confirm("Διαγραφή;"))deleteFuel(f.id);}}>🗑️</button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── PROFILE ── */}
          {tab==="profile" && (
            <div>
              <div className="card">
                <div className="card-title">ΠΡΟΣΩΠΙΚΑ</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div className="input-group"><label className="input-label">Όνομα</label><input className="input" placeholder="Γιώργης" value={profile.firstName||""} onChange={e=>setProfile({...profile,firstName:e.target.value})}/></div>
                  <div className="input-group"><label className="input-label">Επίθετο</label><input className="input" placeholder="Παπαδόπουλος" value={profile.lastName||""} onChange={e=>setProfile({...profile,lastName:e.target.value})}/></div>
                </div>
              </div>
              <div className="card">
                <div className="card-title">ΟΧΗΜΑ</div>
                <div className="input-group"><label className="input-label">Πινακίδα</label><input className="input" placeholder="ΑΒΓ-1234" value={profile.plate||""} onChange={e=>setProfile({...profile,plate:e.target.value})}/></div>
                <div className="input-group"><label className="input-label">Χιλιόμετρα έναρξης ημέρας</label><input className="input" type="number" placeholder="125000" value={profile.startKm||""} onChange={e=>setProfile({...profile,startKm:e.target.value})}/></div>
              </div>
              <div className="card">
                <div className="card-title">ΕΔΡΑ</div>
                <div className="input-group"><label className="input-label">Διεύθυνση Έδρας</label><input className="input" placeholder="Αθήνα, Ελλάδα" value={profile.baseAddress||""} onChange={e=>setProfile({...profile,baseAddress:e.target.value})}/></div>
              </div>
              {Object.keys(locations).length >= 0 && (
                <div className="card" style={{padding:0,overflow:"hidden"}}>
                  <details>
                    <summary style={{
                      cursor:"pointer", fontFamily:"Syne,sans-serif", fontSize:12,
                      fontWeight:700, textTransform:"uppercase", letterSpacing:"1px",
                      color:"#8899b0", padding:"14px 18px", listStyle:"none",
                      display:"flex", justifyContent:"space-between", alignItems:"center",
                      borderBottom: Object.keys(locations).length>0 ? "1px solid #1e3a5f" : "none"
                    }}>
                      <span>📍 ΑΠΟΘΗΚΕΥΜΕΝΟΙ ΠΡΟΟΡΙΣΜΟΙ</span>
                      <span style={{fontWeight:400,fontSize:11}}>({Object.keys(locations).length})</span>
                    </summary>
                    <div style={{padding:"0 18px"}}>
                      {Object.keys(locations).length===0 ? (
                        <div className="empty" style={{padding:"20px 0"}}>Κανένας αποθηκευμένος προορισμός</div>
                      ) : (
                        Object.entries(locations)
                          .sort((a,b)=>(a[1].name||"").localeCompare(b[1].name||"","el"))
                          .map(([key,val])=>(
                            <div key={key} className="loc-row">
                              <div style={{flex:1,minWidth:0,marginRight:8}}>
                                <div style={{fontSize:13,fontWeight:600,color:"#e8edf5",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{val.name}</div>
                                <div style={{fontSize:11,color:"#8899b0",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{val.address}</div>
                              </div>
                              <div className="action-btns">
                                <button className="icon-btn icon-btn-edit" onClick={()=>{
                                  const newName=prompt("Νέο όνομα:",val.name);
                                  const newAddr=prompt("Νέα διεύθυνση:",val.address);
                                  if(newName!==null||newAddr!==null) saveLocation(key,{name:newName??val.name,address:newAddr??val.address});
                                }}>✏️</button>
                                <button className="icon-btn icon-btn-del" onClick={()=>{if(window.confirm("Διαγραφή προορισμού;"))deleteLocation(key);}}>🗑️</button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </details>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM NAV */}
        <nav className="bottom-nav">
          {navItems.map(item=>(
            <button key={item.key} className={`nav-btn ${tab===item.key?"active":""}`} onClick={()=>setTab(item.key)}>
              <span className="nav-icon">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
      </div>

      {arrivalData   && <ArrivalModal rawAddress={arrivalData.rawAddress} knownEntry={arrivalData.knownEntry} onDone={handleArrivalDone} onCancel={()=>{setArrivalData(null);releaseWakeLock();}}/>}
      {showFuel      && <FuelModal onSave={saveFuel} onCancel={()=>setShowFuel(false)}/>}
      {editingRoute  && <EditRouteModal route={editingRoute} onSave={handleEditSave} onCancel={()=>setEditingRoute(null)}/>}
      {showHelp      && <HelpModal onClose={()=>setShowHelp(false)}/>}
    </>
  );
}