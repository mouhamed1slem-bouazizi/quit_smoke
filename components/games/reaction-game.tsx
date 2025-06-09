"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reaction Time Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <div
            className={`h-32 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
              gameState === "waiting"
                ? "bg-gray-200"
                : gameState === "ready"
                  ? "bg-red-200"
                  : gameState === "go"
                    ? "bg-green-200"
                    : "bg-blue-200"
            }`}
            onClick={handleClick}
          >
            {gameState === "waiting" && (
              <div>
                <div className="text-2xl mb-2">⚡</div>
                <p>Click to start</p>
              </div>
            )}
            {gameState === "ready" && (
              <div>
                <div className="text-2xl mb-2">🔴</div>
                <p>Wait for green...</p>
              </div>
            )}
            {gameState === "go" && (
              <div>
                <div className="text-2xl mb-2">🟢</div>
                <p className="font-bold">CLICK NOW!</p>
              </div>
            )}
            {gameState === "result" && (
              <div>
                <div className="text-2xl mb-2">🎯</div>
                <p className="font-bold">{reactionTime}ms</p>
                <p className="text-sm">
                  {reactionTime! < 300 ? "Excellent!" : reactionTime! < 500 ? "Good!" : "Keep practicing!"}
                </p>
              </div>
            )}
          </div>

          {gameState === "waiting" && (
            <Button onClick={startGame} className="w-full">
              Start Test
            </Button>
          )}

          {gameState === "result" && (
            <Button onClick={resetGame} className="w-full">
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
