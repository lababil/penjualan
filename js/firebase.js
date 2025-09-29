// js/firebase.js - Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA5DGgNaOujBGby2FG7Cut-2NTZIP4JpMw",
  authDomain: "lababil-penjualan.firebaseapp.com",
  projectId: "lababil-penjualan",
  storageBucket: "lababil-penjualan.firebasestorage.app",
  messagingSenderId: "96142764029",
  appId: "1:96142764029:web:b7bb32aed1a84e0c239b94"
};

// Inisialisasi Firebase langsung
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('Firebase initialized successfully');

export { auth, db };
export default app;
