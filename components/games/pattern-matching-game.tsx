"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw } from "lucide-react"

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pattern Matching</span>
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
            <div className="text-xs text-gray-600">Pattern</div>
            <div className="font-semibold text-xs">{patternType.split(" ")[0]}</div>
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

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="text-center mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
            {level > 100 ? (
              <div>
                <div className="text-3xl mb-2">👑</div>
                <p className="text-purple-700 font-bold text-lg">PATTERN MASTER!</p>
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
            {/* Pattern Type Display */}
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">
                {patternType}
              </Badge>
              <p className="text-sm text-gray-600">Complete the pattern:</p>
            </div>

            {/* Pattern Display */}
            <div className="text-center">
              <div className="flex flex-wrap justify-center items-center gap-2 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                {currentPattern.map((item, index) => (
                  <div
                    key={index}
                    className={`min-w-[50px] h-12 flex items-center justify-center rounded-lg font-bold ${
                      item === "?"
                        ? "bg-yellow-200 border-2 border-yellow-400 animate-pulse text-yellow-800"
                        : "bg-white border border-gray-300 text-blue-700"
                    } ${level > 50 ? "text-sm" : "text-lg"}`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              <p className="text-center font-semibold">Choose the missing piece:</p>
              <div
                className={`grid gap-3 ${
                  options.length <= 4 ? "grid-cols-2" : options.length <= 6 ? "grid-cols-3" : "grid-cols-4"
                }`}
              >
                {options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(option)}
                    className={`p-3 rounded-lg border-2 transition-all ${level > 50 ? "text-sm" : "text-lg"} ${
                      selectedAnswer === option
                        ? "border-blue-500 bg-blue-100"
                        : "border-gray-300 bg-white hover:border-blue-300"
                    }`}
                    disabled={gameState !== "playing"}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <Button onClick={checkAnswer} disabled={!selectedAnswer || gameState !== "playing"} className="w-full">
                Submit Answer
              </Button>
            </div>

            {/* Wrong Answer Display */}
            {showIncorrectMessage && gameState === "playing" && (
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-700 font-semibold">❌ Incorrect!</p>
                <p className="text-sm text-red-600">The correct answer was: {correctAnswer}</p>
                <p className="text-xs text-red-500">Pattern: {patternType}</p>
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
          <Button onClick={startGame} className="w-full">
            Start Pattern Challenge (100 Levels)
          </Button>
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
