// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBxWf_WWOGvBwgZbMlgbk5_jHUJhaYkzts",
  authDomain: "projetochapaquente.firebaseapp.com",
  projectId: "projetochapaquente",
  storageBucket: "projetochapaquente.firebasestorage.app",
  messagingSenderId: "813295818794",
  appId: "1:813295818794:web:a2a8c8f0831944badf0b53",
  measurementId: "G-9Z78TPZJB0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);