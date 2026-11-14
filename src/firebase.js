// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBMzsFTqNQ6w3YSEkbLBu2HT530lAxeh_s",
  authDomain: "marswalk-navigator.firebaseapp.com",
  projectId: "marswalk-navigator",
  storageBucket: "marswalk-navigator.firebasestorage.app",
  messagingSenderId: "795167359962",
  appId: "1:795167359962:web:a31bbeb419c5a76e07f6e3",
  measurementId: "G-EKYL63R9LQ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics if supported in the current environment
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
