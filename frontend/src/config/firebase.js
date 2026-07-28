import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCB2J9EvFgGQViL8Ykbdc31tZ347llQBBA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "disasterguard-6dab8.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "disasterguard-6dab8",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "disasterguard-6dab8.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "197914226814",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:197914226814:web:88eb9837e8e4f2ad32682f",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

export const getFirebaseMessaging = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      return getMessaging(app);
    }
  } catch (e) {
    console.warn("Firebase Messaging not supported in this browser environment:", e);
  }
  return null;
};

export default app;
