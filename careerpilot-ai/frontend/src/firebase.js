// firebase.js

import { initializeApp } from "firebase/app";

import { getAuth, GoogleAuthProvider } from "firebase/auth";

import { getAnalytics } from "firebase/analytics";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBI5gGTEhkk5FqCPbeASgRmF-ZYNu3qkXI",
  authDomain: "careerpilot-4b77a.firebaseapp.com",
  projectId: "careerpilot-4b77a",
  storageBucket: "careerpilot-4b77a.firebasestorage.app",
  messagingSenderId: "253121350618",
  appId: "1:253121350618:web:3059fb45dd619890158ee3",
  measurementId: "G-EPYYQWT1MH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics
const analytics = getAnalytics(app);

// Auth
export const auth = getAuth(app);

// Google Provider
export const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account",
});

export default app;
