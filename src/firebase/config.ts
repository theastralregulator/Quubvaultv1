'use client';

// This is the public configuration for the Firebase project.
// It is safe to use in the client-side code.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDE9heX5r1r9JwtZO8SHuianUaILcEMjSc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "quub-vault-v1.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "quub-vault-v1",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "quub-vault-v1.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "885184734375",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:885184734375:web:271f21e6bc7eab93d92782",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-2N7ES4WWEJ"
};
