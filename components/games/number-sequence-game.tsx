"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw } from "lucide-react"

interface NumberSequenceGameProps {
  onComplete: () => void
}

export default function NumberSequenceGame({ onComplete }: NumberSequenceGameProps) {
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [currentSequence, setCurrentSequence] = useState<number[]>([])
  const [missingIndex, setMissingIndex] = useState(0)
  const [correctAnswer, setCorrectAnswer] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [gameState, setGameState] = useState<"waiting" | "playing" | "success" | "failed" | "hint">("waiting")
  const [timeLimit, setTimeLimit] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [maxHints, setMaxHints] = useState(3)
  const [sequenceType, setSequenceType] = useState("")
  const [streak, setStreak] = useState(0)
  const [difficulty, setDifficulty] = useState("Beginner")
  const [showWrongAnswer, setShowWrongAnswer] = useState(false)
  const [wrongAnswerInfo, setWrongAnswerInfo] = useState<{ answer: number; type: string } | null>(null)

  useEffect(() => {
    initializeGame()
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (timeLeft !== null && timeLeft > 0 && gameState === "playing") {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev !== null && prev <= 1) {
            const newLives = lives - 1
            setLives(newLives)
            if (newLives <= 0) {
              setGameState("failed")
              return null
            } else {
              generateSequence(level)
              return timeLimit
            }
          }
          return prev !== null ? prev - 1 : null
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [timeLeft, gameState, lives, level, timeLimit])

  const getDifficultySettings = (currentLevel: number) => {
    let timeLimit: number | null = null
    let maxHints = 3
    let difficulty = "Beginner"

    if (currentLevel <= 15) {
      difficulty = "Beginner"
      timeLimit = currentLevel >= 8 ? 45 : null
      maxHints = 3
    } else if (currentLevel <= 30) {
      difficulty = "Easy"
      timeLimit = Math.max(35, 50 - currentLevel)
      maxHints = 2
    } else if (currentLevel <= 50) {
      difficulty = "Medium"
      timeLimit = Math.max(25, 45 - currentLevel)
      maxHints = 2
    } else if (currentLevel <= 75) {
      difficulty = "Hard"
      timeLimit = Math.max(20, 40 - currentLevel)
      maxHints = 1
    } else {
      difficulty = "Expert"
      timeLimit = Math.max(15, 35 - currentLevel)
      maxHints = 1
    }

    return { timeLimit, maxHints, difficulty }
  }

  const initializeGame = () => {
    setLevel(1)
    setScore(0)
    setLives(3)
    setStreak(0)
    setHintsUsed(0)
    setUserInput("")
    setGameState("waiting")
    generateSequence(1)
  }

  const generateSequence = (currentLevel: number) => {
    setShowWrongAnswer(false)
    setWrongAnswerInfo(null)

    const settings = getDifficultySettings(currentLevel)
    setTimeLimit(settings.timeLimit)
    setTimeLeft(settings.timeLimit)
    setMaxHints(settings.maxHints)
    setDifficulty(settings.difficulty)
    setHintsUsed(0)

    const sequenceData = createSequenceByLevel(currentLevel)

    setCurrentSequence(sequenceData.sequence)
    setMissingIndex(sequenceData.missingIndex)
    setCorrectAnswer(sequenceData.correctAnswer)
    setSequenceType(sequenceData.type)
    setUserInput("")
    setGameState("playing")
  }

  const createSequenceByLevel = (level: number) => {
    const sequenceLength = Math.min(5 + Math.floor(level / 10), 12)

    if (level <= 15) {
      return generateArithmeticSequence(sequenceLength, level)
    } else if (level <= 30) {
      return Math.random() < 0.7
        ? generateArithmeticSequence(sequenceLength, level)
        : generateGeometricSequence(sequenceLength, level)
    } else if (level <= 50) {
      const patterns = [
        () => generateArithmeticSequence(sequenceLength, level),
        () => generateGeometricSequence(sequenceLength, level),
        () => generateFibonacciSequence(sequenceLength),
        () => generateSquareSequence(sequenceLength),
      ]
      return patterns[Math.floor(Math.random() * patterns.length)]()
    } else if (level <= 75) {
      const patterns = [
        () => generatePrimeSequence(sequenceLength),
        () => generateFactorialSequence(sequenceLength),
        () => generateTriangularSequence(sequenceLength),
        () => generatePowerSequence(sequenceLength, level),
        () => generateComplexArithmetic(sequenceLength, level),
      ]
      return patterns[Math.floor(Math.random() * patterns.length)]()
    } else {
      const patterns = [
        () => generateCatalanSequence(sequenceLength),
        () => generateLucasSequence(sequenceLength),
        () => generatePentagonalSequence(sequenceLength),
        () => generateRecursiveSequence(sequenceLength, level),
        () => generatePolynomialSequence(sequenceLength, level),
      ]
      return patterns[Math.floor(Math.random() * patterns.length)]()
    }
  }

  const generateArithmeticSequence = (length: number, level: number) => {
    const start = Math.floor(Math.random() * 20) + 1
    const diff = Math.floor(Math.random() * (level <= 10 ? 5 : 10)) + 1
    const sequence = []

    for (let i = 0; i < length; i++) {
      sequence.push(start + i * diff)
    }

    const missingIndex = Math.floor(Math.random() * length)
    const correctAnswer = sequence[missingIndex]

    return {
      sequence,
      missingIndex,
      correctAnswer,
      type: `Arithmetic (+${diff})`,
    }
  }

  const generateGeometricSequence = (length: number, level: number) => {
    const start = Math.floor(Math.random() * 5) + 1
    const ratio = level <= 20 ? 2 : Math.floor(Math.random() * 3) + 2
    const sequence = []

    for (let i = 0; i < length; i++) {
      sequence.push(start * Math.pow(ratio, i))
    }

    const missingIndex = Math.floor(Math.random() * Math.min(length, 6))
    const correctAnswer = sequence[missingIndex]

    return {
      sequence,
      missingIndex,
      correctAnswer,
      type: `Geometric (×${ratio})`,
    }
  }

  const generateFibonacciSequence = (length: number) => {
    const sequence = [1, 1]

    for (let i = 2; i < length; i++) {
      sequence.push(sequence[i - 1] + sequence[i - 2])
    }

    const missingIndex = Math.floor(Math.random() * length)
    const correctAnswer = sequence[missingIndex]

    return {
      sequence,
      missingIndex,
      correctAnswer,
      type: "Fibonacci",
    }
  }

  const generateSquareSequence = (length: number) => {
    const sequence = []
    const start = Math.floor(Math.random() * 5) + 1

    for (let i = 0; i < length; i++) {
      sequence.push(Math.pow(start + i, 2))
    }

    const missingIndex = Math.floor(Math.random() * length)
    const correctAnswer = sequence[missingIndex]

    return {
      sequence,
      missingIndex,
      correctAnswer,
      type: "Perfect Squares",
    }
  }

  const generatePrimeSequence = (length: number) => {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71]
    const sequence = primes.slice(0, length)

    const missingIndex = Math.floor(Math.random() * length)
    const correctAnswer = sequence[missingIndex]

    return {
      sequence,
      missingIndex,
      correctAnswer,
      type: "Prime Numbers",
    }
  }

  const generateFactorialSequence = (length: number) => {
    const sequence = []

    for (let i = 1; i <= length; i++) {
      let factorial = 1
      for (let j = 1; j <= i; j++) {
        factorial *= j
      }
      sequence.push(factorial)
    }

    const missingIndex = Math.floor(Math.random() * Math.min(length, 7))
    const correctAnswer = sequence[missingIndex]

    return {
      sequence,
      missingIndex,
      correctAnswer,
      type: "Factorials",
    }
  }

  const generateTriangularSequence = (length: number) => {
    const sequence = []

    for (let i = 1; i <= length; i++) {
      sequence.push((i * (i + 1)) / 2)
    }

    const missingIndex = Math.floor(Math.random() * length)
    const correctAnswer = sequence[missingIndex]

    return {
      sequence,
      missingIndex,
      correctAnswer,
      type: "Triangular Numbers",
    }
  }

  const generatePowerSequence = (length: number, level: number) => {
    const power = Math.floor(Math.random() * 2) + 3
    const sequence = []

    for (let i = 1; i <= length; i++) {
      sequence.push(Math.pow(i, power))
    }

    const missingIndex = Math.floor(Math.random() * Math.min(length, 6))
    const correctAnswer = sequence[missingIndex]

    return {
      sequence,
      missingIndex,
      correctAnswer,
      type: `Powers of ${power}`,
    }
  }

  const generateComplexArithmetic = (length: number, level: number) => {
    const start = Math.floor(Math.random() * 10) + 1
    const diff1 = Math.floor(Math.random() * 5) + 2
    const diff2 = Math.floor(Math.random() * 3) + 1
    const sequence = [start]

    for (let i = 1; i < length; i++) {
      const increment = diff1 + (i - 1) * diff2
      sequence.push(sequence[i - 1] + increment)
    }

    const missingIndex = Math.floor(Math.random() * length)
    const correctAnswer = sequence[missingIndex]

    return {
      sequence,
      missingIndex,
      correctAnswer,
      type: "Complex Arithmetic",
    }
  }

  const generateCatalanSequence = (length: number) => {
    const sequence = [1]

    for (let i = 1; i < length; i++) {
      let catalan = 0
      for (let j = 0; j < i; j++) {
        catalan += sequence[j] * sequence[i - 1 - j]
      }
      sequence.push(catalan)
    }

    const missingIndex = Math.floor(Math.random() * Math.min(length, 8))
    const correctAnswer = sequence[missingIndex]

    return {
      sequence,
      missingIndex,
      correctAnswer,
      type: "Catalan Numbers",
    }
  }

  const generateLucasSequence = (length: number) => {
    const sequence = [2, 1]

    for (let i = 2; i < length; i++) {
      sequence.push(sequence[i - 1] + sequence[i - 2])
    }

    const missingIndex = Math.floor(Math.random() * length)
    const correctAnswer = sequence[missingIndex]

    return {
      sequence,
      missingIndex,
      correctAnswer,
      type: "Lucas Numbers",
    }
  }

  const generatePentagonalSequence = (length: number) => {
    const sequence = []

    for (let i = 1; i <= length; i++) {
      sequence.push((i * (3 * i - 1)) / 2)
    }

    const missingIndex = Math.floor(Math.random() * length)
    const correctAnswer = sequence[missingIndex]

    return {
      sequence,
      missingIndex,
      correctAnswer,
      type: "Pentagonal Numbers",
    }
  }

  const generateRecursiveSequence = (length: number, level: number) => {
    const a = Math.floor(Math.random() * 3) + 2
    const b = Math.floor(Math.random() * 2) + 1
    const sequence = [1, a]

    for (let i = 2; i < length; i++) {
      sequence.push(a * sequence[i - 1] + b * sequence[i - 2])
    }

    const missingIndex = Math.floor(Math.random() * Math.min(length, 6))
    const correctAnswer = sequence[missingIndex]

    return {
      sequence,
      missingIndex,
      correctAnswer,
      type: `Recursive (${a}n₋₁+${b}n₋₂)`,
    }
  }

  const generatePolynomialSequence = (length: number, level: number) => {
    const a = Math.floor(Math.random() * 3) + 1
    const b = Math.floor(Math.random() * 5) + 1
    const c = Math.floor(Math.random() * 3) + 1
    const sequence = []

    for (let i = 1; i <= length; i++) {
      sequence.push(a * i * i + b * i + c)
    }

    const missingIndex = Math.floor(Math.random() * length)
    const correctAnswer = sequence[missingIndex]

    return {
      sequence,
      missingIndex,
      correctAnswer,
      type: `Polynomial (${a}n²+${b}n+${c})`,
    }
  }

  const checkAnswer = () => {
    const userAnswer = Number.parseInt(userInput)

    if (userAnswer === correctAnswer) {
      const basePoints = level * 10
      const timeBonus = timeLeft ? timeLeft * 3 : 0
      const hintPenalty = hintsUsed * 15
      const streakBonus = streak * 8
      const difficultyBonus = level > 50 ? level * 2 : 0

      const totalPoints = Math.max(0, basePoints + timeBonus + streakBonus + difficultyBonus - hintPenalty)
      setScore(score + totalPoints)
      setStreak(streak + 1)

      if (level >= 100) {
        setGameState("success")
        onComplete()
      } else {
        setLevel(level + 1)
        setTimeout(() => {
          generateSequence(level + 1)
        }, 1500)
      }
    } else {
      const newLives = lives - 1
      setLives(newLives)
      setStreak(0)

      // Show wrong answer message
      setShowWrongAnswer(true)
      setWrongAnswerInfo({
        answer: correctAnswer,
        type: sequenceType,
      })

      if (newLives <= 0) {
        setGameState("failed")
      } else {
        setTimeout(() => {
          setShowWrongAnswer(false)
          setWrongAnswerInfo(null)
          generateSequence(level)
        }, 2500)
      }
    }
  }

  const getHint = () => {
    if (hintsUsed >= maxHints) return

    setHintsUsed(hintsUsed + 1)
    setGameState("hint")

    setTimeout(() => {
      setGameState("playing")
    }, 3000)
  }

  const resetGame = () => {
    setLevel(1)
    setScore(0)
    setLives(3)
    setStreak(0)
    setHintsUsed(0)
    setUserInput("")
    setGameState("waiting")
    setTimeLeft(null)
    setShowWrongAnswer(false)
    setWrongAnswerInfo(null)
  }

  const isGameOver = lives <= 0 || (level > 100 && gameState === "success")

  const getHintText = () => {
    switch (sequenceType) {
      case sequenceType.includes("Arithmetic") ? sequenceType : "":
        return "Each number increases by the same amount"
      case sequenceType.includes("Geometric") ? sequenceType : "":
        return "Each number is multiplied by the same factor"
      case "Fibonacci":
        return "Each number is the sum of the two previous numbers"
      case "Perfect Squares":
        return "These are perfect squares: 1², 2², 3², 4²..."
      case "Prime Numbers":
        return "These are prime numbers (only divisible by 1 and themselves)"
      case "Factorials":
        return "These are factorials: 1!, 2!, 3!, 4!..."
      case "Triangular Numbers":
        return "These are triangular numbers: 1+2, 1+2+3, 1+2+3+4..."
      default:
        return `Pattern type: ${sequenceType}`
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Number Sequence</span>
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
            <div className="font-semibold text-sm">{difficulty}</div>
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
            <div className="text-xs text-gray-600">Hints</div>
            <div className="font-semibold text-sm">
              {maxHints - hintsUsed}/{maxHints}
            </div>
          </div>
        </div>

        {/* Timer */}
        {timeLimit && timeLeft !== null && gameState === "playing" && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Time Remaining:</span>
              <span className={`font-semibold ${timeLeft <= 10 ? "text-red-600" : "text-blue-600"}`}>{timeLeft}s</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${
                  timeLeft <= 10 ? "bg-red-500" : "bg-blue-500"
                }`}
                style={{ width: `${((timeLeft || 0) / timeLimit) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="text-center mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
            {level > 100 ? (
              <div>
                <div className="text-3xl mb-2">👑</div>
                <p className="text-purple-700 font-bold text-lg">MATH MASTER!</p>
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

        {/* Game Content */}
        {!isGameOver && gameState !== "waiting" && (
          <div className="space-y-4">
            {/* Sequence Type */}
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">
                Pattern: {sequenceType}
              </Badge>
              <p className="text-sm text-gray-600">Find the missing number in the sequence</p>
            </div>

            {/* Number Sequence */}
            <div className="text-center">
              <div className="flex flex-wrap justify-center gap-2 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                {currentSequence.map((num, index) => (
                  <div
                    key={index}
                    className={`min-w-[60px] h-12 flex items-center justify-center rounded-lg font-bold text-lg ${
                      index === missingIndex
                        ? "bg-yellow-200 border-2 border-yellow-400 text-yellow-800"
                        : "bg-white border border-gray-300 text-blue-700"
                    }`}
                  >
                    {index === missingIndex ? "?" : num.toLocaleString()}
                  </div>
                ))}
              </div>
            </div>

            {/* Hint Display */}
            {gameState === "hint" && (
              <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-700 font-semibold">💡 Hint:</p>
                <p className="text-sm text-yellow-600">{getHintText()}</p>
                <p className="text-xs text-yellow-500 mt-1">Position {missingIndex + 1} in the sequence</p>
              </div>
            )}

            {/* Input Field */}
            <div className="space-y-3">
              <input
                type="number"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && checkAnswer()}
                placeholder="Enter the missing number..."
                className="w-full p-3 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                disabled={gameState !== "playing"}
              />

              <div className="flex gap-2">
                <Button
                  onClick={checkAnswer}
                  disabled={!userInput.trim() || gameState !== "playing"}
                  className="flex-1"
                >
                  Submit Answer
                </Button>
                <Button
                  onClick={getHint}
                  disabled={hintsUsed >= maxHints || gameState !== "playing"}
                  variant="outline"
                  className="px-4"
                >
                  💡 Hint ({maxHints - hintsUsed})
                </Button>
              </div>
            </div>

            {/* Wrong Answer Display */}
            {showWrongAnswer && wrongAnswerInfo && (
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-700 font-semibold">❌ Incorrect!</p>
                <p className="text-sm text-red-600">
                  The correct answer was: {wrongAnswerInfo.answer.toLocaleString()}
                </p>
                <p className="text-xs text-red-500">Pattern: {wrongAnswerInfo.type}</p>
              </div>
            )}
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
          <Button onClick={() => generateSequence(1)} className="w-full">
            Start Number Challenge (100 Levels)
          </Button>
        )}

        {isGameOver && (
          <Button onClick={initializeGame} className="w-full mt-4">
            {level > 100 ? "Play Again" : "Start Challenge (100 Levels)"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
