"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Award, Medal } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface Achievement {
  id: string
  title: string
  description: string
  unlocked: boolean
  date?: string
}

interface UserData {
  achievements: Achievement[]
}

interface AchievementsSectionProps {
  userData: UserData
  daysSinceQuit: number
}

export default function AchievementsSection({ userData, daysSinceQuit }: AchievementsSectionProps) {
  const { currentUser, updateUserData } = useAuth()

  useEffect(() => {
    if (currentUser && userData) {
      checkAndUnlockAchievements()
    }
  }, [daysSinceQuit, currentUser])

  const checkAndUnlockAchievements = async () => {
    if (!currentUser || !userData.achievements) return

    const gamesPlayed = Number.parseInt(localStorage.getItem("gamesPlayed") || "0")

    const updatedAchievements = userData.achievements.map((achievement) => {
      if (achievement.unlocked) return achievement

      let shouldUnlock = false

      switch (achievement.id) {
        case "1": // First Day
          shouldUnlock = daysSinceQuit >= 1
          break
        case "2": // Week Warrior
          shouldUnlock = daysSinceQuit >= 7
          break
        case "3": // Month Master
          shouldUnlock = daysSinceQuit >= 30
          break
        case "4": // Game Player
          shouldUnlock = gamesPlayed >= 10
          break
      }

      if (shouldUnlock) {
        return {
          ...achievement,
          unlocked: true,
          date: new Date().toISOString(),
        }
      }

      return achievement
    })

    // Check if any new achievements were unlocked
    const newlyUnlocked = updatedAchievements.filter(
      (ach, index) => ach.unlocked && !userData.achievements[index].unlocked,
    )

    if (newlyUnlocked.length > 0) {
      try {
        // Update achievements in Firebase
        await updateUserData({ achievements: updatedAchievements })

        // Show celebration for newly unlocked achievements
        newlyUnlocked.forEach((achievement) => {
          setTimeout(() => {
            alert(`🎉 Achievement Unlocked: ${achievement.title}!\n${achievement.description}`)
          }, 500)
        })
      } catch (error) {
        console.error("Error updating achievements:", error)
      }
    }
  }

  const unlockedCount = userData.achievements?.filter((a) => a.unlocked).length || 0
  const totalCount = userData.achievements?.length || 0

  const getAchievementIcon = (achievementId: string) => {
    switch (achievementId) {
      case "1":
        return <Star className="w-6 h-6" />
      case "2":
        return <Award className="w-6 h-6" />
      case "3":
        return <Medal className="w-6 h-6" />
      case "4":
        return <Trophy className="w-6 h-6" />
      default:
        return <Trophy className="w-6 h-6" />
    }
  }

  const getProgressToNextAchievement = () => {
    const nextAchievement = userData.achievements?.find((a) => !a.unlocked)
    if (!nextAchievement) return null

    switch (nextAchievement.id) {
      case "1":
        return { progress: Math.min((daysSinceQuit / 1) * 100, 100), target: "1 day" }
      case "2":
        return { progress: Math.min((daysSinceQuit / 7) * 100, 100), target: "7 days" }
      case "3":
        return { progress: Math.min((daysSinceQuit / 30) * 100, 100), target: "30 days" }
      case "4":
        const gamesPlayed = Number.parseInt(localStorage.getItem("gamesPlayed") || "0")
        return { progress: Math.min((gamesPlayed / 10) * 100, 100), target: "10 games" }
      default:
        return null
    }
  }

  const nextProgress = getProgressToNextAchievement()

  if (!userData.achievements) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading achievements...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Achievements
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {unlockedCount}/{totalCount} unlocked
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {userData.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                achievement.unlocked
                  ? "bg-yellow-50 border border-yellow-200"
                  : "bg-gray-50 border border-gray-200 opacity-60"
              }`}
            >
              <div className={`${achievement.unlocked ? "text-yellow-600" : "text-gray-400"}`}>
                {getAchievementIcon(achievement.id)}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${achievement.unlocked ? "text-yellow-700" : "text-gray-500"}`}>
                  {achievement.title}
                </h3>
                <p className={`text-sm ${achievement.unlocked ? "text-yellow-600" : "text-gray-400"}`}>
                  {achievement.description}
                </p>
                {achievement.unlocked && achievement.date && (
                  <p className="text-xs text-yellow-500 mt-1">
                    Unlocked {new Date(achievement.date).toLocaleDateString()}
                  </p>
                )}
              </div>
              {achievement.unlocked && <div className="text-2xl">🏆</div>}
            </div>
          ))}
        </div>

        {nextProgress && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">Next Achievement</span>
              <span className="text-xs text-blue-600">{nextProgress.progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${nextProgress.progress}%` }}
              />
            </div>
            <p className="text-xs text-blue-600 mt-1">Progress to {nextProgress.target}</p>
          </div>
        )}

        {unlockedCount === totalCount && totalCount > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg text-center">
            <div className="text-3xl mb-2">🎉</div>
            <h3 className="font-bold text-yellow-700 mb-1">Achievement Master!</h3>
            <p className="text-sm text-yellow-600">
              You've unlocked all achievements! You're a true smoke-free champion!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
