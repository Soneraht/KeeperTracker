import React, { useEffect, useState } from "react";
import { db, collection, getDocs } from "./firebase";
import LoginPage from "./components/LoginPage";
import AdminPanel from "./components/AdminPanel";
import DriverApp from "./components/DriverApp";
import "./styles.css";

export default function App() {
  const [authUser, setAuthUserRaw] = useState(() => {
    try {
      const s = localStorage.getItem("authUser");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const setAuthUser = (user) => {
    if (user) {
      try {
        localStorage.setItem("authUser", JSON.stringify(user));
      } catch {}
    } else {
      try {
        localStorage.removeItem("authUser");
      } catch {}
    }
    setAuthUserRaw(user);
  };

  useEffect(() => {
    if (!authUser) return;
    getDocs(collection(db, "users"))
      .then(snap => {
        if (!snap.docs.some(d => d.id === authUser.id)) setAuthUser(null);
      })
      .catch(() => {});
  }, []);

  if (!authUser) return <LoginPage onLogin={setAuthUser} />;
  if (authUser.role === "admin" || authUser.role === "manager")
    return <AdminPanel user={authUser} onLogout={() => setAuthUser(null)} />;
  return <DriverApp user={authUser} onLogout={() => setAuthUser(null)} />;
}