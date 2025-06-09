"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface BreathingGameProps {
  onComplete: () => void
}

export default function BreathingGame({ onComplete }: BreathingGameProps) {
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale")
  const [cycle, setCycle] = useState(0)
  const [timeLeft, setTimeLeft] = useState(4)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (phase === "inhale") {
              setPhase("hold")
              return 4
            } else if (phase === "hold") {
              setPhase("exhale")
              return 4
            } else {
              setPhase("inhale")
              setCycle((c) => {
                const newCycle = c + 1
                if (newCycle >= 5) {
                  setIsActive(false)
                  onComplete()
                }
                return newCycle
              })
              return 4
            }
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isActive, phase, onComplete])

  const startBreathing = () => {
    setIsActive(true)
    setCycle(0)
    setPhase("inhale")
    setTimeLeft(4)
  }

  const stopBreathing = () => {
    setIsActive(false)
    setCycle(0)
    setPhase("inhale")
    setTimeLeft(4)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Breathing Exercise</CardTitle>
        <p className="text-sm text-gray-600">Follow the breathing pattern to relax and reduce cravings</p>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-6">
          <div className="relative">
            <div
              className={`w-32 h-32 mx-auto rounded-full transition-all duration-1000 flex items-center justify-center ${
                phase === "inhale"
                  ? "bg-blue-200 scale-110"
                  : phase === "hold"
                    ? "bg-purple-200 scale-110"
                    : "bg-green-200 scale-90"
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{phase === "inhale" ? "🫁" : phase === "hold" ? "⏸️" : "💨"}</div>
                <div className="font-bold text-lg">{timeLeft}</div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-lg font-semibold capitalize mb-2">
              {phase === "inhale" ? "Breathe In" : phase === "hold" ? "Hold" : "Breathe Out"}
            </p>
            <p className="text-sm text-gray-600">Cycle {cycle}/5</p>
          </div>

          {!isActive ? (
            <Button onClick={startBreathing} className="w-full">
              Start Breathing Exercise
            </Button>
          ) : (
            <Button onClick={stopBreathing} variant="outline" className="w-full">
              Stop Exercise
            </Button>
          )}

          {cycle >= 5 && !isActive && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">✨</div>
              <p className="text-green-700 font-semibold">Well done!</p>
              <p className="text-sm text-green-600">You've completed a full breathing session</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
