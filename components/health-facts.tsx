"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, RefreshCw } from "lucide-react"

interface HealthFactsProps {
  daysSinceQuit: number
}

export default function HealthFacts({ daysSinceQuit }: HealthFactsProps) {
  const [healthFact, setHealthFact] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    generateHealthFact()
  }, [daysSinceQuit])

  const generateHealthFact = async () => {
    setIsLoading(true)
    try {
      const prompt = `Generate a short, medically accurate health fact about the benefits of quitting smoking for someone who has been smoke-free for ${daysSinceQuit} days. Include specific health improvements and timeline information. Keep it encouraging and factual.`

      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`)
      const text = await response.text()
      setHealthFact(text)
    } catch (error) {
      console.error("Error generating health fact:", error)

      // Fallback facts based on days
      const fallbackFacts = {
        0: "Within 20 minutes of quitting, your heart rate and blood pressure drop.",
        1: "After 24 hours, your risk of heart attack begins to decrease.",
        7: "After 1 week, your sense of taste and smell start to improve.",
        30: "After 1 month, your lung function begins to improve and coughing decreases.",
        365: "After 1 year, your risk of heart disease is cut in half compared to a smoker.",
      }

      const closestDay = Object.keys(fallbackFacts)
        .map(Number)
        .reduce((prev, curr) => (Math.abs(curr - daysSinceQuit) < Math.abs(prev - daysSinceQuit) ? curr : prev))

      setHealthFact(fallbackFacts[closestDay as keyof typeof fallbackFacts])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-gradient-to-r from-red-50 to-pink-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Health Insight
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-5 h-5 animate-spin text-red-500" />
                <span className="ml-2 text-gray-600">Loading health fact...</span>
              </div>
            ) : (
              <p className="text-gray-700 leading-relaxed">{healthFact}</p>
            )}
          </div>

          <Button onClick={generateHealthFact} variant="outline" size="sm" className="w-full" disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            New Health Fact
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
