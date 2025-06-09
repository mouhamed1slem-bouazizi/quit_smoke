"use client"
import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/contexts/notification-context"
import { useRouter } from "next/navigation"

export default function NotificationBell() {
  const { unreadCount } = useNotifications()
  const router = useRouter()
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 200)
    router.push("/notifications")
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className={`relative p-2 transition-transform ${
          isAnimating ? "scale-95" : "scale-100"
        } hover:bg-gray-100 dark:hover:bg-gray-800`}
      >
        <Bell className={`w-6 h-6 text-gray-600 dark:text-gray-300 ${unreadCount > 0 ? "animate-pulse" : ""}`} />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold animate-bounce"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  )
}
