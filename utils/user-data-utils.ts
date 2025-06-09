"use client"

import { doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface UserData {
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

  // Additional data that might be added by other components
  diaryEntries?: Array<{
    id: string
    date: string
    content: string
    mood: string
  }>
  cravingLogs?: Array<{
    id: string
    date: string
    intensity: number
    trigger: string
    copingStrategy: string
  }>
}

// Function to sanitize data for Firestore
const sanitizeDataForFirestore = (data: any): any => {
  if (data === null || data === undefined) {
    return data
  }

  if (typeof data === "function") {
    return null // Remove functions
  }

  if (data instanceof Date) {
    return data.toISOString()
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeDataForFirestore(item))
  }

  if (typeof data === "object") {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      // Skip functions and undefined values
      if (typeof value !== "function" && value !== undefined) {
        sanitized[key] = sanitizeDataForFirestore(value)
      }
    }
    return sanitized
  }

  return data
}

// Function to update user data in Firestore
export const updateUserData = async (userId: string, newData: Partial<UserData>) => {
  try {
    if (!userId) {
      throw new Error("User ID is required")
    }

    // Sanitize the data before sending to Firestore
    const sanitizedData = sanitizeDataForFirestore(newData)

    const userDocRef = doc(db, "users", userId)
    await updateDoc(userDocRef, {
      ...sanitizedData,
      updatedAt: new Date().toISOString(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating user data:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Function to get user data from Firestore
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    if (!userId) {
      return null
    }

    const userDocRef = doc(db, "users", userId)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      return userDoc.data() as UserData
    }
    return null
  } catch (error) {
    console.error("Error fetching user data:", error)
    return null
  }
}

// Hook to get updateUserData function with current user
export const useUpdateUserData = () => {
  const updateData = async (userId: string, newData: Partial<UserData>) => {
    if (!userId) {
      throw new Error("No user ID provided")
    }

    const result = await updateUserData(userId, newData)
    return result
  }

  return updateData
}
