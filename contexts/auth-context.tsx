"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

interface CravingEntry {
  id: string
  intensity: number
  intensityLabel: string
  timestamp: number
  date: string
  time: string
  duration?: number
  triggers?: string[]
  copingMethod?: string
}

interface DiaryEntry {
  id: string
  date: string
  mood: string
  moodLabel: string
  note: string
  timestamp: number
  time?: string
  userId: string
}

interface UserData {
  // Personal Information
  name: string
  age: number
  gender: string
  profilePicture: string
  location: string
  occupation: string

  // Smoking Information
  quitDate: string
  smokesPerDay: number
  costPerPack: number
  cigarettesPerPack: number
  yearsSmoked: number
  reasonToQuit: string

  // App Data
  goals: Array<{
    id: string
    title: string
    target: number
    completed: boolean
  }>
  achievements: Array<{
    id: string
    title: string
    description: string
    unlocked: boolean
    date?: string
  }>

  // Diary entries and cravings stored in user document
  diaryEntries?: DiaryEntry[]
  cravings?: CravingEntry[]
}

interface AuthContextType {
  currentUser: User | null
  userData: UserData | null
  loading: boolean
  dataLoading: boolean
  signup: (email: string, password: string, displayName?: string) => Promise<User>
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (displayName: string) => Promise<void>
  updateUserData: (data: Partial<UserData>) => Promise<void>
  setupUserData: (data: UserData) => Promise<void>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)

  async function signup(email: string, password: string, displayName?: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password)

    // Update profile immediately after creation if displayName is provided
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName })
      // Force refresh the user object to get updated displayName
      await result.user.reload()
    }

    return result.user
  }

  async function login(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  }

  async function logout() {
    setCurrentUser(null)
    setUserData(null)
    return await signOut(auth)
  }

  async function resetPassword(email: string) {
    return await sendPasswordResetEmail(auth, email)
  }

  async function updateUserProfile(displayName: string) {
    if (!currentUser) {
      throw new Error("No user logged in")
    }

    await updateProfile(currentUser, { displayName })
    // Force refresh to get updated profile
    await currentUser.reload()
  }

  async function setupUserData(data: UserData) {
    if (!currentUser) {
      throw new Error("No user logged in")
    }

    try {
      const userDocRef = doc(db, "users", currentUser.uid)
      const dataWithTimestamps = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await setDoc(userDocRef, dataWithTimestamps)
      setUserData(data)
    } catch (error) {
      console.error("Error setting up user data:", error)
      // Fallback to localStorage if Firestore fails
      localStorage.setItem(`userData_${currentUser.uid}`, JSON.stringify(data))
      setUserData(data)
    }
  }

  async function updateUserData(data: Partial<UserData>) {
    if (!currentUser) {
      throw new Error("No user logged in")
    }

    const updatedData = {
      ...userData,
      ...data,
      updatedAt: new Date().toISOString(),
    } as UserData

    try {
      const userDocRef = doc(db, "users", currentUser.uid)
      await setDoc(userDocRef, updatedData, { merge: true })
      setUserData(updatedData)
    } catch (error) {
      console.error("Error updating user data:", error)
      // Fallback to localStorage if Firestore fails
      localStorage.setItem(`userData_${currentUser.uid}`, JSON.stringify(updatedData))
      setUserData(updatedData)
    }
  }

  async function refreshUserData() {
    if (!currentUser) {
      return
    }

    try {
      setDataLoading(true)
      const userDocRef = doc(db, "users", currentUser.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const data = userDoc.data() as UserData
        console.log("User data loaded from Firebase:", data)
        setUserData(data)
      } else {
        console.log("No user data found in Firebase, checking localStorage")
        // Fallback to localStorage
        const localData = localStorage.getItem(`userData_${currentUser.uid}`)
        if (localData) {
          const data = JSON.parse(localData) as UserData
          setUserData(data)
        } else {
          setUserData(null)
        }
      }
    } catch (error) {
      console.error("Error refreshing user data:", error)
      // Fallback to localStorage
      const localData = localStorage.getItem(`userData_${currentUser.uid}`)
      if (localData) {
        const data = JSON.parse(localData) as UserData
        setUserData(data)
      } else {
        setUserData(null)
      }
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "User logged out")

      try {
        setCurrentUser(user)

        if (user) {
          console.log("Fetching user data for:", user.uid)
          setDataLoading(true)

          try {
            // Try to fetch user data from Firestore
            const userDocRef = doc(db, "users", user.uid)
            const userDoc = await getDoc(userDocRef)

            if (userDoc.exists()) {
              const data = userDoc.data() as UserData
              console.log("User data found in Firebase:", data)
              setUserData(data)
            } else {
              console.log("No user data document found in Firebase, checking localStorage")
              // Fallback to localStorage
              const localData = localStorage.getItem(`userData_${user.uid}`)
              if (localData) {
                const data = JSON.parse(localData) as UserData
                console.log("User data found in localStorage:", data)
                setUserData(data)
              } else {
                console.log("No user data found anywhere")
                setUserData(null)
              }
            }
          } catch (firestoreError) {
            console.error("Firestore error, falling back to localStorage:", firestoreError)
            // Fallback to localStorage
            const localData = localStorage.getItem(`userData_${user.uid}`)
            if (localData) {
              const data = JSON.parse(localData) as UserData
              setUserData(data)
            } else {
              setUserData(null)
            }
          }
        } else {
          setUserData(null)
        }
      } catch (error) {
        console.error("Error in auth state change:", error)
        setUserData(null)
      } finally {
        setLoading(false)
        setDataLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userData,
    loading,
    dataLoading,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    updateUserData,
    setupUserData,
    refreshUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
