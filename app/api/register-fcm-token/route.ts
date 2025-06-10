import { NextResponse } from "next/server"
import { getFirestore } from "firebase-admin/firestore"
import { initAdmin } from "@/lib/firebase-admin"

// Initialize Firebase Admin if not already initialized
initAdmin()

export async function POST(request: Request) {
  try {
    const { userId, token } = await request.json()

    if (!userId || !token) {
      return NextResponse.json({ error: "Missing userId or token" }, { status: 400 })
    }

    const db = getFirestore()

    // Store the token in Firestore
    await db.collection("users").doc(userId).collection("fcmTokens").doc(token).set({
      token,
      createdAt: new Date(),
      platform: "web",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error registering FCM token:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
