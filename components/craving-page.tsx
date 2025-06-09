"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Flame,
  RefreshCw,
  TrendingDown,
  Clock,
  Wind,
  Trees,
  Brain,
  Zap,
  Timer,
  BarChart3,
  ChevronRight,
  X,
  CheckCircle,
  Phone,
  Footprints,
} from "lucide-react"

interface CravingEntry {
  id: string
  intensity: number
  intensityLabel: string
  timestamp: number
  date: string
  time: string
  duration?: number
  triggers?: string[]
  copingMethod?: string
}

interface ActivityDetail {
  id: string
  title: string
  description: string
  instructions: string[]
  duration: string
  benefits: string[]
  icon: React.ReactNode
  image: string
  color: string
}

interface CravingPageProps {
  daysSinceQuit: number
  updateUserData: (data: any) => void
}

export default function CravingPage({ daysSinceQuit, updateUserData }: CravingPageProps) {
  const [cravings, setCravings] = useState<CravingEntry[]>([])
  const [selectedIntensity, setSelectedIntensity] = useState<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [currentCravingStart, setCurrentCravingStart] = useState<number | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<ActivityDetail | null>(null)
  const [showActivityModal, setShowActivityModal] = useState(false)

  const [dailyActivities, setDailyActivities] = useState<ActivityDetail[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)
  const [completedActivities, setCompletedActivities] = useState<string[]>([])
  const [showCompletionMessage, setShowCompletionMessage] = useState(false)
  const [completedActivityTitle, setCompletedActivityTitle] = useState("")

  const intensityLevels = [
    { level: 1, label: "Mild", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-300" },
    {
      level: 2,
      label: "Moderate",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300",
    },
    { level: 3, label: "Strong", color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-300" },
    { level: 4, label: "Very Strong", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-300" },
    { level: 5, label: "Extreme", color: "text-red-800", bgColor: "bg-red-100", borderColor: "border-red-500" },
  ]

  const activities: ActivityDetail[] = [
    {
      id: "breathing",
      title: "Wave Breathing for Craving Control",
      description:
        "A powerful breathing technique that helps calm your nervous system and reduce craving intensity through rhythmic, wave-like breathing patterns.",
      instructions: [
        "Find a comfortable seated position with your back straight",
        "Place one hand on your chest, one on your belly",
        "Breathe in slowly through your nose for 4 counts, expanding your belly",
        "Hold your breath gently for 4 counts",
        "Exhale slowly through your mouth for 6 counts, like a gentle wave",
        "Repeat this cycle 8-10 times, focusing on the wave-like rhythm",
        "Notice how your craving intensity decreases with each breath",
      ],
      duration: "3-5 minutes",
      benefits: ["Reduces stress hormones", "Calms nervous system", "Decreases craving intensity", "Improves focus"],
      icon: <Wind className="w-6 h-6" />,
      image: "/placeholder.svg?height=60&width=60",
      color: "bg-blue-50",
    },
    {
      id: "visualization",
      title: "Visualize a Calming Nature Scene",
      description:
        "Use the power of mental imagery to transport yourself to a peaceful natural environment, helping your mind focus away from cravings.",
      instructions: [
        "Close your eyes and take three deep breaths",
        "Imagine yourself in a beautiful, peaceful forest",
        "Picture tall trees swaying gently in a warm breeze",
        "Hear the sound of birds singing and leaves rustling",
        "Feel the warm sun filtering through the tree canopy",
        "Smell the fresh, clean air and earthy forest scents",
        "Stay in this peaceful place for 5-10 minutes",
        "When ready, slowly open your eyes and return to the present",
      ],
      duration: "5-10 minutes",
      benefits: ["Reduces anxiety", "Shifts mental focus", "Promotes relaxation", "Decreases stress"],
      icon: <Trees className="w-6 h-6" />,
      image: "/placeholder.svg?height=60&width=60",
      color: "bg-green-50",
    },
    {
      id: "distraction",
      title: "Quick Distraction Techniques",
      description:
        "Immediate activities designed to redirect your attention and break the craving cycle through engaging your mind and body.",
      instructions: [
        "Choose one activity that appeals to you right now",
        "Count backwards from 100 by 7s (100, 93, 86, 79...)",
        "Name 5 things you can see, 4 you can hear, 3 you can touch",
        "Do 10 jumping jacks or push-ups",
        "Call or text a supportive friend or family member",
        "Drink a large glass of cold water slowly",
        "Brush your teeth or chew sugar-free gum",
        "Continue the activity until the craving passes",
      ],
      duration: "2-5 minutes",
      benefits: ["Immediate distraction", "Breaks craving cycle", "Engages multiple senses", "Quick relief"],
      icon: <Zap className="w-6 h-6" />,
      image: "/placeholder.svg?height=60&width=60",
      color: "bg-purple-50",
    },
    {
      id: "mindfulness",
      title: "Mindfulness Meditation",
      description:
        "Practice present-moment awareness to observe your craving without judgment, allowing it to pass naturally like a wave.",
      instructions: [
        "Sit comfortably with your feet flat on the floor",
        "Close your eyes or soften your gaze downward",
        "Notice the craving sensation without trying to change it",
        "Observe where you feel it in your body",
        "Breathe naturally and say 'I notice I'm having a craving'",
        "Remind yourself 'This feeling is temporary and will pass'",
        "Focus on your breath, counting each exhale from 1 to 10",
        "If your mind wanders, gently return to counting",
      ],
      duration: "5-15 minutes",
      benefits: ["Increases self-awareness", "Reduces reactivity", "Builds mental resilience", "Promotes acceptance"],
      icon: <Brain className="w-6 h-6" />,
      image: "/placeholder.svg?height=60&width=60",
      color: "bg-indigo-50",
    },
    {
      id: "physical",
      title: "Physical Movement",
      description: "Get your body moving to release endorphins and redirect nervous energy away from cravings.",
      instructions: [
        "Step outside for fresh air if possible",
        "Take a brisk 5-minute walk around your area",
        "Do 20 jumping jacks or dance to your favorite song",
        "Try some gentle stretching or yoga poses",
        "Do wall push-ups or squats",
        "Clean or organize a small area of your space",
        "Focus on how your body feels as you move",
        "Continue until you feel energized and focused",
      ],
      duration: "5-10 minutes",
      benefits: ["Releases endorphins", "Reduces stress", "Improves mood", "Redirects energy"],
      icon: <Footprints className="w-6 h-6" />,
      image: "/placeholder.svg?height=60&width=60",
      color: "bg-orange-50",
    },
    {
      id: "social",
      title: "Connect with Support",
      description: "Reach out to your support network for encouragement and accountability during challenging moments.",
      instructions: [
        "Think of someone who supports your quit journey",
        "Call, text, or video chat with them",
        "Share that you're experiencing a craving",
        "Ask them to talk with you for a few minutes",
        "Join an online quit-smoking support group",
        "Post in a supportive community or forum",
        "Listen to their encouragement and advice",
        "Thank them for their support",
      ],
      duration: "5-15 minutes",
      benefits: ["Provides accountability", "Offers encouragement", "Reduces isolation", "Strengthens relationships"],
      icon: <Phone className="w-6 h-6" />,
      image: "/placeholder.svg?height=60&width=60",
      color: "bg-pink-50",
    },
  ]

  useEffect(() => {
    loadCravings()
    generateDailyActivities()

    // Load completed activities
    const savedCompleted = localStorage.getItem("completedActivities")
    if (savedCompleted) {
      setCompletedActivities(JSON.parse(savedCompleted))
    }
  }, [])

  const loadCravings = () => {
    const savedCravings = localStorage.getItem("cravingEntries")
    if (savedCravings) {
      setCravings(JSON.parse(savedCravings))
    }
  }

  const saveCravings = (newCravings: CravingEntry[]) => {
    setCravings(newCravings)
    localStorage.setItem("cravingEntries", JSON.stringify(newCravings))
    updateUserData({ lastCravingUpdate: Date.now() })
  }

  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0]
  }

  const recordCraving = () => {
    if (selectedIntensity === null) return

    const now = Date.now()
    const intensityData = intensityLevels.find((level) => level.level === selectedIntensity)!

    const craving: CravingEntry = {
      id: `craving_${now}`,
      intensity: selectedIntensity,
      intensityLabel: intensityData.label,
      timestamp: now,
      date: getCurrentDate(),
      time: getCurrentTime(),
    }

    saveCravings([...cravings, craving])
    setSelectedIntensity(null)

    // Start tracking duration
    setCurrentCravingStart(now)
    setIsRecording(true)
  }

  const generateDailyActivities = async () => {
    setIsLoadingActivities(true)
    try {
      const today = getCurrentDate()
      const savedActivities = localStorage.getItem(`dailyActivities_${today}`)

      if (savedActivities) {
        setDailyActivities(JSON.parse(savedActivities))
        setIsLoadingActivities(false)
        return
      }

      const activityPrompts = [
        "Generate a unique 3-5 minute breathing or relaxation technique to help overcome smoking cravings. Make it creative and specific.",
        "Create a quick physical activity or movement exercise (2-5 minutes) that can distract from smoking urges and boost energy.",
        "Design a mental distraction or mindfulness activity (3-7 minutes) that helps redirect thoughts away from smoking cravings.",
      ]

      const generatedActivities: ActivityDetail[] = []

      for (let i = 0; i < 3; i++) {
        try {
          // Generate activity description
          const activityResponse = await fetch(`https://text.pollinations.ai/${encodeURIComponent(activityPrompts[i])}`)
          const activityText = await activityResponse.text()

          // Parse the activity text to extract title and description
          const lines = activityText.split("\n").filter((line) => line.trim())
          const title =
            lines[0]
              ?.replace(/^\d+\.\s*/, "")
              .replace(/^#+\s*/, "")
              .trim() || `Activity ${i + 1}`
          const description = lines.slice(1).join(" ").trim() || activityText

          // Generate image for the activity
          const imagePrompt = `A calming, peaceful illustration representing ${title.toLowerCase()}, soft colors, minimalist style, wellness and health theme`
          const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=200&height=200&model=flux&enhance=true`

          const activity: ActivityDetail = {
            id: `daily_${today}_${i}`,
            title: title.length > 50 ? title.substring(0, 50) + "..." : title,
            description: description.length > 200 ? description.substring(0, 200) + "..." : description,
            instructions: [
              "Find a comfortable and quiet space",
              "Follow the technique described above",
              "Focus on your breathing and stay present",
              "Continue for the recommended duration",
              "Notice how your craving intensity changes",
            ],
            duration: "3-5 minutes",
            benefits: ["Reduces craving intensity", "Promotes relaxation", "Improves focus", "Builds coping skills"],
            icon:
              i === 0 ? (
                <Wind className="w-6 h-6" />
              ) : i === 1 ? (
                <Zap className="w-6 h-6" />
              ) : (
                <Brain className="w-6 h-6" />
              ),
            image: imageUrl,
            color: i === 0 ? "bg-blue-50" : i === 1 ? "bg-green-50" : "bg-purple-50",
          }

          generatedActivities.push(activity)
        } catch (error) {
          console.error(`Error generating activity ${i + 1}:`, error)
          // Fallback activity
          generatedActivities.push({
            id: `daily_${today}_${i}`,
            title: `Daily Activity ${i + 1}`,
            description: "A helpful activity to manage cravings and stay focused on your quit journey.",
            instructions: ["Take deep breaths", "Stay focused", "Remember your goals"],
            duration: "3-5 minutes",
            benefits: ["Reduces stress", "Improves focus"],
            icon: <Brain className="w-6 h-6" />,
            image: "/placeholder.svg?height=200&width=200",
            color: "bg-gray-50",
          })
        }
      }

      setDailyActivities(generatedActivities)
      localStorage.setItem(`dailyActivities_${today}`, JSON.stringify(generatedActivities))
    } catch (error) {
      console.error("Error generating daily activities:", error)
    } finally {
      setIsLoadingActivities(false)
    }
  }

  const completeActivity = (activityTitle: string) => {
    if (currentCravingStart && cravings.length > 0) {
      const duration = Math.round((Date.now() - currentCravingStart) / 1000 / 60)
      const lastCraving = cravings[cravings.length - 1]

      const updatedCravings = cravings.map((craving) =>
        craving.id === lastCraving.id ? { ...craving, duration, copingMethod: activityTitle } : craving,
      )

      saveCravings(updatedCravings)
    }

    // Add to completed activities
    const today = getCurrentDate()
    const completed = [...completedActivities, `${today}_${activityTitle}`]
    setCompletedActivities(completed)
    localStorage.setItem("completedActivities", JSON.stringify(completed))

    setCurrentCravingStart(null)
    setIsRecording(false)
    setShowActivityModal(false)
    setSelectedActivity(null)

    // Show completion message
    setCompletedActivityTitle(activityTitle)
    setShowCompletionMessage(true)

    // Auto-hide completion message after 3 seconds
    setTimeout(() => {
      setShowCompletionMessage(false)
    }, 3000)
  }

  const openActivityModal = (activity: ActivityDetail) => {
    setSelectedActivity(activity)
    setShowActivityModal(true)
  }

  const getTodayCravings = () => {
    const today = getCurrentDate()
    return cravings.filter((craving) => craving.date === today)
  }

  const getAverageIntensity = () => {
    const todayCravings = getTodayCravings()
    if (todayCravings.length === 0) return 0

    const total = todayCravings.reduce((sum, craving) => sum + craving.intensity, 0)
    return Math.round((total / todayCravings.length) * 10) / 10
  }

  const getLastCravingTime = () => {
    const todayCravings = getTodayCravings()
    if (todayCravings.length === 0) return null

    const lastCraving = todayCravings.sort((a, b) => b.timestamp - a.timestamp)[0]
    const hoursAgo = Math.floor((Date.now() - lastCraving.timestamp) / (1000 * 60 * 60))
    const minutesAgo = Math.floor((Date.now() - lastCraving.timestamp) / (1000 * 60)) % 60

    if (hoursAgo > 0) {
      return `${hoursAgo}h ${minutesAgo}m ago`
    } else {
      return `${minutesAgo}m ago`
    }
  }

  const todayCravings = getTodayCravings()
  const averageIntensity = getAverageIntensity()
  const lastCravingTime = getLastCravingTime()

  return (
    <div className="space-y-6">
      {/* Header - Exact match to image */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">🚭 Having a Craving?</h1>
          <p className="text-gray-600 mt-1">Track your craving intensity and try these activities to help it pass</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Current Craving Tracker */}
      {isRecording && (
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <Timer className="w-5 h-5 text-red-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800">Craving in Progress</h3>
                  <p className="text-sm text-red-600">Stay strong! Try an activity below to help it pass.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Intensity Selector - Exact match to image */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">How strong is your craving?</h2>

          <div className="grid grid-cols-5 gap-2 mb-6">
            {intensityLevels.map((level) => (
              <button
                key={level.level}
                onClick={() => setSelectedIntensity(level.level)}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  selectedIntensity === level.level
                    ? `${level.bgColor} ${level.borderColor} scale-105`
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className={`text-2xl mb-2 ${level.color}`}>
                  <Flame className="w-6 h-6 mx-auto" />
                </div>
                <div className="text-xs font-medium">{level.label}</div>
              </button>
            ))}
          </div>

          <Button
            onClick={recordCraving}
            disabled={selectedIntensity === null}
            className="w-full bg-gray-400 hover:bg-gray-500 text-white"
            size="lg"
          >
            Record Craving
          </Button>
        </CardContent>
      </Card>

      {/* Activities Section - AI Generated Daily */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Try These Activities</h2>
            <Button variant="ghost" size="sm" onClick={generateDailyActivities} disabled={isLoadingActivities}>
              <RefreshCw className={`w-4 h-4 ${isLoadingActivities ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {isLoadingActivities ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg border bg-gray-50 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {dailyActivities.map((activity, index) => {
                const isCompleted = completedActivities.includes(`${getCurrentDate()}_${activity.title}`)

                return (
                  <div
                    key={activity.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      isCompleted ? "bg-green-50 border-green-200" : "bg-white"
                    }`}
                    onClick={() => !isCompleted && openActivityModal(activity)}
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={activity.image || "/placeholder.svg"}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${isCompleted ? "text-green-700" : "text-gray-800"}`}>
                        {activity.title}
                      </h3>
                      <p className="text-sm text-gray-600">{activity.duration}</p>
                    </div>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {dailyActivities.length === 0 && !isLoadingActivities && (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Click refresh to generate today's activities</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{todayCravings.length}</div>
            <div className="text-sm text-gray-600">Today's Cravings</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{averageIntensity || "—"}</div>
            <div className="text-sm text-gray-600">Avg Intensity</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-sm font-bold text-green-600">{lastCravingTime || "None today"}</div>
            <div className="text-sm text-gray-600">Last Craving</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Cravings */}
      {todayCravings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Today's Craving History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayCravings
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 5)
                .map((craving) => {
                  const intensityData = intensityLevels.find((level) => level.level === craving.intensity)!
                  return (
                    <div key={craving.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${intensityData.bgColor}`}>
                          <Flame className={`w-4 h-4 ${intensityData.color}`} />
                        </div>
                        <div>
                          <div className="font-medium">{craving.intensityLabel}</div>
                          <div className="text-sm text-gray-600">{craving.time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        {craving.duration && <div className="text-sm text-gray-600">{craving.duration}m duration</div>}
                        {craving.copingMethod && (
                          <Badge variant="secondary" className="text-xs">
                            {craving.copingMethod}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Detail Modal */}
      {showActivityModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {selectedActivity.icon}
                  {selectedActivity.title}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowActivityModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-lg ${selectedActivity.color}`}>
                <p className="text-gray-700">{selectedActivity.description}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Instructions:</h3>
                <ol className="space-y-2">
                  {selectedActivity.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Benefits:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedActivity.benefits.map((benefit, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Duration: {selectedActivity.duration}</span>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => completeActivity(selectedActivity.title)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Activity
                </Button>
                <Button onClick={() => setShowActivityModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-4 text-center">
          <TrendingDown className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-800 mb-2">Remember: Cravings Pass</h3>
          <p className="text-sm text-gray-600">
            Most cravings last only 3-5 minutes. You're on day {daysSinceQuit} - you've got this! 💪
          </p>
        </CardContent>
      </Card>

      {/* Completion Message */}
      {showCompletionMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-700 mb-2">Activity Completed! 🎉</h3>
              <p className="text-gray-600 mb-4">
                Great job completing "{completedActivityTitle}"! You're building strong coping skills.
              </p>
              <div className="text-sm text-gray-500">This message will close automatically...</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
