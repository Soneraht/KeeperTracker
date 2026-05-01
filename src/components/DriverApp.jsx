import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from "xlsx";
import { db, collection, doc, deleteDoc, onSnapshot, getDocs } from '../firebase';
import {
  driverCol,
  saveRoute,
  saveLocation,
  saveFuelEntry,
  saveProfile,
  saveServiceEntry,
  delService,
  saveActiveRoute,
  clearActiveRoute,
  updateRequest,
  deleteRequest,
} from '../utils/firebaseHelpers';
import { playNotifSound } from '../utils/sound';
import LiveView from './LiveView';
import HelpModal from './HelpModal';
import EditRouteModal from './EditRouteModal';
import ArrivalModal from './ArrivalModal';
import FuelModal from './FuelModal';
import ServiceModal from './ServiceModal';

export default function DriverApp({ user, onLogout }) {
  const uid = user.id;
  const todayKey = new Date().toLocaleDateString("el-GR");

  const [tab, setTab] = useState("record");
  const [lastArrival, setLastArrival] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [profile, setProfile] = useState({ firstName: "", lastName: "", plate: "", startKm: "", baseAddress: "" });
  const [routes, setRoutes] = useState([]);
  const [allRoutes, setAllRoutes] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  const [routeReady, setRouteReady] = useState(false);
  const [locations, setLocations] = useState({});
  const [fuels, setFuels] = useState([]);
  const [showFuel, setShowFuel] = useState(false);
  const [filters, setFilters] = useState({ client: "", month: "", year: "" });
  const [arrivalData, setArrivalData] = useState(null);
  const [editingRoute, setEditingRoute] = useState(null);
  const [wakeLock, setWakeLock] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [services, setServices] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [archivedRequests, setArchivedRequests] = useState([]);
  const [reqComment, setReqComment] = useState({});
  const prevReqIds = useRef(new Set());

  const now = () => new Date().toLocaleString("el-GR");

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const requestWakeLock = async () => {
    try {
      if ("wakeLock" in navigator) {
        const lock = await navigator.wakeLock.request("screen");
        setWakeLock(lock);
      }
    } catch (e) {
      console.log("WakeLock:", e);
    }
  };
  const releaseWakeLock = async () => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
    }
  };
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && activeRoute) requestWakeLock();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [activeRoute]);

  useEffect(() => {
    const unsubActive = onSnapshot(collection(db, driverCol(uid, "activeRoute")), snap => {
      const cur = snap.docs.find(d => d.id === "current");
      setActiveRoute(cur ? cur.data() : null);
      setRouteReady(true);
    });
    const unsubRoutes = onSnapshot(collection(db, driverCol(uid, "routes")), snap => {
      const data = snap.docs.map(d => d.data()).sort((a, b) => a.start.timestamp - b.start.timestamp);
      setAllRoutes(data);
      setRoutes(data.filter(r => new Date(r.start.timestamp).toLocaleDateString("el-GR") === todayKey));
    });
    const unsubLocations = onSnapshot(collection(db, driverCol(uid, "locations")), snap => {
      const data = {};
      snap.docs.forEach(d => {
        data[d.id] = d.data();
      });
      setLocations(data);
    });
    const unsubFuels = onSnapshot(collection(db, driverCol(uid, "fuels")), snap => {
      setFuels(snap.docs.map(d => d.data()).sort((a, b) => b.id - a.id));
    });
    const unsubProfile = onSnapshot(collection(db, driverCol(uid, "profile")), snap => {
      const driver = snap.docs.find(d => d.id === "driver");
      if (driver) setProfile(driver.data());
    });
    const unsubServices = onSnapshot(collection(db, driverCol(uid, "services")), snap => {
      setServices(snap.docs.map(d => d.data()).sort((a, b) => b.id - a.id));
    });
    return () => {
      unsubRoutes();
      unsubLocations();
      unsubFuels();
      unsubProfile();
      unsubServices();
      unsubActive();
    };
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "requests"), snap => {
      const all = snap.docs.map(d => d.data());
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

      all.forEach(r => {
        if (r.status === "declined" && r.respondedAt && r.respondedAt < oneDayAgo) {
          deleteRequest(r.id).catch(() => {});
        }
      });

      const mine = all
        .filter(
          r =>
            (r.targetDriverId === uid || r.targetDriverId === 'all') &&
            r.status !== 'declined' &&
            !r.archived &&
            !(r.targetDriverId === 'all' && (r.declinedBy || []).includes(uid))
        )
        .sort((a, b) => b.createdAt - a.createdAt);

      const archived = all
        .filter(
          r =>
            (r.targetDriverId === uid || r.assignedDriverId === uid) && r.archived === true
        )
        .sort((a, b) => b.completedAt - a.completedAt);

      mine.forEach(r => {
        if (r.status === "pending" && !prevReqIds.current.has(String(r.id))) {
          playNotifSound();
        }
        prevReqIds.current.add(String(r.id));
      });

      setMyRequests(mine);
      setArchivedRequests(archived);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const hasData = profile.firstName || profile.lastName || profile.plate || profile.startKm || profile.baseAddress;
    if (!hasData) return;
    const t = setTimeout(() => {
      saveProfile(uid, profile);
    }, 800);
    return () => clearTimeout(t);
  }, [profile]);

  const getCoords = () =>
    new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => resolve(null)
      );
    });

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { "Accept-Language": "el" } }
      );
      const data = await res.json();
      const a = data.address || {};
      const road = a.road || a.pedestrian || a.footway || a.street || "";
      const house = a.house_number || "";
      const city = a.city || a.town || a.village || a.municipality || "";
      return (
        [road, house].filter(Boolean).join(" ") +
        (city ? `, ${city}` : "") ||
        data.display_name ||
        `${lat.toFixed(5)}, ${lon.toFixed(5)}`
      );
    } catch {
      return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    }
  };

  const gpsKey = (lat, lon) => `${parseFloat(lat).toFixed(3)}_${parseFloat(lon).toFixed(3)}`;

  const startFromBase = async () => {
    await requestWakeLock();
    const nr = {
      id: Date.now(),
      fromBase: true,
      start: {
        location: profile.baseAddress || "Έδρα",
        time: now(),
        timestamp: Date.now(),
      },
    };
    setActiveRoute(nr);
    await saveActiveRoute(uid, nr);
  };

  const continueFromLast = async () => {
    const lastRoute = [...routes].reverse().find(r => r.end?.location);
    if (!lastRoute) return;
    await requestWakeLock();
    const newRoute = {
      id: Date.now(),
      fromBase: false,
      fromLastClient: lastRoute.end.label || null,
      start: { location: lastRoute.end.location, time: now(), timestamp: Date.now() },
    };
    setLastArrival(null);
    setActiveRoute(newRoute);
    await saveRoute(uid, newRoute);
    await saveActiveRoute(uid, newRoute);
  };

  const findNearbyLocation = (lat, lon) => {
    const toRad = d => (d * Math.PI) / 180;
    const R = 6371000;
    let best = null,
      bestDist = 150;
    Object.entries(locations).forEach(([k, v]) => {
      const parts = k.split("_");
      if (parts.length < 2) return;
      const [klat, klon] = parts.map(Number);
      const dLat = toRad(klat - lat);
      const dLon = toRad(klon - lon);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat)) * Math.cos(toRad(klat)) * Math.sin(dLon / 2) ** 2;
      const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (d < bestDist) {
        bestDist = d;
        best = k;
      }
    });
    return best;
  };

  const endRoute = async () => {
    if (!activeRoute) return;
    const coords = await getCoords();
    let rawAddress = "Άγνωστη τοποθεσία",
      key = null;
    if (coords) {
      rawAddress = await reverseGeocode(coords.lat, coords.lon);
      const nearbyKey = findNearbyLocation(coords.lat, coords.lon);
      key = nearbyKey || gpsKey(coords.lat, coords.lon);
    }
    setArrivalData({ rawAddress, key, knownEntry: key && locations[key] ? locations[key] : null });
  };

  const handleArrivalDone = async (finalAddress, clientName, skipLocationSave = false) => {
    if (!activeRoute) return;
    setSyncing(true);
    if (!skipLocationSave && arrivalData.key) await saveLocation(uid, arrivalData.key, { address: finalAddress, name: clientName });
    const completed = {
      ...activeRoute,
      gpsKey: arrivalData.key,
      end: { location: finalAddress, time: now(), label: clientName, timestamp: Date.now() },
    };
    await saveRoute(uid, completed);
    await clearActiveRoute(uid);
    setSyncing(false);
    setLastArrival({ location: finalAddress, clientName, time: now() });
    setActiveRoute(null);
    setArrivalData(null);
    releaseWakeLock();
  };

  const arriveAtBase = async () => {
    if (!activeRoute) return;
    setSyncing(true);
    const baseAddr = profile.baseAddress || "Έδρα";
    const completed = {
      ...activeRoute,
      gpsKey: null,
      end: { location: baseAddr, time: now(), label: "Έδρα", timestamp: Date.now(), isBase: true },
    };
    await saveRoute(uid, completed);
    await clearActiveRoute(uid);
    setSyncing(false);
    setLastArrival(null);
    setActiveRoute(null);
    releaseWakeLock();
  };

  const handleEditSave = async updatedRoute => {
    setSyncing(true);
    try {
      await saveRoute(uid, updatedRoute);
      if (updatedRoute.gpsKey)
        await saveLocation(uid, updatedRoute.gpsKey, { address: updatedRoute.end.location, name: updatedRoute.end.label });
    } catch (e) {
      console.error("Edit save error:", e);
    }
    setSyncing(false);
    setEditingRoute(null);
  };

  const handleDelete = async id => {
    setSyncing(true);
    try {
      await deleteDoc(doc(db, driverCol(uid, "routes"), String(id)));
    } catch (e) {
      console.error("Delete error:", e);
    }
    setSyncing(false);
  };

  const saveFuel = async form => {
    const entry = { id: Date.now(), ...form };
    setSyncing(true);
    try {
      await saveFuelEntry(uid, entry);
    } catch (e) {
      console.error(e);
    }
    setSyncing(false);
    setShowFuel(false);
  };

  const [editingFuel, setEditingFuel] = useState(null);
  const [fuelFilters, setFuelFilters] = useState({ month: "", year: "" });

  const updateFuel = async form => {
    setSyncing(true);
    try {
      await saveFuelEntry(uid, { ...editingFuel, ...form });
    } catch (e) {
      console.error(e);
    }
    setSyncing(false);
    setEditingFuel(null);
  };

  const deleteFuel = async id => {
    setSyncing(true);
    await deleteDoc(doc(db, driverCol(uid, "fuels"), String(id)));
    setSyncing(false);
  };

  const deleteLocation = async key => {
    setSyncing(true);
    await deleteDoc(doc(db, driverCol(uid, "locations"), key));
    setSyncing(false);
  };

  const exportExcel = () => {
    let totalTime = 0;
    const data = routes.map((r, i) => {
      if (r.end) totalTime += r.end.timestamp - r.start.timestamp;
      return {
        "#": i + 1,
        Εναρξη: r.start.location,
        "Ωρα Εναρξης": r.start.time,
        Αφιξη: r.end?.location || "",
        "Ωρα Αφιξης": r.end?.time || "",
        Πελατης: r.end?.label || "",
      };
    });
    const finalKm = Number(prompt("Τελικά χιλιόμετρα:"));
    data.push(
      {},
      { Εναρξη: "Συνολικος χρονος (λεπτα)", "Ωρα Εναρξης": Math.round(totalTime / 60000) },
      {
        Εναρξη: "Συνολικα χιλιομετρα",
        "Ωρα Εναρξης": finalKm - Number(profile.startKm || 0),
      }
    );
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ιστορικο");
    XLSX.writeFile(wb, `routes_${todayKey.replace(/\//g, "-")}.xlsx`);
  };

  const applyFilters = list =>
    list.filter(r => {
      const date = new Date(r.start?.timestamp || 0);
      const matchClient = filters.client
        ? (r.end?.label || "").toLowerCase().includes(filters.client.toLowerCase())
        : true;
      const matchMonth = filters.month
        ? date.getMonth() + 1 === Number(filters.month)
        : true;
      const matchYear = filters.year
        ? date.getFullYear() === Number(filters.year)
        : true;
      return matchClient && matchMonth && matchYear;
    });

  const lastCompletedRoute = [...routes].reverse().find(r => r.end?.location);
  const totalFuelCost = fuels.reduce((s, f) => s + Number(f.amount || 0), 0);
  const totalFuelLiters = fuels.reduce((s, f) => s + Number(f.liters || 0), 0);

  const navItems = [
    {
      key: "record",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        </svg>
      ),
      label: "ΚΑΤΑΓΡΑΦΗ",
    },
    { key: "history", icon: "📋", label: "ΙΣΤΟΡΙΚΟ" },
    { key: "stats", icon: "📊", label: "ΣΤΑΤΙΣΤΙΚΑ" },
    { key: "fuel", icon: "⛽", label: "ΚΑΥΣΙΜΑ" },
    { key: "profile", icon: "👤", label: "ΠΡΟΦΙΛ" },
  ];

  const ActionBtns = ({ r }) => (
    <div className="action-btns">
      <button className="icon-btn icon-btn-edit" onClick={() => setEditingRoute(r)}>
        ✏️
      </button>
      <button
        className="icon-btn icon-btn-del"
        onClick={() => {
          if (window.confirm("Διαγραφή διαδρομής;")) handleDelete(r.id);
        }}
      >
        🗑️
      </button>
    </div>
  );

  return (
    <div className="app-shell">
      <div className="header">
        <div className="header-inner">
          <span className="logo">Keeper Tracker</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              title={!isOnline ? "Offline" : syncing ? "Syncing..." : "Cloud ✓"}
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <div
                className={`sync-dot ${!isOnline ? "offline" : syncing ? "syncing" : ""}`}
              />
              <span
                style={{
                  fontSize: 11,
                  color: !isOnline ? "#ef4444" : syncing ? "#f59e0b" : "#22c55e",
                }}
              >
                {!isOnline ? "Offline" : "Cloud"}
              </span>
            </div>
            <button className="help-btn" onClick={() => setShowHelp(true)}>
              ?
            </button>
            <button
              onClick={onLogout}
              title="Αποσύνδεση"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.8)",
                padding: "4px 2px",
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
      </div>

      <div className="tab-bar">
        <div>
          <div className="tab-bar-title">
            {tab === "record" && "Καταγραφή Διαδρομής"}
            {tab === "history" && "Ιστορικό"}
            {tab === "stats" && "Στατιστικά"}
            {tab === "fuel" && "Ανεφοδιασμοί"}
            {tab === "profile" && "Στοιχεία Οδηγού"}
          </div>
          <div className="tab-bar-sub">
            {tab === "record" && `${routes.length} διαδρομές σήμερα`}
            {tab === "history" && `${routes.length} καταχωρήσεις`}
            {tab === "stats" && `${allRoutes.length} συνολικά`}
            {tab === "fuel" && `${fuels.length} ανεφοδιασμοί`}
          </div>
        </div>
        {tab === "history" && (
          <button className="btn btn-primary btn-sm" onClick={exportExcel}>
            📥 EXPORT
          </button>
        )}
        {tab === "fuel" && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowFuel(true)}>
            + ΝΕΟΣ
          </button>
        )}
      </div>

      <div className="content">
        {/* RECORD TAB */}
        {tab === "record" && (
          <>
            {myRequests.length > 0 && (
              <div style={{ marginBottom: 4 }}>
                {myRequests.map(r => (
                  <div
                    key={r.id}
                    className={`req-card ${
                      r.status === "pending"
                        ? "req-pending"
                        : r.status === "accepted"
                        ? "req-accepted"
                        : "req-completed"
                    }`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 4,
                      }}
                    >
                      <span className={`req-status req-status-${r.status}`}>
                        {r.status === "pending" && <>⏳ Νεο Αιτημα</>}
                        {r.status === "accepted" && (
                          <>
                            <span className="pulse-dot" style={{ width: 6, height: 6 }} />
                            Σε Εξελιξη
                          </>
                        )}
                        {r.status === "completed" && <>✓ Ολοκληρωθηκε</>}
                      </span>
                      <span className="req-meta">{r.salesUsername}</span>
                    </div>
                    <div className="req-desc">{r.description}</div>
                    <div className="req-meta">{new Date(r.createdAt).toLocaleString("el-GR")}</div>

                    {r.status === "pending" && (
                      <div style={{ marginTop: 10 }}>
                        <div className="input-group" style={{ marginBottom: 8 }}>
                          <input
                            className="input"
                            style={{ fontSize: 13, padding: "9px 12px" }}
                            placeholder="Σχόλιο (προαιρετικό)..."
                            value={reqComment[r.id] || ""}
                            onChange={e =>
                              setReqComment({ ...reqComment, [r.id]: e.target.value })
                            }
                          />
                        </div>
                        <div className="btn-row">
                          <button
                            className="btn btn-success btn-sm"
                            style={{ flex: 1 }}
                            onClick={async () => {
                              await updateRequest(r.id, {
                                status: "accepted",
                                driverComment: reqComment[r.id] || "",
                                assignedDriverId: uid,
                                assignedDriverUsername: user.username,
                                respondedAt: Date.now(),
                              });
                              setReqComment({ ...reqComment, [r.id]: "" });
                            }}
                          >
                            ✓ Αποδοχή
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ flex: 1 }}
                            onClick={async () => {
                              if (r.targetDriverId === 'all') {
                                const updatedDeclinedBy = [...(r.declinedBy || []), uid];
                                const usersSnap = await getDocs(collection(db, 'users'));
                                const totalDrivers = usersSnap.docs.filter(d => d.data().role === 'driver').length;
                                const allDeclined = updatedDeclinedBy.length >= totalDrivers;
                                await updateRequest(r.id, {
                                  declinedBy: updatedDeclinedBy,
                                  ...(allDeclined ? { status: 'declined', respondedAt: Date.now() } : {}),
                                });
                              } else {
                                await updateRequest(r.id, {
                                  status: 'declined',
                                  assignedDriverId: uid,
                                  respondedAt: Date.now(),
                                });
                              }
                            }}
                          >
                            ✗ Άρνηση
                          </button>
                        </div>
                      </div>
                    )}

                    {r.status === "accepted" && (
                      <div style={{ marginTop: 8 }}>
                        {r.driverComment && <div className="req-comment">💬 {r.driverComment}</div>}
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ marginTop: 10, width: "100%" }}
                          onClick={async () => {
                            await updateRequest(r.id, {
                              status: "completed",
                              completedAt: Date.now(),
                            });
                          }}
                        >
                          🏁 Ολοκλήρωση
                        </button>
                      </div>
                    )}

                    {r.status === "completed" && (
                      <div style={{ marginTop: 8 }}>
                        {r.driverComment && <div className="req-comment">💬 {r.driverComment}</div>}
                        <button
                          className="btn btn-sm"
                          style={{
                            marginTop: 10,
                            width: "100%",
                            background: "#374151",
                            color: "#e8edf5",
                            border: "1px solid #4b5563",
                          }}
                          onClick={async () => {
                            await updateRequest(r.id, { archived: true });
                          }}
                        >
                          📁 Αρχειοθέτηση
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {lastArrival && !activeRoute && (
              <div
                className="active-route-card"
                style={{
                  borderColor: "#f59e0b",
                  background: "linear-gradient(135deg,#1a1200 0%,#0f0900 100%)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 18 }}>⏳</span>
                  <span
                    style={{
                      fontFamily: "'Syne',sans-serif",
                      fontWeight: 700,
                      fontSize: 12,
                      color: "#f59e0b",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    Αναμονη επομενης διαδρομης
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <div className="route-info-label">Πελάτης</div>
                    <div className="route-info-value" style={{ color: "#38bdf8" }}>
                      {lastArrival.clientName || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="route-info-label">Ώρα άφιξης</div>
                    <div className="route-info-value">{lastArrival.time}</div>
                  </div>
                </div>
                <div>
                  <div className="route-info-label">Τελευταία τοποθεσία</div>
                  <div className="route-info-value" style={{ fontSize: 12, whiteSpace: "normal" }}>
                    {lastArrival.location}
                  </div>
                </div>
              </div>
            )}

            {!routeReady ? (
              <div className="card" style={{ textAlign: "center", padding: "28px 18px" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>🔄</div>
                <div
                  style={{
                    fontFamily: "Syne,sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#38bdf8",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: 6,
                  }}
                >
                  Επαναφορά κατάστασης
                </div>
                <div style={{ fontSize: 12, color: "#8899b0" }}>Παρακαλώ περιμένετε...</div>
              </div>
            ) : activeRoute ? (
              <div className="active-route-card">
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 6,
                      justifyContent: "center",
                    }}
                  >
                    <span className="pulse-dot" />
                    <span
                      style={{
                        fontFamily: "Syne,sans-serif",
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#38bdf8",
                      }}
                    >
                      ΔΙΑΔΡΟΜΗ ΣΕ ΕΞΕΛΙΞΗ
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#8899b0", marginBottom: 10, textAlign: "center" }}>
                    {"από: "}
                    <span style={{ color: "#e8edf5", fontWeight: 600 }}>
                      {activeRoute.fromBase && !activeRoute.fromLastClient
                        ? "Έδρα"
                        : activeRoute.fromLastClient
                        ? activeRoute.fromLastClient
                        : activeRoute.start.location}
                    </span>
                  </div>
                  <div className="route-info-label" style={{ textAlign: "center" }}>
                    ΩΡΑ ΕΝΑΡΞΗΣ
                  </div>
                  <div className="route-info-value" style={{ textAlign: "center" }}>
                    {activeRoute.start.time}
                  </div>
                </div>
                <div className="btn-row" style={{ marginBottom: 10 }}>
                  <button className="btn btn-success" style={{ marginBottom: 0 }} onClick={endRoute}>
                    ✓ ΑΦΙΞΗ
                  </button>
                  <button
                    className="btn"
                    style={{
                      marginBottom: 0,
                      background: "#7f1d1d",
                      color: "white",
                      border: "1px solid #ef4444",
                    }}
                    onClick={arriveAtBase}
                  >
                    🏠 ΑΦΙΞΗ ΣΕ ΕΔΡΑ
                  </button>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-title">ΝΕΑ ΔΙΑΔΡΟΜΗ</div>
                {![...routes].reverse().find(r => r.end?.location) ||
                [...routes].reverse().find(r => r.end?.location)?.end?.isBase ? (
                  <button className="btn btn-primary" onClick={startFromBase}>
                    🏠 &nbsp;ΕΝΑΡΞΗ ΑΠΟ ΕΔΡΑ
                  </button>
                ) : (
                  <button className="btn btn-secondary" onClick={continueFromLast}>
                    🔁 &nbsp;ΕΠΟΜΕΝΗ ΣΤΑΣΗ
                  </button>
                )}
              </div>
            )}

            <div className="card">
              <div className="card-title">ΣΗΜΕΡΑ · {routes.length} ΔΙΑΔΡΟΜΕΣ</div>
              {routes.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">🗺️</div>Καμία διαδρομή ακόμα σήμερα
                </div>
              ) : (
                <table className="route-table">
                  <thead>
                    <tr>
                      <th style={{ width: "8%" }}>#</th>
                      <th style={{ width: "42%" }}>ΠΕΛΑΤΗΣ</th>
                      <th style={{ width: "32%" }}>ΑΦΙΞΗ</th>
                      <th style={{ width: "18%" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map((r, i) => (
                      <tr key={r.id}>
                        <td style={{ color: "#8899b0" }}>{i === 0 && r.fromBase ? "🏠" : i + 1}</td>
                        <td style={{ textAlign: "left" }}>
                          <span className="client-badge">{r.end?.label || "—"}</span>
                        </td>
                        <td style={{ color: "#8899b0", fontSize: 11 }}>
                          {r.end?.time?.split(",")[1]?.trim() || "—"}
                        </td>
                        <td>
                          <ActionBtns r={r} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <button className="btn btn-secondary" onClick={() => setShowFuel(true)}>
              ⛽ &nbsp;ΚΑΤΑΓΡΑΦΗ ΑΝΕΦΟΔΙΑΣΜΟΥ
            </button>
          </>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <div>
            {lastCompletedRoute && <LiveView address={lastCompletedRoute.end.location} />}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              {routes.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📋</div>Κανένα αρχείο ακόμα
                </div>
              ) : (
                <table className="route-table">
                  <thead>
                    <tr>
                      <th style={{ width: "7%" }}>#</th>
                      <th style={{ width: "30%" }}>ΠΕΛΑΤΗΣ</th>
                      <th style={{ width: "23%" }}>ΕΝΑΡΞΗ</th>
                      <th style={{ width: "23%" }}>ΑΦΙΞΗ</th>
                      <th style={{ width: "17%" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map((r, i) => (
                      <tr key={r.id}>
                        <td style={{ color: "#8899b0" }}>{i === 0 && r.fromBase ? "🏠" : i + 1}</td>
                        <td style={{ textAlign: "left" }}>
                          <span className="client-badge">{r.end?.label || "—"}</span>
                        </td>
                        <td style={{ color: "#8899b0", fontSize: 11 }}>
                          {r.start.time?.split(",")[1]?.trim()}
                        </td>
                        <td style={{ color: "#8899b0", fontSize: 11 }}>
                          {r.end?.time?.split(",")[1]?.trim() || "—"}
                        </td>
                        <td>
                          <ActionBtns r={r} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* STATS TAB */}
        {tab === "stats" && (
          <div>
            <div className="stat-grid">
              <div className="stat-box">
                <div className="stat-label">ΣΥΝΟΛΟ</div>
                <div className="stat-value">
                  {applyFilters(allRoutes).length}
                  <span className="stat-unit">δρομ.</span>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">ΣΗΜΕΡΑ</div>
                <div className="stat-value">
                  {routes.length}
                  <span className="stat-unit">δρομ.</span>
                </div>
              </div>
            </div>
            <div className="filter-row">
              <input
                className="filter-input"
                placeholder="Πελάτης"
                onChange={e => setFilters({ ...filters, client: e.target.value })}
              />
              <input
                className="filter-input"
                placeholder="Μήνας"
                type="number"
                min="1"
                max="12"
                onChange={e => setFilters({ ...filters, month: e.target.value })}
              />
              <input
                className="filter-input"
                placeholder="Έτος"
                type="number"
                onChange={e => setFilters({ ...filters, year: e.target.value })}
              />
            </div>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              {applyFilters(allRoutes).length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📊</div>Δεν βρέθηκαν αποτελέσματα
                </div>
              ) : (
                <table className="route-table">
                  <thead>
                    <tr>
                      <th style={{ width: "7%" }}>#</th>
                      <th style={{ width: "32%" }}>ΠΕΛΑΤΗΣ</th>
                      <th style={{ width: "25%" }}>ΗΜ/ΝΙΑ</th>
                      <th style={{ width: "20%" }}>ΩΡΑ</th>
                      <th style={{ width: "16%" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {applyFilters(allRoutes).map((r, i) => (
                      <tr key={r.id}>
                        <td style={{ color: "#8899b0" }}>{i === 0 && r.fromBase ? "🏠" : i + 1}</td>
                        <td style={{ textAlign: "left" }}>
                          <span className="client-badge">{r.end?.label || "—"}</span>
                        </td>
                        <td style={{ color: "#8899b0", fontSize: 11 }}>
                          {r.start.time?.split(",")[0]}
                        </td>
                        <td style={{ color: "#8899b0", fontSize: 11 }}>
                          {r.start.time?.split(",")[1]?.trim()}
                        </td>
                        <td>
                          <ActionBtns r={r} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* FUEL TAB */}
        {tab === "fuel" && (
          <div>
            <div className="stat-grid">
              <div className="stat-box">
                <div className="stat-label">ΣΥΝΟΛΙΚΟ ΚΟΣΤΟΣ</div>
                <div className="stat-value">
                  {totalFuelCost.toFixed(1)}
                  <span className="stat-unit">€</span>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">ΣΥΝΟΛΙΚΑ ΛΙΤΡΑ</div>
                <div className="stat-value">
                  {totalFuelLiters.toFixed(1)}
                  <span className="stat-unit">L</span>
                </div>
              </div>
            </div>
            <div className="filter-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <input
                className="filter-input"
                placeholder="Μήνας (1-12)"
                type="number"
                min="1"
                max="12"
                value={fuelFilters.month}
                onChange={e => setFuelFilters({ ...fuelFilters, month: e.target.value })}
              />
              <input
                className="filter-input"
                placeholder="Έτος"
                type="number"
                value={fuelFilters.year}
                onChange={e => setFuelFilters({ ...fuelFilters, year: e.target.value })}
              />
            </div>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              {(() => {
                const filtered = fuels.filter(f => {
                  const d = new Date(f.date);
                  const mOk = fuelFilters.month
                    ? d.getMonth() + 1 === Number(fuelFilters.month)
                    : true;
                  const yOk = fuelFilters.year
                    ? d.getFullYear() === Number(fuelFilters.year)
                    : true;
                  return mOk && yOk;
                });
                return filtered.length === 0 ? (
                  <div className="empty">
                    <div className="empty-icon">⛽</div>Κανένας ανεφοδιασμός
                  </div>
                ) : (
                  <table className="route-table">
                    <thead>
                      <tr>
                        <th style={{ width: "20%" }}>ΗΜ/ΝΙΑ</th>
                        <th style={{ width: "13%" }}>ΛΙΤΡΑ</th>
                        <th style={{ width: "13%" }}>ΠΟΣΟ</th>
                        <th style={{ width: "13%" }}>ΧΛΜ</th>
                        <th style={{ width: "21%" }}>ΑΡ.ΤΙΜ</th>
                        <th style={{ width: "20%" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(f => (
                        <tr key={f.id}>
                          <td style={{ color: "#8899b0", fontSize: 11 }}>{f.date}</td>
                          <td>{f.liters}L</td>
                          <td style={{ color: "#38bdf8" }}>{f.amount}€</td>
                          <td style={{ color: "#8899b0" }}>{f.km || "—"}</td>
                          <td style={{ color: "#8899b0", fontSize: 11 }}>{f.receipt || "—"}</td>
                          <td style={{ display: "flex", gap: 2, justifyContent: "center" }}>
                            <button
                              className="icon-btn"
                              style={{ fontSize: 12, padding: "2px 4px" }}
                              onClick={() => setEditingFuel(f)}
                            >
                              ✏️
                            </button>
                            <button
                              className="icon-btn icon-btn-del"
                              style={{ fontSize: 12, padding: "2px 4px" }}
                              onClick={() => {
                                if (window.confirm("Διαγραφή;")) deleteFuel(f.id);
                              }}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {tab === "profile" && (
          <div>
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div className="card-title" style={{ margin: 0 }}>
                  ΠΡΟΦΙΛ ΟΔΗΓΟΥ
                </div>
                {editingProfile ? (
                  <button className="btn btn-primary btn-sm" onClick={() => setEditingProfile(false)}>
                    💾 Αποθήκευση
                  </button>
                ) : (
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditingProfile(true)}>
                    ✏️ Επεξεργασία
                  </button>
                )}
              </div>
              {!editingProfile ? (
                <details>
                  <summary
                    style={{
                      cursor: "pointer",
                      fontFamily: "Syne,sans-serif",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "1px",
                      color: "#8899b0",
                      listStyle: "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "4px 0",
                    }}
                  >
                    <span>
                      👤{" "}
                      <span
                        style={{
                          textTransform: "none",
                          letterSpacing: "normal",
                          fontSize: 13,
                          color: "#e8edf5",
                        }}
                      >
                        {profile.firstName} {profile.lastName}
                      </span>
                    </span>
                    <span style={{ fontSize: 11 }}>▼</span>
                  </summary>
                  <div style={{ marginTop: 12, fontSize: 14, lineHeight: 2, color: "#e8edf5" }}>
                    <div>
                      <span style={{ color: "#8899b0", fontSize: 12 }}>Πινακίδα: </span>
                      {profile.plate}
                    </div>
                    <div>
                      <span style={{ color: "#8899b0", fontSize: 12 }}>Χλμ έναρξης: </span>
                      {profile.startKm}
                    </div>
                    <div>
                      <span style={{ color: "#8899b0", fontSize: 12 }}>Έδρα: </span>
                      {profile.baseAddress}
                    </div>
                  </div>
                </details>
              ) : (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="input-group">
                      <label className="input-label">Όνομα</label>
                      <input
                        className="input"
                        placeholder="Ονομα"
                        value={profile.firstName || ""}
                        onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Επίθετο</label>
                      <input
                        className="input"
                        placeholder="Επίθετο"
                        value={profile.lastName || ""}
                        onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Πινακίδα</label>
                    <input
                      className="input"
                      placeholder="ΑΒΓ-1234"
                      value={profile.plate || ""}
                      onChange={e => setProfile({ ...profile, plate: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Χιλιόμετρα έναρξης</label>
                    <input
                      className="input"
                      type="number"
                      placeholder="125000"
                      value={profile.startKm || ""}
                      onChange={e => setProfile({ ...profile, startKm: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Διεύθυνση Έδρας</label>
                    <input
                      className="input"
                      placeholder="Αθήνα, Ελλάδα"
                      value={profile.baseAddress || ""}
                      onChange={e => setProfile({ ...profile, baseAddress: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <details>
                <summary
                  style={{
                    cursor: "pointer",
                    fontFamily: "Syne,sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "#8899b0",
                    padding: "14px 18px",
                    listStyle: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom:
                      Object.keys(locations).length > 0 ? "1px solid #1e3a5f" : "none",
                  }}
                >
                  <span>📍 ΑΠΟΘΗΚΕΥΜΕΝΟΙ ΠΡΟΟΡΙΣΜΟΙ</span>
                  <span style={{ fontWeight: 400, fontSize: 11 }}>
                    ({Object.keys(locations).length})
                  </span>
                </summary>
                <div style={{ padding: "0 18px" }}>
                  <input
                    className="input"
                    placeholder="🔍 Αναζήτηση προορισμού..."
                    style={{ margin: "10px 0 12px 0" }}
                    onChange={e => {
                      const v = e.target.value.toLowerCase();
                      document.querySelectorAll('.loc-row').forEach(el => {
                        el.style.display = el.textContent.toLowerCase().includes(v) ? '' : 'none';
                      });
                    }}
                  />
                  {Object.keys(locations).length === 0 ? (
                    <div className="empty" style={{ padding: "20px 0" }}>
                      Κανένας αποθηκευμένος προορισμός
                    </div>
                  ) : (
                    Object.entries(locations)
                      .sort((a, b) => (a[1].name || "").localeCompare(b[1].name || "", "el"))
                      .map(([key, val]) => (
                        <div key={key} className="loc-row">
                          <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#e8edf5",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {val.name}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#8899b0",
                                marginTop: 2,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {val.address}
                            </div>
                          </div>
                          <div className="action-btns">
                            <button
                              className="icon-btn icon-btn-edit"
                              onClick={() => {
                                const newName = prompt("Νέο όνομα:", val.name);
                                const newAddr = prompt("Νέα διεύθυνση:", val.address);
                                if (newName !== null || newAddr !== null)
                                  saveLocation(uid, key, {
                                    name: newName ?? val.name,
                                    address: newAddr ?? val.address,
                                  });
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              className="icon-btn icon-btn-del"
                              onClick={() => {
                                if (window.confirm("Διαγραφή προορισμού;")) deleteLocation(key);
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </details>
            </div>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <details>
                <summary
                  style={{
                    cursor: "pointer",
                    fontFamily: "Syne,sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "#8899b0",
                    padding: "14px 18px",
                    listStyle: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: services.length > 0 ? "1px solid #1e3a5f" : "none",
                  }}
                >
                  <span>🔧 ΣΥΝΤΗΡΗΣΗ ΟΧΗΜΑΤΟΣ</span>
                  <span style={{ fontWeight: 400, fontSize: 11 }}>({services.length})</span>
                </summary>
                <div style={{ padding: "10px 18px 14px" }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginBottom: 12, width: "100%" }}
                    onClick={() => {
                      setEditingService(null);
                      setShowServiceModal(true);
                    }}
                  >
                    + Προσθήκη Service
                  </button>
                  {services.length === 0 ? (
                    <div className="empty" style={{ padding: "10px 0" }}>
                      Καμία καταχώρηση συντήρησης
                    </div>
                  ) : (
                    services.map(s => (
                      <div
                        key={s.id}
                        style={{
                          padding: "10px 0",
                          borderBottom: "1px solid #1e3a5f22",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#e8edf5" }}>
                            {s.description}
                          </div>
                          <div style={{ fontSize: 11, color: "#8899b0", marginTop: 3 }}>
                            {s.date}
                            {s.km ? ` · ${s.km} χλμ` : ""}
                          </div>
                        </div>
                        <div className="action-btns">
                          <button
                            className="icon-btn icon-btn-edit"
                            onClick={() => {
                              setEditingService(s);
                              setShowServiceModal(true);
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            className="icon-btn icon-btn-del"
                            onClick={() => {
                              if (window.confirm("Διαγραφή;")) delService(uid, s.id);
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </details>
            </div>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <details>
                <summary
                  style={{
                    cursor: "pointer",
                    fontFamily: "Syne,sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "#8899b0",
                    padding: "14px 18px",
                    listStyle: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: archivedRequests.length > 0 ? "1px solid #1e3a5f" : "none",
                  }}
                >
                  <span>📁 ΑΡΧΕΙΟ ΑΙΤΗΜΑΤΩΝ</span>
                  <span style={{ fontWeight: 400, fontSize: 11 }}>({archivedRequests.length})</span>
                </summary>
                {archivedRequests.length === 0 ? (
                  <div className="empty" style={{ padding: "16px 0" }}>
                    Κανένα αρχειοθετημένο αίτημα
                  </div>
                ) : (
                  <div style={{ padding: "0 18px 10px" }}>
                    {archivedRequests.map(r => (
                      <div key={r.id} style={{ padding: "10px 0", borderBottom: "1px solid #1e3a5f22" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.8px",
                              color: "#22c55e",
                              background: "rgba(34,197,94,0.15)",
                              padding: "2px 8px",
                              borderRadius: 20,
                            }}
                          >
                            ✓ Ολοκληρωθηκε
                          </span>
                          <span style={{ fontSize: 10, color: "#8899b0" }}>{r.salesUsername}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#e8edf5", margin: "4px 0 2px" }}>
                          {r.description}
                        </div>
                        <div style={{ fontSize: 11, color: "#8899b0" }}>
                          {r.completedAt ? new Date(r.completedAt).toLocaleString("el-GR") : "—"}
                        </div>
                        {r.driverComment && (
                          <div style={{ fontSize: 12, color: "#38bdf8", fontStyle: "italic", marginTop: 4 }}>
                            💬 {r.driverComment}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </details>
            </div>
          </div>
        )}
      </div>

      <nav className="bottom-nav">
        {navItems.map(item => (
          <button
            key={item.key}
            className={`nav-btn ${tab === item.key ? "active" : ""}`}
            onClick={() => setTab(item.key)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {arrivalData && (
        <ArrivalModal
          rawAddress={arrivalData.rawAddress}
          knownEntry={arrivalData.knownEntry}
          locations={locations}
          onDone={handleArrivalDone}
          onCancel={() => {
            setArrivalData(null);
            releaseWakeLock();
          }}
        />
      )}
      {showFuel && <FuelModal onSave={saveFuel} onCancel={() => setShowFuel(false)} />}
      {editingFuel && (
        <FuelModal initial={editingFuel} onSave={updateFuel} onCancel={() => setEditingFuel(null)} />
      )}
      {editingRoute && (
        <EditRouteModal
          route={editingRoute}
          onSave={handleEditSave}
          onCancel={() => setEditingRoute(null)}
        />
      )}
      {showServiceModal && (
        <ServiceModal
          initial={editingService}
          onSave={async form => {
            const entry = editingService
              ? { ...editingService, ...form }
              : { id: Date.now(), ...form };
            setSyncing(true);
            await saveServiceEntry(uid, entry);
            setSyncing(false);
            setShowServiceModal(false);
            setEditingService(null);
          }}
          onCancel={() => {
            setShowServiceModal(false);
            setEditingService(null);
          }}
        />
      )}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}