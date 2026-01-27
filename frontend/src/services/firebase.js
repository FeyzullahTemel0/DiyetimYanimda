// frontend/src/services/firebase.js

import { initializeApp } from "firebase/app";
// GÜNCELLENDİ: GoogleAuthProvider'ı da import ediyoruz
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyDiJZPmrSMpm0b1uuSl4H96Ixuo7-CGhTY",
  authDomain: "diet-app-1b4a7.firebaseapp.com",
  projectId: "diet-app-1b4a7",
  storageBucket: "diet-app-1b4a7.firebasestorage.app",
  messagingSenderId: "299176004844",
  appId: "1:299176004844:web:99e1b5257f429b04ed29c9",
  measurementId: "G-FSS5C9CG51"
};


// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Auth, Firestore ve Storage referanslarını oluştur ve export et
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// YENİ: Google ile giriş için kullanılacak sağlayıcıyı oluşturuyoruz
export const googleProvider = new GoogleAuthProvider();

// YENİ (ÖNERİ): Bu ayar, kullanıcının her seferinde hesap seçmesini sağlar.
// Birden fazla Google hesabı olan kullanıcılar için deneyimi iyileştirir.
googleProvider.setCustomParameters({
  prompt: 'select_account'
});