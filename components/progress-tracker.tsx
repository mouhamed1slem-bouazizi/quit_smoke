"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Heart, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"

interface UserData {
  quitDate: string
  smokesPerDay: number
  costPerPack: number
  cigarettesPerPack: number
}

interface ProgressTrackerProps {
  userData: UserData
  daysSinceQuit: number
}

export default function ProgressTracker({ userData, daysSinceQuit }: ProgressTrackerProps) {
  const [progressImage, setProgressImage] = useState<string>("")

  useEffect(() => {
    generateProgressImage()
  }, [daysSinceQuit])

  const generateProgressImage = async () => {
    try {
      let prompt = ""
      if (daysSinceQuit < 7) {
        prompt = "A small green sprout emerging from dark soil, symbolizing new beginnings and hope"
      } else if (daysSinceQuit < 30) {
        prompt = "A young healthy tree with fresh green leaves growing strong, representing progress and growth"
      } else if (daysSinceQuit < 365) {
        prompt = "A flourishing tree with vibrant green canopy and clear blue sky, symbolizing health and vitality"
      } else {
        prompt =
          "A magnificent oak tree in full bloom with crystal clear sky and sunshine, representing complete transformation and health"
      }

      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=200`
      setProgressImage(imageUrl)
    } catch (error) {
      console.error("Error generating progress image:", error)
    }
  }

  const calculateMoneySaved = () => {
    const cigarettesNotSmoked = daysSinceQuit * userData.smokesPerDay
    const packsNotBought = cigarettesNotSmoked / userData.cigarettesPerPack
    return (packsNotBought * userData.costPerPack).toFixed(2)
  }

  const getHealthMilestone = () => {
    if (daysSinceQuit >= 365) {
      return { text: "Risk of heart disease reduced by 50%", icon: "❤️" }
    } else if (daysSinceQuit >= 90) {
      return { text: "Lung function improved significantly", icon: "🫁" }
    } else if (daysSinceQuit >= 30) {
      return { text: "Circulation improved, skin looks better", icon: "✨" }
    } else if (daysSinceQuit >= 7) {
      return { text: "Taste and smell returning to normal", icon: "👃" }
    } else if (daysSinceQuit >= 1) {
      return { text: "Oxygen levels normalizing", icon: "💨" }
    } else {
      return { text: "Your journey begins now!", icon: "🌟" }
    }
  }

  const milestone = getHealthMilestone()

  return (
    <div className="space-y-4">
      {/* Progress Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {progressImage && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img
                src={progressImage || "/placeholder.svg"}
                alt="Progress visualization"
                className="w-full h-32 object-cover"
                crossOrigin="anonymous"
              />
            </div>
          )}
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{daysSinceQuit}</div>
            <p className="text-gray-600">Days Smoke-Free</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">${calculateMoneySaved()}</div>
            <p className="text-sm text-gray-600">Money Saved</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-500">{daysSinceQuit * userData.smokesPerDay}</div>
            <p className="text-sm text-gray-600">Cigarettes Avoided</p>
          </CardContent>
        </Card>
      </div>

      {/* Health Milestone */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{milestone.icon}</div>
            <div>
              <h3 className="font-semibold text-green-700">Health Milestone</h3>
              <p className="text-sm text-gray-600">{milestone.text}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
