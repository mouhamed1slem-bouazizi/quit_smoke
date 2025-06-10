import { firebaseConfig, isFirebaseAvailable } from "./firebase"
import { getMessaging, getToken, onMessage } from "firebase/messaging"
import { initializeApp, getApps } from "firebase/app"

let messaging: any = null

// Initialize messaging only if Firebase is available and we're in browser
if (typeof window !== "undefined" && isFirebaseAvailable) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    messaging = getMessaging(app)
  } catch (error) {
    console.error("Error initializing Firebase messaging:", error)
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications")
    return "denied"
  }

  if (Notification.permission === "granted") {
    return "granted"
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    return permission as NotificationPermission
  }

  return Notification.permission as NotificationPermission
}

export async function getFCMToken(vapidKey: string): Promise<string | null> {
  if (!messaging || !vapidKey) {
    console.log("Messaging not available or VAPID key missing")
    return null
  }

  try {
    const token = await getToken(messaging, { vapidKey })
    console.log("FCM Token:", token)
    return token
  } catch (error) {
    console.error("Error getting FCM token:", error)
    return null
  }
}

export async function setupMessageListener(onMessageReceived: (payload: any) => void): Promise<(() => void) | null> {
  if (!messaging) {
    console.log("Messaging not available")
    return null
  }

  try {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Message received in foreground:", payload)
      onMessageReceived(payload)
    })

    return unsubscribe
  } catch (error) {
    console.error("Error setting up message listener:", error)
    return null
  }
}
