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
import { auth, db, isFirebaseAvailable } from "@/lib/firebase"

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

  // App Settings
  themePreference?: "light" | "dark" | "system"
  setupCompleted?: boolean

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
  userSetupCompleted: boolean
  offlineMode: boolean
  signup: (email: string, password: string, displayName?: string) => Promise<User>
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (displayName: string) => Promise<void>
  updateUserData: (data: Partial<UserData>) => Promise<void>
  setupUserData: (data: UserData) => Promise<void>
  refreshUserData: () => Promise<void>
  checkUserSetup: () => Promise<boolean>
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
  const [userSetupCompleted, setUserSetupCompleted] = useState(false)
  const [offlineMode, setOfflineMode] = useState(!isFirebaseAvailable)

  // Create offline user helper
  function createOfflineUser(email: string, displayName?: string): User {
    return {
      uid: `offline-${email.replace(/[^a-zA-Z0-9]/g, "")}`,
      email,
      displayName: displayName || email.split("@")[0],
      emailVerified: false,
    } as User
  }

  async function signup(email: string, password: string, displayName?: string) {
    console.log("Signup attempt - Firebase available:", isFirebaseAvailable, "Offline mode:", offlineMode)

    // Always use offline mode if Firebase is not available
    if (!isFirebaseAvailable || offlineMode) {
      console.log("Creating offline user account")
      const mockUser = createOfflineUser(email, displayName)
      setCurrentUser(mockUser)
      return mockUser
    }

    // Only try Firebase if it's definitely available
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)

      if (displayName && result.user) {
        await updateProfile(result.user, { displayName })
        await result.user.reload()
      }

      return result.user
    } catch (error) {
      console.error("Firebase signup failed, switching to offline mode:", error)
      setOfflineMode(true)

      const mockUser = createOfflineUser(email, displayName)
      setCurrentUser(mockUser)
      return mockUser
    }
  }

  async function login(email: string, password: string) {
    console.log("Login attempt - Firebase available:", isFirebaseAvailable, "Offline mode:", offlineMode)

    // Always use offline mode if Firebase is not available
    if (!isFirebaseAvailable || offlineMode) {
      console.log("Logging in with offline mode")
      const mockUser = createOfflineUser(email)
      setCurrentUser(mockUser)

      // Try to load existing user data from localStorage
      const localData = localStorage.getItem(`userData_${mockUser.uid}`)
      if (localData) {
        try {
          const data = JSON.parse(localData) as UserData
          setUserData(data)
          setUserSetupCompleted(data.setupCompleted || false)
        } catch (error) {
          console.error("Error parsing local data:", error)
        }
      }

      return mockUser
    }

    // Only try Firebase if it's definitely available
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result.user
    } catch (error) {
      console.error("Firebase login failed, switching to offline mode:", error)
      setOfflineMode(true)

      const mockUser = createOfflineUser(email)
      setCurrentUser(mockUser)

      // Try to load existing user data from localStorage
      const localData = localStorage.getItem(`userData_${mockUser.uid}`)
      if (localData) {
        try {
          const data = JSON.parse(localData) as UserData
          setUserData(data)
          setUserSetupCompleted(data.setupCompleted || false)
        } catch (error) {
          console.error("Error parsing local data:", error)
        }
      }

      return mockUser
    }
  }

  async function logout() {
    setCurrentUser(null)
    setUserData(null)
    setUserSetupCompleted(false)

    if (isFirebaseAvailable && !offlineMode && auth) {
      try {
        return await signOut(auth)
      } catch (error) {
        console.error("Logout error:", error)
      }
    }
  }

  async function resetPassword(email: string) {
    if (!isFirebaseAvailable || offlineMode) {
      throw new Error("Password reset is not available in offline mode")
    }

    try {
      return await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error("Password reset error:", error)
      throw error
    }
  }

  async function updateUserProfile(displayName: string) {
    if (!currentUser) {
      throw new Error("No user logged in")
    }

    if (isFirebaseAvailable && !offlineMode && auth) {
      try {
        await updateProfile(currentUser, { displayName })
        await currentUser.reload()
      } catch (error) {
        console.error("Profile update error:", error)
      }
    }
  }

  async function setupUserData(data: UserData) {
    if (!currentUser) {
      throw new Error("No user logged in")
    }

    const dataWithTimestamps = {
      ...data,
      setupCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      if (isFirebaseAvailable && !offlineMode && db) {
        const userDocRef = doc(db, "users", currentUser.uid)
        await setDoc(userDocRef, dataWithTimestamps)
      }
    } catch (error) {
      console.error("Error saving to Firebase, using localStorage:", error)
    }

    // Always save to localStorage as backup
    localStorage.setItem(`userData_${currentUser.uid}`, JSON.stringify(dataWithTimestamps))
    setUserData(dataWithTimestamps)
    setUserSetupCompleted(true)
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
      if (isFirebaseAvailable && !offlineMode && db) {
        const userDocRef = doc(db, "users", currentUser.uid)
        await setDoc(userDocRef, updatedData, { merge: true })
      }
    } catch (error) {
      console.error("Error updating Firebase, using localStorage:", error)
    }

    // Always save to localStorage as backup
    localStorage.setItem(`userData_${currentUser.uid}`, JSON.stringify(updatedData))
    setUserData(updatedData)
  }

  async function checkUserSetup(): Promise<boolean> {
    if (!currentUser) {
      return false
    }

    try {
      if (isFirebaseAvailable && !offlineMode && db) {
        const userDocRef = doc(db, "users", currentUser.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const data = userDoc.data() as UserData
          const hasCompletedSetup =
            data.setupCompleted === true ||
            (data.quitDate && data.smokesPerDay && data.costPerPack && data.cigarettesPerPack)

          setUserSetupCompleted(hasCompletedSetup)
          return hasCompletedSetup
        }
      }

      // Check localStorage
      const localData = localStorage.getItem(`userData_${currentUser.uid}`)
      if (localData) {
        try {
          const data = JSON.parse(localData) as UserData
          const hasCompletedSetup =
            data.setupCompleted === true ||
            (data.quitDate && data.smokesPerDay && data.costPerPack && data.cigarettesPerPack)

          setUserSetupCompleted(hasCompletedSetup)
          return hasCompletedSetup
        } catch (error) {
          console.error("Error parsing local data:", error)
        }
      }

      setUserSetupCompleted(false)
      return false
    } catch (error) {
      console.error("Error checking user setup:", error)
      setUserSetupCompleted(false)
      return false
    }
  }

  async function refreshUserData() {
    if (!currentUser) {
      return
    }

    try {
      setDataLoading(true)

      if (isFirebaseAvailable && !offlineMode && db) {
        const userDocRef = doc(db, "users", currentUser.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const data = userDoc.data() as UserData
          setUserData(data)

          const hasCompletedSetup =
            data.setupCompleted === true ||
            (data.quitDate && data.smokesPerDay && data.costPerPack && data.cigarettesPerPack)
          setUserSetupCompleted(hasCompletedSetup)
          return
        }
      }

      // Fallback to localStorage
      const localData = localStorage.getItem(`userData_${currentUser.uid}`)
      if (localData) {
        try {
          const data = JSON.parse(localData) as UserData
          setUserData(data)

          const hasCompletedSetup =
            data.setupCompleted === true ||
            (data.quitDate && data.smokesPerDay && data.costPerPack && data.cigarettesPerPack)
          setUserSetupCompleted(hasCompletedSetup)
        } catch (error) {
          console.error("Error parsing local data:", error)
        }
      } else {
        setUserData(null)
        setUserSetupCompleted(false)
      }
    } catch (error) {
      console.error("Error refreshing user data:", error)
      // Fallback to localStorage
      const localData = localStorage.getItem(`userData_${currentUser.uid}`)
      if (localData) {
        try {
          const data = JSON.parse(localData) as UserData
          setUserData(data)
        } catch (error) {
          console.error("Error parsing local data:", error)
        }
      } else {
        setUserData(null)
        setUserSetupCompleted(false)
      }
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    console.log("Auth context initializing - Firebase available:", isFirebaseAvailable)

    if (!isFirebaseAvailable) {
      console.log("Firebase not available, setting offline mode")
      setOfflineMode(true)
      setLoading(false)
      return
    }

    // Only set up Firebase auth listener if Firebase is available
    try {
      if (auth) {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          try {
            setCurrentUser(user)

            if (user) {
              setDataLoading(true)

              try {
                if (db) {
                  const userDocRef = doc(db, "users", user.uid)
                  const userDoc = await getDoc(userDocRef)

                  if (userDoc.exists()) {
                    const data = userDoc.data() as UserData
                    setUserData(data)

                    const hasCompletedSetup =
                      data.setupCompleted === true ||
                      (data.quitDate && data.smokesPerDay && data.costPerPack && data.cigarettesPerPack)
                    setUserSetupCompleted(hasCompletedSetup)
                  } else {
                    const localData = localStorage.getItem(`userData_${user.uid}`)
                    if (localData) {
                      try {
                        const data = JSON.parse(localData) as UserData
                        setUserData(data)

                        const hasCompletedSetup =
                          data.setupCompleted === true ||
                          (data.quitDate && data.smokesPerDay && data.costPerPack && data.cigarettesPerPack)
                        setUserSetupCompleted(hasCompletedSetup)
                      } catch (error) {
                        console.error("Error parsing local data:", error)
                      }
                    } else {
                      setUserData(null)
                      setUserSetupCompleted(false)
                    }
                  }
                }
              } catch (firestoreError) {
                console.error("Firestore error:", firestoreError)
                const localData = localStorage.getItem(`userData_${user.uid}`)
                if (localData) {
                  try {
                    const data = JSON.parse(localData) as UserData
                    setUserData(data)
                  } catch (error) {
                    console.error("Error parsing local data:", error)
                  }
                } else {
                  setUserData(null)
                  setUserSetupCompleted(false)
                }
              }
            } else {
              setUserData(null)
              setUserSetupCompleted(false)
            }
          } catch (error) {
            console.error("Error in auth state change:", error)
            setUserData(null)
            setUserSetupCompleted(false)
          } finally {
            setLoading(false)
            setDataLoading(false)
          }
        })

        return unsubscribe
      } else {
        console.log("Auth object not available, switching to offline mode")
        setOfflineMode(true)
        setLoading(false)
      }
    } catch (error) {
      console.error("Error setting up auth state listener:", error)
      setOfflineMode(true)
      setLoading(false)
      return () => {}
    }
  }, [])

  const value = {
    currentUser,
    userData,
    loading,
    dataLoading,
    userSetupCompleted,
    offlineMode,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    updateUserData,
    setupUserData,
    refreshUserData,
    checkUserSetup,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
