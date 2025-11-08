// Firebase client initialization for web (Next.js client components)
// KODE LAMA: tidak ada inisialisasi Firebase.
// PERUBAHAN: Tambah inisialisasi terpusat agar reuse di halaman login dan komponen lain.
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, signOut, type Auth, /* createUserWithEmailAndPassword, */ signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  const app = getFirebaseApp();
  return getAuth(app);
}

// KODE LAMA (dikomentari): Google Sign-In dinonaktifkan

export async function logoutFirebase() {
  const auth = getFirebaseAuth();
  return signOut(auth);
}

// PERUBAHAN: Menambahkan helper Email/Password (tanpa Google)
export async function loginWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  return signInWithEmailAndPassword(auth, email, password);
}

// KODE LAMA (dikomentari): Fungsi pendaftaran akun dinonaktifkan
// export async function registerWithEmail(email: string, password: string) {
//   const auth = getFirebaseAuth();
//   return createUserWithEmailAndPassword(auth, email, password);
// }
