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
            // Time's up - check if target reached
            if (bubblesPopped >= targetBubbles) {
              completeLevel()
            } else {
              // Failed to reach target - lose a life
              const newLives = lives - 1
              setLives(newLives)
              if (newLives <= 0) {
                setGameState("failed")
                cancelAnimationFrame(animationRef.current)
                return null
              } else {
                // Reset current level
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

  // Get difficulty settings based on level
  const getDifficultySettings = (currentLevel: number) => {
    // Base settings
    let bubbleCount = 5 + Math.floor(currentLevel / 2)
    let timeLimit: number | null = null
    let minSize = 40
    let maxSize = 80
    let minSpeed = 30
    let maxSpeed = 60
    let bonusChance = 0.1
    let penaltyChance = 0
    let targetPercentage = 0.7 // Need to pop 70% of bubbles to complete level

    // Adjust settings based on level
    if (currentLevel <= 10) {
      // Beginner levels
      timeLimit = 30
      minSize = 40
      maxSize = 80
      minSpeed = 30
      maxSpeed = 60
      penaltyChance = 0
    } else if (currentLevel <= 25) {
      // Easy levels
      timeLimit = Math.max(20, 30 - Math.floor(currentLevel / 5))
      minSize = 35
      maxSize = 70
      minSpeed = 40
      maxSpeed = 80
      penaltyChance = 0.05
      targetPercentage = 0.75
    } else if (currentLevel <= 50) {
      // Medium levels
      timeLimit = Math.max(15, 25 - Math.floor(currentLevel / 10))
      minSize = 30
      maxSize = 60
      minSpeed = 50
      maxSpeed = 100
      bonusChance = 0.15
      penaltyChance = 0.1
      targetPercentage = 0.8
    } else if (currentLevel <= 75) {
      // Hard levels
      timeLimit = Math.max(10, 20 - Math.floor(currentLevel / 15))
      minSize = 25
      maxSize = 50
      minSpeed = 70
      maxSpeed = 130
      bonusChance = 0.2
      penaltyChance = 0.15
      targetPercentage = 0.85
    } else {
      // Expert levels
      timeLimit = Math.max(8, 15 - Math.floor(currentLevel / 20))
      minSize = 20
      maxSize = 45
      minSpeed = 90
      maxSpeed = 160
      bonusChance = 0.25
      penaltyChance = 0.2
      targetPercentage = 0.9
    }

    // Cap bubble count to avoid overwhelming the screen
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

  // Start the game
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

  // Generate a new level
  const generateLevel = (currentLevel: number) => {
    const settings = getDifficultySettings(currentLevel)
    setTimeLimit(settings.timeLimit)
    setTimeLeft(settings.timeLimit)

    const newBubbles: Bubble[] = []
    for (let i = 0; i < settings.bubbleCount; i++) {
      // Determine bubble type
      let type: "regular" | "bonus" | "penalty" = "regular"
      const rand = Math.random()
      if (rand < settings.penaltyChance) {
        type = "penalty"
      } else if (rand < settings.penaltyChance + settings.bonusChance) {
        type = "bonus"
      }

      // Set bubble properties based on type
      let color = "#3b82f6" // Default blue for regular bubbles
      let points = 10
      let size = Math.random() * (settings.maxSize - settings.minSize) + settings.minSize

      if (type === "bonus") {
        color = "#10b981" // Green for bonus
        points = 25
        size *= 0.8 // Smaller
      } else if (type === "penalty") {
        color = "#ef4444" // Red for penalty
        points = -15
        size *= 1.1 // Larger
      }

      // Create bubble with random position
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

    // Start animation loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    lastTimeRef.current = performance.now()
    animationLoop(performance.now())
  }

  // Animation loop for moving bubbles
  const animationLoop = (timestamp: number) => {
    if (gameState !== "playing") return

    const deltaTime = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp

    // Update bubble positions
    setBubbles((prevBubbles) => {
      return prevBubbles.map((bubble) => {
        if (bubble.popped) return bubble

        // Move bubble with circular motion
        const speedFactor = deltaTime / 1000
        const time = timestamp * 0.001
        let x = bubble.x + Math.cos(time + bubble.id) * bubble.speed * speedFactor * 0.5
        let y = bubble.y + Math.sin(time + bubble.id * 0.7) * bubble.speed * speedFactor * 0.5

        // Keep bubbles within bounds
        if (x < 0) x = 0
        if (x > canvasSize.width - bubble.size) x = canvasSize.width - bubble.size
        if (y < 0) y = 0
        if (y > canvasSize.height - bubble.size) y = canvasSize.height - bubble.size

        // Gradually reduce opacity (bubbles disappear over time)
        const opacityReduction = level <= 25 ? 0.3 : 0.5
        const opacity = Math.max(0, bubble.opacity - (opacityReduction * deltaTime) / 1000)

        return { ...bubble, x, y, opacity }
      })
    })

    // Continue animation loop
    animationRef.current = requestAnimationFrame(animationLoop)
  }

  // Draw bubbles on canvas
  const drawBubbles = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas with background
    ctx.fillStyle = "#dbeafe" // Light blue background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw each bubble
    bubbles.forEach((bubble) => {
      if (bubble.popped || bubble.opacity <= 0) return

      ctx.save()
      ctx.globalAlpha = bubble.opacity

      // Draw bubble shadow
      ctx.beginPath()
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.arc(bubble.x + bubble.size / 2 + 2, bubble.y + bubble.size / 2 + 2, bubble.size / 2, 0, Math.PI * 2)
      ctx.fill()

      // Draw main bubble
      ctx.beginPath()
      ctx.fillStyle = bubble.color
      ctx.arc(bubble.x + bubble.size / 2, bubble.y + bubble.size / 2, bubble.size / 2, 0, Math.PI * 2)
      ctx.fill()

      // Add shine effect
      ctx.beginPath()
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
      ctx.arc(bubble.x + bubble.size * 0.3, bubble.y + bubble.size * 0.3, bubble.size * 0.15, 0, Math.PI * 2)
      ctx.fill()

      // Add border
      ctx.beginPath()
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"
      ctx.lineWidth = 2
      ctx.arc(bubble.x + bubble.size / 2, bubble.y + bubble.size / 2, bubble.size / 2 - 1, 0, Math.PI * 2)
      ctx.stroke()

      ctx.restore()
    })
  }

  // Handle bubble click/tap
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== "playing") return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if click hit any bubble
    let hit = false
    setBubbles((prevBubbles) => {
      return prevBubbles.map((bubble) => {
        // Skip already popped bubbles
        if (bubble.popped) return bubble

        // Check if click is inside bubble
        const dx = x - (bubble.x + bubble.size / 2)
        const dy = y - (bubble.y + bubble.size / 2)
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance <= bubble.size / 2) {
          hit = true
          // Update score and streak
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
          // Count popped bubble
          setBubblesPopped((prev) => prev + 1)
          return { ...bubble, popped: true, opacity: 0 }
        }
        return bubble
      })
    })

    // If no bubble was hit, reset streak
    if (!hit) {
      setStreak(0)
    }

    // Check if target reached
    if (bubblesPopped + (hit ? 1 : 0) >= targetBubbles) {
      completeLevel()
    }
  }

  // Complete the current level
  const completeLevel = () => {
    // Cancel animation
    cancelAnimationFrame(animationRef.current)

    // Calculate bonuses
    const timeBonus = timeLeft ? timeLeft * 5 : 0
    const streakBonus = highestStreak * 10
    const accuracyBonus = Math.floor((bubblesPopped / totalBubbles) * 100)
    const totalBonus = timeBonus + streakBonus + accuracyBonus

    // Update score
    setScore((prev) => prev + totalBonus)

    // Show success message
    setSuccessMessage(
      `Level ${level} complete! +${totalBonus} points (Time: +${timeBonus}, Streak: +${streakBonus}, Accuracy: +${accuracyBonus})`,
    )

    // Check if game completed
    if (level >= 100) {
      setGameState("success")
      onComplete()
    } else {
      // Advance to next level after delay
      setTimeout(() => {
        setLevel((prev) => prev + 1)
        setSuccessMessage("")
        generateLevel(level + 1)
      }, 2000)
    }
  }

  // Reset the game
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

  // Get difficulty name based on level
  const getDifficultyName = () => {
    if (level <= 10) return "Beginner"
    if (level <= 25) return "Easy"
    if (level <= 50) return "Medium"
    if (level <= 75) return "Hard"
    return "Expert"
  }

  const isGameOver = lives <= 0 || (level > 100 && gameState === "success")

  // Add canvas initialization effect
  useEffect(() => {
    if (gameState === "playing" && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Set canvas size
        canvas.width = canvasSize.width
        canvas.height = canvasSize.height
        // Initial draw
        drawBubbles()
      }
    }
  }, [gameState, canvasSize, bubbles])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bubble Pop</span>
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
        {/* Game Info */}
        <div className="grid grid-cols-4 gap-2 mb-4 text-center">
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600">Difficulty</div>
            <div className="font-semibold text-sm">{getDifficultyName()}</div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600">Lives</div>
            <div className="font-semibold text-sm">
              {"❤️".repeat(lives)}
              {"🤍".repeat(3 - lives)}
            </div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600">Streak</div>
            <div className="font-semibold text-sm">{streak}</div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600">Progress</div>
            <div className="font-semibold text-sm">
              {bubblesPopped}/{targetBubbles}
            </div>
          </div>
        </div>

        {/* Timer */}
        {timeLimit && timeLeft !== null && gameState === "playing" && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Time Remaining:</span>
              <span className={`font-semibold ${timeLeft <= 5 ? "text-red-600" : "text-blue-600"}`}>{timeLeft}s</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${
                  timeLeft <= 5 ? "bg-red-500" : "bg-blue-500"
                }`}
                style={{ width: `${((timeLeft || 0) / timeLimit) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200 text-center">
            <p className="text-green-700 font-semibold">{successMessage}</p>
          </div>
        )}

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="text-center mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
            {level > 100 ? (
              <div>
                <div className="text-3xl mb-2">👑</div>
                <p className="text-purple-700 font-bold text-lg">BUBBLE MASTER!</p>
                <p className="text-sm text-purple-600">You completed all 100 levels!</p>
                <p className="text-xs text-gray-600 mt-2">Final Score: {score} points</p>
              </div>
            ) : (
              <div>
                <div className="text-2xl mb-2">💔</div>
                <p className="text-red-700 font-semibold">Game Over!</p>
                <p className="text-sm text-red-600">You reached level {level}</p>
                <p className="text-xs text-gray-600 mt-2">Score: {score} points</p>
              </div>
            )}
          </div>
        )}

        {/* Game Canvas */}
        {gameState !== "waiting" && !isGameOver && (
          <div className="mb-4">
            <div
              className="relative mx-auto border border-gray-300 rounded-lg overflow-hidden"
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
              <div className="absolute top-2 right-2 bg-white bg-opacity-90 p-2 rounded text-xs shadow-sm">
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>+10pts</span>
                </div>
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>+25pts</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span>-15pts</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress to Level 100 */}
        <div className="space-y-2 mt-4">
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

        {/* Start Button */}
        {gameState === "waiting" && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <h3 className="font-semibold mb-2">How to Play:</h3>
              <p className="text-sm text-gray-700 mb-2">
                Pop as many bubbles as you can before they fade away! Watch out for special bubbles:
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <div>
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                  Regular: +10pts
                </div>
                <div>
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                  Bonus: +25pts
                </div>
                <div>
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                  Penalty: -15pts
                </div>
              </div>
            </div>

            <Button onClick={startGame} className="w-full">
              Start Bubble Challenge (100 Levels)
            </Button>
          </div>
        )}

        {isGameOver && (
          <Button onClick={startGame} className="w-full mt-4">
            {level > 100 ? "Play Again" : "Try Again"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
