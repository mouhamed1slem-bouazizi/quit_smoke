"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Gamepad2, Target, Activity, Stethoscope, Trophy, BookOpen, Flame, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import NotificationBell from "@/components/notification-bell"
import MotivationSection from "@/components/motivation-section"
import ProgressTracker from "@/components/progress-tracker"
import GamesSection from "@/components/games-section"
import HealthFacts from "@/components/health-facts"
import HealthTimeline from "@/components/health-timeline"
import HealthRecovery from "@/components/health-recovery"
import GoalSetting from "@/components/goal-setting"
import GoalsPage from "@/components/goals-page"
import DiaryPage from "@/components/diary-page"
import CravingPage from "@/components/craving-page"
import ActivitiesSuggestions from "@/components/activities-suggestions"
import AchievementsSection from "@/components/achievements-section"
import ProfilePage from "@/components/profile-page"
import { useAuth } from "@/contexts/auth-context"

export default function QuitSmokingApp() {
  const { currentUser, userData, loading, dataLoading, userSetupCompleted, checkUserSetup } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    async function checkAuth() {
      console.log("App state:", {
        currentUser: !!currentUser,
        userData: !!userData,
        loading,
        dataLoading,
        userSetupCompleted,
      })

      // Don't redirect while still loading
      if (loading || dataLoading) {
        return
      }

      // If no user is logged in, redirect to login
      if (!currentUser) {
        console.log("No user logged in, redirecting to login")
        router.push("/auth/login")
        return
      }

      // Check if user has completed setup
      const isSetupCompleted = await checkUserSetup()

      // If user is logged in but setup is not completed, redirect to setup
      if (currentUser && !isSetupCompleted) {
        console.log("User logged in but setup not completed, redirecting to setup")
        router.push("/auth/setup")
        return
      }

      // If we have both user and userData, stay on dashboard
      console.log("User and data both available, staying on dashboard")
    }

    checkAuth()
  }, [currentUser, userData, loading, dataLoading, userSetupCompleted, router, checkUserSetup])

  // Show loading while authentication or data is loading
  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 dark:border-green-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            {loading ? "Checking authentication..." : "Loading your data..."}
          </p>
        </div>
      </div>
    )
  }

  // Show loading if we don't have the required data yet
  if (!currentUser || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 dark:border-green-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your journey...</p>
        </div>
      </div>
    )
  }

  const getDaysSinceQuit = () => {
    const quitDate = new Date(userData.quitDate)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - quitDate.getTime())
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  const daysSinceQuit = getDaysSinceQuit()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold text-green-600 dark:text-green-400">SmokeOut</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Day {daysSinceQuit} • Keep going strong! 💪</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="scale-125">
                <NotificationBell />
              </div>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setActiveTab("profile")}
                className="p-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <User className="w-9 h-9 text-gray-600 dark:text-gray-300" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-8 mb-4 text-xs h-14">
              <TabsTrigger value="dashboard" className="p-3 h-full">
                <Heart className="w-5 h-5" />
              </TabsTrigger>
              <TabsTrigger value="craving" className="p-3 h-full">
                <Flame className="w-5 h-5" />
              </TabsTrigger>
              <TabsTrigger value="health" className="p-3 h-full">
                <Stethoscope className="w-5 h-5" />
              </TabsTrigger>
              <TabsTrigger value="goals-new" className="p-3 h-full">
                <Trophy className="w-5 h-5" />
              </TabsTrigger>
              <TabsTrigger value="diary" className="p-3 h-full">
                <BookOpen className="w-5 h-5" />
              </TabsTrigger>
              <TabsTrigger value="games" className="p-3 h-full">
                <Gamepad2 className="w-5 h-5" />
              </TabsTrigger>
              <TabsTrigger value="goals" className="p-3 h-full">
                <Target className="w-5 h-5" />
              </TabsTrigger>
              <TabsTrigger value="activities" className="p-3 h-full">
                <Activity className="w-5 h-5" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              <ProgressTracker userData={userData} daysSinceQuit={daysSinceQuit} />
              <MotivationSection daysSinceQuit={daysSinceQuit} />
              <HealthFacts daysSinceQuit={daysSinceQuit} />
              <HealthTimeline daysSinceQuit={daysSinceQuit} />
              <AchievementsSection userData={userData} daysSinceQuit={daysSinceQuit} />
            </TabsContent>

            <TabsContent value="craving">
              <CravingPage daysSinceQuit={daysSinceQuit} />
            </TabsContent>

            <TabsContent value="health">
              <HealthRecovery daysSinceQuit={daysSinceQuit} />
            </TabsContent>

            <TabsContent value="goals-new">
              <GoalsPage daysSinceQuit={daysSinceQuit} userData={userData} />
            </TabsContent>

            <TabsContent value="diary">
              <DiaryPage daysSinceQuit={daysSinceQuit} />
            </TabsContent>

            <TabsContent value="games">
              <GamesSection />
            </TabsContent>

            <TabsContent value="goals">
              <GoalSetting userData={userData} daysSinceQuit={daysSinceQuit} />
            </TabsContent>

            <TabsContent value="activities">
              <ActivitiesSuggestions />
            </TabsContent>

            <TabsContent value="profile">
              <ProfilePage daysSinceQuit={daysSinceQuit} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
