import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, getDoc, getDocs } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDCg_ePeZBsp2OzPtfYoX5ikZuusI55L-w",
  authDomain: "keeper-tracker-a6944.firebaseapp.com",
  projectId: "keeper-tracker-a6944",
  storageBucket: "keeper-tracker-a6944.firebasestorage.app",
  messagingSenderId: "444485952494",
  appId: "1:444485952494:web:cf0ec018a2f3e21fe524ff"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export { collection, doc, setDoc, deleteDoc, onSnapshot, getDoc, getDocs, signInAnonymously };
