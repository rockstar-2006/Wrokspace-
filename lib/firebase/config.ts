import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: "AIzaSyCzh4kgWukR-9igXPRZ0aOruR7TUWGPf1A",
  authDomain: "workspace-aed6b.firebaseapp.com",
  projectId: "workspace-aed6b",
  storageBucket: "workspace-aed6b.firebasestorage.app",
  messagingSenderId: "62324460523",
  appId: "1:62324460523:web:631f077d2cab1e07f427ae",
  measurementId: "G-8J4FBSB3HT",
};

// Initialize Firebase App singleton safely for both client and SSR
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export const FIREBASE_AUTH_ENDPOINTS = {
  signInWithPassword: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`,
  signUp: `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`,
  sendOobCode: `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseConfig.apiKey}`,
  lookup: `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
  firestore: `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`,
};
