import React, { useState } from 'react';

export default function FuelModal({ onSave, onCancel, initial }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    liters: initial?.liters || "",
    amount: initial?.amount || "",
    km: initial?.km || "",
    receipt: initial?.receipt || "",
    date: initial?.date || todayStr,
  });

  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{initial ? "✏️ ΕΠΕΞΕΡΓΑΣΙΑ" : "⛽ ΑΝΕΦΟΔΙΑΣΜΟΣ"}</div>
        <div className="input-group">
          <label className="input-label">Ημερομηνία</label>
          <input
            className="input"
            type="date"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Λίτρα</label>
          <input
            className="input"
            type="number"
            placeholder="45.5"
            value={form.liters}
            onChange={e => setForm({ ...form, liters: e.target.value })}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Ποσό (€)</label>
          <input
            className="input"
            type="number"
            placeholder="82.00"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Χιλιόμετρα (προαιρετικό)</label>
          <input
            className="input"
            type="number"
            placeholder="125450"
            value={form.km}
            onChange={e => setForm({ ...form, km: e.target.value })}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Αρ. Τιμολογίου (προαιρετικό)</label>
          <input
            className="input"
            type="text"
            placeholder="π.χ. ΑΑ-12345"
            value={form.receipt}
            onChange={e => setForm({ ...form, receipt: e.target.value })}
          />
        </div>
        <div className="btn-row">
          <button
            className="btn btn-primary"
            style={{ marginBottom: 0 }}
            onClick={() => {
              if (form.liters && form.amount) onSave(form);
            }}
          >
            ΑΠΟΘΗΚΕΥΣΗ
          </button>
          <button className="btn btn-secondary" style={{ marginBottom: 0 }} onClick={onCancel}>
            ΑΚΥΡΟ
          </button>
        </div>
      </div>
    </div>
  );
}