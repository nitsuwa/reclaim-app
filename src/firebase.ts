// src/firebase.ts

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ** REPLACE THESE PLACEHOLDERS WITH YOUR ACTUAL CONFIG FROM THE FIREBASE CONSOLE **
const firebaseConfig = {
  apiKey: "AIzaSyBoM-arBjX8_zyhYqTVyM98k3PWjVBBsJk",
  authDomain: "reclaim-559c9.firebaseapp.com",
  projectId: "reclaim-559c9",
  storageBucket: "reclaim-559c9.firebasestorage.app",
  messagingSenderId: "577504023429",
  appId: "1:577504023429:web:f16d6fe605a4d9a6912aec",
  measurementId: "G-ENWKG10EHZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services and export them
export const auth = getAuth(app);
export const db = getFirestore(app);