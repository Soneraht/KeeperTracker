# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# Keeper Tracker 

**Έκδοση:** 1.0.0  
**Ημερομηνία:** Απρίλιος 2026  
**Κατάσταση:** Production-ready (Beta)

***

## Επισκόπηση Έργου

Το **Keeper Tracker** είναι μία Progressive Web Application (PWA) ανεπτυγμένη για την πραγματικού χρόνου καταγραφή και παρακολούθηση διαδρομών επαγγελματικών οχημάτων. Η εφαρμογή επιτρέπει στον οδηγό να καταγράφει εκκινήσεις, αφίξεις και στοιχεία πελατών, ενώ παράλληλα τα δεδομένα συγχρονίζονται σε πραγματικό χρόνο στο cloud, καθιστώντας τα ορατά από οποιαδήποτε εξουσιοδοτημένη συσκευή.

***

## Στοίβα Τεχνολογιών (Tech Stack)

### Frontend — React 18

Η διεπαφή χρήστη αναπτύχθηκε με τη βιβλιοθήκη **React 18**, χρησιμοποιώντας functional components και React Hooks (`useState`, `useEffect`). Η αρχιτεκτονική είναι Single Page Application (SPA) χωρίς εξωτερικό routing — η πλοήγηση διαχειρίζεται εσωτερικά μέσω state management με tab-based navigation. Η επιλογή του React εξασφαλίζει component reusability, αντιδραστική ενημέρωση της διεπαφής και ευκολία συντήρησης.

### Build Tool — Vite

Ως εργαλείο bundling και development server χρησιμοποιήθηκε το **Vite**, το οποίο προσφέρει εξαιρετικά γρήγορο Hot Module Replacement (HMR) κατά την ανάπτυξη και βελτιστοποιημένο production build μέσω Rollup. Η χρήση του Vite μειώνει σημαντικά τον χρόνο ανάπτυξης σε σχέση με παλαιότερα toolchains (π.χ. Create React App).

### Backend & Database — Firebase Firestore (NoSQL)

Για την αποθήκευση δεδομένων χρησιμοποιήθηκε η υπηρεσία **Cloud Firestore** της Google Firebase — μία NoSQL, document-based βάση δεδομένων με real-time sync capabilities. Τα δεδομένα οργανώνονται σε collections:

| Collection | Περιεχόμενο |
|---|---|
| `routes` | Καταγεγραμμένες διαδρομές (έναρξη, άφιξη, πελάτης, timestamps) |
| `locations` | Αποθηκευμένοι γνωστοί προορισμοί με GPS key |
| `fuels` | Εγγραφές ανεφοδιασμού (λίτρα, κόστος, χιλιόμετρα) |
| `profile` | Στοιχεία οδηγού και οχήματος |

Η επικοινωνία με το Firestore γίνεται μέσω **real-time listeners** (`onSnapshot`), εξασφαλίζοντας άμεση ενημέρωση σε όλες τις συνδεδεμένες συσκευές χωρίς polling.

### Geolocation & Reverse Geocoding

Η εντόπιση τοποθεσίας υλοποιείται μέσω του **Web Geolocation API** του browser, το οποίο επιστρέφει συντεταγμένες GPS (latitude/longitude). Για τη μετατροπή των συντεταγμένων σε αναγνώσιμη διεύθυνση χρησιμοποιείται το **Nominatim API** του OpenStreetMap, με παράμετρο γλώσσας `el` για αποτελέσματα στα ελληνικά. Η κωδικοποίηση GPS key γίνεται με ακρίβεια 3 δεκαδικών ψηφίων (~100 μέτρα), επιτρέποντας αξιόπιστη αναγνώριση γνωστών προορισμών.

### Live Map View — Google Maps Embed API

Η ενότητα Live View αξιοποιεί το **Google Maps Embed API** για την εμφάνιση χάρτη με την τελευταία διεύθυνση άφιξης. Το embed φορτώνεται ως `<iframe>` με δυναμική URL που κωδικοποιεί την τρέχουσα τοποθεσία, ενώ παρέχεται σύνδεσμος για άνοιγμα στο πλήρες Google Maps.

### Export — SheetJS (xlsx)

Η εξαγωγή δεδομένων σε μορφή Excel υλοποιείται με τη βιβλιοθήκη **SheetJS (xlsx)**. Η εφαρμογή δημιουργεί δυναμικά workbook με τις διαδρομές ημέρας, συμπεριλαμβάνοντας υπολογισμό συνολικού χρόνου (σε λεπτά) και συνολικών χιλιομέτρων βάσει εισαγωγής χρήστη.

### Screen Wake Lock API

Κατά τη διάρκεια ενεργής διαδρομής, η εφαρμογή αξιοποιεί το **Screen Wake Lock API** για να αποτρέψει την αυτόματη απενεργοποίηση της οθόνης. Η λειτουργία υποστηρίζεται σε iOS 16.4+ και σύγχρονες εκδόσεις Android Chrome, εξασφαλίζοντας διαρκή ορατότητα της εφαρμογής κατά την οδήγηση.

### Deployment — GitHub Pages

Η εφαρμογή αναπτύσσεται (deploy) στο **GitHub Pages** μέσω του πακέτου `gh-pages`. Η διαδικασία περιλαμβάνει production build μέσω `npm run build` και αυτόματη ανάρτηση του `dist/` φακέλου στο branch `gh-pages` του αντίστοιχου repository. Το αποτέλεσμα είναι μία στατική εφαρμογή διαθέσιμη σε δωρεάν δημόσιο URL (`https://<username>.github.io/<repo-name>`).

***

## Αρχιτεκτονική Δεδομένων

```
Firebase Firestore
├── /routes/{id}
│     start: { location, time, timestamp, fromBase }
│     end:   { location, time, label, timestamp }
│     gpsKey: "lat_lon"
│
├── /locations/{gpsKey}
│     address: "Οδός Αριθμός, Πόλη"
│     name:    "Επωνυμία Πελάτη"
│
├── /fuels/{id}
│     liters, amount, km, date
│
└── /profile/driver
      firstName, lastName, plate, startKm, baseAddress
```

***

## Βασικές Λειτουργίες

- **Έναρξη διαδρομής** από αποθηκευμένη έδρα ή τρέχουσα GPS τοποθεσία
- **Καταγραφή άφιξης** με αυτόματο reverse geocoding και επιβεβαίωση διεύθυνσης
- **Αναγνώριση γνωστών προορισμών** βάσει GPS proximity matching
- **Real-time sync** σε cloud — δεδομένα ορατά από οποιαδήποτε συσκευή άμεσα
- **Live Map View** τελευταίας άφιξης με ενσωματωμένο χάρτη
- **Export σε Excel** με συνοπτικά στατιστικά ημέρας
- **Καταγραφή ανεφοδιασμών** με συγκεντρωτικά σύνολα κόστους / λίτρων
- **Φίλτρα ιστορικού** ανά πελάτη, μήνα, έτος

***

## Πακέτα (Dependencies)

| Πακέτο | Έκδοση | Χρήση |
|---|---|---|
| `react` | 18.x | UI framework |
| `react-dom` | 18.x | DOM rendering |
| `firebase` | 11.x | Firestore SDK |
| `xlsx` | 0.18.x | Excel export |
| `gh-pages` | 6.x | GitHub Pages deployment |
| `vite` | 5.x | Build tool (dev dependency) |

***

## Σημειώσεις Ασφαλείας

Η βάση δεδομένων Firestore λειτουργεί προς το παρόν σε **test mode** (ανοικτοί κανόνες ανάγνωσης/εγγραφής). Για παραγωγικό περιβάλλον (production) συνίσταται η εφαρμογή κανόνων ασφαλείας (Security Rules) μέσω Firebase Console, καθώς και η ενεργοποίηση **Firebase Authentication** για έλεγχο πρόσβασης ανά χρήστη.