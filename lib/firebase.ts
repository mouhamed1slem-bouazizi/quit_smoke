import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB_t9_0fUlS9AbIEuIyoJB-nhIeUTviu8Y",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "app-d7397.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://app-d7397-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "app-d7397",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "app-d7397.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "538283025810",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:538283025810:web:7dc45efc541c332e2a8d4b",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-20JJF8G8CD",
}

// Validate Firebase configuration
function validateFirebaseConfig(config: any): boolean {
  const requiredFields = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"]

  for (const field of requiredFields) {
    if (!config[field] || config[field].includes("your-") || config[field] === "") {
      console.warn(`Firebase config field '${field}' is missing or invalid`)
      return false
    }
  }

  return true
}

// Initialize Firebase only if configuration is valid
let app: any = null
let auth: any = null
let db: any = null
let isFirebaseAvailable = false

try {
  if (validateFirebaseConfig(firebaseConfig)) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    auth = getAuth(app)
    db = getFirestore(app)
    isFirebaseAvailable = true
    console.log("Firebase initialized successfully")
  } else {
    console.warn("Firebase configuration is invalid, running in offline mode")
    isFirebaseAvailable = false
  }
} catch (error) {
  console.error("Firebase initialization error:", error)
  isFirebaseAvailable = false
}

export { app, auth, db, isFirebaseAvailable }
