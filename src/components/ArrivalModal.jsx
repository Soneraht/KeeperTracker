import React, { useState } from 'react';

export default function ArrivalModal({ rawAddress, knownEntry, locations, onDone, onCancel }) {
  const [step, setStep] = useState("pick_location");
  const [search, setSearch] = useState("");
  const [editedNumber, setEditedNumber] = useState("");
  const [finalAddress, setFinalAddress] = useState(rawAddress);
  const [clientName, setClientName] = useState(knownEntry?.name || "");

  const sortedLocs = Object.entries(locations || {})
    .map(([k, v]) => ({ key: k, ...v }))
    .sort((a, b) => (a.name || "").localeCompare(b.name || "", "el"));

  const filtered = search.trim()
    ? sortedLocs.filter(
        l =>
          (l.name || "").toLowerCase().includes(search.toLowerCase()) ||
          (l.address || "").toLowerCase().includes(search.toLowerCase())
      )
    : sortedLocs;

  if (step === "pick_location")
    return (
      <div className="overlay" onClick={onCancel}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-title">📍 Άφιξη</div>
          <div className="modal-subtitle">Επίλεξε προορισμό ή πρόσθεσε νέο</div>
          <input
            className="input"
            placeholder="🔍 Αναζήτηση..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            style={{ marginBottom: 12 }}
          />
          <div style={{ maxHeight: 260, overflowY: "auto", marginBottom: 12 }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", color: "#8899b0", fontSize: 13, padding: "20px 0" }}>
                Κανένα αποτέλεσμα
              </div>
            )}
            {filtered.map(loc => (
              <div
                key={loc.key}
                onClick={() => onDone(loc.address, loc.name, true)}
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #1e3a5f44",
                  cursor: "pointer",
                  borderRadius: 8,
                  marginBottom: 4,
                  background: "#1a2235",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e8edf5" }}>{loc.name}</div>
                <div style={{ fontSize: 11, color: "#8899b0", marginTop: 2 }}>{loc.address}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary" style={{ marginBottom: 8 }} onClick={() => setStep("confirm_address")}>
            📡 Νέος προορισμός (GPS)
          </button>
          <button className="btn btn-secondary" style={{ marginBottom: 0 }} onClick={onCancel}>
            Άκυρο
          </button>
        </div>
      </div>
    );

  if (step === "confirm_address")
    return (
      <div className="overlay">
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-title">📍 Νέος Προορισμός</div>
          <div className="modal-subtitle">Επιβεβαίωσε τη διεύθυνση GPS</div>
          <div className="address-box">{rawAddress}</div>
          <div className="btn-row">
            <button
              className="btn btn-success"
              onClick={() => {
                setFinalAddress(rawAddress);
                setStep("name");
              }}
            >
              ✓ Σωστή
            </button>
            <button
              className="btn btn-warning"
              onClick={() => {
                setEditedNumber(rawAddress);
                setStep("edit_number");
              }}
            >
              ✏️ Edit
            </button>
          </div>
          <button className="btn btn-secondary" style={{ marginTop: 10 }} onClick={() => setStep("pick_location")}>
            ← Πίσω
          </button>
        </div>
      </div>
    );

  if (step === "edit_number")
    return (
      <div className="overlay">
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-title">✏️ Επεξεργασία Διεύθυνσης</div>
          <div className="modal-subtitle">Διόρθωσε ολόκληρη τη διεύθυνση</div>
          <div className="input-group">
            <label className="input-label">Διεύθυνση</label>
            <input
              className="input"
              type="text"
              placeholder="π.χ. Λεωφόρος Αθηνών 12, Αθήνα"
              value={editedNumber}
              onChange={e => setEditedNumber(e.target.value)}
              autoFocus
            />
          </div>
          <div className="btn-row">
            <button
              className="btn btn-primary"
              onClick={() => {
                setFinalAddress(editedNumber.trim() || rawAddress);
                setStep("name");
              }}
            >
              ✓ ΟΚ
            </button>
            <button className="btn btn-secondary" onClick={() => setStep("confirm_address")}>
              Πίσω
            </button>
          </div>
        </div>
      </div>
    );

  if (step === "name")
    return (
      <div className="overlay">
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-title">👤 Όνομα Πελάτη</div>
          <div className="modal-subtitle">
            <strong style={{ color: "#e8edf5" }}>{finalAddress}</strong>
          </div>
          <div className="input-group">
            <label className="input-label">Όνομα</label>
            <input
              className="input"
              type="text"
              placeholder="Επίθετο"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="btn-row">
            <button
              className="btn btn-success"
              onClick={() => onDone(finalAddress, clientName.trim())}
            >
              💾 Αποθήκευση
            </button>
            <button className="btn btn-secondary" onClick={() => setStep("confirm_address")}>
              Πίσω
            </button>
          </div>
        </div>
      </div>
    );

  return null;
}