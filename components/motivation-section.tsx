"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, RefreshCw } from "lucide-react"

interface MotivationSectionProps {
  daysSinceQuit: number
}

export default function MotivationSection({ daysSinceQuit }: MotivationSectionProps) {
  const [motivationMessage, setMotivationMessage] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    generateMotivationMessage()
  }, [daysSinceQuit])

  const generateMotivationMessage = async () => {
    setIsLoading(true)
    try {
      let prompt = ""
      if (daysSinceQuit === 0) {
        prompt =
          "Generate an inspiring and encouraging message for someone who just started their journey to quit smoking today. Make it hopeful and motivating."
      } else if (daysSinceQuit < 7) {
        prompt = `Generate an uplifting motivational message for someone who has been smoke-free for ${daysSinceQuit} days. Acknowledge their progress and encourage them to keep going.`
      } else if (daysSinceQuit < 30) {
        prompt = `Create an inspiring message for someone who has been smoke-free for ${daysSinceQuit} days. Celebrate their achievement and motivate them for the journey ahead.`
      } else {
        prompt = `Write a congratulatory and motivating message for someone who has been smoke-free for ${daysSinceQuit} days. Highlight their incredible achievement and inspire continued success.`
      }

      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`)
      const text = await response.text()
      setMotivationMessage(text)
    } catch (error) {
      console.error("Error generating motivation message:", error)
      setMotivationMessage("You're doing amazing! Every smoke-free day is a victory. Keep going strong! 💪")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-purple-800 dark:text-purple-200">
          <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Daily Motivation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-purple-100 dark:border-purple-700">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-5 h-5 animate-spin text-purple-600 dark:text-purple-400" />
                <span className="ml-2 text-gray-600 dark:text-gray-300">Generating your message...</span>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{motivationMessage}</p>
            )}
          </div>

          <Button
            onClick={generateMotivationMessage}
            variant="outline"
            size="sm"
            className="w-full border-purple-200 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30"
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            New Message
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
