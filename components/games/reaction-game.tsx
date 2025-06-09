"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"

interface ReactionGameProps {
  onComplete: () => void
}

export default function ReactionGame({ onComplete }: ReactionGameProps) {
  const [gameState, setGameState] = useState<"waiting" | "ready" | "go" | "result">("waiting")
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number>(0)

  const startGame = () => {
    setGameState("ready")
    const delay = Math.random() * 3000 + 2000 // 2-5 seconds

    setTimeout(() => {
      setGameState("go")
      setStartTime(Date.now())
    }, delay)
  }

  const handleClick = () => {
    if (gameState === "go") {
      const time = Date.now() - startTime
      setReactionTime(time)
      setGameState("result")
      onComplete()
    } else if (gameState === "ready") {
      setGameState("waiting")
      alert("Too early! Wait for the green signal.")
    }
  }

  const resetGame = () => {
    setGameState("waiting")
    setReactionTime(null)
  }

  const getPerformanceMessage = () => {
    if (!reactionTime) return ""
    if (reactionTime < 200) return "Lightning Fast! ⚡"
    if (reactionTime < 300) return "Excellent! 🎯"
    if (reactionTime < 400) return "Very Good! 👍"
    if (reactionTime < 500) return "Good! 😊"
    return "Keep practicing! 💪"
  }

  const getPerformanceColor = () => {
    if (!reactionTime) return "from-gray-400 to-gray-500"
    if (reactionTime < 200) return "from-yellow-400 to-orange-500"
    if (reactionTime < 300) return "from-green-400 to-emerald-500"
    if (reactionTime < 400) return "from-blue-400 to-cyan-500"
    if (reactionTime < 500) return "from-purple-400 to-violet-500"
    return "from-red-400 to-pink-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Zap className="w-6 h-6" />
            <span>Reaction Time Test</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div
              className={`h-64 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-xl ${
                gameState === "waiting"
                  ? "bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400"
                  : gameState === "ready"
                    ? "bg-gradient-to-br from-red-400 to-red-600 animate-pulse"
                    : gameState === "go"
                      ? "bg-gradient-to-br from-green-400 to-green-600 animate-bounce"
                      : `bg-gradient-to-br ${getPerformanceColor()}`
              }`}
              onClick={handleClick}
            >
              {gameState === "waiting" && (
                <div className="text-center">
                  <div className="text-4xl mb-4">⚡</div>
                  <p className="text-gray-700 font-semibold text-lg">Click to start</p>
                  <p className="text-gray-600 text-sm mt-2">Test your reflexes!</p>
                </div>
              )}
              {gameState === "ready" && (
                <div className="text-center">
                  <div className="text-4xl mb-4">🔴</div>
                  <p className="text-white font-bold text-xl">Wait for green...</p>
                  <p className="text-red-100 text-sm mt-2">Don't click yet!</p>
                </div>
              )}
              {gameState === "go" && (
                <div className="text-center">
                  <div className="text-4xl mb-4">🟢</div>
                  <p className="text-white font-bold text-2xl">CLICK NOW!</p>
                  <p className="text-green-100 text-sm mt-2">As fast as you can!</p>
                </div>
              )}
              {gameState === "result" && (
                <div className="text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <p className="text-white font-bold text-3xl">{reactionTime}ms</p>
                  <p className="text-white text-lg mt-2">{getPerformanceMessage()}</p>
                </div>
              )}
            </div>

            {gameState === "waiting" && (
              <Button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                size="lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Reaction Test
              </Button>
            )}

            {gameState === "result" && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-lg">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">Performance Analysis</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-blue-600 font-semibold">Your Time</div>
                      <div className="text-2xl font-bold text-gray-800">{reactionTime}ms</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-600 font-semibold">Rating</div>
                      <div className="text-lg font-bold text-gray-800">{getPerformanceMessage()}</div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={resetGame}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Instructions */}
            <div className="p-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl shadow-lg">
              <h3 className="font-bold text-orange-800 mb-2">How to Play</h3>
              <ul className="text-sm text-orange-700 space-y-1 text-left">
                <li>• Click "Start" to begin the test</li>
                <li>• Wait for the red screen to turn green</li>
                <li>• Click as fast as possible when you see green</li>
                <li>• Try to get the fastest reaction time!</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
