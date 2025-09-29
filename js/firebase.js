// js/firebase.js - Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // TODO: Ganti dengan konfigurasi Firebase Anda dari Firebase Console
  // 1. Buka https://console.firebase.google.com/
  // 2. Pilih project Anda
  // 3. Klik ikon gear (Settings) > Project settings
  // 4. Scroll ke bagian "Your apps" > Web app
  // 5. Copy konfigurasi dan paste di sini

  apiKey: "AIzaSyA5DGgNaOujBGby2FG7Cut-2NTZIP4JpMw",
  authDomain: "lababil-penjualan.firebaseapp.com",
  projectId: "lababil-penjualan",
  storageBucket: "lababil-penjualan.firebasestorage.app",
  messagingSenderId: "96142764029",
  appId: "1:96142764029:web:b7bb32aed1a84e0c239b94"
};

// Check if Firebase config is properly set
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "AIzaSyA5DGgNaOujBGby2FG7Cut-2NTZIP4JpMw" &&
         firebaseConfig.projectId !== "lababil-penjualan";
};

// Initialize Firebase only if properly configured
let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
} else {
  console.warn('Firebase not configured. Please update js/firebase.js with your Firebase config.');
}

// Export services (will be null if not configured)
export { auth, db };
export default app;

