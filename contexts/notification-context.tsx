"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { Notification, NotificationContextType } from "@/types/notification"

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

  const addNotification = (
    notificationData: Omit<Notification, "id" | "timestamp" | "date" | "time" | "userId" | "isRead">,
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
    }

    setNotifications((prev) => [newNotification, ...prev])
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
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
