export interface Notification {
  id: string
  title: string
  message: string
  type: "achievement" | "milestone" | "reminder" | "goal" | "health" | "system" | "push"
  isRead: boolean
  timestamp: number
  date: string
  time: string
  userId: string
  source: "app" | "firebase"
  data?: {
    achievementId?: string
    goalId?: string
    milestoneType?: string
    fcmMessageId?: string
    fcmNotificationId?: string
    imageUrl?: string
    actionUrl?: string
    [key: string]: any
  }
}

export interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "date" | "time" | "userId" | "isRead">,
  ) => void
  addFirebaseNotification: (fcmPayload: any) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  deleteNotification: (notificationId: string) => void
  clearAllNotifications: () => void
  requestNotificationPermission: () => Promise<boolean>
  notificationPermission: NotificationPermission | null
}

export type NotificationPermission = "granted" | "denied" | "default" | null
