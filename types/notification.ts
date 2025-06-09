export interface Notification {
  id: string
  title: string
  message: string
  type: "achievement" | "milestone" | "reminder" | "goal" | "health" | "system"
  isRead: boolean
  timestamp: number
  date: string
  time: string
  userId: string
  data?: {
    achievementId?: string
    goalId?: string
    milestoneType?: string
    [key: string]: any
  }
}

export interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "date" | "time" | "userId" | "isRead">,
  ) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  deleteNotification: (notificationId: string) => void
  clearAllNotifications: () => void
}
