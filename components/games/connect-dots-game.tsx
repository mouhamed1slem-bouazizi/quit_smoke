"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link, RotateCcw } from "lucide-react"

interface Dot {
  id: number
  x: number
  y: number
  number: number
}

interface ConnectDotsGameProps {
  onComplete: () => void
}

export default function ConnectDotsGame({ onComplete }: ConnectDotsGameProps) {
  const [level, setLevel] = useState(1)
  const [dots, setDots] = useState<Dot[]>([])
  const [connectedDots, setConnectedDots] = useState<number[]>([])
  const [currentDot, setCurrentDot] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameStarted, setGameStarted] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Generate dots for current level
  const generateDots = (level: number) => {
    const numDots = Math.min(3 + Math.floor(level / 2), 25) // 3 to 25 dots
    const newDots: Dot[] = []
    const canvasWidth = 400
    const canvasHeight = 300
    const margin = 40

    // Generate random positions for dots
    for (let i = 0; i < numDots; i++) {
      let x, y
      let attempts = 0

      do {
        x = margin + Math.random() * (canvasWidth - 2 * margin)
        y = margin + Math.random() * (canvasHeight - 2 * margin)
        attempts++
      } while (attempts < 50 && newDots.some((dot) => Math.sqrt((dot.x - x) ** 2 + (dot.y - y) ** 2) < 35))

      newDots.push({
        id: i,
        x,
        y,
        number: i + 1,
      })
    }

    return newDots
  }

  // Initialize level
  const initializeLevel = () => {
    const newDots = generateDots(level)
    setDots(newDots)
    setConnectedDots([])
    setCurrentDot(null)
    setIsComplete(false)
    setShowSuccess(false)

    // Set time limit based on level
    const baseTime = Math.max(120 - level * 2, 30)
    setTimeLeft(baseTime)
  }

  // Start game
  const startGame = () => {
    setGameStarted(true)
    initializeLevel()
  }

  // Reset game
  const resetGame = () => {
    setLevel(1)
    setScore(0)
    setGameStarted(false)
    setTimeLeft(60)
    initializeLevel()
  }

  // Timer effect
  useEffect(() => {
    if (!gameStarted || isComplete || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - reset to current level
          setTimeout(() => {
            initializeLevel()
          }, 1000)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, isComplete, timeLeft])

  // Initialize on mount
  useEffect(() => {
    initializeLevel()
  }, [level])

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw connections with gradient
    ctx.lineWidth = 4
    ctx.lineCap = "round"

    for (let i = 0; i < connectedDots.length - 1; i++) {
      const dot1 = dots.find((d) => d.number === connectedDots[i])
      const dot2 = dots.find((d) => d.number === connectedDots[i + 1])

      if (dot1 && dot2) {
        const gradient = ctx.createLinearGradient(dot1.x, dot1.y, dot2.x, dot2.y)
        gradient.addColorStop(0, "#3b82f6")
        gradient.addColorStop(1, "#8b5cf6")

        ctx.strokeStyle = gradient
        ctx.shadowColor = "#3b82f6"
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.moveTo(dot1.x, dot1.y)
        ctx.lineTo(dot2.x, dot2.y)
        ctx.stroke()
        ctx.shadowBlur = 0
      }
    }

    // Draw dots with enhanced styling
    dots.forEach((dot) => {
      const isConnected = connectedDots.includes(dot.number)
      const isCurrent = currentDot === dot.number
      const isNext = connectedDots.length === 0 ? dot.number === 1 : dot.number === connectedDots.length + 1

      // Dot shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
      ctx.shadowBlur = 8
      ctx.shadowOffsetY = 4

      // Dot circle
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, 22, 0, 2 * Math.PI)

      if (isConnected) {
        const gradient = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, 22)
        gradient.addColorStop(0, "#10b981")
        gradient.addColorStop(1, "#059669")
        ctx.fillStyle = gradient
      } else if (isCurrent) {
        const gradient = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, 22)
        gradient.addColorStop(0, "#f59e0b")
        gradient.addColorStop(1, "#d97706")
        ctx.fillStyle = gradient
      } else if (isNext) {
        const gradient = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, 22)
        gradient.addColorStop(0, "#3b82f6")
        gradient.addColorStop(1, "#2563eb")
        ctx.fillStyle = gradient
      } else {
        const gradient = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, 22)
        gradient.addColorStop(0, "#f3f4f6")
        gradient.addColorStop(1, "#d1d5db")
        ctx.fillStyle = gradient
      }

      ctx.fill()
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      // Dot border
      ctx.strokeStyle = "#374151"
      ctx.lineWidth = 2
      ctx.stroke()

      // Number
      ctx.fillStyle = isConnected || isCurrent || isNext ? "white" : "#374151"
      ctx.font = "bold 16px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(dot.number.toString(), dot.x, dot.y)
    })
  }, [dots, connectedDots, currentDot])

  // Handle dot click
  const handleDotClick = (dot: Dot) => {
    if (isComplete || timeLeft <= 0) return

    const expectedNext = connectedDots.length + 1

    if (dot.number === expectedNext) {
      const newConnectedDots = [...connectedDots, dot.number]
      setConnectedDots(newConnectedDots)
      setCurrentDot(dot.number)

      // Check if level complete
      if (newConnectedDots.length === dots.length) {
        setIsComplete(true)
        setShowSuccess(true)

        // Calculate score
        const timeBonus = Math.floor(timeLeft * 10)
        const levelBonus = level * 100
        const newScore = score + levelBonus + timeBonus
        setScore(newScore)

        // Auto advance after delay
        setTimeout(() => {
          if (level < 100) {
            setLevel((prev) => prev + 1)
          } else {
            // Game completed!
            onComplete()
          }
        }, 2000)
      }
    } else {
      // Wrong dot - visual feedback
      setCurrentDot(dot.number)
      setTimeout(() => setCurrentDot(null), 500)
    }
  }

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Find clicked dot
    const clickedDot = dots.find((dot) => Math.sqrt((dot.x - x) ** 2 + (dot.y - y) ** 2) <= 22)

    if (clickedDot) {
      handleDotClick(clickedDot)
    }
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Link className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold">Connect the Dots</h2>
                <p className="text-blue-100 text-sm">Connect numbered dots in sequence!</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center space-y-6">
            <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <p className="text-blue-700 font-medium">• Click dots in numerical order (1, 2, 3...)</p>
              <p className="text-blue-700 font-medium">• Complete the connection before time runs out</p>
              <p className="text-blue-700 font-medium">• 100 levels with increasing difficulty</p>
            </div>
            <Button
              onClick={startGame}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🚀 Start Game
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Link className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Connect the Dots</h2>
                <p className="text-blue-100 text-sm">Level {level} of 100</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">Level {level}</Badge>
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
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex justify-between text-sm font-medium">
              <span>
                Progress: {connectedDots.length}/{dots.length}
              </span>
              <span className={timeLeft <= 10 ? "text-red-200" : "text-blue-100"}>Time: {timeLeft}s</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
              <div
                className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(connectedDots.length / dots.length) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {showSuccess && (
            <div className="text-center p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl border-2 border-green-200 shadow-xl">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <p className="text-green-700 font-bold text-2xl mb-2">Level {level} Complete!</p>
              <p className="text-green-600 text-lg">
                +{level * 100} points + {Math.floor(timeLeft * 10)} time bonus
              </p>
            </div>
          )}

          {timeLeft === 0 && !isComplete && (
            <div className="text-center p-6 bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 rounded-2xl border-2 border-red-200 shadow-xl">
              <div className="text-6xl mb-4">⏰</div>
              <p className="text-red-700 font-bold text-2xl mb-2">Time's Up!</p>
              <p className="text-red-600 text-lg">Try again!</p>
            </div>
          )}

          <div className="flex justify-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={400}
                height={300}
                className="border-2 border-blue-200 rounded-2xl cursor-pointer bg-gradient-to-br from-white to-blue-50 shadow-lg"
                onClick={handleCanvasClick}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-blue-100/20 pointer-events-none" />
            </div>
          </div>

          <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <p className="text-indigo-700 font-medium">
              {connectedDots.length === 0
                ? "🎯 Click dot #1 to start"
                : connectedDots.length === dots.length
                  ? "✨ Pattern complete!"
                  : `🔗 Next: Connect dot #${connectedDots.length + 1}`}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={initializeLevel}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🔄 Restart Level
            </Button>
            <Button
              variant="outline"
              onClick={resetGame}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🏠 New Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
