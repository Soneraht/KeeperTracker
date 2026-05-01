import React, { useState } from 'react';
import { db, auth, collection, getDocs, signInAnonymously } from '../firebase';

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h.toString(16);
}

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Συμπλήρωσε username και password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const snap = await getDocs(collection(db, "users"));
      const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const found = users.find(
        u =>
          (u.username || "").toLowerCase() === username.trim().toLowerCase() &&
          u.passwordHash === simpleHash(password)
      );
      if (!found) {
        setError("Λάθος στοιχεία σύνδεσης");
      } else if (found.active === false) {
        setError("Ο λογαριασμός είναι ανενεργός");
      } else {
        await signInAnonymously(auth);
        onLogin(found);
      }
    } catch (e) {
      setError("Σφάλμα σύνδεσης");
    }
    setLoading(false);
  };

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-logo">Keeper Tracker</div>
        <div className="login-sub">Σύνδεση σε λογαριασμό οδηγού, πωλητή ή admin</div>
        {error && <div className="login-error">{error}</div>}
        <div className="input-group">
          <label className="input-label">Username</label>
          <input
            className="input"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
          />
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>
        <button className="btn btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? "Σύνδεση..." : "Είσοδος"}
        </button>
        <div style={{ marginTop: 10, fontSize: 12, color: "#8899b0", lineHeight: 1.6 }}>
          Οι λογαριασμοί δημιουργούνται μόνο από admin.
        </div>
      </div>
    </div>
  );
}