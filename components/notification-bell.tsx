"use client"

import { Bell } from "lucide-react"
import { useNotifications } from "@/contexts/notification-context"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function NotificationBell() {
  const { notifications, unreadCount, requestNotificationPermission } = useNotifications()
  const router = useRouter()
  const [isAnimating, setIsAnimating] = useState(false)
  const [prevUnreadCount, setPrevUnreadCount] = useState(unreadCount)

  // Animate the bell when new notifications arrive
  useEffect(() => {
    if (unreadCount > prevUnreadCount) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 2000)
      return () => clearTimeout(timer)
    }
    setPrevUnreadCount(unreadCount)
  }, [unreadCount, prevUnreadCount])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => router.push("/notifications")}
      aria-label={`${unreadCount} unread notifications`}
    >
      <Bell
        className={`h-6 w-6 ${
          isAnimating ? "animate-ring text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
        }`}
      />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Button>
  )
}
