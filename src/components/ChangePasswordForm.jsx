import React, { useState } from 'react';
import { db, collection, doc, setDoc, getDocs } from '../firebase';

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h.toString(16);
}

export default function ChangePasswordForm({ userId, onBack }) {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setError("");
    setSuccess(false);
    if (!current || !newPass || !confirm) {
      setError("Συμπλήρωσε όλα τα πεδία");
      return;
    }
    if (newPass.length < 4) {
      setError("Ο νέος κωδικός πρέπει να έχει τουλάχιστον 4 χαρακτήρες");
      return;
    }
    if (newPass !== confirm) {
      setError("Οι νέοι κωδικοί δεν ταιριάζουν");
      return;
    }
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const userDoc = snap.docs.find(d => d.id === userId);
      if (!userDoc) {
        setError("Σφάλμα: λογαριασμός δεν βρέθηκε");
        setLoading(false);
        return;
      }
      const data = userDoc.data();
      if (data.passwordHash !== simpleHash(current)) {
        setError("Λάθος τρέχων κωδικός");
        setLoading(false);
        return;
      }
      await setDoc(doc(db, "users", userId), { ...data, passwordHash: simpleHash(newPass) });
      setSuccess(true);
      setCurrent("");
      setNewPass("");
      setConfirm("");
    } catch (e) {
      setError("Σφάλμα αποθήκευσης");
    }
    setLoading(false);
  };

  return (
    <div>
      {error && <div className="login-error" style={{ marginBottom: 14 }}>{error}</div>}
      {success && (
        <div
          style={{
            background: "rgba(34,197,94,0.12)",
            border: "1px solid #22c55e",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 13,
            color: "#22c55e",
            marginBottom: 14,
          }}
        >
          ✅ Ο κωδικός άλλαξε επιτυχώς!
        </div>
      )}
      <div className="input-group">
        <label className="input-label">Τρέχων Κωδικός</label>
        <input
          className="input"
          type="password"
          placeholder="••••••••"
          value={current}
          onChange={e => setCurrent(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label className="input-label">Νέος Κωδικός</label>
        <input
          className="input"
          type="password"
          placeholder="••••••••"
          value={newPass}
          onChange={e => setNewPass(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label className="input-label">Επιβεβαίωση Νέου</label>
        <input
          className="input"
          type="password"
          placeholder="••••••••"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSave()}
        />
      </div>
      <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
        {loading ? "Αποθήκευση..." : "💾 Αποθήκευση"}
      </button>
    </div>
  );
}