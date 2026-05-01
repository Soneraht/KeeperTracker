import React, { useState, useEffect, useRef } from 'react';
import { db, collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from '../firebase';
import { driverCol } from '../utils/firebaseHelpers';
import { playNotifSound, playSoftNotifSound } from '../utils/sound';
import LiveView from './LiveView';
import HelpModal from './HelpModal';
import ChangePasswordForm from './ChangePasswordForm';

export default function AdminPanel({ user, onLogout }) {
  const isAdmin = user.role === "admin";
  const [view, setView] = useState("home");
  const [showHelp, setShowHelp] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "driver" });
  const [driverRoutes, setDriverRoutes] = useState([]);
  const [driverFuels, setDriverFuels] = useState([]);
  const [driverServices, setDriverServices] = useState([]);
  const [driverActive, setDriverActive] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [routeFilters, setRouteFilters] = useState({ client: "", month: "", year: "" });
  const [salesRequests, setSalesRequests] = useState([]);
  const [newReq, setNewReq] = useState({ targetDriverId: "", description: "" });
  const salesPrevReqIds = useRef(new Set());

  const saveRequestHelper = async (r) => {
    await setDoc(doc(db, "requests", String(r.id)), r);
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "requests"), snap => {
      const all = snap.docs.map(d => d.data());
      const mine = all
        .filter(r => r.salesUserId === user.id)
        .sort((a, b) => b.createdAt - a.createdAt);
      mine.forEach(r => {
        const key = `${r.id}_${r.status}`;
        if ((r.status === "accepted" || r.status === "completed") && !salesPrevReqIds.current.has(key)) {
          playSoftNotifSound();
        }
        salesPrevReqIds.current.add(key);
      });
      setSalesRequests(mine);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(data.sort((a, b) => (a.username || "").localeCompare(b.username || "", "el")));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selectedDriverId || view !== "live") return;
    const unsubRoutes = onSnapshot(collection(db, driverCol(selectedDriverId, "routes")), snap =>
      setDriverRoutes(snap.docs.map(d => d.data()).sort((a, b) => a.start.timestamp - b.start.timestamp))
    );
    const unsubFuels = onSnapshot(collection(db, driverCol(selectedDriverId, "fuels")), snap =>
      setDriverFuels(snap.docs.map(d => d.data()).sort((a, b) => b.id - a.id))
    );
    const unsubServices = onSnapshot(collection(db, driverCol(selectedDriverId, "services")), snap =>
      setDriverServices(snap.docs.map(d => d.data()).sort((a, b) => b.id - a.id))
    );
    const unsubActive = onSnapshot(collection(db, driverCol(selectedDriverId, "activeRoute")), snap => {
      const cur = snap.docs.find(d => d.id === "current");
      setDriverActive(cur ? cur.data() : null);
    });
    const unsubProfile = onSnapshot(collection(db, driverCol(selectedDriverId, "profile")), snap => {
      const p = snap.docs.find(d => d.id === "driver");
      setDriverProfile(p ? p.data() : null);
    });
    return () => {
      unsubRoutes();
      unsubFuels();
      unsubServices();
      unsubActive();
      unsubProfile();
    };
  }, [selectedDriverId, view]);

  const visibleAccounts = users.filter(u => u.role === "driver" || u.role === "manager");
  const driverAccounts = users.filter(u => u.role === "driver");
  const selectedUser = visibleAccounts.find(u => u.id === selectedDriverId);
  const lastLocation =
    driverActive?.start?.location || driverRoutes.find(r => r.end?.location)?.end?.location;

  const createUser = async () => {
    if (!newUser.username.trim() || !newUser.password.trim())
      return alert("Συμπλήρωσε username και password");
    if (users.some(u => (u.username || "").toLowerCase() === newUser.username.trim().toLowerCase()))
      return alert("Το username υπάρχει ήδη");
    const id = `user_${Date.now()}`;
    await setDoc(doc(db, "users", id), {
      username: newUser.username.trim(),
      passwordHash: (() => {
        let h = 0;
        for (let i = 0; i < newUser.password.length; i++)
          h = (Math.imul(31, h) + newUser.password.charCodeAt(i)) | 0;
        return h.toString(16);
      })(),
      role: newUser.role,
      active: true,
      createdAt: Date.now(),
    });
    setNewUser({ username: "", password: "", role: "driver" });
    alert("Ο λογαριασμός δημιουργήθηκε");
  };

  const deleteUserAccount = async id => {
    if (!window.confirm("Οριστική διαγραφή λογαριασμού;")) return;
    await deleteDoc(doc(db, "users", id));
    alert("Ο λογαριασμός διαγράφηκε από τη λίστα χρηστών");
  };

  // Το υπόλοιπο return είναι πανομοιότυπο με το αρχικό, απλά χωρίς το css string και με σωστά imports
  return (
    <>
      <div className="admin-wrap">
        <div className="admin-header">
          <div className="logo">
            Keeper Tracker <span className="logo-beta">{user.role}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAdmin && (
              <button className="help-btn" onClick={() => setShowHelp(true)}>
                ?
              </button>
            )}
            <button
              onClick={onLogout}
              title="Αποσύνδεση"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.8)",
                padding: "4px 6px",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        {view === "home" && (
          <div className="content">
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="card-title" style={{ marginBottom: 6 }}>
                    ΣΥΝΔΕΔΕΜΕΝΟΣ ΧΡΗΣΤΗΣ
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#e8edf5" }}>{user.username}</div>
                </div>
                <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-manager'}`}>
                  {user.role}
                </span>
              </div>
            </div>

            <div className="big-btn-grid">
              {isAdmin && (
                <button className="big-btn" onClick={() => setView("accounts")}>
                  <div className="big-btn-icon">👥</div>
                  <div className="big-btn-label">Δημιουργία / Διαγραφή Λογαριασμού</div>
                  <div className="big-btn-sub">Driver ή Manager accounts</div>
                </button>
              )}
              <button className="big-btn" onClick={() => setView("live")}>
                <div className="big-btn-icon">🛰️</div>
                <div className="big-btn-label">Δρομολόγια Live</div>
                <div className="big-btn-sub">Ιστορικό, χάρτης, καύσιμα, service</div>
              </button>
              <button
                className="big-btn"
                style={{ position: "relative" }}
                onClick={() => setView("requests")}
              >
                <div className="big-btn-icon">📋</div>
                <div className="big-btn-label">Αιτήματα</div>
                <div className="big-btn-sub">Αποστολή & παρακολούθηση</div>
                {salesRequests.filter(r => r.status === "pending").length > 0 && (
                  <span className="notif-badge">
                    {salesRequests.filter(r => r.status === "pending").length}
                  </span>
                )}
              </button>
              <button
                className="big-btn"
                onClick={() => setView("changepass")}
                style={{ gridColumn: isAdmin ? "1 / -1" : "auto" }}
              >
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
              <div className="section-title">➕ Νεος Λογαριασμος</div>
              <div className="input-group">
                <label className="input-label">Username</label>
                <input
                  className="input"
                  value={newUser.username}
                  onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="π.χ. driver1"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  className="input"
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="password"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Ρόλος</label>
                <select
                  className="select-input"
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="driver">Οδηγός</option>
                  <option value="manager">Πωλητής</option>
                </select>
              </div>
              <button className="btn btn-primary" onClick={createUser}>
                Δημιουργία
              </button>
            </div>

            <div className="card">
              <div className="section-title">🗑️ Υπαρχοντες Λογαριασμοι</div>
              {visibleAccounts.length === 0 ? (
                <div className="empty" style={{ padding: '12px 0' }}>
                  Δεν υπάρχουν λογαριασμοί
                </div>
              ) : (
                visibleAccounts.map(u => (
                  <div key={u.id} className="driver-row">
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#e8edf5" }}>
                        {u.username}
                      </div>
                      <div style={{ fontSize: 11, color: "#8899b0" }}>{u.role}</div>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteUserAccount(u.id)}>
                      Διαγραφή
                    </button>
                  </div>
                ))
              )}
            </div>
            <button className="btn btn-secondary" onClick={() => setView('home')}>
              ← Πίσω
            </button>
          </div>
        )}

        {view === "live" && (
          <div className="content">
            <div className="card">
              <div className="section-title">🧭 Επιλογη Οδηγου</div>
              <select
                className="select-input"
                value={selectedDriverId}
                onChange={e => setSelectedDriverId(e.target.value)}
              >
                <option value="">— Επίλεξε οδηγό —</option>
                {driverAccounts.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.username}
                  </option>
                ))}
              </select>
              {selectedUser && (
                <div style={{ fontSize: 12, color: "#8899b0" }}>
                  Εμφάνιση δεδομένων για{' '}
                  <span style={{ color: "#e8edf5", fontWeight: 700 }}>{selectedUser.username}</span>
                </div>
              )}
            </div>

            {selectedDriverId && (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 16px',
                    borderRadius: 10,
                    marginBottom: 14,
                    background: driverActive
                      ? 'linear-gradient(135deg,#0d2545 0%,#0a1929 100%)'
                      : 'linear-gradient(135deg,#1a1200 0%,#0f0900 100%)',
                    border: `1px solid ${driverActive ? "#1d6ef5" : "#f59e0b"}`,
                  }}
                >
                  {driverActive ? (
                    <>
                      <span className="pulse-dot" />
                      <span
                        style={{
                          fontFamily: 'Syne,sans-serif',
                          fontWeight: 700,
                          fontSize: 13,
                          color: "#38bdf8",
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Διαδρομη σε εξελιξη
                      </span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 16 }}>⏳</span>
                      <span
                        style={{
                          fontFamily: 'Syne,sans-serif',
                          fontWeight: 700,
                          fontSize: 13,
                          color: "#f59e0b",
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Αναμονη επομενης διαδρομης
                      </span>
                    </>
                  )}
                </div>

                {lastLocation && <LiveView address={lastLocation} />}

                {driverActive && (
                  <div className="active-route-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span className="pulse-dot" />
                      <span
                        style={{
                          fontFamily: 'Syne,sans-serif',
                          fontWeight: 700,
                          fontSize: 15,
                          color: "#38bdf8",
                        }}
                      >
                        ΕΝΕΡΓΟ ΔΡΟΜΟΛΟΓΙΟ
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#8899b0" }}>Αφετηρία</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#e8edf5", marginTop: 4 }}>
                      {driverActive.start?.location}
                    </div>
                    <div style={{ fontSize: 11, color: "#8899b0", marginTop: 6 }}>
                      {driverActive.start?.time}
                    </div>
                  </div>
                )}

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 18px 8px' }} className="section-title">
                    📋 Ιστορικο Δρομολογιων
                  </div>
                  <div
                    style={{
                      padding: '0 12px 10px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: 6,
                    }}
                  >
                    <input
                      className="filter-input"
                      placeholder="Πελάτης"
                      value={routeFilters.client}
                      onChange={e => setRouteFilters({ ...routeFilters, client: e.target.value })}
                    />
                    <input
                      className="filter-input"
                      placeholder="Μήνας"
                      type="number"
                      min="1"
                      max="12"
                      value={routeFilters.month}
                      onChange={e => setRouteFilters({ ...routeFilters, month: e.target.value })}
                    />
                    <input
                      className="filter-input"
                      placeholder="Έτος"
                      type="number"
                      value={routeFilters.year}
                      onChange={e => setRouteFilters({ ...routeFilters, year: e.target.value })}
                    />
                  </div>
                  {driverRoutes.length === 0 ? (
                    <div className="empty">
                      <div className="empty-icon">📋</div>Δεν υπάρχουν δρομολόγια
                    </div>
                  ) : (
                    (() => {
                      const filtered = [...driverRoutes]
                        .reverse()
                        .filter(r => {
                          const cOk = routeFilters.client
                            ? (r.end?.label || "").toLowerCase().includes(routeFilters.client.toLowerCase())
                            : true;
                          const d = new Date(r.start?.timestamp || 0);
                          const mOk = routeFilters.month
                            ? d.getMonth() + 1 === Number(routeFilters.month)
                            : true;
                          const yOk = routeFilters.year
                            ? d.getFullYear() === Number(routeFilters.year)
                            : true;
                          return cOk && mOk && yOk;
                        })
                        .slice(0, 15);
                      return filtered.length === 0 ? (
                        <div className="empty" style={{ padding: '16px' }}>
                          Δεν βρέθηκαν αποτελέσματα
                        </div>
                      ) : (
                        <table className="route-table">
                          <thead>
                            <tr>
                              <th style={{ width: '9%' }}>#</th>
                              <th style={{ width: '33%' }}>ΠΕΛΑΤΗΣ</th>
                              <th style={{ width: '24%' }}>ΗΜ/ΝΙΑ</th>
                              <th style={{ width: '17%' }}>ΩΡΑ</th>
                              <th style={{ width: '17%' }}>ΛΗΞΗ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((r, i) => (
                              <tr key={r.id}>
                                <td style={{ color: "#8899b0" }}>{i + 1}</td>
                                <td style={{ textAlign: 'left' }}>
                                  <span className="client-badge">{r.end?.label || '—'}</span>
                                </td>
                                <td style={{ color: "#8899b0", fontSize: 11 }}>
                                  {r.start.time?.split(',')[0]}
                                </td>
                                <td style={{ color: "#8899b0", fontSize: 11 }}>
                                  {r.start.time?.split(',')[1]?.trim()}
                                </td>
                                <td style={{ color: "#8899b0", fontSize: 11 }}>
                                  {r.end?.time?.split(',')[1]?.trim() || '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      );
                    })()
                  )}
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 18px 8px' }} className="section-title">
                    ⛽ Ανεφοδιασμοι
                  </div>
                  {driverFuels.length === 0 ? (
                    <div className="empty" style={{ padding: '20px' }}>
                      Δεν υπάρχουν ανεφοδιασμοί
                    </div>
                  ) : (
                    <table className="route-table">
                      <thead>
                        <tr>
                          <th style={{ width: '26%' }}>ΗΜ/ΝΙΑ</th>
                          <th style={{ width: '17%' }}>L</th>
                          <th style={{ width: '17%' }}>€</th>
                          <th style={{ width: '18%' }}>ΧΛΜ</th>
                          <th style={{ width: '22%' }}>ΑΠΟΔ.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {driverFuels.map(f => (
                          <tr key={f.id}>
                            <td style={{ color: "#8899b0", fontSize: 11 }}>{f.date}</td>
                            <td>{f.liters}</td>
                            <td style={{ color: "#38bdf8" }}>{f.amount}</td>
                            <td style={{ color: "#8899b0" }}>{f.km}</td>
                            <td style={{ color: "#8899b0", fontSize: 11 }}>{f.receipt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 18px 8px' }} className="section-title">
                    🔧 Συντηρηση Οχηματος
                  </div>
                  {driverServices.length === 0 ? (
                    <div className="empty" style={{ padding: '20px' }}>
                      Δεν υπάρχουν service entries
                    </div>
                  ) : (
                    <div style={{ padding: '0 18px 10px' }}>
                      {driverServices.map(s => (
                        <div key={s.id} className="driver-row">
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#e8edf5" }}>
                              {s.description}
                            </div>
                            <div style={{ fontSize: 11, color: "#8899b0" }}>
                              {s.date}
                              {s.km ? ` • ${s.km} km` : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {driverProfile && (
                  <div className="card">
                    <div className="section-title">🚗 Στοιχεια Οχηματος</div>
                    <div style={{ fontSize: 13, lineHeight: 1.9 }}>
                      <div>
                        <span style={{ color: "#8899b0" }}>Οδηγός: </span>
                        {driverProfile.firstName} {driverProfile.lastName}
                      </div>
                      <div>
                        <span style={{ color: "#8899b0" }}>Πινακίδα: </span>
                        {driverProfile.plate}
                      </div>
                      <div>
                        <span style={{ color: "#8899b0" }}>Έδρα: </span>
                        {driverProfile.baseAddress}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <button className="btn btn-secondary" onClick={() => setView('home')}>
              ← Πίσω
            </button>
          </div>
        )}

        {view === "requests" && (
          <div className="content">
            <div className="card">
              <div className="section-title">📤 Νεο Αιτημα</div>
              <div className="input-group">
                <label className="input-label">Οδηγός</label>
                <select
                  className="select-input"
                  style={{ marginBottom: 0 }}
                  value={newReq.targetDriverId}
                  onChange={e => setNewReq({ ...newReq, targetDriverId: e.target.value })}
                >
                  <option value="">— Επίλεξε οδηγό —</option>
                  <option value="all">📢 Όλοι οι οδηγοί</option>
                  {driverAccounts.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Περιγραφή</label>
                <textarea
                  className="input"
                  rows={3}
                  style={{ resize: 'none', lineHeight: 1.5, width: '100%', boxSizing: 'border-box' }}
                  placeholder="π.χ. Παράδοση στον πελάτη Παπαδόπουλο, Λεωφ. Αθηνών 12..."
                  value={newReq.description}
                  onChange={e => setNewReq({ ...newReq, description: e.target.value })}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  if (!newReq.targetDriverId || !newReq.description.trim())
                    return alert("Συμπλήρωσε οδηγό και περιγραφή");
                  const id = Date.now();
                  try {
                    if (newReq.targetDriverId === 'all') {
                      for (const driver of driverAccounts) {
                        const rid = Date.now() + Math.random();
                        await saveRequestHelper({
                          id: rid,
                          salesUserId: user.id,
                          salesUsername: user.username,
                          targetDriverId: driver.id,
                          groupId: String(id),
                          description: newReq.description.trim(),
                          status: 'pending',
                          createdAt: id,
                        });
                      }
                    } else {
                      await saveRequestHelper({
                        id,
                        salesUserId: user.id,
                        salesUsername: user.username,
                        targetDriverId: newReq.targetDriverId,
                        description: newReq.description.trim(),
                        status: 'pending',
                        createdAt: id,
                      });
                    }
                    setNewReq({ targetDriverId: "", description: "" });
                    alert("✅ Το αίτημα στάλθηκε!");
                  } catch (e) {
                    console.error("saveRequest error:", e);
                    alert("❌ Σφάλμα αποστολής: " + e.message + "\n\nΈλεγξε τα Firestore Security Rules.");
                  }
                }}
              >
                📤 Αποστολή
              </button>
            </div>

            {salesRequests.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📋</div>Δεν υπάρχουν αιτήματα
              </div>
            ) : (
              salesRequests.map(r => {
                const driver = driverAccounts.find(u => u.id === r.assignedDriverId);
                return (
                  <div key={r.id} className={`req-card req-${r.status}`}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 6,
                      }}
                    >
                      <span className={`req-status req-status-${r.status}`}>
                        {r.status === "pending" && "⏳ Αναμονη"}
                        {r.status === "accepted" && (
                          <>
                            <span className="pulse-dot" style={{ width: 6, height: 6 }} />
                            Σε Εξελιξη
                          </>
                        )}
                        {r.status === "declined" && "✗ Απορριφθηκε"}
                        {r.status === "completed" && "✓ Ολοκληρωθηκε"}
                      </span>
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#8899b0",
                          fontSize: 16,
                          padding: 0,
                          lineHeight: 1,
                        }}
                        onClick={() => {
                          if (window.confirm("Διαγραφή αιτήματος;")) {
                            import('../utils/firebaseHelpers').then(m => m.deleteRequest(r.id));
                          }
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="req-desc">{r.description}</div>
                    <div className="req-meta" style={{ marginTop: 4 }}>
                      {r.targetDriverId === "all"
                        ? "📢 Όλοι οι οδηγοί"
                        : `→ ${driverAccounts.find(u => u.id === r.targetDriverId)?.username || r.targetDriverId}`}
                      {" · "}
                      {new Date(r.createdAt).toLocaleString("el-GR")}
                    </div>
                    {r.status === "accepted" || r.status === "completed" ? (
                      <div style={{ marginTop: 6 }}>
                        <div className="req-meta">
                          ✋ {r.assignedDriverUsername || driver?.username}
                        </div>
                        {r.driverComment && (
                          <div className="req-comment">💬 {r.driverComment}</div>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
            <button className="btn btn-secondary" onClick={() => setView('home')}>
              ← Πίσω
            </button>
          </div>
        )}

        {view === "changepass" && (
          <div className="content">
            <div className="card">
              <div className="section-title">🔑 Αλλαγη Κωδικου</div>
              <div style={{ fontSize: 13, color: "#8899b0", marginBottom: 16 }}>
                Λογαριασμός: <strong style={{ color: "#e8edf5" }}>{user.username}</strong>
              </div>
              <ChangePasswordForm userId={user.id} onBack={() => setView("home")} />
            </div>
            <button className="btn btn-secondary" onClick={() => setView('home')}>
              ← Πίσω
            </button>
          </div>
        )}

        {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      </div>
    </>
  );
}