"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calculator, RotateCcw, Lightbulb } from "lucide-react"

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Number Sequence</h2>
                <p className="text-blue-100 text-sm">Find the missing number!</p>
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
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
              <div className="text-xs text-blue-600 font-medium mb-1">Difficulty</div>
              <div className="font-bold text-sm text-blue-800">{difficulty}</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100 shadow-sm">
              <div className="text-xs text-red-600 font-medium mb-1">Lives</div>
              <div className="font-bold text-sm">
                {"❤️".repeat(lives)}
                {"🤍".repeat(3 - lives)}
              </div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 shadow-sm">
              <div className="text-xs text-green-600 font-medium mb-1">Streak</div>
              <div className="font-bold text-sm text-green-800">{streak}</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-100 shadow-sm">
              <div className="text-xs text-yellow-600 font-medium mb-1">Hints</div>
              <div className="font-bold text-sm text-yellow-800">
                {maxHints - hintsUsed}/{maxHints}
              </div>
            </div>
          </div>

          {/* Timer */}
          {timeLimit && timeLeft !== null && gameState === "playing" && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-orange-700">Time Remaining:</span>
                <span className={`font-bold ${timeLeft <= 10 ? "text-red-600" : "text-orange-600"}`}>{timeLeft}s</span>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-3 shadow-inner">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    timeLeft <= 10
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : "bg-gradient-to-r from-orange-500 to-yellow-500"
                  }`}
                  style={{ width: `${((timeLeft || 0) / timeLimit) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {isGameOver && (
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 rounded-2xl border-2 border-purple-200 shadow-xl">
              {level > 100 ? (
                <div>
                  <div className="text-6xl mb-4 animate-bounce">👑</div>
                  <p className="text-purple-700 font-bold text-2xl mb-2">MATH MASTER!</p>
                  <p className="text-purple-600 text-lg mb-2">You completed all 100 levels!</p>
                  <p className="text-gray-600 font-medium">Final Score: {score} points</p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-4">💔</div>
                  <p className="text-red-700 font-bold text-xl mb-2">Game Over!</p>
                  <p className="text-red-600 text-lg mb-2">You reached level {level}</p>
                  <p className="text-gray-600 font-medium">Score: {score} points</p>
                </div>
              )}
            </div>
          )}

          {/* Game Content */}
          {!isGameOver && gameState !== "waiting" && (
            <div className="space-y-6">
              {/* Sequence Type */}
              <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <Badge className="mb-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-lg">
                  Pattern: {sequenceType}
                </Badge>
                <p className="text-indigo-700 font-medium">Find the missing number in the sequence</p>
              </div>

              {/* Number Sequence */}
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-lg">
                <div className="flex flex-wrap justify-center gap-3">
                  {currentSequence.map((num, index) => (
                    <div
                      key={index}
                      className={`min-w-[70px] h-16 flex items-center justify-center rounded-xl font-bold text-xl shadow-lg transform transition-all duration-200 ${
                        index === missingIndex
                          ? "bg-gradient-to-br from-yellow-200 to-yellow-400 border-2 border-yellow-500 text-yellow-800 animate-pulse scale-110"
                          : "bg-gradient-to-br from-white to-blue-50 border border-blue-200 text-blue-700 hover:scale-105"
                      }`}
                    >
                      {index === missingIndex ? "?" : num.toLocaleString()}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hint Display */}
              {gameState === "hint" && (
                <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 shadow-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    <p className="text-yellow-700 font-bold">Hint:</p>
                  </div>
                  <p className="text-yellow-600 mb-2">{getHintText()}</p>
                  <p className="text-yellow-500 text-sm">Position {missingIndex + 1} in the sequence</p>
                </div>
              )}

              {/* Input Field */}
              <div className="space-y-4">
                <input
                  type="number"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && checkAnswer()}
                  placeholder="Enter the missing number..."
                  className="w-full p-4 text-center text-xl font-bold border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none bg-white shadow-lg transition-all duration-200"
                  disabled={gameState !== "playing"}
                />

                <div className="flex gap-3">
                  <Button
                    onClick={checkAnswer}
                    disabled={!userInput.trim() || gameState !== "playing"}
                    className="flex-1 h-12 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    ✓ Submit Answer
                  </Button>
                  <Button
                    onClick={getHint}
                    disabled={hintsUsed >= maxHints || gameState !== "playing"}
                    className="px-6 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Lightbulb className="w-4 h-4 mr-1" />
                    Hint ({maxHints - hintsUsed})
                  </Button>
                </div>
              </div>

              {/* Wrong Answer Display */}
              {showWrongAnswer && wrongAnswerInfo && (
                <div className="text-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 shadow-lg">
                  <p className="text-red-700 font-bold text-lg mb-2">❌ Incorrect!</p>
                  <p className="text-red-600 mb-1">
                    The correct answer was: <span className="font-bold">{wrongAnswerInfo.answer.toLocaleString()}</span>
                  </p>
                  <p className="text-red-500 text-sm">Pattern: {wrongAnswerInfo.type}</p>
                </div>
              )}
            </div>
          )}

          {/* Progress to Level 100 */}
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

          {/* Start Button */}
          {gameState === "waiting" && (
            <Button
              onClick={() => generateSequence(1)}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🚀 Start Number Challenge (100 Levels)
            </Button>
          )}

          {isGameOver && (
            <Button
              onClick={initializeGame}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mt-4"
            >
              {level > 100 ? "🎮 Play Again" : "🚀 Start Challenge (100 Levels)"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
