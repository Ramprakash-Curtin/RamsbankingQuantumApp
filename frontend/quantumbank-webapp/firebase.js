// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCiHJXoeK_PmJU6K-VcvyZL6ukrQ_OIjPw",
  authDomain: "mobilebankingquantumapp.firebaseapp.com",
  projectId: "mobilebankingquantumapp",
  storageBucket: "mobilebankingquantumapp.firebasestorage.app",
  messagingSenderId: "367879511581",
  appId: "1:367879511581:web:8f426eb259372b6fccb0f4",
  measurementId: "G-BHFXJMVFRP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);