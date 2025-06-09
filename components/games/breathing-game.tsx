"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Play, Square } from "lucide-react"

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

  const getPhaseColor = () => {
    switch (phase) {
      case "inhale":
        return "from-blue-400 to-cyan-500"
      case "hold":
        return "from-purple-400 to-violet-500"
      case "exhale":
        return "from-green-400 to-emerald-500"
      default:
        return "from-gray-400 to-gray-500"
    }
  }

  const getPhaseIcon = () => {
    switch (phase) {
      case "inhale":
        return "🫁"
      case "hold":
        return "⏸️"
      case "exhale":
        return "💨"
      default:
        return "🫁"
    }
  }

  const getPhaseInstruction = () => {
    switch (phase) {
      case "inhale":
        return "Breathe In Slowly"
      case "hold":
        return "Hold Your Breath"
      case "exhale":
        return "Breathe Out Gently"
      default:
        return "Breathe In"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Heart className="w-6 h-6" />
            <span>Breathing Exercise</span>
          </CardTitle>
          <p className="text-blue-100 text-sm">Follow the breathing pattern to relax and reduce cravings</p>
        </CardHeader>

        <CardContent className="p-8">
          <div className="text-center space-y-8">
            {/* Breathing Circle */}
            <div className="relative flex justify-center">
              <div
                className={`w-48 h-48 rounded-full transition-all duration-1000 flex items-center justify-center shadow-2xl bg-gradient-to-br ${getPhaseColor()} ${
                  phase === "inhale"
                    ? "scale-110 shadow-blue-300/50"
                    : phase === "hold"
                      ? "scale-110 shadow-purple-300/50"
                      : "scale-90 shadow-green-300/50"
                }`}
              >
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">{getPhaseIcon()}</div>
                  <div className="font-bold text-2xl">{timeLeft}</div>
                  <div className="text-sm opacity-90">seconds</div>
                </div>
              </div>

              {/* Breathing rings */}
              <div
                className={`absolute inset-0 rounded-full border-4 border-white/30 animate-ping ${isActive ? "block" : "hidden"}`}
              />
              <div
                className={`absolute inset-4 rounded-full border-2 border-white/20 animate-pulse ${isActive ? "block" : "hidden"}`}
              />
            </div>

            {/* Phase Instruction */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">{getPhaseInstruction()}</h2>
              <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-lg">
                <p className="text-lg font-semibold text-gray-700">Cycle {cycle}/5</p>
                <div className="w-full bg-white/50 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(cycle / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Controls */}
            {!isActive ? (
              <Button
                onClick={startBreathing}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Breathing Exercise
              </Button>
            ) : (
              <Button
                onClick={stopBreathing}
                variant="outline"
                className="w-full border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                size="lg"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop Exercise
              </Button>
            )}

            {/* Completion Message */}
            {cycle >= 5 && !isActive && (
              <div className="p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl shadow-lg border-2 border-green-200">
                <div className="text-3xl mb-3">✨</div>
                <p className="text-green-700 font-bold text-lg">Well done!</p>
                <p className="text-green-600">You've completed a full breathing session</p>
                <p className="text-green-500 text-sm mt-2">Take a moment to notice how you feel</p>
              </div>
            )}

            {/* Benefits Info */}
            <div className="p-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl shadow-lg">
              <h3 className="font-bold text-orange-800 mb-2">Benefits of Deep Breathing</h3>
              <ul className="text-sm text-orange-700 space-y-1 text-left">
                <li>• Reduces stress and anxiety</li>
                <li>• Helps manage cravings</li>
                <li>• Improves focus and clarity</li>
                <li>• Promotes relaxation</li>
                <li>• Supports better sleep</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
