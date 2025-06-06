"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Gamepad2, Target, Activity } from "lucide-react"
import MotivationSection from "@/components/motivation-section"
import ProgressTracker from "@/components/progress-tracker"
import GamesSection from "@/components/games-section"
import HealthFacts from "@/components/health-facts"
import GoalSetting from "@/components/goal-setting"
import ActivitiesSuggestions from "@/components/activities-suggestions"
import AchievementsSection from "@/components/achievements-section"

interface UserData {
  quitDate: string
  smokesPerDay: number
  costPerPack: number
  cigarettesPerPack: number
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

export default function QuitSmokingApp() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isSetup, setIsSetup] = useState(false)
  const [setupData, setSetupData] = useState({
    smokesPerDay: 20,
    costPerPack: 10,
    cigarettesPerPack: 20,
  })

  useEffect(() => {
    const savedData = localStorage.getItem("quitSmokingData")
    if (savedData) {
      const data = JSON.parse(savedData)
      setUserData(data)
      setIsSetup(true)
    }
  }, [])

  const handleSetup = () => {
    const newUserData: UserData = {
      quitDate: new Date().toISOString(),
      ...setupData,
      goals: [
        { id: "1", title: "24 Hours Smoke-Free", target: 1, completed: false },
        { id: "2", title: "1 Week Smoke-Free", target: 7, completed: false },
        { id: "3", title: "1 Month Smoke-Free", target: 30, completed: false },
        { id: "4", title: "1 Year Smoke-Free", target: 365, completed: false },
      ],
      achievements: [
        { id: "1", title: "First Day", description: "Completed your first smoke-free day", unlocked: false },
        { id: "2", title: "Week Warrior", description: "One week without smoking", unlocked: false },
        { id: "3", title: "Month Master", description: "One month smoke-free", unlocked: false },
        { id: "4", title: "Game Player", description: "Played 10 distraction games", unlocked: false },
      ],
    }

    setUserData(newUserData)
    localStorage.setItem("quitSmokingData", JSON.stringify(newUserData))
    setIsSetup(true)
  }

  const updateUserData = (newData: Partial<UserData>) => {
    if (!userData) return

    const updated = { ...userData, ...newData }
    setUserData(updated)
    localStorage.setItem("quitSmokingData", JSON.stringify(updated))
  }

  const getDaysSinceQuit = () => {
    if (!userData) return 0
    const quitDate = new Date(userData.quitDate)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - quitDate.getTime())
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  if (!isSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md mx-auto pt-20">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-green-600">🌟 Start Your Smoke-Free Journey</CardTitle>
              <p className="text-gray-600">Let's set up your personalized quit plan</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">How many cigarettes did you smoke per day?</label>
                <input
                  type="number"
                  value={setupData.smokesPerDay}
                  onChange={(e) => setSetupData({ ...setupData, smokesPerDay: Number.parseInt(e.target.value) })}
                  className="w-full p-3 border rounded-lg"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cost per pack ($)</label>
                <input
                  type="number"
                  value={setupData.costPerPack}
                  onChange={(e) => setSetupData({ ...setupData, costPerPack: Number.parseFloat(e.target.value) })}
                  className="w-full p-3 border rounded-lg"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cigarettes per pack</label>
                <input
                  type="number"
                  value={setupData.cigarettesPerPack}
                  onChange={(e) => setSetupData({ ...setupData, cigarettesPerPack: Number.parseInt(e.target.value) })}
                  className="w-full p-3 border rounded-lg"
                  min="1"
                />
              </div>

              <Button onClick={handleSetup} className="w-full bg-green-600 hover:bg-green-700">
                Start My Journey 🚀
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const daysSinceQuit = getDaysSinceQuit()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
          <div className="text-center">
            <h1 className="text-xl font-bold text-green-600">Smoke-Free Journey</h1>
            <p className="text-sm text-gray-600">Day {daysSinceQuit} • Keep going strong! 💪</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="dashboard" className="text-xs">
                <Heart className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="games" className="text-xs">
                <Gamepad2 className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="goals" className="text-xs">
                <Target className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="activities" className="text-xs">
                <Activity className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              <ProgressTracker userData={userData!} daysSinceQuit={daysSinceQuit} />
              <MotivationSection daysSinceQuit={daysSinceQuit} />
              <HealthFacts daysSinceQuit={daysSinceQuit} />
              <AchievementsSection userData={userData!} updateUserData={updateUserData} daysSinceQuit={daysSinceQuit} />
            </TabsContent>

            <TabsContent value="games">
              <GamesSection />
            </TabsContent>

            <TabsContent value="goals">
              <GoalSetting userData={userData!} updateUserData={updateUserData} daysSinceQuit={daysSinceQuit} />
            </TabsContent>

            <TabsContent value="activities">
              <ActivitiesSuggestions />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
