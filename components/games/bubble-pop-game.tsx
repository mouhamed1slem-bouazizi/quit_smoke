"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw } from "lucide-react"

type Bubble = {
  id: number
  x: number
  y: number
  size: number
  color: string
  speed: number
  points: number
  type: "regular" | "bonus" | "penalty"
  popped: boolean
  opacity: number
}

export default function BubblePopGame({ onComplete }: { onComplete: () => void }) {
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [gameState, setGameState] = useState<"waiting" | "playing" | "success" | "failed">("waiting")
  const [timeLimit, setTimeLimit] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [bubblesPopped, setBubblesPopped] = useState(0)
  const [totalBubbles, setTotalBubbles] = useState(0)
  const [streak, setStreak] = useState(0)
  const [highestStreak, setHighestStreak] = useState(0)
  const [targetBubbles, setTargetBubbles] = useState(0)
  const [successMessage, setSuccessMessage] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 300 })

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const maxWidth = Math.min(400, window.innerWidth - 40)
      const maxHeight = Math.min(300, window.innerHeight - 400)
      setCanvasSize({ width: maxWidth, height: maxHeight })
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Game timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (timeLeft !== null && timeLeft > 0 && gameState === "playing") {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev !== null && prev <= 1) {
            if (bubblesPopped >= targetBubbles) {
              completeLevel()
            } else {
              const newLives = lives - 1
              setLives(newLives)
              if (newLives <= 0) {
                setGameState("failed")
                cancelAnimationFrame(animationRef.current)
                return null
              } else {
                generateLevel(level)
                return timeLimit
              }
            }
            return null
          }
          return prev !== null ? prev - 1 : null
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [timeLeft, gameState, lives, level, timeLimit, bubblesPopped, targetBubbles])

  const getDifficultySettings = (currentLevel: number) => {
    let bubbleCount = 5 + Math.floor(currentLevel / 2)
    let timeLimit: number | null = null
    let minSize = 40
    let maxSize = 80
    let minSpeed = 30
    let maxSpeed = 60
    let bonusChance = 0.1
    let penaltyChance = 0
    let targetPercentage = 0.7

    if (currentLevel <= 10) {
      timeLimit = 30
      minSize = 40
      maxSize = 80
      minSpeed = 30
      maxSpeed = 60
      penaltyChance = 0
    } else if (currentLevel <= 25) {
      timeLimit = Math.max(20, 30 - Math.floor(currentLevel / 5))
      minSize = 35
      maxSize = 70
      minSpeed = 40
      maxSpeed = 80
      penaltyChance = 0.05
      targetPercentage = 0.75
    } else if (currentLevel <= 50) {
      timeLimit = Math.max(15, 25 - Math.floor(currentLevel / 10))
      minSize = 30
      maxSize = 60
      minSpeed = 50
      maxSpeed = 100
      bonusChance = 0.15
      penaltyChance = 0.1
      targetPercentage = 0.8
    } else if (currentLevel <= 75) {
      timeLimit = Math.max(10, 20 - Math.floor(currentLevel / 15))
      minSize = 25
      maxSize = 50
      minSpeed = 70
      maxSpeed = 130
      bonusChance = 0.2
      penaltyChance = 0.15
      targetPercentage = 0.85
    } else {
      timeLimit = Math.max(8, 15 - Math.floor(currentLevel / 20))
      minSize = 20
      maxSize = 45
      minSpeed = 90
      maxSpeed = 160
      bonusChance = 0.25
      penaltyChance = 0.2
      targetPercentage = 0.9
    }

    bubbleCount = Math.min(bubbleCount, 30)

    return {
      bubbleCount,
      timeLimit,
      minSize,
      maxSize,
      minSpeed,
      maxSpeed,
      bonusChance,
      penaltyChance,
      targetPercentage,
    }
  }

  const startGame = () => {
    setLevel(1)
    setScore(0)
    setLives(3)
    setBubblesPopped(0)
    setStreak(0)
    setHighestStreak(0)
    setGameState("playing")
    generateLevel(1)
  }

  const generateLevel = (currentLevel: number) => {
    const settings = getDifficultySettings(currentLevel)
    setTimeLimit(settings.timeLimit)
    setTimeLeft(settings.timeLimit)

    const newBubbles: Bubble[] = []
    for (let i = 0; i < settings.bubbleCount; i++) {
      let type: "regular" | "bonus" | "penalty" = "regular"
      const rand = Math.random()
      if (rand < settings.penaltyChance) {
        type = "penalty"
      } else if (rand < settings.penaltyChance + settings.bonusChance) {
        type = "bonus"
      }

      let color = "#3b82f6"
      let points = 10
      let size = Math.random() * (settings.maxSize - settings.minSize) + settings.minSize

      if (type === "bonus") {
        color = "#10b981"
        points = 25
        size *= 0.8
      } else if (type === "penalty") {
        color = "#ef4444"
        points = -15
        size *= 1.1
      }

      newBubbles.push({
        id: i,
        x: Math.random() * (canvasSize.width - size),
        y: Math.random() * (canvasSize.height - size),
        size,
        color,
        speed: Math.random() * (settings.maxSpeed - settings.minSpeed) + settings.minSpeed,
        points,
        type,
        popped: false,
        opacity: 1,
      })
    }

    setBubbles(newBubbles)
    setTotalBubbles(newBubbles.length)
    setTargetBubbles(Math.ceil(newBubbles.length * settings.targetPercentage))
    setBubblesPopped(0)
    setGameState("playing")

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    lastTimeRef.current = performance.now()
    animationLoop(performance.now())
  }

  const animationLoop = (timestamp: number) => {
    if (gameState !== "playing") return

    const deltaTime = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp

    setBubbles((prevBubbles) => {
      return prevBubbles.map((bubble) => {
        if (bubble.popped) return bubble

        const speedFactor = deltaTime / 1000
        const time = timestamp * 0.001
        let x = bubble.x + Math.cos(time + bubble.id) * bubble.speed * speedFactor * 0.5
        let y = bubble.y + Math.sin(time + bubble.id * 0.7) * bubble.speed * speedFactor * 0.5

        if (x < 0) x = 0
        if (x > canvasSize.width - bubble.size) x = canvasSize.width - bubble.size
        if (y < 0) y = 0
        if (y > canvasSize.height - bubble.size) y = canvasSize.height - bubble.size

        const opacityReduction = level <= 25 ? 0.3 : 0.5
        const opacity = Math.max(0, bubble.opacity - (opacityReduction * deltaTime) / 1000)

        return { ...bubble, x, y, opacity }
      })
    })

    animationRef.current = requestAnimationFrame(animationLoop)
  }

  const drawBubbles = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "rgba(59, 130, 246, 0.1)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    bubbles.forEach((bubble) => {
      if (bubble.popped || bubble.opacity <= 0) return

      ctx.save()
      ctx.globalAlpha = bubble.opacity

      ctx.beginPath()
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.arc(bubble.x + bubble.size / 2 + 2, bubble.y + bubble.size / 2 + 2, bubble.size / 2, 0, Math.PI * 2)
      ctx.fill()

      const gradient = ctx.createRadialGradient(
        bubble.x + bubble.size / 2,
        bubble.y + bubble.size / 2,
        0,
        bubble.x + bubble.size / 2,
        bubble.y + bubble.size / 2,
        bubble.size / 2,
      )
      gradient.addColorStop(0, bubble.color)
      gradient.addColorStop(1, bubble.color + "80")

      ctx.beginPath()
      ctx.fillStyle = gradient
      ctx.arc(bubble.x + bubble.size / 2, bubble.y + bubble.size / 2, bubble.size / 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
      ctx.arc(bubble.x + bubble.size * 0.3, bubble.y + bubble.size * 0.3, bubble.size * 0.15, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"
      ctx.lineWidth = 2
      ctx.arc(bubble.x + bubble.size / 2, bubble.y + bubble.size / 2, bubble.size / 2 - 1, 0, Math.PI * 2)
      ctx.stroke()

      ctx.restore()
    })
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== "playing") return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    let hit = false
    setBubbles((prevBubbles) => {
      return prevBubbles.map((bubble) => {
        if (bubble.popped) return bubble

        const dx = x - (bubble.x + bubble.size / 2)
        const dy = y - (bubble.y + bubble.size / 2)
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance <= bubble.size / 2) {
          hit = true
          setScore((prev) => prev + bubble.points)
          if (bubble.type === "penalty") {
            setStreak(0)
          } else {
            setStreak((prev) => {
              const newStreak = prev + 1
              setHighestStreak((highest) => Math.max(highest, newStreak))
              return newStreak
            })
          }
          setBubblesPopped((prev) => prev + 1)
          return { ...bubble, popped: true, opacity: 0 }
        }
        return bubble
      })
    })

    if (!hit) {
      setStreak(0)
    }

    if (bubblesPopped + (hit ? 1 : 0) >= targetBubbles) {
      completeLevel()
    }
  }

  const completeLevel = () => {
    cancelAnimationFrame(animationRef.current)

    const timeBonus = timeLeft ? timeLeft * 5 : 0
    const streakBonus = highestStreak * 10
    const accuracyBonus = Math.floor((bubblesPopped / totalBubbles) * 100)
    const totalBonus = timeBonus + streakBonus + accuracyBonus

    setScore((prev) => prev + totalBonus)

    setSuccessMessage(
      `Level ${level} complete! +${totalBonus} points (Time: +${timeBonus}, Streak: +${streakBonus}, Accuracy: +${accuracyBonus})`,
    )

    if (level >= 100) {
      setGameState("success")
      onComplete()
    } else {
      setTimeout(() => {
        setLevel((prev) => prev + 1)
        setSuccessMessage("")
        generateLevel(level + 1)
      }, 2000)
    }
  }

  const resetGame = () => {
    cancelAnimationFrame(animationRef.current)
    setLevel(1)
    setScore(0)
    setLives(3)
    setBubblesPopped(0)
    setStreak(0)
    setHighestStreak(0)
    setGameState("waiting")
    setBubbles([])
    setTimeLeft(null)
    setSuccessMessage("")
  }

  const getDifficultyName = () => {
    if (level <= 10) return "Beginner"
    if (level <= 25) return "Easy"
    if (level <= 50) return "Medium"
    if (level <= 75) return "Hard"
    return "Expert"
  }

  const isGameOver = lives <= 0 || (level > 100 && gameState === "success")

  useEffect(() => {
    if (gameState === "playing" && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        canvas.width = canvasSize.width
        canvas.height = canvasSize.height
        drawBubbles()
      }
    }
  }, [gameState, canvasSize, bubbles])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
      <Card className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">🫧</span>
              </div>
              <span className="text-xl font-bold">Bubble Pop Master</span>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-white/20 text-white border-white/30">Level: {level}/100</Badge>
              <Badge className="bg-white/20 text-white border-white/30">Score: {score}</Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetGame}
                className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Game Info */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "Difficulty", value: getDifficultyName(), icon: "🎯" },
              { label: "Lives", value: "❤️".repeat(lives) + "🤍".repeat(3 - lives), icon: "" },
              { label: "Streak", value: streak, icon: "🔥" },
              { label: "Progress", value: `${bubblesPopped}/${targetBubbles}`, icon: "🎈" },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white/60 to-blue-100/60 backdrop-blur-sm p-3 rounded-xl border border-white/30 text-center"
              >
                <div className="text-xs text-blue-700 font-medium">
                  {item.icon} {item.label}
                </div>
                <div className="font-bold text-blue-900 text-sm mt-1">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Timer */}
          {timeLimit && timeLeft !== null && gameState === "playing" && (
            <div className="mb-6 bg-gradient-to-r from-white/60 to-blue-100/60 backdrop-blur-sm p-4 rounded-xl border border-white/30">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-blue-700 font-medium">⏰ Time Remaining:</span>
                <span className={`font-bold ${timeLeft <= 5 ? "text-red-600" : "text-blue-900"}`}>{timeLeft}s</span>
              </div>
              <div className="w-full bg-white/40 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    timeLeft <= 5
                      ? "bg-gradient-to-r from-red-400 to-red-600"
                      : "bg-gradient-to-r from-blue-400 to-purple-600"
                  }`}
                  style={{ width: `${((timeLeft || 0) / timeLimit) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-gradient-to-br from-green-100/80 to-emerald-100/80 backdrop-blur-sm rounded-xl border border-white/30 text-center">
              <p className="text-green-700 font-bold">{successMessage}</p>
            </div>
          )}

          {/* Game Over Screen */}
          {isGameOver && (
            <div className="text-center mb-6 p-6 bg-gradient-to-br from-purple-100/80 to-pink-100/80 backdrop-blur-sm rounded-xl border border-white/30">
              {level > 100 ? (
                <div>
                  <div className="text-4xl mb-3">👑</div>
                  <p className="text-purple-700 font-bold text-xl mb-2">BUBBLE MASTER!</p>
                  <p className="text-purple-600 mb-2">You completed all 100 levels!</p>
                  <p className="text-gray-600 text-sm">Final Score: {score} points</p>
                </div>
              ) : (
                <div>
                  <div className="text-3xl mb-3">💔</div>
                  <p className="text-red-700 font-bold text-lg mb-2">Game Over!</p>
                  <p className="text-red-600 mb-2">You reached level {level}</p>
                  <p className="text-gray-600 text-sm">Score: {score} points</p>
                </div>
              )}
            </div>
          )}

          {/* Game Canvas */}
          {gameState !== "waiting" && !isGameOver && (
            <div className="mb-6">
              <div
                className="relative mx-auto bg-gradient-to-br from-white/40 to-blue-100/40 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg overflow-hidden"
                style={{ width: canvasSize.width, height: canvasSize.height }}
              >
                <canvas
                  ref={canvasRef}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  onClick={handleCanvasClick}
                  className="block cursor-pointer"
                  style={{ width: "100%", height: "100%" }}
                />

                {/* Bubble Legend */}
                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-3 rounded-lg text-xs shadow-lg border border-white/40">
                  <div className="flex items-center mb-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500 mr-2 shadow-sm"></div>
                    <span className="text-blue-700 font-medium">+10pts</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 mr-2 shadow-sm"></div>
                    <span className="text-green-700 font-medium">+25pts</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-red-500 mr-2 shadow-sm"></div>
                    <span className="text-red-700 font-medium">-15pts</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress to Level 100 */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-blue-700 font-medium">
              <span>🏆 Overall Progress:</span>
              <span>{level}/100</span>
            </div>
            <div className="w-full bg-white/40 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-400 to-pink-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(level / 100) * 100}%` }}
              />
            </div>
          </div>

          {/* Start Button */}
          {gameState === "waiting" && (
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-br from-blue-100/80 to-purple-100/80 backdrop-blur-sm rounded-xl border border-white/30 text-center">
                <h3 className="font-bold text-blue-700 mb-3 text-lg">🎮 How to Play:</h3>
                <p className="text-blue-600 mb-4">
                  Pop as many bubbles as you can before they fade away! Watch out for special bubbles:
                </p>
                <div className="flex justify-center gap-6 text-sm">
                  <div className="flex items-center">
                    <span className="inline-block w-4 h-4 rounded-full bg-blue-500 mr-2 shadow-sm"></span>
                    <span className="text-blue-700 font-medium">Regular: +10pts</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-4 h-4 rounded-full bg-green-500 mr-2 shadow-sm"></span>
                    <span className="text-green-700 font-medium">Bonus: +25pts</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-4 h-4 rounded-full bg-red-500 mr-2 shadow-sm"></span>
                    <span className="text-red-700 font-medium">Penalty: -15pts</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
              >
                🚀 Start Bubble Challenge (100 Levels)
              </Button>
            </div>
          )}

          {isGameOver && (
            <Button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
            >
              {level > 100 ? "🎮 Play Again" : "🔄 Try Again"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
