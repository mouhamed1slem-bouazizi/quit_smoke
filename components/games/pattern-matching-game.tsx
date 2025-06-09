"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Puzzle, RotateCcw } from "lucide-react"

interface PatternMatchingGameProps {
  onComplete: () => void
}

export default function PatternMatchingGame({ onComplete }: PatternMatchingGameProps) {
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameState, setGameState] = useState<"waiting" | "playing" | "success" | "failed">("waiting")
  const [currentPattern, setCurrentPattern] = useState<string[]>([])
  const [options, setOptions] = useState<string[]>([])
  const [correctAnswer, setCorrectAnswer] = useState("")
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [showIncorrectMessage, setShowIncorrectMessage] = useState(false)
  const [timeLimit, setTimeLimit] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [patternType, setPatternType] = useState("")
  const [streak, setStreak] = useState(0)

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
              generateLevel(level)
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
    let difficulty = "Beginner"
    let patternLength = 4
    let optionCount = 4

    if (currentLevel <= 15) {
      difficulty = "Beginner"
      patternLength = 4
      optionCount = 4
      timeLimit = currentLevel >= 10 ? 30 : null
    } else if (currentLevel <= 30) {
      difficulty = "Easy"
      patternLength = 5
      optionCount = 4
      timeLimit = Math.max(25, 35 - currentLevel)
    } else if (currentLevel <= 50) {
      difficulty = "Medium"
      patternLength = 6
      optionCount = 6
      timeLimit = Math.max(20, 30 - currentLevel)
    } else if (currentLevel <= 75) {
      difficulty = "Hard"
      patternLength = 7
      optionCount = 6
      timeLimit = Math.max(15, 25 - currentLevel)
    } else {
      difficulty = "Expert"
      patternLength = 8
      optionCount = 8
      timeLimit = Math.max(10, 20 - currentLevel)
    }

    return { timeLimit, difficulty, patternLength, optionCount }
  }

  const generatePattern = (level: number) => {
    const settings = getDifficultySettings(level)

    if (level <= 15) {
      return generateBasicPatterns(settings.patternLength, settings.optionCount)
    } else if (level <= 30) {
      return generateColorShapePatterns(settings.patternLength, settings.optionCount)
    } else if (level <= 50) {
      return generateSequencePatterns(settings.patternLength, settings.optionCount)
    } else if (level <= 75) {
      return generateMathematicalPatterns(settings.patternLength, settings.optionCount)
    } else {
      return generateComplexLogicalPatterns(settings.patternLength, settings.optionCount)
    }
  }

  const generateBasicPatterns = (length: number, optionCount: number) => {
    const patterns = [
      {
        generator: () => {
          const symbols = ["🔴", "🔵"]
          const sequence = []
          for (let i = 0; i < length; i++) {
            sequence.push(symbols[i % 2])
          }
          return { sequence, answer: symbols[length % 2], type: "Alternating Colors" }
        },
      },
      {
        generator: () => {
          const symbols = ["⭐", "💫"]
          const sequence = []
          for (let i = 0; i < length; i++) {
            sequence.push(symbols[i % 2])
          }
          return { sequence, answer: symbols[length % 2], type: "Alternating Stars" }
        },
      },
      {
        generator: () => {
          const symbols = ["🍎", "🍌", "🍇"]
          const sequence = []
          for (let i = 0; i < length; i++) {
            sequence.push(symbols[i % 3])
          }
          return { sequence, answer: symbols[length % 3], type: "Fruit Cycle" }
        },
      },
      {
        generator: () => {
          const symbols = ["😀", "😊", "🙂"]
          const sequence = []
          for (let i = 0; i < length; i++) {
            sequence.push(symbols[i % 3])
          }
          return { sequence, answer: symbols[length % 3], type: "Emoji Cycle" }
        },
      },
    ]

    const pattern = patterns[Math.floor(Math.random() * patterns.length)].generator()
    const allOptions = ["🔴", "🔵", "🟢", "🟡", "⭐", "💫", "✨", "🌟", "🍎", "🍌", "🍇", "🍊", "😀", "😊", "🙂", "😄"]
    const options = [pattern.answer]

    while (options.length < optionCount) {
      const randomOption = allOptions[Math.floor(Math.random() * allOptions.length)]
      if (!options.includes(randomOption)) {
        options.push(randomOption)
      }
    }

    return {
      sequence: [...pattern.sequence, "?"],
      answer: pattern.answer,
      options: options.sort(() => Math.random() - 0.5),
      type: pattern.type,
    }
  }

  const generateColorShapePatterns = (length: number, optionCount: number) => {
    const patterns = [
      {
        generator: () => {
          const symbols = ["🔴", "🔵", "🔴", "🔵", "🟢"]
          const sequence = []
          for (let i = 0; i < length; i++) {
            sequence.push(symbols[i % symbols.length])
          }
          return { sequence, answer: symbols[length % symbols.length], type: "Color Sequence" }
        },
      },
      {
        generator: () => {
          const symbols = ["🔺", "🔻", "🔺", "🔻"]
          const sequence = []
          for (let i = 0; i < length; i++) {
            sequence.push(symbols[i % symbols.length])
          }
          return { sequence, answer: symbols[length % symbols.length], type: "Triangle Pattern" }
        },
      },
    ]

    const pattern = patterns[Math.floor(Math.random() * patterns.length)].generator()
    const allOptions = ["🔴", "🔵", "🟢", "🟡", "🟣", "🟠", "🔺", "🔻", "🟦", "🟨", "🟩"]
    const options = [pattern.answer]

    while (options.length < optionCount) {
      const randomOption = allOptions[Math.floor(Math.random() * allOptions.length)]
      if (!options.includes(randomOption)) {
        options.push(randomOption)
      }
    }

    return {
      sequence: [...pattern.sequence, "?"],
      answer: pattern.answer,
      options: options.sort(() => Math.random() - 0.5),
      type: pattern.type,
    }
  }

  const generateSequencePatterns = (length: number, optionCount: number) => {
    const patterns = [
      {
        generator: () => {
          const start = Math.floor(Math.random() * 5) + 1
          const diff = Math.floor(Math.random() * 3) + 1
          const sequence = []
          for (let i = 0; i < length; i++) {
            sequence.push((start + i * diff).toString())
          }
          return { sequence, answer: (start + length * diff).toString(), type: `Arithmetic (+${diff})` }
        },
      },
      {
        generator: () => {
          const start = Math.floor(Math.random() * 20)
          const sequence = []
          for (let i = 0; i < length; i++) {
            sequence.push(String.fromCharCode(65 + ((start + i) % 26)))
          }
          return { sequence, answer: String.fromCharCode(65 + ((start + length) % 26)), type: "Letter Sequence" }
        },
      },
    ]

    const pattern = patterns[Math.floor(Math.random() * patterns.length)].generator()
    const options = [pattern.answer]

    while (options.length < optionCount) {
      let wrongAnswer
      if (pattern.type.includes("Arithmetic")) {
        const num = Number.parseInt(pattern.answer)
        wrongAnswer = (num + Math.floor(Math.random() * 10) - 5).toString()
      } else if (pattern.type === "Letter Sequence") {
        const charCode = pattern.answer.charCodeAt(0)
        wrongAnswer = String.fromCharCode(65 + ((charCode - 65 + Math.floor(Math.random() * 6) - 3) % 26))
      } else {
        const num = Number.parseInt(pattern.answer)
        wrongAnswer = (num + Math.floor(Math.random() * 20) - 10).toString()
      }

      if (!options.includes(wrongAnswer) && wrongAnswer !== "0" && !wrongAnswer.includes("-")) {
        options.push(wrongAnswer)
      }
    }

    return {
      sequence: [...pattern.sequence, "?"],
      answer: pattern.answer,
      options: options.sort(() => Math.random() - 0.5),
      type: pattern.type,
    }
  }

  const generateMathematicalPatterns = (length: number, optionCount: number) => {
    const patterns = [
      {
        generator: () => {
          const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
          const sequence = primes.slice(0, length).map((n) => n.toString())
          return { sequence, answer: primes[length].toString(), type: "Prime Numbers" }
        },
      },
      {
        generator: () => {
          const sequence = []
          for (let i = 1; i <= length; i++) {
            sequence.push((i * i).toString())
          }
          return { sequence, answer: ((length + 1) * (length + 1)).toString(), type: "Perfect Squares" }
        },
      },
    ]

    const pattern = patterns[Math.floor(Math.random() * patterns.length)].generator()
    const options = [pattern.answer]

    while (options.length < optionCount) {
      const num = Number.parseInt(pattern.answer)
      const wrongAnswer = (num + Math.floor(Math.random() * 20) - 10).toString()
      if (!options.includes(wrongAnswer) && wrongAnswer !== "0" && !wrongAnswer.includes("-")) {
        options.push(wrongAnswer)
      }
    }

    return {
      sequence: [...pattern.sequence, "?"],
      answer: pattern.answer,
      options: options.sort(() => Math.random() - 0.5),
      type: pattern.type,
    }
  }

  const generateComplexLogicalPatterns = (length: number, optionCount: number) => {
    const patterns = [
      {
        generator: () => {
          const symbols = ["🔴", "🔵", "🟢", "🟡"]
          const matrix = []
          for (let i = 0; i < length; i++) {
            matrix.push(symbols[(i * 2) % symbols.length])
          }
          return { sequence: matrix, answer: symbols[(length * 2) % symbols.length], type: "Matrix Pattern" }
        },
      },
      {
        generator: () => {
          const sequence = []
          for (let i = 0; i < length; i++) {
            if (i % 3 === 0) sequence.push("🔺")
            else if (i % 3 === 1) sequence.push("🔴")
            else sequence.push("🔵")
          }
          let answer
          if (length % 3 === 0) answer = "🔺"
          else if (length % 3 === 1) answer = "🔴"
          else answer = "🔵"
          return { sequence, answer, type: "Conditional Logic" }
        },
      },
    ]

    const pattern = patterns[Math.floor(Math.random() * patterns.length)].generator()
    const allOptions = ["🔴", "🔵", "🟢", "🟡", "🟣", "🟠", "🔺", "🔻", "A", "B", "C", "D"]
    const options = [pattern.answer]

    while (options.length < optionCount) {
      const wrongAnswer = allOptions[Math.floor(Math.random() * allOptions.length)]
      if (!options.includes(wrongAnswer)) {
        options.push(wrongAnswer)
      }
    }

    return {
      sequence: [...pattern.sequence, "?"],
      answer: pattern.answer,
      options: options.sort(() => Math.random() - 0.5),
      type: pattern.type,
    }
  }

  const startGame = () => {
    setLevel(1)
    setScore(0)
    setLives(3)
    setStreak(0)
    setSelectedAnswer("")
    generateLevel(1)
  }

  const checkAnswer = () => {
    if (selectedAnswer === correctAnswer) {
      const basePoints = level * 10
      const timeBonus = timeLeft ? timeLeft * 2 : 0
      const streakBonus = streak * 5
      const difficultyBonus = level > 50 ? level : 0

      const totalPoints = basePoints + timeBonus + streakBonus + difficultyBonus
      setScore(score + totalPoints)
      setStreak(streak + 1)
      setShowIncorrectMessage(false)

      if (level >= 100) {
        setGameState("success")
        onComplete()
      } else {
        setLevel(level + 1)
        setTimeout(() => {
          generateLevel(level + 1)
        }, 1000)
      }
    } else {
      const newLives = lives - 1
      setLives(newLives)
      setStreak(0)
      setShowIncorrectMessage(true)

      if (newLives <= 0) {
        setGameState("failed")
      } else {
        setTimeout(() => {
          setShowIncorrectMessage(false)
          generateLevel(level)
        }, 1500)
      }
    }
    setSelectedAnswer("")
  }

  const generateLevel = (currentLevel: number) => {
    const settings = getDifficultySettings(currentLevel)
    setTimeLimit(settings.timeLimit)
    setTimeLeft(settings.timeLimit)

    const patternData = generatePattern(currentLevel)
    setCurrentPattern(patternData.sequence)
    setOptions(patternData.options)
    setCorrectAnswer(patternData.answer)
    setPatternType(patternData.type)
    setShowIncorrectMessage(false)
    setGameState("playing")
  }

  const resetGame = () => {
    setLevel(1)
    setScore(0)
    setLives(3)
    setStreak(0)
    setSelectedAnswer("")
    setShowIncorrectMessage(false)
    setGameState("waiting")
    setTimeLeft(null)
  }

  const getDifficultyName = () => {
    if (level <= 15) return "Beginner"
    if (level <= 30) return "Easy"
    if (level <= 50) return "Medium"
    if (level <= 75) return "Hard"
    return "Expert"
  }

  const isGameOver = lives <= 0 || (level > 100 && gameState === "success")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Puzzle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Pattern Matching</h2>
                <p className="text-blue-100 text-sm">Complete the pattern!</p>
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
              <div className="font-bold text-sm text-blue-800">{getDifficultyName()}</div>
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
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 shadow-sm">
              <div className="text-xs text-purple-600 font-medium mb-1">Pattern</div>
              <div className="font-bold text-xs text-purple-800">{patternType.split(" ")[0]}</div>
            </div>
          </div>

          {/* Timer */}
          {timeLimit && timeLeft !== null && gameState === "playing" && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-orange-700">Time Remaining:</span>
                <span className={`font-bold ${timeLeft <= 5 ? "text-red-600" : "text-orange-600"}`}>{timeLeft}s</span>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-3 shadow-inner">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    timeLeft <= 5
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
                  <p className="text-purple-700 font-bold text-2xl mb-2">PATTERN MASTER!</p>
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
              {/* Pattern Type Display */}
              <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <Badge className="mb-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-lg">
                  {patternType}
                </Badge>
                <p className="text-indigo-700 font-medium">Complete the pattern:</p>
              </div>

              {/* Pattern Display */}
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-lg">
                <div className="flex flex-wrap justify-center items-center gap-3">
                  {currentPattern.map((item, index) => (
                    <div
                      key={index}
                      className={`min-w-[60px] h-16 flex items-center justify-center rounded-xl font-bold text-lg shadow-lg transform transition-all duration-200 ${
                        item === "?"
                          ? "bg-gradient-to-br from-yellow-200 to-yellow-400 border-2 border-yellow-500 animate-pulse text-yellow-800 scale-110"
                          : "bg-gradient-to-br from-white to-blue-50 border border-blue-200 text-blue-700 hover:scale-105"
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Answer Options */}
              <div className="space-y-4">
                <p className="text-center font-bold text-lg text-gray-700">Choose the missing piece:</p>
                <div
                  className={`grid gap-4 ${
                    options.length <= 4 ? "grid-cols-2" : options.length <= 6 ? "grid-cols-3" : "grid-cols-4"
                  }`}
                >
                  {options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswer(option)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 font-bold text-lg shadow-lg transform hover:scale-105 ${
                        selectedAnswer === option
                          ? "border-blue-500 bg-gradient-to-br from-blue-100 to-blue-200 scale-105 shadow-xl"
                          : "border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-blue-300 hover:shadow-xl"
                      }`}
                      disabled={gameState !== "playing"}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={checkAnswer}
                  disabled={!selectedAnswer || gameState !== "playing"}
                  className="w-full h-12 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  ✓ Submit Answer
                </Button>
              </div>

              {/* Wrong Answer Display */}
              {showIncorrectMessage && gameState === "playing" && (
                <div className="text-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 shadow-lg">
                  <p className="text-red-700 font-bold text-lg mb-2">❌ Incorrect!</p>
                  <p className="text-red-600 mb-1">
                    The correct answer was: <span className="font-bold">{correctAnswer}</span>
                  </p>
                  <p className="text-red-500 text-sm">Pattern: {patternType}</p>
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
              onClick={startGame}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🚀 Start Pattern Challenge (100 Levels)
            </Button>
          )}

          {isGameOver && (
            <Button
              onClick={startGame}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mt-4"
            >
              {level > 100 ? "🎮 Play Again" : "🚀 Try Again"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
