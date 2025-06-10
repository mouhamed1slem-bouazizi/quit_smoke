import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Firebase configuration - only use if all required fields are present
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Validate Firebase configuration
function validateFirebaseConfig(config: any): boolean {
  const requiredFields = ["apiKey", "authDomain", "projectId"]

  for (const field of requiredFields) {
    if (!config[field] || config[field] === "" || config[field] === "undefined") {
      console.warn(`Firebase config field '${field}' is missing, empty, or undefined`)
      return false
    }
  }

  // Additional validation for API key format
  if (config.apiKey && !config.apiKey.startsWith("AIza")) {
    console.warn("Firebase API key appears to be invalid (should start with 'AIza')")
    return false
  }

  return true
}

// Initialize Firebase only if configuration is completely valid
let app: any = null
let auth: any = null
let db: any = null
let isFirebaseAvailable = false

// Check if we're in a browser environment and have valid config
if (typeof window !== "undefined") {
  try {
    if (validateFirebaseConfig(firebaseConfig)) {
      console.log("Firebase config is valid, initializing...")
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
      auth = getAuth(app)
      db = getFirestore(app)
      isFirebaseAvailable = true
      console.log("Firebase initialized successfully")
    } else {
      console.log("Firebase configuration is invalid or incomplete, running in offline mode")
      isFirebaseAvailable = false
    }
  } catch (error) {
    console.error("Firebase initialization failed:", error)
    isFirebaseAvailable = false
  }
} else {
  console.log("Not in browser environment, Firebase will be initialized client-side")
  isFirebaseAvailable = false
}

export { app, auth, db, isFirebaseAvailable, firebaseConfig }
