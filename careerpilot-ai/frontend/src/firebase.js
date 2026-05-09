// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);

export const provider = new GoogleAuthProvider();

/* Optional */

provider.setCustomParameters({
  prompt: "select_account",
});
