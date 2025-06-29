"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, RotateCcw, Lightbulb } from "lucide-react"

interface WordPuzzleGameProps {
  onComplete: () => void
}

export default function WordPuzzleGame({ onComplete }: WordPuzzleGameProps) {
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [currentWord, setCurrentWord] = useState("")
  const [scrambledWord, setScrambledWord] = useState("")
  const [userInput, setUserInput] = useState("")
  const [gameState, setGameState] = useState<"waiting" | "playing" | "success" | "failed" | "hint">("waiting")
  const [timeLimit, setTimeLimit] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [maxHints, setMaxHints] = useState(3)
  const [wordCategory, setWordCategory] = useState("")
  const [streak, setStreak] = useState(0)

  // Dedicated state for wrong answer message
  const [showWrongAnswer, setShowWrongAnswer] = useState(false)
  const [wrongAnswerText, setWrongAnswerText] = useState("")

  const wordLists = {
    beginner: {
      health: ["HEART", "LUNGS", "CLEAN", "FRESH", "HAPPY", "STRONG", "VITAL", "PEACE", "CALM", "HOPE"],
      nature: ["TREE", "LEAF", "BIRD", "WIND", "SUN", "MOON", "STAR", "LAKE", "HILL", "ROCK"],
      positive: ["LOVE", "JOY", "SMILE", "DREAM", "WISH", "GIFT", "KIND", "NICE", "GOOD", "BEST"],
      simple: ["BOOK", "GAME", "TIME", "LIFE", "HOME", "WORK", "PLAY", "FOOD", "WALK", "TALK"],
    },
    easy: {
      health: ["BREATH", "ENERGY", "HEALTH", "OXYGEN", "MUSCLE", "IMMUNE", "ACTIVE", "BETTER", "HEALED", "STRONG"],
      nature: ["FOREST", "FLOWER", "GARDEN", "STREAM", "MEADOW", "VALLEY", "SUNSET", "BREEZE", "SPRING", "WINTER"],
      positive: ["BRIGHT", "FUTURE", "GROWTH", "CHANGE", "WISDOM", "COURAGE", "SPIRIT", "WONDER", "BEAUTY", "GRACE"],
      lifestyle: [
        "CHOICE",
        "HABITS",
        "GOALS",
        "FOCUS",
        "BALANCE",
        "MINDFUL",
        "JOURNEY",
        "PROGRESS",
        "SUCCESS",
        "FREEDOM",
      ],
    },
    medium: {
      health: [
        "HEALING",
        "WELLNESS",
        "RECOVERY",
        "VITALITY",
        "STRENGTH",
        "ENDURANCE",
        "IMMUNITY",
        "BALANCE",
        "RENEWAL",
        "RESTORE",
      ],
      science: [
        "BIOLOGY",
        "CHEMISTRY",
        "PHYSICS",
        "ANATOMY",
        "MOLECULE",
        "PROTEIN",
        "VITAMIN",
        "MINERAL",
        "CALCIUM",
        "GLUCOSE",
      ],
      motivation: [
        "ACHIEVE",
        "INSPIRE",
        "TRIUMPH",
        "VICTORY",
        "PERSIST",
        "OVERCOME",
        "CONQUER",
        "SUCCEED",
        "PROSPER",
        "FLOURISH",
      ],
      advanced: [
        "COMPLEX",
        "PATTERN",
        "SYSTEM",
        "NETWORK",
        "PROCESS",
        "FUNCTION",
        "STRUCTURE",
        "DYNAMIC",
        "ORGANIC",
        "NATURAL",
      ],
    },
    hard: {
      medical: [
        "RESPIRATORY",
        "CARDIOVASCULAR",
        "NEUROLOGICAL",
        "METABOLISM",
        "CIRCULATION",
        "REGENERATION",
        "DETOXIFICATION",
        "OXYGENATION",
      ],
      scientific: [
        "MOLECULAR",
        "BIOCHEMICAL",
        "PHYSIOLOGICAL",
        "PSYCHOLOGICAL",
        "THERAPEUTIC",
        "PHARMACEUTICAL",
        "DIAGNOSTIC",
        "SYSTEMATIC",
      ],
      achievement: [
        "EXCELLENCE",
        "MASTERY",
        "DEDICATION",
        "PERSEVERANCE",
        "DETERMINATION",
        "COMMITMENT",
        "DISCIPLINE",
        "RESILIENCE",
      ],
      complex: [
        "TRANSFORMATION",
        "OPTIMIZATION",
        "INTEGRATION",
        "COORDINATION",
        "COLLABORATION",
        "COMMUNICATION",
        "ORGANIZATION",
        "IMPLEMENTATION",
      ],
    },
    expert: {
      advanced: [
        "EXTRAORDINARY",
        "REVOLUTIONARY",
        "UNPRECEDENTED",
        "COMPREHENSIVE",
        "SOPHISTICATED",
        "MULTIDIMENSIONAL",
        "INTERCONNECTED",
        "TRANSFORMATIONAL",
      ],
      medical: [
        "IMMUNOLOGICAL",
        "PHARMACOLOGICAL",
        "PATHOPHYSIOLOGY",
        "NEUROTRANSMITTER",
        "ANTIOXIDANT",
        "CARDIOVASCULAR",
        "PULMONARY",
        "ENDOCRINOLOGY",
      ],
      achievement: [
        "ACCOMPLISHMENT",
        "BREAKTHROUGH",
        "EXTRAORDINARY",
        "PHENOMENAL",
        "EXCEPTIONAL",
        "OUTSTANDING",
        "REMARKABLE",
        "MAGNIFICENT",
      ],
      ultimate: [
        "CONSCIOUSNESS",
        "ENLIGHTENMENT",
        "TRANSCENDENCE",
        "METAMORPHOSIS",
        "REJUVENATION",
        "REVITALIZATION",
        "EMPOWERMENT",
        "ACTUALIZATION",
      ],
    },
  }

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
              generateWord(level)
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
    let category = "beginner"
    let timeLimit: number | null = null
    let maxHints = 3

    if (currentLevel <= 20) {
      category = "beginner"
      timeLimit = currentLevel >= 10 ? 60 : null
      maxHints = 3
    } else if (currentLevel <= 40) {
      category = "easy"
      timeLimit = Math.max(45, 70 - currentLevel)
      maxHints = 2
    } else if (currentLevel <= 60) {
      category = "medium"
      timeLimit = Math.max(30, 60 - currentLevel)
      maxHints = 2
    } else if (currentLevel <= 80) {
      category = "hard"
      timeLimit = Math.max(20, 50 - currentLevel)
      maxHints = 1
    } else {
      category = "expert"
      timeLimit = Math.max(15, 40 - currentLevel)
      maxHints = 1
    }

    return { category, timeLimit, maxHints }
  }

  const initializeGame = () => {
    setLevel(1)
    setScore(0)
    setLives(3)
    setStreak(0)
    setHintsUsed(0)
    setUserInput("")
    setGameState("waiting")
    // Clear wrong answer state
    setShowWrongAnswer(false)
    setWrongAnswerText("")
    generateWord(1)
  }

  const generateWord = (currentLevel: number) => {
    // Clear wrong answer state when generating new word
    setShowWrongAnswer(false)
    setWrongAnswerText("")

    const settings = getDifficultySettings(currentLevel)
    setTimeLimit(settings.timeLimit)
    setTimeLeft(settings.timeLimit)
    setMaxHints(settings.maxHints)
    setHintsUsed(0)

    const categoryData = wordLists[settings.category as keyof typeof wordLists]
    const categories = Object.keys(categoryData)
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)]
    const words = categoryData[selectedCategory as keyof typeof categoryData]
    const selectedWord = words[Math.floor(Math.random() * words.length)]

    setCurrentWord(selectedWord)
    setWordCategory(selectedCategory)
    setScrambledWord(scrambleWord(selectedWord))
    setUserInput("")
    setGameState("playing")
  }

  const scrambleWord = (word: string) => {
    const letters = word.split("")
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[letters[i], letters[j]] = [letters[j], letters[i]]
    }
    if (letters.join("") === word && word.length > 3) {
      return scrambleWord(word)
    }
    return letters.join("")
  }

  const checkAnswer = () => {
    if (userInput.toUpperCase() === currentWord) {
      // Correct answer - clear any wrong answer state
      setShowWrongAnswer(false)
      setWrongAnswerText("")

      const basePoints = currentWord.length * 10
      const timeBonus = timeLeft ? timeLeft * 2 : 0
      const hintPenalty = hintsUsed * 10
      const streakBonus = streak * 5
      const levelBonus = level * 5

      const totalPoints = Math.max(0, basePoints + timeBonus + streakBonus + levelBonus - hintPenalty)
      setScore(score + totalPoints)
      setStreak(streak + 1)

      if (level >= 100) {
        setGameState("success")
        onComplete()
      } else {
        setLevel(level + 1)
        setTimeout(() => {
          generateWord(level + 1)
        }, 1500)
      }
    } else {
      // Wrong answer - show error message
      setShowWrongAnswer(true)
      setWrongAnswerText(currentWord)

      const newLives = lives - 1
      setLives(newLives)
      setStreak(0)

      // Clear the wrong answer message after 2.5 seconds
      setTimeout(() => {
        setShowWrongAnswer(false)
        setWrongAnswerText("")
      }, 2500)

      if (newLives <= 0) {
        setGameState("failed")
      } else {
        setTimeout(() => {
          generateWord(level)
        }, 3000) // Wait a bit longer to show the error message
      }
    }
  }

  const getHint = () => {
    if (hintsUsed >= maxHints) return

    setHintsUsed(hintsUsed + 1)
    setGameState("hint")
    setTimeout(() => {
      setGameState("playing")
    }, 2000)
  }

  const getDifficultyName = () => {
    if (level <= 20) return "Beginner"
    if (level <= 40) return "Easy"
    if (level <= 60) return "Medium"
    if (level <= 80) return "Hard"
    return "Expert"
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
    // Clear wrong answer state
    setShowWrongAnswer(false)
    setWrongAnswerText("")
  }

  const isGameOver = lives <= 0 || (level > 100 && gameState === "success")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Word Puzzle</h2>
                <p className="text-blue-100 text-sm">Unscramble the letters!</p>
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
                  <p className="text-purple-700 font-bold text-2xl mb-2">WORD MASTER!</p>
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
              {/* Category and Word Length */}
              <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <Badge className="mb-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-lg">
                  Category: {wordCategory.charAt(0).toUpperCase() + wordCategory.slice(1)}
                </Badge>
                <p className="text-indigo-700 font-medium">{currentWord.length} letters</p>
              </div>

              {/* Scrambled Word */}
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-lg">
                <div className="text-3xl font-bold tracking-wider">
                  {scrambledWord.split("").map((letter, index) => (
                    <span
                      key={index}
                      className="mx-2 p-3 bg-white rounded-lg shadow-md text-blue-700 inline-block transform hover:scale-110 transition-transform duration-200"
                    >
                      {letter}
                    </span>
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
                  <p className="text-yellow-600 mb-2">This word is related to {wordCategory}</p>
                  <p className="text-yellow-500 text-sm">First letter: {currentWord[0]}</p>
                </div>
              )}

              {/* Wrong Answer Display - Only show when showWrongAnswer is true */}
              {showWrongAnswer && (
                <div className="text-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 shadow-lg">
                  <p className="text-red-700 font-bold text-lg mb-2">❌ Incorrect!</p>
                  <p className="text-red-600">
                    The correct answer was: <span className="font-bold">{wrongAnswerText}</span>
                  </p>
                </div>
              )}

              {/* Input Field */}
              <div className="space-y-4">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === "Enter" && checkAnswer()}
                  placeholder="Enter your answer..."
                  className="w-full p-4 text-center text-xl font-bold border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none bg-white shadow-lg transition-all duration-200"
                  maxLength={currentWord.length}
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
              onClick={() => generateWord(1)}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🚀 Start Word Challenge (100 Levels)
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
