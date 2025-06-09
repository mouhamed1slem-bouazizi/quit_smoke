"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Trophy, Droplets, Sparkles } from "lucide-react"

interface WaterSortGameProps {
  onComplete: () => void
}

type Color = string
type Tube = Color[]

const COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Yellow
  "#DDA0DD", // Plum
  "#FFB347", // Orange
  "#87CEEB", // Sky Blue
  "#F0E68C", // Khaki
  "#FFB6C1", // Light Pink
  "#98FB98", // Pale Green
  "#DEB887", // Burlywood
]

const TUBE_CAPACITY = 4

export default function WaterSortGame({ onComplete }: WaterSortGameProps) {
  const [level, setLevel] = useState(1)
  const [tubes, setTubes] = useState<Tube[]>([])
  const [selectedTube, setSelectedTube] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [history, setHistory] = useState<Tube[][]>([])
  const [score, setScore] = useState(0)

  // Generate level configuration
  const generateLevel = useCallback((levelNum: number) => {
    const numColors = Math.min(2 + Math.floor((levelNum - 1) / 10), 8)
    const numTubes = numColors + 2
    const colorsToUse = COLORS.slice(0, numColors)

    const newTubes: Tube[] = []
    const colorSegments: Color[] = []

    colorsToUse.forEach((color) => {
      for (let i = 0; i < TUBE_CAPACITY; i++) {
        colorSegments.push(color)
      }
    })

    for (let i = colorSegments.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[colorSegments[i], colorSegments[j]] = [colorSegments[j], colorSegments[i]]
    }

    for (let i = 0; i < numColors; i++) {
      const tube: Tube = []
      for (let j = 0; j < TUBE_CAPACITY; j++) {
        tube.push(colorSegments[i * TUBE_CAPACITY + j])
      }
      newTubes.push(tube)
    }

    for (let i = 0; i < 2; i++) {
      newTubes.push([])
    }

    if (levelNum > 10) {
      const shuffleCount = Math.min(levelNum - 10, 20)
      for (let i = 0; i < shuffleCount; i++) {
        const fromTube = Math.floor(Math.random() * numColors)
        const toTube = Math.floor(Math.random() * numColors)

        if (fromTube !== toTube && newTubes[fromTube].length > 0 && newTubes[toTube].length < TUBE_CAPACITY) {
          const color = newTubes[fromTube].pop()!
          newTubes[toTube].push(color)
        }
      }
    }

    return newTubes
  }, [])

  const initializeGame = useCallback(() => {
    const newTubes = generateLevel(level)
    setTubes(newTubes)
    setSelectedTube(null)
    setMoves(0)
    setGameWon(false)
    setGameStarted(true)
    setHistory([JSON.parse(JSON.stringify(newTubes))])
  }, [level, generateLevel])

  const checkWin = useCallback((currentTubes: Tube[]) => {
    return currentTubes.every((tube) => {
      if (tube.length === 0) return true
      if (tube.length !== TUBE_CAPACITY) return false
      return tube.every((color) => color === tube[0])
    })
  }, [])

  const getTopColor = (tube: Tube): Color | null => {
    return tube.length > 0 ? tube[tube.length - 1] : null
  }

  const getTopColorCount = (tube: Tube): number => {
    if (tube.length === 0) return 0
    const topColor = tube[tube.length - 1]
    let count = 0
    for (let i = tube.length - 1; i >= 0 && tube[i] === topColor; i--) {
      count++
    }
    return count
  }

  const canPour = (fromTube: Tube, toTube: Tube): boolean => {
    if (fromTube.length === 0) return false
    if (toTube.length >= TUBE_CAPACITY) return false

    const fromTopColor = getTopColor(fromTube)
    const toTopColor = getTopColor(toTube)

    return toTopColor === null || fromTopColor === toTopColor
  }

  const pourWater = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    const newTubes = [...tubes]
    const fromTube = [...newTubes[fromIndex]]
    const toTube = [...newTubes[toIndex]]

    if (!canPour(fromTube, toTube)) return

    const fromTopColor = getTopColor(fromTube)
    const fromTopCount = getTopColorCount(fromTube)
    const availableSpace = TUBE_CAPACITY - toTube.length
    const pourCount = Math.min(fromTopCount, availableSpace)

    for (let i = 0; i < pourCount; i++) {
      const color = fromTube.pop()!
      toTube.push(color)
    }

    newTubes[fromIndex] = fromTube
    newTubes[toIndex] = toTube

    setHistory((prev) => [...prev, JSON.parse(JSON.stringify(newTubes))])
    setTubes(newTubes)
    setMoves((prev) => prev + 1)

    if (checkWin(newTubes)) {
      setGameWon(true)
      const levelBonus = level * 100
      const moveBonus = Math.max(0, 100 - moves * 5)
      const totalScore = levelBonus + moveBonus
      setScore((prev) => prev + totalScore)
    }
  }

  const handleTubeClick = (tubeIndex: number) => {
    if (gameWon) return

    if (selectedTube === null) {
      if (tubes[tubeIndex].length > 0) {
        setSelectedTube(tubeIndex)
      }
    } else if (selectedTube === tubeIndex) {
      setSelectedTube(null)
    } else {
      pourWater(selectedTube, tubeIndex)
      setSelectedTube(null)
    }
  }

  const undoMove = () => {
    if (history.length > 1) {
      const newHistory = [...history]
      newHistory.pop()
      const previousState = newHistory[newHistory.length - 1]

      setTubes(JSON.parse(JSON.stringify(previousState)))
      setHistory(newHistory)
      setMoves((prev) => Math.max(0, prev - 1))
      setGameWon(false)
      setSelectedTube(null)
    }
  }

  const nextLevel = () => {
    setLevel((prev) => prev + 1)
    setGameWon(false)
    setGameStarted(false)
  }

  const restartLevel = () => {
    setGameStarted(false)
    setScore(0)
  }

  const newGame = () => {
    setLevel(1)
    setScore(0)
    setGameStarted(false)
  }

  useEffect(() => {
    if (!gameStarted) {
      initializeGame()
    }
  }, [gameStarted, initializeGame])

  if (!gameStarted) {
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-xl">
        <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Droplets className="w-7 h-7" />
            Water Color Sort
          </CardTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              Level {level}
            </Badge>
            <Sparkles className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-6 p-6">
          <div className="text-6xl mb-4">🧪</div>
          <div className="space-y-3">
            <p className="text-lg font-medium text-gray-700">Sort the colored water!</p>
            <p className="text-sm text-gray-600">Each tube should contain only one color</p>
          </div>
          <div className="bg-white/60 rounded-lg p-4 space-y-2">
            <p className="text-xs text-gray-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Tap a tube to select, then tap another to pour
            </p>
            <p className="text-xs text-gray-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Water can only pour on same color or empty space
            </p>
            <p className="text-xs text-gray-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Complete all tubes to advance
            </p>
          </div>
          <Button
            onClick={() => setGameStarted(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Start Level {level}
          </Button>
          {level > 1 && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={restartLevel} className="flex-1 rounded-xl border-2">
                Restart Level
              </Button>
              <Button variant="outline" onClick={newGame} className="flex-1 rounded-xl border-2">
                New Game
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-6 h-6" />
            Level {level}
          </CardTitle>
          <Badge variant="secondary" className="bg-white/20 text-white border-0">
            <Trophy className="w-3 h-3 mr-1" />
            {score}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm text-blue-100">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-white/60 rounded-full"></span>
            Moves: {moves}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={undoMove}
            disabled={history.length <= 1}
            className="text-white hover:bg-white/20 rounded-lg"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Undo
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {gameWon && (
          <div className="text-center p-6 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl shadow-lg">
            <div className="text-3xl mb-3">🎉</div>
            <p className="font-bold text-lg">Level Complete!</p>
            <p className="text-sm opacity-90 mb-4">Completed in {moves} moves</p>
            <Button
              onClick={nextLevel}
              className="bg-white text-green-600 hover:bg-gray-100 font-medium rounded-lg shadow-md transform transition-all duration-200 hover:scale-105"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Next Level ({level + 1})
            </Button>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 justify-items-center p-4 bg-white/40 rounded-xl">
          {tubes.map((tube, index) => (
            <div
              key={index}
              className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedTube === index
                  ? "ring-4 ring-blue-400 ring-offset-2 scale-110 shadow-lg"
                  : canPour(tubes[selectedTube!] || [], tube) && selectedTube !== null && selectedTube !== index
                    ? "ring-3 ring-green-400 ring-offset-1 shadow-md"
                    : "hover:shadow-md"
              }`}
              onClick={() => handleTubeClick(index)}
            >
              {/* Glass tube with realistic effects */}
              <div className="relative w-14 h-20 bg-gradient-to-b from-white to-gray-50 rounded-b-2xl border-2 border-gray-300 shadow-lg overflow-hidden">
                {/* Glass shine effect */}
                <div className="absolute left-1 top-1 w-1 h-16 bg-gradient-to-b from-white to-transparent opacity-60 rounded-full"></div>

                {/* Water layers with gradients */}
                {tube.map((color, colorIndex) => (
                  <div
                    key={colorIndex}
                    className="absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out"
                    style={{
                      background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                      height: `${(1 / TUBE_CAPACITY) * 100}%`,
                      bottom: `${(colorIndex / TUBE_CAPACITY) * 100}%`,
                      boxShadow: "inset 0 1px 2px rgba(255,255,255,0.3)",
                    }}
                  >
                    {/* Water surface reflection */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"></div>
                  </div>
                ))}

                {/* Empty space with subtle gradient */}
                {tube.length < TUBE_CAPACITY && (
                  <div
                    className="absolute left-0 right-0 bg-gradient-to-b from-gray-50 to-white"
                    style={{
                      top: 0,
                      height: `${((TUBE_CAPACITY - tube.length) / TUBE_CAPACITY) * 100}%`,
                    }}
                  />
                )}

                {/* Glass bottom highlight */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-gray-200 to-transparent opacity-50 rounded-b-2xl"></div>
              </div>

              {/* Tube number with better styling */}
              <div className="text-xs text-center mt-2 font-medium text-gray-600 bg-white/60 rounded-full w-6 h-6 flex items-center justify-center mx-auto shadow-sm">
                {index + 1}
              </div>

              {/* Selection indicator */}
              {selectedTube === index && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={restartLevel}
            className="flex-1 rounded-xl border-2 hover:bg-white/60 transition-all duration-200"
          >
            Restart
          </Button>
          <Button
            variant="outline"
            onClick={newGame}
            className="flex-1 rounded-xl border-2 hover:bg-white/60 transition-all duration-200"
          >
            New Game
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
