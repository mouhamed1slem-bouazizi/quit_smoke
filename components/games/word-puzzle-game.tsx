"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw } from "lucide-react"

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
    generateWord(1)
  }

  const generateWord = (currentLevel: number) => {
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
      const newLives = lives - 1
      setLives(newLives)
      setStreak(0)

      if (newLives <= 0) {
        setGameState("failed")
      } else {
        setTimeout(() => {
          generateWord(level)
        }, 2000)
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
  }

  const isGameOver = lives <= 0 || (level > 100 && gameState === "success")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Word Puzzle</span>
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
                <p className="text-purple-700 font-bold text-lg">WORD MASTER!</p>
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
            {/* Category and Word Length */}
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">
                Category: {wordCategory.charAt(0).toUpperCase() + wordCategory.slice(1)}
              </Badge>
              <p className="text-sm text-gray-600">{currentWord.length} letters</p>
            </div>

            {/* Scrambled Word */}
            <div className="text-center">
              <div className="text-2xl font-bold tracking-wider bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                {scrambledWord.split("").map((letter, index) => (
                  <span key={index} className="mx-1 text-blue-700">
                    {letter}
                  </span>
                ))}
              </div>
            </div>

            {/* Hint Display */}
            {gameState === "hint" && (
              <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-700 font-semibold">💡 Hint: This word is related to {wordCategory}</p>
                <p className="text-sm text-yellow-600">First letter: {currentWord[0]}</p>
              </div>
            )}

            {/* Input Field */}
            <div className="space-y-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === "Enter" && checkAnswer()}
                placeholder="Enter your answer..."
                className="w-full p-3 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                maxLength={currentWord.length}
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
            {lives < 3 && gameState === "playing" && (
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-700 font-semibold">❌ Incorrect!</p>
                <p className="text-sm text-red-600">The correct answer was: {currentWord}</p>
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
          <Button onClick={() => generateWord(1)} className="w-full">
            Start Word Challenge (100 Levels)
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
