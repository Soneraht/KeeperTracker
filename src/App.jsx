import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { db, collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from "./firebase";

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
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{background:${theme.bg};color:${theme.text};font-family:'DM Sans',sans-serif;min-height:100vh;width:100%;overflow-x:hidden}
  .app-shell{width:100%;max-width:480px;min-height:100vh;margin:0 auto;background:${theme.bg};border-left:1px solid ${theme.border};border-right:1px solid ${theme.border};display:flex;flex-direction:column;position:relative}
  .header{background:#c0001a;border-bottom:2px solid #8b0000;padding:0 20px;height:60px;display:flex;align-items:center;flex-shrink:0;width:100%}
  .header-inner{display:flex;align-items:center;justify-content:space-between;width:100%}
  .logo{font-family:'Syne',sans-serif;font-weight:800;font-size:18px;letter-spacing:-0.5px;color:#fff;display:flex;align-items:baseline;gap:5px}
  .logo-beta{font-size:10px;font-weight:400;color:rgba(255,255,255,0.7);letter-spacing:0.5px;font-family:'DM Sans',sans-serif;text-transform:lowercase}
  .help-btn{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:white;font-size:16px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s;flex-shrink:0}
  .help-btn:hover{background:rgba(255,255,255,0.25)}
  .tab-bar{background:${theme.surface};border:1px solid ${theme.border};border-radius:14px;margin:14px 16px 0;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;height:64px;flex-shrink:0}
  .tab-bar-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:${theme.text}}
  .tab-bar-sub{font-size:12px;color:${theme.textMuted};margin-top:2px}
  .content{flex:1;padding:14px 16px 20px;overflow-y:auto;overflow-x:hidden}
  .bottom-nav{position:sticky;bottom:0;background:${theme.surface};border-top:1px solid ${theme.border};display:flex;flex-shrink:0;width:100%;z-index:100}
  .nav-btn{flex:1;background:none;border:none;color:${theme.textMuted};padding:10px 4px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:10px;font-family:'DM Sans',sans-serif;font-weight:500;transition:color 0.2s;border-top:2px solid transparent;margin-top:-1px}
  .nav-btn.active{color:${theme.accent};border-top-color:${theme.accent}}
  .nav-icon{font-size:18px;line-height:1;display:flex;align-items:center;justify-content:center;height:22px}
  .card{background:${theme.surface};border:1px solid ${theme.border};border-radius:14px;padding:18px;margin-bottom:14px}
  .card-title{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:${theme.textMuted};margin-bottom:14px}
  .btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px 18px;border-radius:10px;border:none;font-family:'DM Sans',sans-serif;font-weight:600;font-size:15px;cursor:pointer;transition:all 0.18s;width:100%;margin-bottom:10px}
  .btn-primary{background:linear-gradient(135deg,${theme.primary} 0%,#1456c8 100%);color:white;box-shadow:0 4px 20px rgba(29,110,245,0.35)}
  .btn-primary:hover{background:linear-gradient(135deg,${theme.primaryHover} 0%,${theme.primary} 100%);transform:translateY(-1px)}
  .btn-secondary{background:${theme.surfaceAlt};color:${theme.text};border:1px solid ${theme.border}}
  .btn-secondary:hover{border-color:${theme.primary};color:${theme.accent}}
  .btn-success{background:linear-gradient(135deg,#15803d 0%,#22c55e 100%);color:white;box-shadow:0 4px 20px rgba(34,197,94,0.3)}
  .btn-danger{background:linear-gradient(135deg,#7f1d1d 0%,#ef4444 100%);color:white}
  .btn-warning{background:linear-gradient(135deg,#b45309 0%,#f59e0b 100%);color:white}
  .btn-sm{padding:8px 14px;font-size:13px;width:auto;margin-bottom:0;border-radius:8px}
  .btn-row{display:flex;gap:10px}
  .btn-row .btn{margin-bottom:0}
  .active-route-card{background:linear-gradient(135deg,#0d2545 0%,#0a1929 100%);border:1px solid ${theme.primary};border-radius:14px;padding:18px;margin-bottom:14px;position:relative;overflow:hidden}
  .active-route-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${theme.primary},${theme.accent});animation:shimmer 2s ease-in-out infinite}
  @keyframes shimmer{0%,100%{opacity:1}50%{opacity:0.4}}
  .pulse-dot{display:inline-block;width:8px;height:8px;background:${theme.success};border-radius:50%;margin-right:8px;animation:pulse 1.5s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}
  .route-info-label{font-size:11px;color:${theme.textMuted};text-transform:uppercase;letter-spacing:0.8px;margin-bottom:2px}
  .route-info-value{font-size:14px;color:${theme.text};font-weight:500}
  .route-table{width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed}
  .route-table th{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:${theme.textMuted};padding:6px;text-align:center;border-bottom:1px solid ${theme.border};overflow:hidden;white-space:nowrap}
  .route-table td{padding:6px;border-bottom:1px solid ${theme.border}22;color:${theme.text};vertical-align:middle;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center}
  .route-table tr:last-child td{border-bottom:none}
  .client-badge{display:block;color:${theme.accent};font-size:12px;font-weight:600;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}
  .action-btns{display:flex;gap:2px;align-items:center}
  .icon-btn{background:none;border:none;cursor:pointer;font-size:14px;padding:3px;border-radius:6px;transition:background 0.15s;line-height:1;flex-shrink:0}
  .icon-btn:hover{background:${theme.surfaceAlt}}
  .icon-btn-edit{color:${theme.accent}}
  .icon-btn-del{color:${theme.danger}}
  .input-group{margin-bottom:12px}
  .input-label{display:block;font-size:12px;font-weight:500;color:${theme.textMuted};margin-bottom:6px}
  .input{width:100%;background:${theme.surfaceAlt};border:1px solid ${theme.border};border-radius:9px;color:${theme.text};font-family:'DM Sans',sans-serif;font-size:15px;padding:12px 14px;outline:none;transition:border-color 0.2s}
  .input:focus{border-color:${theme.primary}}
  .input::placeholder{color:${theme.textMuted}}
  .select-input{width:100%;background:${theme.surfaceAlt};border:1px solid ${theme.border};border-radius:9px;color:${theme.text};font-family:'DM Sans',sans-serif;font-size:14px;padding:10px 14px;outline:none;margin-bottom:14px}
  .stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
  .stat-box{background:${theme.surfaceAlt};border:1px solid ${theme.border};border-radius:10px;padding:14px}
  .stat-label{font-size:11px;color:${theme.textMuted};text-transform:uppercase;letter-spacing:0.6px;margin-bottom:6px}
  .stat-value{font-family:'Syne',sans-serif;font-size:26px;font-weight:700;color:${theme.accent}}
  .stat-unit{font-size:12px;color:${theme.textMuted};font-weight:400;margin-left:3px}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:flex-end;justify-content:center}
  .modal{background:${theme.surface};border:1px solid ${theme.border};border-radius:20px 20px 0 0;padding:24px 20px 36px;width:100%;max-width:480px;animation:slideUp 0.25s ease;max-height:85vh;overflow-y:auto}
  @keyframes slideUp{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}
  .modal-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;margin-bottom:6px}
  .modal-subtitle{font-size:13px;color:${theme.textMuted};margin-bottom:20px;line-height:1.5}
  .address-box{background:${theme.surfaceAlt};border:1px solid ${theme.border};border-radius:10px;padding:14px;margin-bottom:18px;font-size:14px;font-weight:500;color:${theme.text};word-break:break-word;line-height:1.5}
  .empty{text-align:center;color:${theme.textMuted};padding:40px 20px;font-size:14px}
  .empty-icon{font-size:40px;margin-bottom:12px}
  .filter-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px}
  .filter-input{background:${theme.surfaceAlt};border:1px solid ${theme.border};border-radius:8px;color:${theme.text};font-family:'DM Sans',sans-serif;font-size:13px;padding:9px 10px;outline:none;width:100%}
  .filter-input:focus{border-color:${theme.primary}}
  .filter-input::placeholder{color:${theme.textMuted};font-size:12px}
  .loc-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid ${theme.border}22}
  .loc-row:last-child{border-bottom:none}
  .live-view-card{background:${theme.surface};border:1px solid ${theme.primary};border-radius:14px;margin-bottom:14px;overflow:hidden}
  .live-view-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:linear-gradient(135deg,#0d2545 0%,#0a1929 100%);border-bottom:1px solid ${theme.border}}
  .live-view-title{display:flex;align-items:center;gap:8px;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${theme.accent}}
  .live-dot{width:7px;height:7px;border-radius:50%;background:${theme.success};animation:pulse 1.5s ease-in-out infinite;flex-shrink:0}
  .live-address{font-size:11px;color:${theme.textMuted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px}
  .live-view-map{width:100%;height:220px;border:none;display:block}
  .live-open-btn{display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;color:${theme.accent};font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;padding:10px 16px;border-top:1px solid ${theme.border}44;width:100%;justify-content:center;transition:background 0.2s}
  .live-open-btn:hover{background:${theme.surfaceAlt}}
  .sync-indicator{display:flex;align-items:center;gap:6px;font-size:11px}
  .sync-dot{width:6px;height:6px;border-radius:50%;background:${theme.success}}
  .sync-dot.syncing{background:${theme.warning};animation:pulse 1s ease-in-out infinite}
  .sync-dot.offline{background:${theme.danger};animation:pulse 1s ease-in-out infinite}
  .help-section{margin-bottom:20px}
  .help-section-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:${theme.accent};text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;display:flex;align-items:center;gap:8px}
  .help-item{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid ${theme.border}33;font-size:13px;line-height:1.5;color:${theme.text}}
  .help-item:last-child{border-bottom:none}
  .help-item-icon{font-size:18px;flex-shrink:0;margin-top:1px}
  .help-item-text strong{color:${theme.accent};display:block;font-size:13px;margin-bottom:2px}
  .help-item-text span{color:${theme.textMuted};font-size:12px}
  /* Login */
  .login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:${theme.bg};padding:20px}
  .login-box{background:${theme.surface};border:1px solid ${theme.border};border-radius:20px;padding:36px 28px;width:100%;max-width:360px}
  .login-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:26px;color:#fff;margin-bottom:4px}
  .login-sub{font-size:13px;color:${theme.textMuted};margin-bottom:28px}
  .login-error{background:rgba(239,68,68,0.12);border:1px solid ${theme.danger};border-radius:8px;padding:10px 14px;font-size:13px;color:${theme.danger};margin-bottom:14px}
  .role-badge{display:inline-block;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;text-transform:uppercase;letter-spacing:0.8px}
  .role-admin{background:rgba(239,68,68,0.2);color:#ef4444}
  .role-manager{background:rgba(245,158,11,0.2);color:#f59e0b}
  .role-driver{background:rgba(29,110,245,0.2);color:#38bdf8}
  /* Admin / Manager panel */
  .admin-wrap{max-width:480px;min-height:100vh;margin:0 auto;background:${theme.bg};border-left:1px solid ${theme.border};border-right:1px solid ${theme.border};display:flex;flex-direction:column}
  .admin-header{background:#c0001a;border-bottom:2px solid #8b0000;padding:0 20px;height:60px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
  .big-btn-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:20px 16px}
  .big-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:${theme.surface};border:1px solid ${theme.border};border-radius:16px;padding:28px 16px;cursor:pointer;transition:all 0.2s;text-align:center}
  .big-btn:hover{border-color:${theme.primary};background:${theme.surfaceAlt};transform:translateY(-2px)}
  .big-btn-icon{font-size:38px}
  .big-btn-label{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:${theme.text}}
  .big-btn-sub{font-size:11px;color:${theme.textMuted};line-height:1.4}
  .driver-row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid ${theme.border}22}
  .driver-row:last-child{border-bottom:none}
  .section-title{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${theme.textMuted};margin-bottom:12px;display:flex;align-items:center;gap:8px}
  .back-btn{background:none;border:none;color:rgba(255,255,255,0.8);font-size:22px;cursor:pointer;padding:4px 8px;line-height:1}
`;

// ─── Firebase helpers ─────────────────────────────────────────────
const driverCol        = (uid, col) => `drivers/${uid}/${col}`;
const saveRoute        = (uid, r)   => setDoc(doc(db, driverCol(uid,"routes"),    String(r.id)), r);
const saveLocation     = (uid, k,v) => setDoc(doc(db, driverCol(uid,"locations"), k.replace(/\./g,"_")), v);
const saveFuelEntry    = (uid, e)   => setDoc(doc(db, driverCol(uid,"fuels"),     String(e.id)), e);
const saveProfile      = (uid, p)   => setDoc(doc(db, driverCol(uid,"profile"),   "driver"), p);
const saveServiceEntry = (uid, s)   => setDoc(doc(db, driverCol(uid,"services"),  String(s.id)), s);
const delService       = (uid, id)  => deleteDoc(doc(db, driverCol(uid,"services"), String(id)));
const saveActiveRoute  = (uid, r)   => setDoc(doc(db, driverCol(uid,"activeRoute"), "current"), r);
const clearActiveRoute = (uid)      => deleteDoc(doc(db, driverCol(uid,"activeRoute"), "current"));

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
        <div className="modal-subtitle">Keeper Tracker — Σύστημα Καταγραφής Δρομολογίων</div>

        <div className="help-section">
          <div className="help-section-title">🚐 Καταγραφή Δρομολογίου</div>
          <div className="help-item"><span className="help-item-icon">🏠</span><div className="help-item-text"><strong>Εκκίνηση από Έδρα</strong><span>Ξεκινά δρομολόγιο από την αποθηκευμένη διεύθυνση έδρας.</span></div></div>
          <div className="help-item"><span className="help-item-icon">📍</span><div className="help-item-text"><strong>Εκκίνηση από GPS</strong><span>Εντοπίζει την τρέχουσα θέση μέσω GPS και ξεκινά από εκεί.</span></div></div>
          <div className="help-item"><span className="help-item-icon">🔄</span><div className="help-item-text"><strong>Συνέχεια από Τελευταίο</strong><span>Ξεκινά νέο δρομολόγιο από το τελευταίο σημείο άφιξης.</span></div></div>
          <div className="help-item"><span className="help-item-icon">✅</span><div className="help-item-text"><strong>Άφιξη σε Πελάτη</strong><span>Καταγράφει GPS θέση· επιβεβαιώνεις διεύθυνση, διορθώνεις αριθμό αν χρειαστεί και καταχωρείς όνομα πελάτη. Μπορείς να επιλέξεις και από αποθηκευμένες τοποθεσίες.</span></div></div>
          <div className="help-item"><span className="help-item-icon">🏠</span><div className="help-item-text"><strong>Επιστροφή στην Έδρα</strong><span>Κλείνει το δρομολόγιο με προορισμό την έδρα χωρίς χρήση GPS.</span></div></div>
        </div>

        <div className="help-section">
          <div className="help-section-title">📋 Ιστορικό & Στατιστικά</div>
          <div className="help-item"><span className="help-item-icon">📜</span><div className="help-item-text"><strong>Ιστορικό</strong><span>Εμφανίζει τα δρομολόγια της σημερινής ημέρας. Με Live View βλέπεις την τελευταία διεύθυνση στον χάρτη.</span></div></div>
          <div className="help-item"><span className="help-item-icon">📊</span><div className="help-item-text"><strong>Στατιστικά</strong><span>Φιλτράρισε δρομολόγια ανά πελάτη, μήνα ή έτος. Εμφανίζει σύνολα από όλες τις ημέρες.</span></div></div>
          <div className="help-item"><span className="help-item-icon">📤</span><div className="help-item-text"><strong>Export Excel</strong><span>Εξάγει τα σημερινά δρομολόγια σε αρχείο .xlsx με σύνολο χρόνου και χιλιομέτρων.</span></div></div>
          <div className="help-item"><span className="help-item-icon">✏️</span><div className="help-item-text"><strong>Επεξεργασία / Διαγραφή</strong><span>Κάθε δρομολόγιο μπορεί να επεξεργαστεί (πελάτης, διεύθυνση) ή να διαγραφεί με το εικονίδιο 🗑️.</span></div></div>
        </div>

        <div className="help-section">
          <div className="help-section-title">⛽ Καύσιμα & Service</div>
          <div className="help-item"><span className="help-item-icon">⛽</span><div className="help-item-text"><strong>Καταχώρηση Καυσίμων</strong><span>Καταγράφεις λίτρα, κόστος, χιλιόμετρα και αριθμό απόδειξης. Εμφανίζει σύνολα κόστους/λίτρων.</span></div></div>
          <div className="help-item"><span className="help-item-icon">🔧</span><div className="help-item-text"><strong>Service Οχήματος</strong><span>Στο Προφίλ, καταχώρησε ημερομηνία, χιλιόμετρα και περιγραφή service. Μπορείς να επεξεργαστείς ή να διαγράψεις κάθε εγγραφή.</span></div></div>
        </div>

        <div className="help-section">
          <div className="help-section-title">👤 Προφίλ & Τοποθεσίες</div>
          <div className="help-item"><span className="help-item-icon">✏️</span><div className="help-item-text"><strong>Επεξεργασία Προφίλ</strong><span>Πάτα "Επεξεργασία" για να αλλάξεις στοιχεία (όνομα, πινακίδα, χλμ έναρξης, έδρα). Η αποθήκευση γίνεται αυτόματα. Πάτα "Αποθήκευση" για να κλείσεις τη φόρμα.</span></div></div>
          <div className="help-item"><span className="help-item-icon">📍</span><div className="help-item-text"><strong>Αποθηκευμένες Τοποθεσίες</strong><span>Οι διευθύνσεις πελατών αποθηκεύονται αυτόματα μετά από κάθε άφιξη. Μπορείς να τις επεξεργαστείς ή διαγράψεις.</span></div></div>
        </div>

        <div className="help-section">
          <div className="help-section-title">☁️ Συγχρονισμός</div>
          <div className="help-item"><span className="help-item-icon">🔵</span><div className="help-item-text"><strong>Cloud Sync</strong><span>Όλα αποθηκεύονται σε Firebase σε πραγματικό χρόνο. Η ένδειξη "Sync..." εμφανίζεται κατά την αποθήκευση.</span></div></div>
          <div className="help-item"><span className="help-item-icon">🔴</span><div className="help-item-text"><strong>Offline</strong><span>Αν χαθεί σύνδεση, εμφανίζεται "Offline". Τα δεδομένα συγχρονίζονται αυτόματα μόλις επιστρέψει το internet.</span></div></div>
        </div>

        <button className="btn btn-secondary" style={{marginBottom:0,marginTop:6}} onClick={onClose}>Κλείσιμο</button>
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
function ArrivalModal({ rawAddress, knownEntry, locations, onDone, onCancel }) {
  const [step,         setStep]         = useState("pick_location");
  const [search,       setSearch]       = useState("");
  const [editedNumber, setEditedNumber] = useState("");
  const [finalAddress, setFinalAddress] = useState(rawAddress);
  const [clientName,   setClientName]   = useState(knownEntry?.name || "");

  const sortedLocs = Object.entries(locations || {})
    .map(([k,v]) => ({key:k, ...v}))
    .sort((a,b) => (a.name||"").localeCompare(b.name||"", "el"));

  const filtered = search.trim()
    ? sortedLocs.filter(l =>
        (l.name||"").toLowerCase().includes(search.toLowerCase()) ||
        (l.address||"").toLowerCase().includes(search.toLowerCase())
      )
    : sortedLocs;

  // Step: pick_location — λίστα αποθηκευμένων + search
  if (step === "pick_location") return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-title">📍 Άφιξη</div>
        <div className="modal-subtitle">Επίλεξε προορισμό ή πρόσθεσε νέο</div>
        <input
          className="input"
          placeholder="🔍 Αναζήτηση..."
          value={search}
          onChange={e=>setSearch(e.target.value)}
          autoFocus
          style={{marginBottom:12}}
        />
        <div style={{maxHeight:260,overflowY:"auto",marginBottom:12}}>
          {filtered.length === 0 && (
            <div style={{textAlign:"center",color:"#8899b0",fontSize:13,padding:"20px 0"}}>Κανένα αποτέλεσμα</div>
          )}
          {filtered.map(loc => (
            <div key={loc.key}
              onClick={()=>onDone(loc.address, loc.name)}
              style={{padding:"12px 14px",borderBottom:"1px solid #1e3a5f44",cursor:"pointer",borderRadius:8,marginBottom:4,background:"#1a2235"}}
            >
              <div style={{fontSize:14,fontWeight:600,color:"#e8edf5"}}>{loc.name}</div>
              <div style={{fontSize:11,color:"#8899b0",marginTop:2}}>{loc.address}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-secondary" style={{marginBottom:8}} onClick={()=>setStep("confirm_address")}>
          📡 Νέος προορισμός (GPS)
        </button>
        <button className="btn btn-secondary" style={{marginBottom:0}} onClick={onCancel}>Άκυρο</button>
      </div>
    </div>
  );

  // Step: confirm_address — επιβεβαίωση GPS διεύθυνσης
  if (step === "confirm_address") return (
    <div className="overlay"><div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="modal-title">📍 Νέος Προορισμός</div>
      <div className="modal-subtitle">Επιβεβαίωσε τη διεύθυνση GPS</div>
      <div className="address-box">{rawAddress}</div>
      <div className="btn-row">
        <button className="btn btn-success" onClick={()=>{setFinalAddress(rawAddress);setStep("name");}}>✓ Σωστή</button>
        <button className="btn btn-warning" onClick={()=>setStep("edit_number")}>✏️ Αριθμός</button>
      </div>
      <button className="btn btn-secondary" style={{marginTop:10}} onClick={()=>setStep("pick_location")}>← Πίσω</button>
    </div></div>
  );

  // Step: edit_number
  if (step === "edit_number") {
    const streetOnly = rawAddress.replace(/,.*/, "").replace(/\d+/, "").trim();
    return (
      <div className="overlay"><div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-title">✏️ Διόρθωση</div>
        <div className="modal-subtitle"><strong style={{color:"#e8edf5"}}>{streetOnly}</strong></div>
        <div className="input-group"><label className="input-label">Αριθμός</label>
          <input className="input" type="text" placeholder="π.χ. 12" value={editedNumber}
            onChange={e=>setEditedNumber(e.target.value)} autoFocus/>
        </div>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={()=>{
            let addr = rawAddress;
            if (editedNumber) {
              if (/,/.test(rawAddress)) addr = rawAddress.replace(/,/, ` ${editedNumber},`);
              else if (rawAddress.includes(" ")) addr = rawAddress.replace(/ /, ` ${editedNumber} `);
              else addr = rawAddress + " " + editedNumber;
            }
            setFinalAddress(addr); setStep("name");
          }}>✓ ΟΚ</button>
          <button className="btn btn-secondary" onClick={()=>setStep("confirm_address")}>Πίσω</button>
        </div>
      </div></div>
    );
  }

  // Step: name
  if (step === "name") return (
    <div className="overlay"><div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="modal-title">👤 Όνομα Πελάτη</div>
      <div className="modal-subtitle"><strong style={{color:"#e8edf5"}}>{finalAddress}</strong></div>
      <div className="input-group"><label className="input-label">Όνομα</label>
        <input className="input" type="text" placeholder="π.χ. Παπαδόπουλος" value={clientName}
          onChange={e=>setClientName(e.target.value)} autoFocus/>
      </div>
      <div className="btn-row">
        <button className="btn btn-success" onClick={()=>onDone(finalAddress, clientName.trim())}>💾 Αποθήκευση</button>
        <button className="btn btn-secondary" onClick={()=>setStep("confirm_address")}>Πίσω</button>
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


// ─── ServiceModal ────────────────────────────────────────────────
function ServiceModal({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? {date:initial.date||"",km:initial.km||"",description:initial.description||""} : {date:"",km:"",description:""});
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-title">{initial ? "✏️ Επεξεργασία Service" : "🔧 Νέο Service"}</div>
        <div className="modal-subtitle">Καταχώρηση συντήρησης οχήματος</div>
        <div className="input-group">
          <label className="input-label">Ημερομηνία</label>
          <input className="input" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
        </div>
        <div className="input-group">
          <label className="input-label">Χιλιόμετρα</label>
          <input className="input" type="number" placeholder="125000" value={form.km} onChange={e=>setForm({...form,km:e.target.value})}/>
        </div>
        <div className="input-group">
          <label className="input-label">Περιγραφή</label>
          <input className="input" placeholder="π.χ. Αλλαγή λαδιών, φίλτρα..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        </div>
        <div className="btn-row">
          <button className="btn btn-success" style={{marginBottom:0}} onClick={()=>{if(form.date&&form.description)onSave(form);}}>💾 Αποθήκευση</button>
          <button className="btn btn-secondary" style={{marginBottom:0}} onClick={onCancel}>Άκυρο</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────
function DriverApp({ user, onLogout }) {
  const uid = user.id;
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
  const [editingProfile, setEditingProfile] = useState(false);
  const [services, setServices] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

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
    // Επαναφορά ενεργής διαδρομής από Firestore
    const unsubActive = onSnapshot(collection(db, driverCol(uid,"activeRoute")), snap => {
      const cur = snap.docs.find(d=>d.id==="current");
      setActiveRoute(cur ? cur.data() : null);
    });

    const unsubRoutes = onSnapshot(collection(db, driverCol(uid,"routes")), (snap) => {
      const data = snap.docs.map(d=>d.data()).sort((a,b)=>a.start.timestamp-b.start.timestamp);
      setAllRoutes(data);
      setRoutes(data.filter(r => new Date(r.start.timestamp).toLocaleDateString("el-GR")===todayKey));
    });
    const unsubLocations = onSnapshot(collection(db, driverCol(uid,"locations")), (snap) => {
      const data = {};
      snap.docs.forEach(d=>{ data[d.id]=d.data(); });
      setLocations(data);
    });
    const unsubFuels = onSnapshot(collection(db, driverCol(uid,"fuels")), (snap) => {
      setFuels(snap.docs.map(d=>d.data()).sort((a,b)=>b.id-a.id));
    });
    const unsubProfile = onSnapshot(collection(db, driverCol(uid,"profile")), (snap) => {
      const driver = snap.docs.find(d=>d.id==="driver");
      if (driver) setProfile(driver.data());
    });
    const unsubServices = onSnapshot(collection(db, driverCol(uid,"services")), (snap) => {
      setServices(snap.docs.map(d=>d.data()).sort((a,b)=>b.id-a.id));
    });

    return () => { unsubRoutes(); unsubLocations(); unsubFuels(); unsubProfile(); unsubServices(); unsubActive(); };
  }, []);

  // ─── Profile debounce save ────────────────────────────────────
  useEffect(() => {
    const hasData = profile.firstName || profile.lastName || profile.plate || profile.startKm || profile.baseAddress;
    if (!hasData) return;
    const t = setTimeout(() => { saveProfile(uid, profile); }, 800);
    return () => clearTimeout(t);
  }, [profile]);


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
    const nr = {id:Date.now(), fromBase:true, start:{location:profile.baseAddress||"Έδρα", time:now(), timestamp:Date.now()}};
    setActiveRoute(nr);
    await saveActiveRoute(uid, nr);
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
      fromLastClient: lastRoute.end.label || null,
      start: { location: lastRoute.end.location, time: now(), timestamp: Date.now() }
    };
    setActiveRoute(newRoute);
    await saveRoute(uid, newRoute);
    await saveActiveRoute(uid, newRoute);
  };

  const findNearbyLocation = (lat, lon) => {
    const toRad = d => d * Math.PI / 180;
    const R = 6371000;
    let best = null, bestDist = 150;
    Object.entries(locations).forEach(([k, v]) => {
      const parts = k.split("_");
      if (parts.length < 2) return;
      const [klat, klon] = parts.map(Number);
      const dLat = toRad(klat - lat);
      const dLon = toRad(klon - lon);
      const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat))*Math.cos(toRad(klat))*Math.sin(dLon/2)**2;
      const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      if (d < bestDist) { bestDist = d; best = k; }
    });
    return best;
  };

  const endRoute = async () => {
    if (!activeRoute) return;
    const coords = await getCoords();
    let rawAddress="Άγνωστη τοποθεσία", key=null;
    if (coords) {
      rawAddress = await reverseGeocode(coords.lat, coords.lon);
      const nearbyKey = findNearbyLocation(coords.lat, coords.lon);
      key = nearbyKey || gpsKey(coords.lat, coords.lon);
    }
    setArrivalData({rawAddress, key, knownEntry: key&&locations[key] ? locations[key] : null});
  };

  const handleArrivalDone = async (finalAddress, clientName) => {
    if (!activeRoute) return;
    setSyncing(true);
    if (arrivalData.key) await saveLocation(uid, arrivalData.key,{address:finalAddress, name:clientName});
    const completed = {...activeRoute, gpsKey:arrivalData.key, end:{location:finalAddress, time:now(), label:clientName, timestamp:Date.now()}};
    await saveRoute(uid, completed);
    setSyncing(false);
    setActiveRoute(null); setArrivalData(null);
    releaseWakeLock();
  };


  const arriveAtBase = async () => {
    if (!activeRoute) return;
    setSyncing(true);
    const baseAddr = profile.baseAddress || "Έδρα";
    const completed = {...activeRoute, gpsKey:null, end:{location:baseAddr, time:now(), label:"Έδρα", timestamp:Date.now(), isBase:true}};
    await saveRoute(uid, completed);
    await clearActiveRoute(uid);
    setSyncing(false);
    setActiveRoute(null);
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
    await saveFuelEntry(uid, entry);
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
    {key:"record",  icon:(<svg xmlns="http://www.w3.org/2000/svg" width="22" height="20" viewBox="0 0 24 24" fill="white"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>), label:"ΚΑΤΑΓΡΑΦΗ"},
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
            <span className="logo">Keeper Tracker<span className="logo-beta">{user.username}</span></span>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div className="sync-indicator">
                <div className={`sync-dot ${!isOnline?"offline":syncing?"syncing":""}`}/>
                <span style={{color:!isOnline?theme.danger:syncing?theme.warning:theme.textMuted}}>
                  {!isOnline?"Offline":syncing?"Sync...":"Cloud ✓"}
                </span>
              </div>
              <button className="help-btn" onClick={()=>setShowHelp(true)}>?</button>
              <button onClick={onLogout} title="Αποσύνδεση" style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.7)",fontSize:20,padding:"4px 2px",lineHeight:1}}>⏏</button>
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
                  <div style={{marginBottom:14}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,justifyContent:"center"}}>
                      <span className="pulse-dot"/>
                      <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:15,color:"#38bdf8"}}>ΔΙΑΔΡΟΜΗ ΣΕ ΕΞΕΛΙΞΗ</span>
                    </div>
                    <div style={{fontSize:12,color:"#8899b0",marginBottom:10,textAlign:"center"}}>
                      {"από: "}
                      <span style={{color:"#e8edf5",fontWeight:600}}>
                        {activeRoute.fromBase && !activeRoute.fromLastClient
                          ? "Έδρα"
                          : activeRoute.fromLastClient
                            ? activeRoute.fromLastClient
                            : activeRoute.start.location}
                      </span>
                    </div>
                    <div className="route-info-label" style={{textAlign:"center"}}>ΩΡΑ ΕΝΑΡΞΗΣ</div>
                    <div className="route-info-value" style={{textAlign:"center"}}>{activeRoute.start.time}</div>
                  </div>
                  <div className="btn-row" style={{marginBottom:10}}>
                    <button className="btn btn-success" style={{marginBottom:0}} onClick={endRoute}>✓ ΑΦΙΞΗ</button>
                    <button className="btn" style={{marginBottom:0,background:"#7f1d1d",color:"white",border:"1px solid #ef4444"}} onClick={arriveAtBase}>🏠 ΑΦΙΞΗ ΣΕ ΕΔΡΑ</button>
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div className="card-title">ΝΕΑ ΔΙΑΔΡΟΜΗ</div>
                  {![...routes].reverse().find(r=>r.end?.location) || [...routes].reverse().find(r=>r.end?.location)?.end?.isBase ? (
                    <button className="btn btn-primary" onClick={startFromBase}>🏠 &nbsp;ΕΝΑΡΞΗ ΑΠΟ ΕΔΡΑ</button>
                  ) : (
                    <button className="btn btn-secondary" onClick={continueFromLast}>🔁 &nbsp;ΕΠΟΜΕΝΗ ΣΤΑΣΗ</button>
                  )}
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
                      <th style={{width:"32%"}}>ΑΦΙΞΗ</th>
                      <th style={{width:"18%"}}></th>
                    </tr></thead>
                    <tbody>{routes.map((r,i)=>(
                      <tr key={r.id}>
                        <td style={{color:"#8899b0"}}>{i===0&&r.fromBase?"🏠":i+1}</td>
                        <td style={{textAlign:"left"}}><span className="client-badge">{r.end?.label||"—"}</span></td>
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
                        <td style={{textAlign:"left"}}><span className="client-badge">{r.end?.label||"—"}</span></td>
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
                        <td style={{textAlign:"left"}}><span className="client-badge">{r.end?.label||"—"}</span></td>
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
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                  <div className="card-title" style={{margin:0}}>ΠΡΟΦΙΛ ΟΔΗΓΟΥ</div>
                  {editingProfile ? (
                    <button className="btn btn-primary btn-sm" onClick={()=>setEditingProfile(false)}>💾 Αποθήκευση</button>
                  ) : (
                    <button className="btn btn-secondary btn-sm" onClick={()=>setEditingProfile(true)}>✏️ Επεξεργασία</button>
                  )}
                </div>
                {!editingProfile ? (
                  <details>
                    <summary style={{cursor:"pointer",fontFamily:"Syne,sans-serif",fontSize:12,fontWeight:700,
                      textTransform:"uppercase",letterSpacing:"1px",color:"#8899b0",listStyle:"none",
                      display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0"}}>
                      <span>👤 {profile.firstName} {profile.lastName}</span>
                      <span style={{fontSize:11}}>▼</span>
                    </summary>
                    <div style={{marginTop:12,fontSize:14,lineHeight:2,color:"#e8edf5"}}>
                      <div><span style={{color:"#8899b0",fontSize:12}}>Πινακίδα: </span>{profile.plate}</div>
                      <div><span style={{color:"#8899b0",fontSize:12}}>Χλμ έναρξης: </span>{profile.startKm}</div>
                      <div><span style={{color:"#8899b0",fontSize:12}}>Έδρα: </span>{profile.baseAddress}</div>
                    </div>
                  </details>
                ) : (
                  <div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                      <div className="input-group"><label className="input-label">Όνομα</label><input className="input" placeholder="Γιώργης" value={profile.firstName||""} onChange={e=>setProfile({...profile,firstName:e.target.value})}/></div>
                      <div className="input-group"><label className="input-label">Επίθετο</label><input className="input" placeholder="Παπαδόπουλος" value={profile.lastName||""} onChange={e=>setProfile({...profile,lastName:e.target.value})}/></div>
                    </div>
                    <div className="input-group"><label className="input-label">Πινακίδα</label><input className="input" placeholder="ΑΒΓ-1234" value={profile.plate||""} onChange={e=>setProfile({...profile,plate:e.target.value})}/></div>
                    <div className="input-group"><label className="input-label">Χιλιόμετρα έναρξης</label><input className="input" type="number" placeholder="125000" value={profile.startKm||""} onChange={e=>setProfile({...profile,startKm:e.target.value})}/></div>
                    <div className="input-group"><label className="input-label">Διεύθυνση Έδρας</label><input className="input" placeholder="Αθήνα, Ελλάδα" value={profile.baseAddress||""} onChange={e=>setProfile({...profile,baseAddress:e.target.value})}/></div>
                  </div>
                )}
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
                      <input
                        className="input"
                        placeholder="🔍 Αναζήτηση προορισμού..."
                        style={{margin:"10px 0 12px 0"}}
                        onChange={e=>{
                          const v=e.target.value.toLowerCase();
                          document.querySelectorAll('.loc-row').forEach(el=>{
                            el.style.display=el.textContent.toLowerCase().includes(v)?'':'none';
                          });
                        }}
                      />
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
                                  if(newName!==null||newAddr!==null) saveLocation(uid, key,{name:newName??val.name, address:newAddr??val.address});
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
              <div className="card" style={{padding:0,overflow:"hidden"}}>
                <details>
                  <summary style={{cursor:"pointer",fontFamily:"Syne,sans-serif",fontSize:12,fontWeight:700,
                    textTransform:"uppercase",letterSpacing:"1px",color:"#8899b0",padding:"14px 18px",
                    listStyle:"none",display:"flex",justifyContent:"space-between",alignItems:"center",
                    borderBottom:services.length>0?"1px solid #1e3a5f":"none"}}>
                    <span>🔧 ΣΥΝΤΗΡΗΣΗ ΟΧΗΜΑΤΟΣ</span>
                    <span style={{fontWeight:400,fontSize:11}}>({services.length})</span>
                  </summary>
                  <div style={{padding:"10px 18px 14px"}}>
                    <button className="btn btn-primary btn-sm" style={{marginBottom:12,width:"100%"}} onClick={()=>{setEditingService(null);setShowServiceModal(true);}}>+ Προσθήκη Service</button>
                    {services.length===0 ? (
                      <div className="empty" style={{padding:"10px 0"}}>Καμία καταχώρηση συντήρησης</div>
                    ) : (
                      services.map(s=>(
                        <div key={s.id} style={{padding:"10px 0",borderBottom:"1px solid #1e3a5f22",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:600,color:"#e8edf5"}}>{s.description}</div>
                            <div style={{fontSize:11,color:"#8899b0",marginTop:3}}>{s.date}{s.km?` · ${s.km} χλμ`:""}</div>
                          </div>
                          <div className="action-btns">
                            <button className="icon-btn icon-btn-edit" onClick={()=>{setEditingService(s);setShowServiceModal(true);}}>✏️</button>
                            <button className="icon-btn icon-btn-del" onClick={()=>{if(window.confirm("Διαγραφή;"))delService(uid, s.id);}}>🗑️</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </details>
              </div>
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

      {arrivalData   && <ArrivalModal rawAddress={arrivalData.rawAddress} knownEntry={arrivalData.knownEntry} locations={locations} onDone={handleArrivalDone} onCancel={()=>{setArrivalData(null);releaseWakeLock();}}/>}
      {showFuel      && <FuelModal onSave={saveFuel} onCancel={()=>setShowFuel(false)}/>}
      {editingRoute  && <EditRouteModal route={editingRoute} onSave={handleEditSave} onCancel={()=>setEditingRoute(null)}/>}
            {showServiceModal && <ServiceModal
        initial={editingService}
        onSave={async (form)=>{
          const entry = editingService ? {...editingService,...form} : {id:Date.now(),...form};
          setSyncing(true);
          await saveServiceEntry(uid, entry);
          setSyncing(false);
          setShowServiceModal(false); setEditingService(null);
        }}
        onCancel={()=>{setShowServiceModal(false);setEditingService(null);}}
      />}
      {showHelp      && <HelpModal onClose={()=>setShowHelp(false)}/>}
    </>
  );
}


// ─── simpleHash ─────────────────────────────────────────────────────────────
function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h.toString(16);
}



// ─── Login Page ─────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Συμπλήρωσε username και password");
      return;
    }
    setLoading(true); setError("");
    try {
      const snap = await getDocs(collection(db, "users"));
      const users = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      const found = users.find(u =>
        (u.username||"").toLowerCase() === username.trim().toLowerCase() &&
        u.passwordHash === simpleHash(password)
      );
      if (!found) {
        setError("Λάθος στοιχεία σύνδεσης");
      } else if (found.active === false) {
        setError("Ο λογαριασμός είναι ανενεργός");
      } else {
        onLogin(found);
      }
    } catch (e) {
      setError("Σφάλμα σύνδεσης");
    }
    setLoading(false);
  };

  return (
    <>
      <style>{css}</style>
      <div className="login-wrap">
        <div className="login-box">
          <div className="login-logo">Keeper Tracker</div>
          <div className="login-sub">Σύνδεση σε λογαριασμό οδηγού, πωλητή ή admin</div>
          {error && <div className="login-error">{error}</div>}
          <div className="input-group">
            <label className="input-label">Username</label>
            <input className="input" value={username} onChange={e=>setUsername(e.target.value)} placeholder="π.χ. driver1" autoFocus />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&handleLogin()} />
          </div>
          <button className="btn btn-primary" onClick={handleLogin} disabled={loading}>{loading ? "Σύνδεση..." : "Είσοδος"}</button>
          <div style={{marginTop:10,fontSize:12,color:theme.textMuted,lineHeight:1.6}}>
            Οι λογαριασμοί δημιουργούνται μόνο από admin.
          </div>
        </div>
      </div>
    </>
  );
}


// ─── Change Password ────────────────────────────────────────────────────────
function ChangePasswordForm({ userId, onBack }) {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setError(""); setSuccess(false);
    if (!current || !newPass || !confirm) { setError("Συμπλήρωσε όλα τα πεδία"); return; }
    if (newPass.length < 4) { setError("Ο νέος κωδικός πρέπει να έχει τουλάχιστον 4 χαρακτήρες"); return; }
    if (newPass !== confirm) { setError("Οι νέοι κωδικοί δεν ταιριάζουν"); return; }
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const userDoc = snap.docs.find(d => d.id === userId);
      if (!userDoc) { setError("Σφάλμα: λογαριασμός δεν βρέθηκε"); setLoading(false); return; }
      const data = userDoc.data();
      if (data.passwordHash !== simpleHash(current)) { setError("Λάθος τρέχων κωδικός"); setLoading(false); return; }
      await setDoc(doc(db, "users", userId), { ...data, passwordHash: simpleHash(newPass) });
      setSuccess(true); setCurrent(""); setNewPass(""); setConfirm("");
    } catch(e) { setError("Σφάλμα αποθήκευσης"); }
    setLoading(false);
  };

  return (
    <div>
      {error && <div className="login-error" style={{marginBottom:14}}>{error}</div>}
      {success && <div style={{background:"rgba(34,197,94,0.12)",border:"1px solid #22c55e",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#22c55e",marginBottom:14}}>✅ Ο κωδικός άλλαξε επιτυχώς!</div>}
      <div className="input-group"><label className="input-label">Τρέχων Κωδικός</label><input className="input" type="password" placeholder="••••••••" value={current} onChange={e=>setCurrent(e.target.value)}/></div>
      <div className="input-group"><label className="input-label">Νέος Κωδικός</label><input className="input" type="password" placeholder="••••••••" value={newPass} onChange={e=>setNewPass(e.target.value)}/></div>
      <div className="input-group"><label className="input-label">Επιβεβαίωση Νέου</label><input className="input" type="password" placeholder="••••••••" value={confirm} onChange={e=>setConfirm(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSave()}/></div>
      <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading ? "Αποθήκευση..." : "💾 Αποθήκευση"}</button>
    </div>
  );
}


// ─── Admin / Manager Panel ──────────────────────────────────────────────────
function AdminPanel({ user, onLogout }) {
  const isAdmin = user.role === "admin";
  const [view, setView] = useState("home");
  const [showHelp, setShowHelp] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [newUser, setNewUser] = useState({username:"",password:"",role:"driver"});
  const [driverRoutes, setDriverRoutes] = useState([]);
  const [driverFuels, setDriverFuels] = useState([]);
  const [driverServices, setDriverServices] = useState([]);
  const [driverActive, setDriverActive] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), snap => {
      const data = snap.docs.map(d => ({id:d.id, ...d.data()}));
      setUsers(data.sort((a,b)=>(a.username||"").localeCompare(b.username||"", "el")));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selectedDriverId || view !== "live") return;
    const unsubRoutes = onSnapshot(collection(db, driverCol(selectedDriverId,"routes")), snap => setDriverRoutes(snap.docs.map(d=>d.data()).sort((a,b)=>a.start.timestamp-b.start.timestamp)));
    const unsubFuels = onSnapshot(collection(db, driverCol(selectedDriverId,"fuels")), snap => setDriverFuels(snap.docs.map(d=>d.data()).sort((a,b)=>b.id-a.id)));
    const unsubServices = onSnapshot(collection(db, driverCol(selectedDriverId,"services")), snap => setDriverServices(snap.docs.map(d=>d.data()).sort((a,b)=>b.id-a.id)));
    const unsubActive = onSnapshot(collection(db, driverCol(selectedDriverId,"activeRoute")), snap => { const cur = snap.docs.find(d=>d.id==='current'); setDriverActive(cur ? cur.data() : null); });
    const unsubProfile = onSnapshot(collection(db, driverCol(selectedDriverId,"profile")), snap => { const p = snap.docs.find(d=>d.id==='driver'); setDriverProfile(p ? p.data() : null); });
    return () => { unsubRoutes(); unsubFuels(); unsubServices(); unsubActive(); unsubProfile(); };
  }, [selectedDriverId, view]);

  const visibleAccounts = users.filter(u => u.role === "driver" || u.role === "manager");
  const driverAccounts  = users.filter(u => u.role === "driver");
  const selectedUser = visibleAccounts.find(u => u.id === selectedDriverId);
  const lastLocation = driverActive?.start?.location || driverRoutes.find(r => r.end?.location)?.end?.location;

  const createUser = async () => {
    if (!newUser.username.trim() || !newUser.password.trim()) return alert("Συμπλήρωσε username και password");
    if (users.some(u => (u.username||"").toLowerCase() === newUser.username.trim().toLowerCase())) return alert("Το username υπάρχει ήδη");
    const id = `user_${Date.now()}`;
    await setDoc(doc(db, "users", id), {
      username: newUser.username.trim(),
      passwordHash: simpleHash(newUser.password),
      role: newUser.role,
      active: true,
      createdAt: Date.now(),
    });
    setNewUser({username:"",password:"",role:"driver"});
    alert("Ο λογαριασμός δημιουργήθηκε");
  };

  const deleteUserAccount = async id => {
    if (!window.confirm("Οριστική διαγραφή λογαριασμού;")) return;
    await deleteDoc(doc(db, "users", id));
    alert("Ο λογαριασμός διαγράφηκε από τη λίστα χρηστών");
  };

  return (
    <>
      <style>{css}</style>
      <div className="admin-wrap">
        <div className="admin-header">
          <div className="logo">Keeper Tracker <span className="logo-beta">{user.role}</span></div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button className="help-btn" onClick={()=>setShowHelp(true)}>?</button>
            <button className="btn btn-secondary btn-sm" onClick={onLogout}>Έξοδος</button>
          </div>
        </div>

        {view === "home" && (
          <div className="content">
            <div className="card" style={{marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div className="card-title" style={{marginBottom:6}}>ΣΥΝΔΕΔΕΜΕΝΟΣ ΧΡΗΣΤΗΣ</div>
                  <div style={{fontSize:16,fontWeight:700,color:theme.text}}>{user.username}</div>
                </div>
                <span className={`role-badge ${user.role==='admin' ? 'role-admin' : 'role-manager'}`}>{user.role}</span>
              </div>
            </div>

            <div className="big-btn-grid">
              {isAdmin && (
                <button className="big-btn" onClick={()=>setView("accounts")}>
                  <div className="big-btn-icon">👥</div>
                  <div className="big-btn-label">Δημιουργία / Διαγραφή Λογαριασμού</div>
                  <div className="big-btn-sub">Driver ή Manager accounts</div>
                </button>
              )}
              <button className="big-btn" onClick={()=>setView("live")}>
                <div className="big-btn-icon">🛰️</div>
                <div className="big-btn-label">Δρομολόγια Live</div>
                <div className="big-btn-sub">Ιστορικό, χάρτης, καύσιμα, service</div>
              </button>
              <button className="big-btn" onClick={()=>setView("changepass")} style={{gridColumn: isAdmin ? "1 / -1" : "auto"}}>
                <div className="big-btn-icon">🔑</div>
                <div className="big-btn-label">Αλλαγή Κωδικού</div>
                <div className="big-btn-sub">Αλλαγή κωδικού λογαριασμού σου</div>
              </button>
            </div>
          </div>
        )}

        {view === "accounts" && isAdmin && (
          <div className="content">
            <div className="card">
              <div className="section-title">➕ Νέος Λογαριασμός</div>
              <div className="input-group"><label className="input-label">Username</label><input className="input" value={newUser.username} onChange={e=>setNewUser({...newUser, username:e.target.value})} placeholder="π.χ. driver1"/></div>
              <div className="input-group"><label className="input-label">Password</label><input className="input" value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})} placeholder="password"/></div>
              <div className="input-group"><label className="input-label">Ρόλος</label>
                <select className="select-input" value={newUser.role} onChange={e=>setNewUser({...newUser, role:e.target.value})}>
                  <option value="driver">Οδηγός</option>
                  <option value="manager">Πωλητής</option>
                </select>
              </div>
              <button className="btn btn-primary" onClick={createUser}>Δημιουργία</button>
            </div>

            <div className="card">
              <div className="section-title">🗑️ Υπάρχοντες Λογαριασμοί</div>
              {visibleAccounts.length === 0 ? <div className="empty" style={{padding:'12px 0'}}>Δεν υπάρχουν λογαριασμοί</div> :
                visibleAccounts.map(u => (
                  <div key={u.id} className="driver-row">
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:theme.text}}>{u.username}</div>
                      <div style={{fontSize:11,color:theme.textMuted}}>{u.role}</div>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={()=>deleteUserAccount(u.id)}>Διαγραφή</button>
                  </div>
                ))
              }
            </div>
            <button className="btn btn-secondary" onClick={()=>setView('home')}>← Πίσω</button>
          </div>
        )}

        {view === "live" && (
          <div className="content">
            <div className="card">
              <div className="section-title">🧭 Επιλογή Οδηγού</div>
              <select className="select-input" value={selectedDriverId} onChange={e=>setSelectedDriverId(e.target.value)}>
                <option value="">— Επίλεξε οδηγό —</option>
                {driverAccounts.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
              {selectedUser && <div style={{fontSize:12,color:theme.textMuted}}>Εμφάνιση δεδομένων για <span style={{color:theme.text,fontWeight:700}}>{selectedUser.username}</span></div>}
            </div>

            {selectedDriverId && (
              <>
                {lastLocation && <LiveView address={lastLocation} />}

                {driverActive && (
                  <div className="active-route-card">
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}><span className="pulse-dot"></span><span style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:15,color:theme.accent}}>ΕΝΕΡΓΟ ΔΡΟΜΟΛΟΓΙΟ</span></div>
                    <div style={{fontSize:12,color:theme.textMuted}}>Αφετηρία</div>
                    <div style={{fontSize:14,fontWeight:700,color:theme.text,marginTop:4}}>{driverActive.start?.location}</div>
                    <div style={{fontSize:11,color:theme.textMuted,marginTop:6}}>{driverActive.start?.time}</div>
                  </div>
                )}

                <div className="card" style={{padding:0,overflow:'hidden'}}>
                  <div style={{padding:'16px 18px 8px'}} className="section-title">📋 Ιστορικό Δρομολογίων</div>
                  {driverRoutes.length===0 ? <div className="empty"><div className="empty-icon">📋</div>Δεν υπάρχουν δρομολόγια</div> :
                    <table className="route-table"><thead><tr><th style={{width:'9%'}}>#</th><th style={{width:'33%'}}>ΠΕΛΑΤΗΣ</th><th style={{width:'24%'}}>ΗΜ/ΝΙΑ</th><th style={{width:'17%'}}>ΩΡΑ</th><th style={{width:'17%'}}>ΛΗΞΗ</th></tr></thead><tbody>
                      {driverRoutes.map((r,i)=><tr key={r.id}><td style={{color:theme.textMuted}}>{i+1}</td><td style={{textAlign:'left'}}><span className="client-badge">{r.end?.label||'—'}</span></td><td style={{color:theme.textMuted,fontSize:11}}>{r.start.time?.split(',')[0]}</td><td style={{color:theme.textMuted,fontSize:11}}>{r.start.time?.split(',')[1]?.trim()}</td><td style={{color:theme.textMuted,fontSize:11}}>{r.end?.time?.split(',')[1]?.trim()||'—'}</td></tr>)}
                    </tbody></table>
                  }
                </div>

                <div className="card" style={{padding:0,overflow:'hidden'}}>
                  <div style={{padding:'16px 18px 8px'}} className="section-title">⛽ Ανεφοδιασμοί</div>
                  {driverFuels.length===0 ? <div className="empty" style={{padding:'20px'}}>Δεν υπάρχουν ανεφοδιασμοί</div> :
                    <table className="route-table"><thead><tr><th style={{width:'26%'}}>ΗΜ/ΝΙΑ</th><th style={{width:'17%'}}>L</th><th style={{width:'17%'}}>€</th><th style={{width:'18%'}}>ΧΛΜ</th><th style={{width:'22%'}}>ΑΠΟΔ.</th></tr></thead><tbody>
                      {driverFuels.map(f=><tr key={f.id}><td style={{color:theme.textMuted,fontSize:11}}>{f.date}</td><td>{f.liters}</td><td style={{color:theme.accent}}>{f.amount}</td><td style={{color:theme.textMuted}}>{f.km}</td><td style={{color:theme.textMuted,fontSize:11}}>{f.receipt}</td></tr>)}
                    </tbody></table>
                  }
                </div>

                <div className="card" style={{padding:0,overflow:'hidden'}}>
                  <div style={{padding:'16px 18px 8px'}} className="section-title">🔧 Συντήρηση Οχήματος</div>
                  {driverServices.length===0 ? <div className="empty" style={{padding:'20px'}}>Δεν υπάρχουν service entries</div> :
                    <div style={{padding:'0 18px 10px'}}>
                      {driverServices.map(s => <div key={s.id} className="driver-row"><div><div style={{fontSize:13,fontWeight:700,color:theme.text}}>{s.description}</div><div style={{fontSize:11,color:theme.textMuted}}>{s.date}{s.km ? ` • ${s.km} km` : ''}</div></div></div>)}
                    </div>
                  }
                </div>

                {driverProfile && (
                  <div className="card">
                    <div className="section-title">🚗 Στοιχεία Οχήματος</div>
                    <div style={{fontSize:13,lineHeight:1.9}}>
                      <div><span style={{color:theme.textMuted}}>Οδηγός: </span>{driverProfile.firstName} {driverProfile.lastName}</div>
                      <div><span style={{color:theme.textMuted}}>Πινακίδα: </span>{driverProfile.plate}</div>
                      <div><span style={{color:theme.textMuted}}>Έδρα: </span>{driverProfile.baseAddress}</div>
                    </div>
                  </div>
                )}
              </>
            )}
            <button className="btn btn-secondary" onClick={()=>setView('home')}>← Πίσω</button>
          </div>
        )}


        {view === "changepass" && (
          <div className="content">
            <div className="card">
              <div className="section-title">🔑 Αλλαγή Κωδικού</div>
              <div style={{fontSize:13,color:theme.textMuted,marginBottom:16}}>Λογαριασμός: <strong style={{color:theme.text}}>{user.username}</strong></div>
              <ChangePasswordForm userId={user.id} onBack={()=>setView("home")} />
            </div>
            <button className="btn btn-secondary" onClick={()=>setView("home")}>← Πίσω</button>
          </div>
        )}

        {showHelp && <HelpModal onClose={()=>setShowHelp(false)} />}
      </div>
    </>
  );
}


// ─── App Entry Point ────────────────────────────────────────────────────────
export default function App() {
  // Inject CSS once for all components
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
    return () => { try { document.head.removeChild(styleEl); } catch {} };
  }, []);

  const [authUser, setAuthUserRaw] = useState(() => {
    try { const s = localStorage.getItem("authUser"); return s ? JSON.parse(s) : null; }
    catch { return null; }
  });

  const setAuthUser = (user) => {
    if (user) { try { localStorage.setItem("authUser", JSON.stringify(user)); } catch {} }
    else       { try { localStorage.removeItem("authUser"); } catch {} }
    setAuthUserRaw(user);
  };

  // Validate stored session — clear if account deleted from Firestore
  useEffect(() => {
    if (!authUser) return;
    getDocs(collection(db, "users")).then(snap => {
      if (!snap.docs.some(d => d.id === authUser.id)) setAuthUser(null);
    }).catch(() => {});
  }, []);

  if (!authUser) return <LoginPage onLogin={setAuthUser} />;
  if (authUser.role === "admin" || authUser.role === "manager")
    return <AdminPanel user={authUser} onLogout={() => setAuthUser(null)} />;
  return <DriverApp user={authUser} onLogout={() => setAuthUser(null)} />;
}
