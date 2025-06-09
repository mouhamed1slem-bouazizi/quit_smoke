"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Palette, RotateCcw } from "lucide-react"

interface ColorMemoryGameProps {
  onComplete: () => void
}

export default function ColorMemoryGame({ onComplete }: ColorMemoryGameProps) {
  const [sequence, setSequence] = useState<number[]>([])
  const [playerSequence, setPlayerSequence] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPlayerTurn, setIsPlayerTurn] = useState(false)
  const [gameState, setGameState] = useState<"waiting" | "showing" | "playing" | "success" | "failed">("waiting")
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [showSpeed, setShowSpeed] = useState(600)
  const [colorCount, setColorCount] = useState(4)
  const [activeColor, setActiveColor] = useState<number | null>(null)

  const allColors = [
    { id: 0, color: "bg-red-500", activeColor: "bg-red-300", name: "Red" },
    { id: 1, color: "bg-blue-500", activeColor: "bg-blue-300", name: "Blue" },
    { id: 2, color: "bg-green-500", activeColor: "bg-green-300", name: "Green" },
    { id: 3, color: "bg-yellow-500", activeColor: "bg-yellow-300", name: "Yellow" },
    { id: 4, color: "bg-purple-500", activeColor: "bg-purple-300", name: "Purple" },
    { id: 5, color: "bg-pink-500", activeColor: "bg-pink-300", name: "Pink" },
    { id: 6, color: "bg-orange-500", activeColor: "bg-orange-300", name: "Orange" },
    { id: 7, color: "bg-cyan-500", activeColor: "bg-cyan-300", name: "Cyan" },
    { id: 8, color: "bg-indigo-500", activeColor: "bg-indigo-300", name: "Indigo" },
  ]

  const getCurrentColors = () => {
    return allColors.slice(0, colorCount)
  }

  const updateDifficulty = (currentLevel: number) => {
    const newColorCount = Math.min(4 + Math.floor((currentLevel - 1) / 10), 9)
    setColorCount(newColorCount)

    const newShowSpeed = Math.max(200, 600 - Math.floor((currentLevel - 1) / 5) * 50)
    setShowSpeed(newShowSpeed)
  }

  const startGame = () => {
    setLevel(1)
    setScore(0)
    setLives(3)
    setSequence([])
    setPlayerSequence([])
    setGameState("waiting")
    setColorCount(4)
    setShowSpeed(600)
    nextLevel()
  }

  const nextLevel = () => {
    updateDifficulty(level)

    const sequenceLength = Math.min(3 + level, 20)
    const newSequence = []

    for (let i = 0; i < sequenceLength; i++) {
      newSequence.push(Math.floor(Math.random() * colorCount))
    }

    setSequence(newSequence)
    setPlayerSequence([])
    setIsPlayerTurn(false)
    setGameState("showing")
    playSequence(newSequence)
  }

  const playSequence = async (seq: number[]) => {
    setIsPlaying(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    for (let i = 0; i < seq.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, showSpeed))
      setActiveColor(seq[i])
      await new Promise((resolve) => setTimeout(resolve, Math.max(200, showSpeed - 100)))
      setActiveColor(null)
    }

    setIsPlaying(false)
    setIsPlayerTurn(true)
    setGameState("playing")
  }

  const handleColorClick = (colorId: number) => {
    if (!isPlayerTurn || isPlaying) return

    const newPlayerSequence = [...playerSequence, colorId]
    setPlayerSequence(newPlayerSequence)

    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[playerSequence.length]) {
      const newLives = lives - 1
      setLives(newLives)

      if (newLives <= 0) {
        setGameState("failed")
        setIsPlayerTurn(false)
        return
      } else {
        setPlayerSequence([])
        setTimeout(() => {
          playSequence(sequence)
        }, 1000)
        return
      }
    }

    if (newPlayerSequence.length === sequence.length) {
      const levelBonus = level * 10
      const speedBonus = Math.floor((700 - showSpeed) / 10)
      const colorBonus = (colorCount - 4) * 5
      const newScore = score + levelBonus + speedBonus + colorBonus

      setScore(newScore)
      setLevel(level + 1)
      setGameState("success")
      setIsPlayerTurn(false)

      if (level >= 100) {
        setTimeout(() => {
          onComplete()
        }, 2000)
      } else {
        setTimeout(() => {
          nextLevel()
        }, 1500)
      }
    }
  }

  const resetGame = () => {
    setSequence([])
    setPlayerSequence([])
    setIsPlaying(false)
    setIsPlayerTurn(false)
    setGameState("waiting")
    setLevel(1)
    setScore(0)
    setLives(3)
    setActiveColor(null)
    setColorCount(4)
    setShowSpeed(600)
  }

  const getDifficultyInfo = () => {
    if (level <= 10) return "Beginner"
    if (level <= 25) return "Easy"
    if (level <= 50) return "Medium"
    if (level <= 75) return "Hard"
    return "Master"
  }

  const currentColors = getCurrentColors()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            <span>Color Memory</span>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">Level: {level}/100</Badge>
            <Badge variant="outline">Score: {score}</Badge>
            <Button size="sm" variant="outline" onClick={resetGame}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Game Info */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-gray-50 rounded">
              <div className="text-xs text-gray-600">Difficulty</div>
              <div className="font-semibold text-sm">{getDifficultyInfo()}</div>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <div className="text-xs text-gray-600">Lives</div>
              <div className="font-semibold text-sm">
                {"❤️".repeat(lives)}
                {"🤍".repeat(3 - lives)}
              </div>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <div className="text-xs text-gray-600">Sequence</div>
              <div className="font-semibold text-sm">{sequence.length} colors</div>
            </div>
          </div>

          {/* Game Status */}
          <div className="text-center">
            {gameState === "waiting" && <p className="text-gray-600">Watch the sequence, then repeat it perfectly!</p>}
            {gameState === "showing" && (
              <div>
                <p className="text-blue-600 font-semibold">Watch carefully...</p>
                <p className="text-xs text-gray-500">
                  Speed: {showSpeed}ms | Colors: {colorCount}
                </p>
              </div>
            )}
            {gameState === "playing" && (
              <div>
                <p className="text-green-600 font-semibold">Your turn! Repeat the sequence</p>
                <p className="text-xs text-gray-500">
                  {playerSequence.length}/{sequence.length} correct
                </p>
              </div>
            )}
            {gameState === "success" && (
              <div>
                <p className="text-green-700 font-semibold">Perfect! 🎉</p>
                <p className="text-sm text-gray-600">
                  {level > 100 ? "GAME COMPLETED!" : `Advancing to level ${level}...`}
                </p>
              </div>
            )}
            {gameState === "failed" && (
              <div>
                <p className="text-red-700 font-semibold">Game Over! 💔</p>
                <p className="text-sm text-gray-600">You reached level {level - 1}</p>
              </div>
            )}
          </div>

          {/* Color Grid */}
          <div
            className={`grid gap-3 ${colorCount <= 4 ? "grid-cols-2" : colorCount <= 6 ? "grid-cols-3" : "grid-cols-3"}`}
          >
            {currentColors.map((color) => (
              <button
                key={color.id}
                className={`h-16 rounded-lg transition-all duration-200 ${
                  activeColor === color.id ? color.activeColor : color.color
                } ${isPlayerTurn && !isPlaying ? "hover:opacity-80 cursor-pointer" : "cursor-default"} ${
                  activeColor === color.id ? "scale-95 shadow-lg ring-2 ring-white" : ""
                }`}
                onClick={() => handleColorClick(color.id)}
                disabled={!isPlayerTurn || isPlaying}
              >
                <span className="text-white font-semibold text-sm">{color.name}</span>
              </button>
            ))}
          </div>

          {/* Progress */}
          {sequence.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sequence Progress:</span>
                <span>
                  {playerSequence.length}/{sequence.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(playerSequence.length / sequence.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Overall Progress to Level 100 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress:</span>
              <span>{level}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(level / 100) * 100}%` }}
              />
            </div>
          </div>

          {/* Start/Restart Button */}
          {gameState === "waiting" && (
            <Button onClick={startGame} className="w-full">
              Start Challenge (100 Levels)
            </Button>
          )}

          {gameState === "failed" && (
            <Button onClick={startGame} className="w-full">
              Try Again
            </Button>
          )}

          {level > 100 && gameState === "success" && (
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
              <div className="text-3xl mb-2">👑</div>
              <p className="text-purple-700 font-bold text-lg">LEGENDARY MASTER!</p>
              <p className="text-sm text-purple-600">You completed all 100 levels!</p>
              <p className="text-xs text-gray-600 mt-2">Final Score: {score} points</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
