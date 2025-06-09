"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, RefreshCw, Clock, Heart, Brain, Smile } from "lucide-react"

export default function ActivitiesSuggestions() {
  const [currentSuggestions, setCurrentSuggestions] = useState<
    Array<{
      id: string
      title: string
      description: string
      duration: string
      category: "physical" | "mental" | "social" | "creative"
      icon: string
    }>
  >([])
  const [aiSuggestion, setAiSuggestion] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const predefinedActivities = [
    {
      id: "1",
      title: "Take a Walk",
      description: "Go for a 10-15 minute walk outside",
      duration: "10-15 min",
      category: "physical" as const,
      icon: "🚶",
    },
    {
      id: "2",
      title: "Deep Breathing",
      description: "Practice 4-7-8 breathing technique",
      duration: "5 min",
      category: "mental" as const,
      icon: "🫁",
    },
    {
      id: "3",
      title: "Call a Friend",
      description: "Reach out to someone you care about",
      duration: "10-20 min",
      category: "social" as const,
      icon: "📞",
    },
    {
      id: "4",
      title: "Drink Water",
      description: "Hydrate with a large glass of water",
      duration: "2 min",
      category: "physical" as const,
      icon: "💧",
    },
    {
      id: "5",
      title: "Listen to Music",
      description: "Play your favorite uplifting songs",
      duration: "5-10 min",
      category: "mental" as const,
      icon: "🎵",
    },
    {
      id: "6",
      title: "Stretch",
      description: "Do simple stretching exercises",
      duration: "5-10 min",
      category: "physical" as const,
      icon: "🤸",
    },
    {
      id: "7",
      title: "Write in Journal",
      description: "Express your thoughts and feelings",
      duration: "10-15 min",
      category: "creative" as const,
      icon: "📝",
    },
    {
      id: "8",
      title: "Meditation",
      description: "Practice mindfulness meditation",
      duration: "10-20 min",
      category: "mental" as const,
      icon: "🧘",
    },
  ]

  useEffect(() => {
    shuffleActivities()
    generateAISuggestion()
  }, [])

  const shuffleActivities = () => {
    const shuffled = [...predefinedActivities].sort(() => Math.random() - 0.5).slice(0, 4)
    setCurrentSuggestions(shuffled)
  }

  const generateAISuggestion = async () => {
    setIsLoading(true)
    try {
      const prompt =
        "Generate a unique, simple, and healthy activity suggestion to help someone distract from smoking cravings. Make it something that can be done in 5-15 minutes and is accessible to most people. Be creative but practical."

      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`)
      const text = await response.text()
      setAiSuggestion(text)
    } catch (error) {
      console.error("Error generating AI suggestion:", error)
      setAiSuggestion(
        "Try organizing a small area of your home - it keeps your hands busy and gives you a sense of accomplishment!",
      )
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "physical":
        return <Heart className="w-4 h-4" />
      case "mental":
        return <Brain className="w-4 h-4" />
      case "social":
        return <Smile className="w-4 h-4" />
      case "creative":
        return <Activity className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "physical":
        return "bg-red-100 text-red-700"
      case "mental":
        return "bg-blue-100 text-blue-700"
      case "social":
        return "bg-green-100 text-green-700"
      case "creative":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-600" />
            Healthy Distractions
          </CardTitle>
          <p className="text-sm text-gray-600">Try these activities when you feel a craving</p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => {
              shuffleActivities()
              generateAISuggestion()
            }}
            variant="outline"
            size="sm"
            className="w-full mb-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Get New Suggestions
          </Button>
        </CardContent>
      </Card>

      {/* AI Generated Suggestion */}
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700 border-orange-200 dark:border-gray-600">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
            <span className="text-lg">🤖</span>
            AI Suggestion
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="w-5 h-5 animate-spin text-orange-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-300">Generating suggestion...</span>
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{aiSuggestion}</p>
          )}
        </CardContent>
      </Card>

      {/* Predefined Activities */}
      <div className="grid gap-3">
        {currentSuggestions.map((activity) => (
          <Card key={activity.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{activity.title}</h3>
                    <Badge variant="secondary" className={`text-xs ${getCategoryColor(activity.category)}`}>
                      {getCategoryIcon(activity.category)}
                      <span className="ml-1 capitalize">{activity.category}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {activity.duration}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Emergency Craving Help */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl mb-2">🚨</div>
          <h3 className="font-semibold text-red-700 mb-2">Strong Craving?</h3>
          <p className="text-sm text-red-600 mb-3">
            Remember: Cravings typically last 3-5 minutes. You can get through this!
          </p>
          <div className="text-xs text-red-500">Try the 4 D's: Delay, Deep breathe, Drink water, Do something else</div>
        </CardContent>
      </Card>
    </div>
  )
}
