import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider
} from "firebase/auth";

/* =========================
   FIREBASE CONFIG
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyBI5gGTEhkk5FqCPbeASgRmF-ZYNu3qkXI",
  authDomain: "careerpilot-4b77a.firebaseapp.com",
  projectId: "careerpilot-4b77a",
  storageBucket:
    "careerpilot-4b77a.firebasestorage.app",
  messagingSenderId:
    "253121350618",
  appId:
    "1:253121350618:web:cba366138629387f158ee3",
  measurementId:
    "G-MPLY6JGHFB"
};

/* =========================
   INIT
========================= */

const app =
  initializeApp(
    firebaseConfig
  );

/* =========================
   AUTH
========================= */

export const auth =
  getAuth(app);

export const provider =
  new GoogleAuthProvider();

/* Optional */

provider.setCustomParameters({
  prompt: "select_account"
});