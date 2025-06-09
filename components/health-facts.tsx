"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, RefreshCw, TrendingUp, Zap, Shield } from "lucide-react"

interface HealthFactsProps {
  daysSinceQuit: number
}

export default function HealthFacts({ daysSinceQuit }: HealthFactsProps) {
  const [healthFact, setHealthFact] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [factCategory, setFactCategory] = useState<"immediate" | "short" | "long" | "benefits">("immediate")

  useEffect(() => {
    generateHealthFact()
  }, [daysSinceQuit])

  const generateHealthFact = async (category?: "immediate" | "short" | "long" | "benefits") => {
    setIsLoading(true)
    const selectedCategory = category || getRecommendedCategory()
    setFactCategory(selectedCategory)

    try {
      let prompt = ""

      switch (selectedCategory) {
        case "immediate":
          prompt = `Generate a short, medically accurate health fact about the immediate benefits (within hours to days) of quitting smoking for someone who has been smoke-free for ${daysSinceQuit} days. Focus on what's happening in their body right now. Include specific timeframes and be encouraging.`
          break
        case "short":
          prompt = `Generate a short, medically accurate health fact about the short-term benefits (weeks to months) of quitting smoking for someone who has been smoke-free for ${daysSinceQuit} days. Focus on improvements they can feel and notice. Be specific and motivating.`
          break
        case "long":
          prompt = `Generate a short, medically accurate health fact about the long-term benefits (months to years) of quitting smoking for someone who has been smoke-free for ${daysSinceQuit} days. Focus on major health improvements and disease risk reduction. Be inspiring and factual.`
          break
        case "benefits":
          prompt = `Generate an inspiring health fact about the overall benefits and positive changes from quitting smoking for someone who has been smoke-free for ${daysSinceQuit} days. Include both physical and mental health improvements. Make it uplifting and comprehensive.`
          break
      }

      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`)
      const text = await response.text()
      setHealthFact(text)
    } catch (error) {
      console.error("Error generating health fact:", error)

      // Enhanced fallback facts based on days and category
      const fallbackFacts = getFallbackFacts(daysSinceQuit, selectedCategory)
      setHealthFact(fallbackFacts)
    } finally {
      setIsLoading(false)
    }
  }

  const getRecommendedCategory = () => {
    if (daysSinceQuit < 7) return "immediate"
    if (daysSinceQuit < 90) return "short"
    if (daysSinceQuit < 365) return "long"
    return "benefits"
  }

  const getFallbackFacts = (days: number, category: string) => {
    const factsByCategory = {
      immediate: {
        0: "Within 20 minutes of quitting, your heart rate and blood pressure drop to normal levels.",
        1: "After 24 hours, your risk of heart attack begins to decrease and carbon monoxide levels normalize.",
        3: "After 72 hours, your bronchial tubes relax and breathing becomes easier.",
        7: "After 1 week, your sense of taste and smell start to improve significantly.",
      },
      short: {
        14: "After 2 weeks, your circulation improves and walking becomes easier.",
        30: "After 1 month, your lung function begins to improve and coughing decreases significantly.",
        60: "After 2 months, your immune system strengthens and you get sick less often.",
        90: "After 3 months, your lung capacity increases by up to 30%.",
      },
      long: {
        180: "After 6 months, your risk of respiratory infections drops dramatically.",
        365: "After 1 year, your risk of heart disease is cut in half compared to a smoker.",
        730: "After 2 years, your risk of stroke returns to that of a non-smoker.",
        1825: "After 5 years, your risk of lung cancer is reduced by 50%.",
      },
      benefits: {
        0: "Quitting smoking is the single best thing you can do for your health!",
        30: "Your body is healing itself every day you stay smoke-free!",
        365: "You've given yourself the gift of better health and longer life!",
        1825: "You've dramatically reduced your risk of cancer, heart disease, and stroke!",
      },
    }

    const categoryFacts = factsByCategory[category as keyof typeof factsByCategory]
    const closestDay = Object.keys(categoryFacts)
      .map(Number)
      .reduce((prev, curr) => (Math.abs(curr - days) < Math.abs(prev - days) ? curr : prev))

    return categoryFacts[closestDay as keyof typeof categoryFacts]
  }

  const getCategoryInfo = (category: string) => {
    const categoryData = {
      immediate: {
        title: "Immediate Benefits",
        icon: <Zap className="w-5 h-5 text-yellow-500" />,
        color: "from-yellow-50 to-orange-50",
        borderColor: "border-yellow-200",
      },
      short: {
        title: "Short-term Benefits",
        icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
        color: "from-blue-50 to-cyan-50",
        borderColor: "border-blue-200",
      },
      long: {
        title: "Long-term Benefits",
        icon: <Shield className="w-5 h-5 text-green-500" />,
        color: "from-green-50 to-emerald-50",
        borderColor: "border-green-200",
      },
      benefits: {
        title: "Overall Benefits",
        icon: <Heart className="w-5 h-5 text-red-500" />,
        color: "from-red-50 to-pink-50",
        borderColor: "border-red-200",
      },
    }
    return categoryData[category as keyof typeof categoryData]
  }

  const currentCategoryInfo = getCategoryInfo(factCategory)

  return (
    <Card className={`bg-gradient-to-r ${currentCategoryInfo.color} ${currentCategoryInfo.borderColor}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {currentCategoryInfo.icon}
          Health Insight: {currentCategoryInfo.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Category Selection Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => generateHealthFact("immediate")}
              variant={factCategory === "immediate" ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              <Zap className="w-3 h-3 mr-1" />
              Immediate
            </Button>
            <Button
              onClick={() => generateHealthFact("short")}
              variant={factCategory === "short" ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Short-term
            </Button>
            <Button
              onClick={() => generateHealthFact("long")}
              variant={factCategory === "long" ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              <Shield className="w-3 h-3 mr-1" />
              Long-term
            </Button>
            <Button
              onClick={() => generateHealthFact("benefits")}
              variant={factCategory === "benefits" ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              <Heart className="w-3 h-3 mr-1" />
              Overall
            </Button>
          </div>

          {/* Health Fact Display */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-5 h-5 animate-spin text-gray-500" />
                <span className="ml-2 text-gray-600">Generating health insight...</span>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 leading-relaxed mb-3">{healthFact}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Day {daysSinceQuit} of your smoke-free journey</span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-red-400" />
                    AI-powered
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => generateHealthFact(factCategory)}
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Fact
            </Button>
            <Button
              onClick={() => generateHealthFact()}
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={isLoading}
            >
              <Heart className="w-4 h-4 mr-2" />
              Surprise Me
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600">Your body is healing every day</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
