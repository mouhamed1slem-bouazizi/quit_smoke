"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  Calendar,
  Edit3,
  Camera,
  Trophy,
  Heart,
  Cigarette,
  Save,
  X,
  LogOut,
  Monitor,
  Moon,
  Sun,
  Send,
  MessageSquare,
  Mail,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useTheme } from "@/contexts/theme-context"
import { Textarea } from "@/components/ui/textarea"
import NotificationBell from "@/components/notification-bell"

interface ProfilePageProps {
  daysSinceQuit: number
}

// Developer email constant - used for sending feedback
const DEVELOPER_EMAIL = "mibtn10@gmail.com"

export default function ProfilePage({ daysSinceQuit }: ProfilePageProps) {
  const { userData, updateUserData, logout, currentUser } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: userData?.name || "",
    age: userData?.age || 25,
    gender: userData?.gender || "",
    location: userData?.location || "",
    occupation: userData?.occupation || "",
    yearsSmoked: userData?.yearsSmoked || 1,
    reasonToQuit: userData?.reasonToQuit || "",
    quitDate: userData?.quitDate
      ? new Date(userData.quitDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  })

  const { theme, setTheme } = useTheme()

  const [feedbackType, setFeedbackType] = useState("feedback")
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [isSendingFeedback, setIsSendingFeedback] = useState(false)
  const [feedbackStatus, setFeedbackStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  if (!userData) {
    return <div>Loading user data...</div>
  }

  const handleSave = () => {
    const updatedData = {
      ...editData,
      quitDate: new Date(editData.quitDate + "T00:00:00").toISOString(),
    }
    updateUserData(updatedData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData({
      name: userData.name || "",
      age: userData.age || 25,
      gender: userData.gender || "",
      location: userData.location || "",
      occupation: userData.occupation || "",
      yearsSmoked: userData.yearsSmoked || 1,
      reasonToQuit: userData.reasonToQuit || "",
      quitDate: userData.quitDate
        ? new Date(userData.quitDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    })
    setIsEditing(false)
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        updateUserData({ profilePicture: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/auth/login")
    } catch (error) {
      console.error("Failed to log out", error)
    }
  }

  const calculateMoneySaved = () => {
    const cigarettesNotSmoked = daysSinceQuit * userData.smokesPerDay
    const packsNotBought = cigarettesNotSmoked / userData.cigarettesPerPack
    return (packsNotBought * userData.costPerPack).toFixed(2)
  }

  const calculateLifeRegained = () => {
    // Assuming each cigarette reduces life by 11 minutes
    const minutesRegained = daysSinceQuit * userData.smokesPerDay * 11
    const hoursRegained = Math.floor(minutesRegained / 60)
    const daysRegained = Math.floor(hoursRegained / 24)
    return { minutes: minutesRegained, hours: hoursRegained, days: daysRegained }
  }

  const getCompletedGoals = () => {
    return userData.goals.filter((goal) => goal.completed).length
  }

  const getUnlockedAchievements = () => {
    return userData.achievements.filter((achievement) => achievement.unlocked).length
  }

  const lifeRegained = calculateLifeRegained()
  const completedGoals = getCompletedGoals()
  const unlockedAchievements = getUnlockedAchievements()

  const handleSendFeedback = async () => {
    if (!feedbackMessage.trim()) return

    setIsSendingFeedback(true)
    setFeedbackStatus(null)

    try {
      // Prepare the feedback data
      const feedbackData = {
        type: feedbackType,
        message: feedbackMessage.trim(),
        userInfo: {
          name: userData?.name || currentUser?.email?.split("@")[0] || "Anonymous User",
          email: currentUser?.email || "No email provided",
          userId: currentUser?.uid || "Unknown",
        },
        appInfo: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        },
        userData: {
          daysSinceQuit,
          smokesPerDay: userData?.smokesPerDay,
          quitDate: userData?.quitDate,
        },
        // All messages will be sent to the developer email
        to: DEVELOPER_EMAIL,
      }

      // Send the feedback to our API endpoint
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedbackData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to send feedback")
      }

      setFeedbackStatus({
        type: "success",
        message: "✅ Thank you for your feedback! We've received your message and will review it soon.",
      })

      // Clear the form
      setFeedbackMessage("")
      setFeedbackType("feedback")

      // Clear success message after 5 seconds
      setTimeout(() => setFeedbackStatus(null), 5000)
    } catch (error) {
      console.error("Error sending feedback:", error)
      setFeedbackStatus({
        type: "error",
        message: "❌ Sorry, there was an error sending your feedback. Please try again later.",
      })
    } finally {
      setIsSendingFeedback(false)
    }
  }

  // Rest of the component remains the same...

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              My Profile
            </CardTitle>
            <div className="flex gap-2">
              <NotificationBell />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                {isEditing ? "Cancel" : "Edit"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-500 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={userData.profilePicture || "/placeholder.svg"} alt={userData.name || "User"} />
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                  {(userData.name || currentUser?.email?.[0] || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute -bottom-2 -right-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-blue-500" />
                  </label>
                </div>
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Age"
                      value={editData.age}
                      onChange={(e) => setEditData({ ...editData, age: Number.parseInt(e.target.value) || 0 })}
                      className="w-20 p-2 border rounded-lg"
                      min="1"
                      max="120"
                    />
                    <select
                      value={editData.gender}
                      onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                      className="flex-1 p-2 border rounded-lg"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {userData.name || currentUser?.email?.split("@")[0] || "Anonymous User"}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    {userData.age > 0 && <span>{userData.age} years old</span>}
                    {userData.gender && (
                      <Badge variant="secondary" className="capitalize">
                        {userData.gender}
                      </Badge>
                    )}
                    <span className="text-gray-500">{currentUser?.email}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 gap-4">
            {isEditing ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="City, Country"
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Occupation</label>
                  <input
                    type="text"
                    placeholder="Your job title"
                    value={editData.occupation}
                    onChange={(e) => setEditData({ ...editData, occupation: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Years Smoked</label>
                  <input
                    type="number"
                    placeholder="How many years did you smoke?"
                    value={editData.yearsSmoked}
                    onChange={(e) => setEditData({ ...editData, yearsSmoked: Number.parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border rounded-lg"
                    min="0"
                    max="80"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reason to Quit</label>
                  <textarea
                    placeholder="What motivated you to quit smoking?"
                    value={editData.reasonToQuit}
                    onChange={(e) => setEditData({ ...editData, reasonToQuit: e.target.value })}
                    className="w-full p-2 border rounded-lg h-20 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-orange-600">⚠️ Reset Quit Date</label>
                  <input
                    type="date"
                    value={editData.quitDate}
                    onChange={(e) => setEditData({ ...editData, quitDate: e.target.value })}
                    className="w-full p-2 border-2 border-orange-200 rounded-lg focus:border-orange-400"
                    max={new Date().toISOString().split("T")[0]}
                  />
                  <p className="text-xs text-orange-600 mt-1">⚠️ Changing this will reset your progress statistics</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                {userData.location && (
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <p className="font-medium">{userData.location}</p>
                  </div>
                )}
                {userData.occupation && (
                  <div>
                    <span className="text-gray-500">Occupation:</span>
                    <p className="font-medium">{userData.occupation}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Quit Date:</span>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(userData.quitDate).toLocaleDateString()}
                  </p>
                </div>
                {userData.yearsSmoked && (
                  <div>
                    <span className="text-gray-500">Years Smoked:</span>
                    <p className="font-medium">{userData.yearsSmoked} years</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {!isEditing && userData.reasonToQuit && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-500">My Motivation:</span>
              <p className="text-sm text-gray-700 mt-1 italic">"{userData.reasonToQuit}"</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Progress Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{daysSinceQuit}</div>
              <p className="text-sm text-gray-600">Days Smoke-Free</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">${calculateMoneySaved()}</div>
              <p className="text-sm text-gray-600">Money Saved</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{completedGoals}</div>
              <p className="text-sm text-gray-600">Goals Completed</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{unlockedAchievements}</div>
              <p className="text-sm text-gray-600">Achievements</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smoking Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Cigarette className="w-5 h-5 text-red-600" />
            Smoking Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Cigarettes Avoided:</span>
              <span className="font-bold text-red-600">{daysSinceQuit * userData.smokesPerDay}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Packs Not Bought:</span>
              <span className="font-bold text-red-600">
                {Math.floor((daysSinceQuit * userData.smokesPerDay) / userData.cigarettesPerPack)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Life Regained:</span>
              <span className="font-bold text-green-600">
                {lifeRegained.days > 0 ? `${lifeRegained.days} days` : `${lifeRegained.hours} hours`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Previous Daily Habit:</span>
              <span className="font-medium">{userData.smokesPerDay} cigarettes/day</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Progress */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Health Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl mb-2">🌟</div>
            <h3 className="font-bold text-green-700 mb-2">
              {daysSinceQuit >= 365
                ? "Health Champion!"
                : daysSinceQuit >= 30
                  ? "Health Warrior!"
                  : daysSinceQuit >= 7
                    ? "Health Hero!"
                    : "Health Journey Started!"}
            </h3>
            <p className="text-sm text-gray-600">
              Your body is healing and getting stronger every day. Keep up the amazing work!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Choose how the app looks to you. Select a single theme, or sync with your system and automatically switch
              between day and night themes.
            </p>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                  theme === "light"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-lg"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800/50"
                }`}
              >
                <Sun
                  className={`w-6 h-6 ${theme === "light" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                />
                <span
                  className={`text-sm font-medium ${theme === "light" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}
                >
                  Light
                </span>
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                  theme === "dark"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-lg"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800/50"
                }`}
              >
                <Moon
                  className={`w-6 h-6 ${theme === "dark" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                />
                <span
                  className={`text-sm font-medium ${theme === "dark" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}
                >
                  Dark
                </span>
              </button>

              <button
                onClick={() => setTheme("system")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                  theme === "system"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-lg"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800/50"
                }`}
              >
                <Monitor
                  className={`w-6 h-6 ${theme === "system" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                />
                <span
                  className={`text-sm font-medium ${theme === "system" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}
                >
                  System
                </span>
              </button>
            </div>

            {theme === "system" && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-800/30 rounded-lg border dark:border">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  🌓 Automatically switches between light and dark themes based on your device settings
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Section */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
            Send Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Have suggestions, found a bug, or want to share your experience? We'd love to hear from you!
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Message Type</label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="feedback">General Feedback</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="support">Support Request</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Your Message</label>
                <Textarea
                  placeholder="Tell us what's on your mind..."
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  className="min-h-[120px] resize-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  maxLength={1000}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                  {feedbackMessage.length}/1000 characters
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border dark:border-blue-800/30">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Your message will be sent with your name (
                    {userData?.name || currentUser?.email?.split("@")[0] || "Anonymous"}) and email (
                    {currentUser?.email}) automatically attached for follow-up.
                  </span>
                </p>
              </div>

              <Button
                onClick={handleSendFeedback}
                disabled={!feedbackMessage.trim() || isSendingFeedback}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingFeedback ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Feedback
                  </>
                )}
              </Button>

              {feedbackStatus && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    feedbackStatus.type === "success"
                      ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                  }`}
                >
                  {feedbackStatus.message}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
