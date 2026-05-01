import React, { useState } from 'react';

export default function EditRouteModal({ route, onSave, onCancel }) {
  const [clientName, setClientName] = useState(route.end?.label || "");
  const [address, setAddress] = useState(route.end?.location || "");

  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">✏️ ΕΠΕΞΕΡΓΑΣΙΑ</div>
        <div className="modal-subtitle">Αλλαγή στοιχείων διαδρομής</div>
        <div className="input-group">
          <label className="input-label">Όνομα Πελάτη</label>
          <input
            className="input"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="Όνομα πελάτη"
            autoFocus
          />
        </div>
        <div className="input-group">
          <label className="input-label">Διεύθυνση Άφιξης</label>
          <input
            className="input"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Οδός Αριθμός, Πόλη"
          />
        </div>
        <div className="btn-row">
          <button
            className="btn btn-success"
            style={{ marginBottom: 0 }}
            onClick={() =>
              onSave({
                ...route,
                end: {
                  ...route.end,
                  label: clientName.trim() || "Άγνωστο",
                  location: address.trim() || route.end?.location,
                },
              })
            }
          >
            ✓ ΑΠΟΘΗΚΕΥΣΗ
          </button>
          <button className="btn btn-secondary" style={{ marginBottom: 0 }} onClick={onCancel}>
            ΑΚΥΡΟ
          </button>
        </div>
      </div>
    </div>
  );
}