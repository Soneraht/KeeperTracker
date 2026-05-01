import React, { useState } from 'react';

export default function ServiceModal({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial
      ? {
          date: initial.date || "",
          km: initial.km || "",
          description: initial.description || "",
        }
      : { date: "", km: "", description: "" }
  );

  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">
          {initial ? "✏️ Επεξεργασία Service" : "🔧 Νέο Service"}
        </div>
        <div className="modal-subtitle">Καταχώρηση συντήρησης οχήματος</div>
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
          <label className="input-label">Χιλιόμετρα</label>
          <input
            className="input"
            type="number"
            placeholder="125000"
            value={form.km}
            onChange={e => setForm({ ...form, km: e.target.value })}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Περιγραφή</label>
          <input
            className="input"
            placeholder="π.χ. Αλλαγή λαδιών, φίλτρα..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="btn-row">
          <button
            className="btn btn-success"
            style={{ marginBottom: 0 }}
            onClick={() => {
              if (form.date && form.description) onSave(form);
            }}
          >
            💾 Αποθήκευση
          </button>
          <button className="btn btn-secondary" style={{ marginBottom: 0 }} onClick={onCancel}>
            Άκυρο
          </button>
        </div>
      </div>
    </div>
  );
}