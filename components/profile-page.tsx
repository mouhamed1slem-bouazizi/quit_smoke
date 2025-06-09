"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Calendar, Edit3, Camera, Trophy, Heart, Cigarette, Save, X } from "lucide-react"

interface UserData {
  // Personal Information
  name: string
  age: number
  gender: string
  profilePicture: string
  location: string
  occupation: string

  // Smoking Information
  quitDate: string
  smokesPerDay: number
  costPerPack: number
  cigarettesPerPack: number
  yearsSmoked: number
  reasonToQuit: string

  // App Data
  goals: Array<{
    id: string
    title: string
    target: number
    completed: boolean
  }>
  achievements: Array<{
    id: string
    title: string
    description: string
    unlocked: boolean
    date?: string
  }>
}

interface ProfilePageProps {
  userData: UserData
  updateUserData: (data: Partial<UserData>) => void
  daysSinceQuit: number
}

export default function ProfilePage({ userData, updateUserData, daysSinceQuit }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: userData.name || "",
    age: userData.age || 25,
    gender: userData.gender || "",
    location: userData.location || "",
    occupation: userData.occupation || "",
    yearsSmoked: userData.yearsSmoked || 1,
    reasonToQuit: userData.reasonToQuit || "",
  })

  const handleSave = () => {
    updateUserData(editData)
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
    })
    setIsEditing(false)
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={userData.profilePicture || "/placeholder.svg"} alt={userData.name || "User"} />
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                  {(userData.name || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0">
                  <Camera className="w-4 h-4" />
                </Button>
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
                  <h2 className="text-xl font-bold text-gray-800">{userData.name || "Anonymous User"}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    {userData.age && <span>{userData.age} years old</span>}
                    {userData.gender && (
                      <Badge variant="secondary" className="capitalize">
                        {userData.gender}
                      </Badge>
                    )}
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
    </div>
  )
}
