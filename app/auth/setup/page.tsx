"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function SetupPage() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingSetup, setCheckingSetup] = useState(true)
  const router = useRouter()
  const { currentUser, userData, setupUserData, checkUserSetup, userSetupCompleted } = useAuth()

  const [setupData, setSetupData] = useState({
    smokesPerDay: 20,
    costPerPack: 10,
    cigarettesPerPack: 20,
    yearsSmoked: 1,
    reasonToQuit: "",
    quitDate: new Date().toISOString().split("T")[0], // Default to today
  })

  // Check if user has already completed setup
  useEffect(() => {
    async function checkSetupStatus() {
      if (!currentUser) {
        router.push("/auth/login")
        return
      }

      try {
        const isSetupCompleted = await checkUserSetup()

        if (isSetupCompleted) {
          console.log("User setup already completed, redirecting to dashboard")
          router.push("/")
        }
      } catch (err) {
        console.error("Error checking setup status:", err)
      } finally {
        setCheckingSetup(false)
      }
    }

    checkSetupStatus()
  }, [currentUser, router, checkUserSetup])

  // If user data exists, redirect to dashboard
  useEffect(() => {
    if (userSetupCompleted && !checkingSetup) {
      console.log("User setup completed, redirecting to dashboard")
      router.push("/")
    }
  }, [userSetupCompleted, router, checkingSetup])

  async function handleSetup() {
    try {
      setError("")
      setLoading(true)

      if (!currentUser) {
        throw new Error("No user logged in")
      }

      const newUserData = {
        // Personal Information
        name: currentUser.displayName || "",
        age: 0,
        gender: "",
        profilePicture: currentUser.photoURL || "",
        location: "",
        occupation: "",

        // Smoking Information
        quitDate: new Date(setupData.quitDate + "T00:00:00").toISOString(),
        smokesPerDay: setupData.smokesPerDay,
        costPerPack: setupData.costPerPack,
        cigarettesPerPack: setupData.cigarettesPerPack,
        yearsSmoked: setupData.yearsSmoked,
        reasonToQuit: setupData.reasonToQuit,
        setupCompleted: true,

        // App Data
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

      await setupUserData(newUserData)
      router.push("/")
    } catch (err) {
      console.error(err)
      setError("Failed to set up your profile. " + (err instanceof Error ? err.message : ""))
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking setup status
  if (checkingSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600 dark:text-green-400" />
          <p className="text-gray-600 dark:text-gray-300">Checking your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto pt-20">
        <Card className="dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
              🌟 Start Your Smoke-Free Journey
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300">Let's set up your personalized quit plan</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                How many cigarettes did you smoke per day?
              </label>
              <input
                type="number"
                value={setupData.smokesPerDay}
                onChange={(e) => setSetupData({ ...setupData, smokesPerDay: Number.parseInt(e.target.value) })}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Cost per pack ($)</label>
              <input
                type="number"
                value={setupData.costPerPack}
                onChange={(e) => setSetupData({ ...setupData, costPerPack: Number.parseFloat(e.target.value) })}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Cigarettes per pack</label>
              <input
                type="number"
                value={setupData.cigarettesPerPack}
                onChange={(e) => setSetupData({ ...setupData, cigarettesPerPack: Number.parseInt(e.target.value) })}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">When did you quit smoking?</label>
              <input
                type="date"
                value={setupData.quitDate || new Date().toISOString().split("T")[0]}
                onChange={(e) => setSetupData({ ...setupData, quitDate: e.target.value })}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                max={new Date().toISOString().split("T")[0]}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select today if you're quitting right now</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">How many years did you smoke?</label>
              <input
                type="number"
                value={setupData.yearsSmoked}
                onChange={(e) => setSetupData({ ...setupData, yearsSmoked: Number.parseInt(e.target.value) || 1 })}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                min="0"
                max="80"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                Why did you decide to quit? (Optional)
              </label>
              <textarea
                placeholder="Share your motivation..."
                value={setupData.reasonToQuit}
                onChange={(e) => setSetupData({ ...setupData, reasonToQuit: e.target.value })}
                className="w-full p-3 border rounded-lg h-20 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <Button
              onClick={handleSetup}
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting Up...
                </>
              ) : (
                "Start My Journey 🚀"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
