import { db, collection, doc, setDoc, deleteDoc } from "../firebase";

export const driverCol = (uid, col) => `drivers/${uid}/${col}`;
export const saveRoute = (uid, r) => setDoc(doc(db, driverCol(uid, "routes"), String(r.id)), r);
export const saveLocation = (uid, k, v) => setDoc(doc(db, driverCol(uid, "locations"), k.replace(/\./g, "_")), v);
export const saveFuelEntry = (uid, e) => setDoc(doc(db, driverCol(uid, "fuels"), String(e.id)), e);
export const saveProfile = (uid, p) => setDoc(doc(db, driverCol(uid, "profile"), "driver"), p);
export const saveServiceEntry = (uid, s) => setDoc(doc(db, driverCol(uid, "services"), String(s.id)), s);
export const delService = (uid, id) => deleteDoc(doc(db, driverCol(uid, "services"), String(id)));
export const saveActiveRoute = (uid, r) => setDoc(doc(db, driverCol(uid, "activeRoute"), "current"), r);
export const clearActiveRoute = (uid) => deleteDoc(doc(db, driverCol(uid, "activeRoute"), "current"));

export const saveRequest = (r) => setDoc(doc(db, "requests", String(r.id)), r);
export const updateRequest = (id, patch) => setDoc(doc(db, "requests", String(id)), patch, { merge: true });
export const deleteRequest = (id) => deleteDoc(doc(db, "requests", String(id)));