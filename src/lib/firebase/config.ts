import { initializeApp, getApps } from "firebase/app"

const firebaseConfig = {
  apiKey: "AIzaSyAZOA_yVNRD4ekqBuC1zsbsjKdMwPfmXY0",
  authDomain: "erp-auth-332b9.firebaseapp.com",
  projectId: "erp-auth-332b9",
  storageBucket: "erp-auth-332b9.firebasestorage.app",
  messagingSenderId: "87060406929",
  appId: "1:87060406929:web:04655f9381dbfb25925530",
  measurementId: "G-9H7F4VFR2C",
}

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
