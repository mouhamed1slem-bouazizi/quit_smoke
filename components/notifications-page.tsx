"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Bell,
  Trophy,
  Target,
  Heart,
  Clock,
  Settings,
  CheckCheck,
  Trash2,
  Filter,
  AlertCircle,
  MessageSquare,
} from "lucide-react"
import { useNotifications } from "@/contexts/notification-context"
import type { Notification } from "@/types/notification"
import { useRouter } from "next/navigation"
import Image from "next/image"

const getNotificationIcon = (type: Notification["type"], source: Notification["source"]) => {
  if (source === "firebase") {
    return <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
  }

  switch (type) {
    case "achievement":
      return <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
    case "milestone":
      return <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
    case "health":
      return <Heart className="w-5 h-5 text-red-500 dark:text-red-400" />
    case "goal":
      return <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    case "reminder":
      return <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
    case "system":
      return <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
    case "push":
      return <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
    default:
      return <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
  }
}

const getNotificationTypeColor = (type: Notification["type"], source: Notification["source"]) => {
  if (source === "firebase") {
    return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
  }

  switch (type) {
    case "achievement":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
    case "milestone":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    case "health":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    case "goal":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    case "reminder":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
    case "system":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    case "push":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
    default:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
  }
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    requestNotificationPermission,
    notificationPermission,
  } = useNotifications()

  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [typeFilter, setTypeFilter] = useState<Notification["type"] | "all" | "push">("all")
  const [sourceFilter, setSourceFilter] = useState<"all" | "app" | "firebase">("all")
  const router = useRouter()

  const filteredNotifications = notifications.filter((notification) => {
    const matchesReadFilter = filter === "all" || (filter === "unread" && !notification.isRead)
    const matchesTypeFilter = typeFilter === "all" || notification.type === typeFilter
    const matchesSourceFilter = sourceFilter === "all" || notification.source === sourceFilter
    return matchesReadFilter && matchesTypeFilter && matchesSourceFilter
  })

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }

    // If notification has an action URL, navigate to it
    if (notification.data?.actionUrl) {
      window.location.href = notification.data.actionUrl
    }
  }

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors mr-2"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Notifications
              </CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {notificationPermission !== "granted" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => requestNotificationPermission()}
                  className="flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Enable Notifications
                </Button>
              )}
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead} className="flex items-center gap-2">
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="flex items-center gap-2 text-red-500 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Filter:</span>
            </div>
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              All ({notifications.length})
            </Button>
            <Button variant={filter === "unread" ? "default" : "outline"} size="sm" onClick={() => setFilter("unread")}>
              Unread ({unreadCount})
            </Button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as Notification["type"] | "all")}
              className="px-3 py-1 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Types</option>
              <option value="achievement">Achievements</option>
              <option value="milestone">Milestones</option>
              <option value="health">Health</option>
              <option value="goal">Goals</option>
              <option value="reminder">Reminders</option>
              <option value="push">Push</option>
              <option value="system">System</option>
            </select>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as "all" | "app" | "firebase")}
              className="px-3 py-1 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Sources</option>
              <option value="app">In-App</option>
              <option value="firebase">Push</option>
            </select>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === "unread"
                  ? "All caught up! Check back later for new updates."
                  : "Notifications about your progress and achievements will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    notification.isRead
                      ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.source)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              className={`font-medium ${
                                notification.isRead
                                  ? "text-gray-900 dark:text-gray-100"
                                  : "text-blue-900 dark:text-blue-100"
                              }`}
                            >
                              {notification.title}
                            </h4>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getNotificationTypeColor(notification.type, notification.source)}`}
                            >
                              {notification.source === "firebase" ? "Push" : notification.type}
                            </Badge>
                            {!notification.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />}
                          </div>
                          <p
                            className={`text-sm ${
                              notification.isRead
                                ? "text-gray-600 dark:text-gray-400"
                                : "text-blue-800 dark:text-blue-200"
                            }`}
                          >
                            {notification.message}
                          </p>

                          {/* Show image if available */}
                          {notification.data?.imageUrl && (
                            <div className="mt-2 rounded-md overflow-hidden">
                              <Image
                                src={notification.data.imageUrl || "/placeholder.svg"}
                                alt="Notification image"
                                width={300}
                                height={150}
                                className="object-cover rounded-md"
                              />
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatRelativeTime(notification.timestamp)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {notification.time} • {new Date(notification.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
