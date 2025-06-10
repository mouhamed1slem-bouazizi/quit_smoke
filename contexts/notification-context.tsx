"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { Notification, NotificationContextType, NotificationPermission } from "@/types/notification"
import {
  requestNotificationPermission as requestFCMPermission,
  setupMessageListener,
  getFCMToken,
} from "@/lib/firebase-messaging"

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(null)
  const [fcmToken, setFcmToken] = useState<string | null>(null)

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (currentUser) {
      const stored = localStorage.getItem(`notifications_${currentUser.uid}`)
      if (stored) {
        try {
          const parsedNotifications = JSON.parse(stored) as Notification[]
          setNotifications(parsedNotifications)
        } catch (error) {
          console.error("Error parsing stored notifications:", error)
        }
      }
    }
  }, [currentUser])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (currentUser && notifications.length > 0) {
      localStorage.setItem(`notifications_${currentUser.uid}`, JSON.stringify(notifications))
    }
  }, [notifications, currentUser])

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission as NotificationPermission)
    }
  }, [])

  // Set up Firebase messaging listener when user is logged in
  useEffect(() => {
    if (!currentUser) return

    const setupFirebaseMessaging = async () => {
      // Only proceed if permission is granted
      if (notificationPermission !== "granted") return

      // Set up message listener for foreground messages
      const unsubscribe = await setupMessageListener((payload) => {
        addFirebaseNotification(payload)
      })

      // Get FCM token for this device
      const token = await getFCMToken(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "")
      setFcmToken(token)

      // Save token to user's profile in Firestore if needed
      if (token && currentUser) {
        // This would typically be implemented in a server action or API route
        console.log("Would save FCM token to user profile:", token)
      }

      return () => {
        if (unsubscribe) unsubscribe()
      }
    }

    setupFirebaseMessaging()
  }, [currentUser, notificationPermission])

  const requestNotificationPermission = async (): Promise<boolean> => {
    const permission = await requestFCMPermission()
    setNotificationPermission(permission)
    return permission === "granted"
  }

  const addNotification = (
    notificationData: Omit<Notification, "id" | "timestamp" | "date" | "time" | "userId" | "isRead" | "source">,
  ) => {
    if (!currentUser) return

    const now = new Date()
    const newNotification: Notification = {
      ...notificationData,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: now.getTime(),
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      userId: currentUser.uid,
      isRead: false,
      source: "app",
    }

    setNotifications((prev) => [newNotification, ...prev])
  }

  const addFirebaseNotification = (fcmPayload: any) => {
    if (!currentUser) return

    const now = new Date()
    const notification = fcmPayload.notification || {}
    const data = fcmPayload.data || {}

    const newNotification: Notification = {
      id: `fcm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: notification.title || "New Notification",
      message: notification.body || "",
      type: data.type || "push",
      isRead: false,
      timestamp: now.getTime(),
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      userId: currentUser.uid,
      source: "firebase",
      data: {
        fcmMessageId: fcmPayload.messageId,
        fcmNotificationId: data.notificationId,
        imageUrl: notification.image || data.imageUrl,
        actionUrl: data.actionUrl,
        ...data,
      },
    }

    setNotifications((prev) => [newNotification, ...prev])

    // Show browser notification if app is in background
    if (document.visibilityState !== "visible" && notificationPermission === "granted") {
      try {
        const browserNotification = new Notification(newNotification.title, {
          body: newNotification.message,
          icon: "/icons/icon-192x192.png",
          image: newNotification.data?.imageUrl,
        })

        browserNotification.onclick = () => {
          window.focus()
          if (newNotification.data?.actionUrl) {
            window.location.href = newNotification.data.actionUrl
          }
        }
      } catch (error) {
        console.error("Error showing browser notification:", error)
      }
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification,
      ),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId))
  }

  const clearAllNotifications = () => {
    setNotifications([])
    if (currentUser) {
      localStorage.removeItem(`notifications_${currentUser.uid}`)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const value = {
    notifications,
    unreadCount,
    addNotification,
    addFirebaseNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    requestNotificationPermission,
    notificationPermission,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
