// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD4cPhrT3c9B67TchQeEtFDl-q7F6S6Sc0",
  authDomain: "nestednotes-8e590.firebaseapp.com",
  projectId: "nestednotes-8e590",
  storageBucket: "nestednotes-8e590.firebasestorage.app",
  messagingSenderId: "1033661494234",
  appId: "1:1033661494234:web:f993c272cb7c03f10386e3",
  measurementId: "G-NRC1B4BCK7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);