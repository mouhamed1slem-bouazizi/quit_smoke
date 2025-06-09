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
    {
      id: 0,
      color: "from-red-400 to-red-600",
      activeColor: "from-red-200 to-red-400",
      name: "Red",
      shadow: "shadow-red-300",
    },
    {
      id: 1,
      color: "from-blue-400 to-blue-600",
      activeColor: "from-blue-200 to-blue-400",
      name: "Blue",
      shadow: "shadow-blue-300",
    },
    {
      id: 2,
      color: "from-green-400 to-green-600",
      activeColor: "from-green-200 to-green-400",
      name: "Green",
      shadow: "shadow-green-300",
    },
    {
      id: 3,
      color: "from-yellow-400 to-yellow-600",
      activeColor: "from-yellow-200 to-yellow-400",
      name: "Yellow",
      shadow: "shadow-yellow-300",
    },
    {
      id: 4,
      color: "from-purple-400 to-purple-600",
      activeColor: "from-purple-200 to-purple-400",
      name: "Purple",
      shadow: "shadow-purple-300",
    },
    {
      id: 5,
      color: "from-pink-400 to-pink-600",
      activeColor: "from-pink-200 to-pink-400",
      name: "Pink",
      shadow: "shadow-pink-300",
    },
    {
      id: 6,
      color: "from-orange-400 to-orange-600",
      activeColor: "from-orange-200 to-orange-400",
      name: "Orange",
      shadow: "shadow-orange-300",
    },
    {
      id: 7,
      color: "from-cyan-400 to-cyan-600",
      activeColor: "from-cyan-200 to-cyan-400",
      name: "Cyan",
      shadow: "shadow-cyan-300",
    },
    {
      id: 8,
      color: "from-indigo-400 to-indigo-600",
      activeColor: "from-indigo-200 to-indigo-400",
      name: "Indigo",
      shadow: "shadow-indigo-300",
    },
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Color Memory</h2>
                <p className="text-blue-100 text-sm">Watch, remember, repeat!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">Level: {level}/100</Badge>
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">Score: {score}</Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetGame}
                className="text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Game Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
              <div className="text-xs text-blue-600 font-medium mb-1">Difficulty</div>
              <div className="font-bold text-lg text-blue-800">{getDifficultyInfo()}</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100 shadow-sm">
              <div className="text-xs text-red-600 font-medium mb-1">Lives</div>
              <div className="font-bold text-lg">
                {"❤️".repeat(lives)}
                {"🤍".repeat(3 - lives)}
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 shadow-sm">
              <div className="text-xs text-green-600 font-medium mb-1">Sequence</div>
              <div className="font-bold text-lg text-green-800">{sequence.length} colors</div>
            </div>
          </div>

          {/* Game Status */}
          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            {gameState === "waiting" && (
              <p className="text-purple-700 font-medium">Watch the sequence, then repeat it perfectly!</p>
            )}
            {gameState === "showing" && (
              <div>
                <p className="text-blue-700 font-bold text-lg mb-2">✨ Watch carefully...</p>
                <p className="text-sm text-blue-600">
                  Speed: {showSpeed}ms | Colors: {colorCount}
                </p>
              </div>
            )}
            {gameState === "playing" && (
              <div>
                <p className="text-green-700 font-bold text-lg mb-2">🎯 Your turn! Repeat the sequence</p>
                <p className="text-sm text-green-600">
                  Progress: {playerSequence.length}/{sequence.length} correct
                </p>
              </div>
            )}
            {gameState === "success" && (
              <div>
                <p className="text-green-700 font-bold text-xl mb-2">🎉 Perfect!</p>
                <p className="text-green-600">{level > 100 ? "GAME COMPLETED!" : `Advancing to level ${level}...`}</p>
              </div>
            )}
            {gameState === "failed" && (
              <div>
                <p className="text-red-700 font-bold text-xl mb-2">💔 Game Over!</p>
                <p className="text-red-600">You reached level {level - 1}</p>
              </div>
            )}
          </div>

          {/* Color Grid */}
          <div
            className={`grid gap-4 ${colorCount <= 4 ? "grid-cols-2" : colorCount <= 6 ? "grid-cols-3" : "grid-cols-3"}`}
          >
            {currentColors.map((color) => (
              <button
                key={color.id}
                className={`h-20 rounded-2xl transition-all duration-300 transform ${
                  activeColor === color.id
                    ? `bg-gradient-to-br ${color.activeColor} scale-95 shadow-2xl ${color.shadow}/50 ring-4 ring-white`
                    : `bg-gradient-to-br ${color.color} hover:scale-105 shadow-lg hover:shadow-xl ${color.shadow}/30`
                } ${isPlayerTurn && !isPlaying ? "cursor-pointer hover:shadow-2xl" : "cursor-default"} ${
                  activeColor === color.id ? "animate-pulse" : ""
                }`}
                onClick={() => handleColorClick(color.id)}
                disabled={!isPlayerTurn || isPlaying}
              >
                <span className="text-white font-bold text-lg drop-shadow-lg">{color.name}</span>
              </button>
            ))}
          </div>

          {/* Progress */}
          {sequence.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <span>Sequence Progress:</span>
                <span>
                  {playerSequence.length}/{sequence.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${(playerSequence.length / sequence.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Overall Progress to Level 100 */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium text-gray-700">
              <span>Overall Progress:</span>
              <span>{level}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${(level / 100) * 100}%` }}
              />
            </div>
          </div>

          {/* Start/Restart Button */}
          {gameState === "waiting" && (
            <Button
              onClick={startGame}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🚀 Start Challenge (100 Levels)
            </Button>
          )}

          {gameState === "failed" && (
            <Button
              onClick={startGame}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🔄 Try Again
            </Button>
          )}

          {level > 100 && gameState === "success" && (
            <div className="text-center p-6 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl border-2 border-yellow-200 shadow-xl">
              <div className="text-6xl mb-4 animate-bounce">👑</div>
              <p className="text-yellow-700 font-bold text-2xl mb-2">LEGENDARY MASTER!</p>
              <p className="text-yellow-600 text-lg mb-2">You completed all 100 levels!</p>
              <p className="text-gray-600 font-medium">Final Score: {score} points</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
