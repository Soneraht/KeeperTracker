import React from 'react';

export default function HelpModal({ onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title" style={{ textAlign: "center" }}>📖 Οδηγιες Χρησης</div>
        <div className="modal-subtitle" style={{ textAlign: "center" }}>
          Keeper Tracker — Συστημα Καταγραφης Δρομολογιων
        </div>

        <div className="help-section">
          <div className="help-section-title" style={{ textAlign: "center" }}>🚐 Καταγραφη Δρομολογιου</div>
          <div className="help-item">
            <span className="help-item-icon">🏠</span>
            <div className="help-item-text">
              <strong>Εκκινηση απο Εδρα</strong>
              <span>Ξεκινά δρομολόγιο από την αποθηκευμένη διεύθυνση έδρας.</span>
            </div>
          </div>
          <div className="help-item">
            <span className="help-item-icon">🔄</span>
            <div className="help-item-text">
              <strong>Συνεχεια απο Τελευταιο</strong>
              <span>Ξεκινά νέο δρομολόγιο από το τελευταίο σημείο άφιξης.</span>
            </div>
          </div>
          <div className="help-item">
            <span className="help-item-icon">✅</span>
            <div className="help-item-text">
              <strong>Αφιξη σε Πελατη</strong>
              <span>Επιβεβαιώνεις διεύθυνση, διορθώνεις αριθμό αν χρειαστεί και καταχωρείς όνομα πελάτη. Μπορείς να επιλέξεις και από αποθηκευμένες τοποθεσίες.</span>
            </div>
          </div>
          <div className="help-item">
            <span className="help-item-icon">🏠</span>
            <div className="help-item-text">
              <strong>Επιστροφη στην Εδρα</strong>
              <span>Κλείνει το δρομολόγιο με προορισμό την έδρα.</span>
            </div>
          </div>
        </div>

        <div className="help-section">
          <div className="help-section-title" style={{ textAlign: "center" }}>📋 Ιστορικο & Στατιστικα</div>
          <div className="help-item">
            <span className="help-item-icon">📜</span>
            <div className="help-item-text">
              <strong>Ιστορικο</strong>
              <span>Εμφανίζει τα δρομολόγια της σημερινής ημέρας. Με Live View βλέπεις την τελευταία διεύθυνση στον χάρτη.</span>
            </div>
          </div>
          <div className="help-item">
            <span className="help-item-icon">📊</span>
            <div className="help-item-text">
              <strong>Στατιστικα</strong>
              <span>Φιλτράρισε δρομολόγια ανά πελάτη, μήνα ή έτος. Εμφανίζει σύνολα από όλες τις ημέρες.</span>
            </div>
          </div>
          <div className="help-item">
            <span className="help-item-icon">📤</span>
            <div className="help-item-text">
              <strong>Export Excel</strong>
              <span>Εξάγει τα σημερινά δρομολόγια σε αρχείο .xlsx με σύνολο χρόνου και χιλιομέτρων.</span>
            </div>
          </div>
          <div className="help-item">
            <span className="help-item-icon">✏️</span>
            <div className="help-item-text">
              <strong>Επεξεργασια / Διαγραφη</strong>
              <span>Κάθε δρομολόγιο μπορεί να επεξεργαστεί (πελάτης, διεύθυνση) ή να διαγραφεί με το εικονίδιο 🗑️.</span>
            </div>
          </div>
        </div>

        <div className="help-section">
          <div className="help-section-title" style={{ textAlign: "center" }}>⛽ Καυσιμα & Service</div>
          <div className="help-item">
            <span className="help-item-icon">⛽</span>
            <div className="help-item-text">
              <strong>Καταχωρηση Καυσιμων</strong>
              <span>Καταγράφεις ημερομηνία, λίτρα, κόστος, χιλιόμετρα και αριθμό απόδειξης. Μπορείς να επεξεργαστείς κάθε εγγραφή.</span>
            </div>
          </div>
          <div className="help-item">
            <span className="help-item-icon">🔧</span>
            <div className="help-item-text">
              <strong>Service Οχηματος</strong>
              <span>Στο Προφίλ, καταχώρησε ημερομηνία, χιλιόμετρα και περιγραφή service. Μπορείς να επεξεργαστείς ή να διαγράψεις κάθε εγγραφή.</span>
            </div>
          </div>
        </div>

        <div className="help-section">
          <div className="help-section-title" style={{ textAlign: "center" }}>👤 Προφιλ & Τοποθεσιες</div>
          <div className="help-item">
            <span className="help-item-icon">✏️</span>
            <div className="help-item-text">
              <strong>Επεξεργασια Προφιλ</strong>
              <span>Πάτα "Επεξεργασία" για να αλλάξεις στοιχεία (όνομα, πινακίδα, χλμ έναρξης, έδρα).</span>
            </div>
          </div>
          <div className="help-item">
            <span className="help-item-icon">📍</span>
            <div className="help-item-text">
              <strong>Αποθηκευμενες Τοποθεσιες</strong>
              <span>Οι διευθύνσεις πελατών αποθηκεύονται αυτόματα μετά από κάθε άφιξη. Μπορείς να τις επεξεργαστείς ή διαγράψεις.</span>
            </div>
          </div>
        </div>

        <div className="help-section">
          <div className="help-section-title" style={{ textAlign: "center" }}>☁️ Συγχρονισμος</div>
          <div className="help-item">
            <span className="help-item-icon">🔵</span>
            <div className="help-item-text">
              <strong>Cloud Sync</strong>
              <span>Όλα αποθηκεύονται σε Firebase σε πραγματικό χρόνο. Η ένδειξη "Sync..." εμφανίζεται κατά την αποθήκευση.</span>
            </div>
          </div>
          <div className="help-item">
            <span className="help-item-icon">🔴</span>
            <div className="help-item-text">
              <strong>Offline</strong>
              <span>Αν χαθεί σύνδεση, εμφανίζεται "Offline". Τα δεδομένα συγχρονίζονται αυτόματα μόλις επιστρέψει το internet.</span>
            </div>
          </div>
        </div>

        <button className="btn btn-secondary" style={{ marginBottom: 0, marginTop: 6 }} onClick={onClose}>
          Κλεισιμο
        </button>
      </div>
    </div>
  );
}