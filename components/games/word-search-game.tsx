"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Search } from "lucide-react"

export default function WordSearchGame({ onComplete }: { onComplete: () => void }) {
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameState, setGameState] = useState<"waiting" | "playing" | "success" | "failed">("waiting")
  const [grid, setGrid] = useState<string[][]>([])
  const [words, setWords] = useState<string[]>([])
  const [foundWords, setFoundWords] = useState<string[]>([])
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([])
  const [timeLimit, setTimeLimit] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [streak, setStreak] = useState(0)
  const [gridSize, setGridSize] = useState(8)
  const [isSelecting, setIsSelecting] = useState(false)
  const [hintUsed, setHintUsed] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [hintWord, setHintWord] = useState("")
  const gridRef = useRef<HTMLDivElement>(null)

  const wordLists = {
    beginner: {
      health: ["LUNG", "QUIT", "HEAL", "LIFE", "BODY", "MIND", "REST", "CALM", "WELL", "GOOD"],
      nature: ["TREE", "LEAF", "BIRD", "WIND", "SUN", "MOON", "STAR", "LAKE", "HILL", "ROCK"],
      positive: ["HOPE", "LOVE", "CARE", "KIND", "GROW", "LIVE", "FREE", "RISE", "GAIN", "GLOW"],
    },
    easy: {
      health: ["BREATH", "HEALTH", "OXYGEN", "ENERGY", "STRONG", "ACTIVE", "BETTER", "LUNGS", "HEART", "CLEAN"],
      nature: ["FOREST", "FLOWER", "GARDEN", "STREAM", "MEADOW", "VALLEY", "SUNSET", "BREEZE", "SPRING", "OCEAN"],
      positive: ["FUTURE", "GROWTH", "CHANGE", "WISDOM", "COURAGE", "SPIRIT", "WONDER", "BEAUTY", "PEACE", "HAPPY"],
    },
    medium: {
      health: [
        "WELLNESS",
        "RECOVERY",
        "VITALITY",
        "STRENGTH",
        "ENDURANCE",
        "IMMUNITY",
        "BALANCE",
        "RENEWAL",
        "HEALTHY",
        "BREATHE",
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
        "IMPROVE",
      ],
      lifestyle: [
        "FREEDOM",
        "JOURNEY",
        "PROGRESS",
        "SUCCESS",
        "MINDFUL",
        "BALANCE",
        "ROUTINE",
        "HABITS",
        "CHOICE",
        "CHANGE",
      ],
    },
    hard: {
      health: [
        "RESPIRATORY",
        "CIRCULATION",
        "REGENERATE",
        "OXYGENATE",
        "HEALTHIER",
        "ENDURANCE",
        "RESILIENCE",
        "WELLBEING",
        "VITALITY",
      ],
      achievement: [
        "DEDICATION",
        "PERSEVERE",
        "DETERMINED",
        "COMMITMENT",
        "DISCIPLINE",
        "RESILIENT",
        "MOTIVATED",
        "CONSISTENT",
      ],
      lifestyle: [
        "TRANSFORMATION",
        "IMPROVEMENT",
        "DEVELOPMENT",
        "PROGRESSION",
        "ADVANCEMENT",
        "ENHANCEMENT",
        "EVOLUTION",
      ],
    },
    expert: {
      health: ["CARDIOVASCULAR", "REJUVENATION", "REVITALIZATION", "REHABILITATION", "DETOXIFICATION", "RESTORATION"],
      achievement: ["ACCOMPLISHMENT", "BREAKTHROUGH", "EXTRAORDINARY", "DETERMINATION", "PERSEVERANCE", "DEDICATION"],
      mindset: ["CONSCIOUSNESS", "ENLIGHTENMENT", "TRANSCENDENCE", "TRANSFORMATION", "EMPOWERMENT", "ACTUALIZATION"],
    },
  }

  useEffect(() => {
    if (gameState === "waiting") {
      initializeGame()
    }
  }, [gameState])

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
    let category = "beginner"
    let gridSize = 8
    let wordCount = 3
    let timeLimit: number | null = null
    let maxHints = 3

    if (currentLevel <= 20) {
      category = "beginner"
      gridSize = 8
      wordCount = 3
      timeLimit = currentLevel >= 10 ? 120 : null
      maxHints = 3
    } else if (currentLevel <= 40) {
      category = "easy"
      gridSize = 10
      wordCount = 4
      timeLimit = Math.max(90, 150 - currentLevel)
      maxHints = 2
    } else if (currentLevel <= 60) {
      category = "medium"
      gridSize = 12
      wordCount = 5
      timeLimit = Math.max(60, 120 - currentLevel)
      maxHints = 2
    } else if (currentLevel <= 80) {
      category = "hard"
      gridSize = 14
      wordCount = 6
      timeLimit = Math.max(45, 100 - currentLevel)
      maxHints = 1
    } else {
      category = "expert"
      gridSize = 16
      wordCount = 7
      timeLimit = Math.max(30, 80 - currentLevel)
      maxHints = 1
    }

    return { category, gridSize, wordCount, timeLimit, maxHints }
  }

  const initializeGame = () => {
    setLevel(1)
    setScore(0)
    setLives(3)
    setStreak(0)
    setFoundWords([])
    setSelectedCells([])
    setHintUsed(false)
    setShowHint(false)
    setGameState("playing")
    generateLevel(1)
  }

  const generateLevel = (currentLevel: number) => {
    const settings = getDifficultySettings(currentLevel)
    setGridSize(settings.gridSize)
    setTimeLimit(settings.timeLimit)
    setTimeLeft(settings.timeLimit)
    setHintUsed(false)
    setShowHint(false)

    const categoryData = wordLists[settings.category as keyof typeof wordLists]
    const categories = Object.keys(categoryData)
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)]
    const categoryWords = categoryData[selectedCategory as keyof typeof categoryData]

    const shuffledWords = [...categoryWords].sort(() => Math.random() - 0.5)
    const levelWords = shuffledWords.slice(0, settings.wordCount)

    const { grid, placedWords } = generateWordSearchGrid(settings.gridSize, levelWords)

    setGrid(grid)
    setWords(placedWords)
    setFoundWords([])
    setSelectedCells([])
    setGameState("playing")
  }

  const generateWordSearchGrid = (size: number, wordList: string[]) => {
    const grid: string[][] = Array(size)
      .fill(0)
      .map(() => Array(size).fill(""))
    const placedWords: string[] = []

    for (const word of wordList) {
      let placed = false
      let attempts = 0
      const maxAttempts = 100

      while (!placed && attempts < maxAttempts) {
        attempts++

        const direction = Math.floor(Math.random() * 4)

        let row, col
        let canPlace = false
        let positions: [number, number][] = []

        switch (direction) {
          case 0: // Horizontal
            row = Math.floor(Math.random() * size)
            col = Math.floor(Math.random() * (size - word.length + 1))

            canPlace = true
            positions = []
            for (let i = 0; i < word.length; i++) {
              if (grid[row][col + i] !== "" && grid[row][col + i] !== word[i]) {
                canPlace = false
                break
              }
              positions.push([row, col + i])
            }

            if (canPlace) {
              for (let i = 0; i < word.length; i++) {
                grid[row][col + i] = word[i]
              }
              placed = true
              placedWords.push(word)
            }
            break

          case 1: // Vertical
            row = Math.floor(Math.random() * (size - word.length + 1))
            col = Math.floor(Math.random() * size)

            canPlace = true
            positions = []
            for (let i = 0; i < word.length; i++) {
              if (grid[row + i][col] !== "" && grid[row + i][col] !== word[i]) {
                canPlace = false
                break
              }
              positions.push([row + i, col])
            }

            if (canPlace) {
              for (let i = 0; i < word.length; i++) {
                grid[row + i][col] = word[i]
              }
              placed = true
              placedWords.push(word)
            }
            break

          case 2: // Diagonal down
            row = Math.floor(Math.random() * (size - word.length + 1))
            col = Math.floor(Math.random() * (size - word.length + 1))

            canPlace = true
            positions = []
            for (let i = 0; i < word.length; i++) {
              if (grid[row + i][col + i] !== "" && grid[row + i][col + i] !== word[i]) {
                canPlace = false
                break
              }
              positions.push([row + i, col + i])
            }

            if (canPlace) {
              for (let i = 0; i < word.length; i++) {
                grid[row + i][col + i] = word[i]
              }
              placed = true
              placedWords.push(word)
            }
            break

          case 3: // Diagonal up
            row = Math.floor(Math.random() * (size - word.length + 1)) + word.length - 1
            col = Math.floor(Math.random() * (size - word.length + 1))

            canPlace = true
            positions = []
            for (let i = 0; i < word.length; i++) {
              if (grid[row - i][col + i] !== "" && grid[row - i][col + i] !== word[i]) {
                canPlace = false
                break
              }
              positions.push([row - i, col + i])
            }

            if (canPlace) {
              for (let i = 0; i < word.length; i++) {
                grid[row - i][col + i] = word[i]
              }
              placed = true
              placedWords.push(word)
            }
            break
        }
      }
    }

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (grid[i][j] === "") {
          grid[i][j] = letters[Math.floor(Math.random() * letters.length)]
        }
      }
    }

    return { grid, placedWords }
  }

  const handleCellMouseDown = (row: number, col: number) => {
    setIsSelecting(true)
    setSelectedCells([[row, col]])
  }

  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isSelecting) return

    const lastCell = selectedCells[selectedCells.length - 1]
    const rowDiff = Math.abs(row - lastCell[0])
    const colDiff = Math.abs(col - lastCell[1])

    if ((rowDiff === 0 && colDiff === 1) || (rowDiff === 1 && colDiff === 0) || (rowDiff === 1 && colDiff === 1)) {
      if (selectedCells.length >= 2) {
        const prevCell = selectedCells[selectedCells.length - 2]
        const currentDirection = getDirection(prevCell, lastCell)
        const newDirection = getDirection(lastCell, [row, col])

        if (currentDirection !== newDirection) {
          return
        }
      }

      const alreadySelected = selectedCells.some((cell) => cell[0] === row && cell[1] === col)
      if (!alreadySelected) {
        setSelectedCells([...selectedCells, [row, col]])
      }
    }
  }

  const getDirection = (cell1: [number, number], cell2: [number, number]) => {
    const rowDiff = cell2[0] - cell1[0]
    const colDiff = cell2[1] - cell1[1]

    if (rowDiff === 0 && colDiff === 1) return "right"
    if (rowDiff === 0 && colDiff === -1) return "left"
    if (rowDiff === 1 && colDiff === 0) return "down"
    if (rowDiff === -1 && colDiff === 0) return "up"
    if (rowDiff === 1 && colDiff === 1) return "down-right"
    if (rowDiff === 1 && colDiff === -1) return "down-left"
    if (rowDiff === -1 && colDiff === 1) return "up-right"
    if (rowDiff === -1 && colDiff === -1) return "up-left"
    return "unknown"
  }

  const handleCellMouseUp = () => {
    if (!isSelecting) return
    setIsSelecting(false)

    const selectedWord = selectedCells.map(([row, col]) => grid[row][col]).join("")
    const reversedWord = selectedWord.split("").reverse().join("")

    const foundWord = words.find((word) => word === selectedWord || word === reversedWord)

    if (foundWord && !foundWords.includes(foundWord)) {
      setFoundWords([...foundWords, foundWord])
      setStreak(streak + 1)

      const wordLength = foundWord.length
      const basePoints = wordLength * 10
      const timeBonus = timeLeft ? Math.floor(timeLeft / 10) : 0
      const streakBonus = streak * 5

      setScore(score + basePoints + timeBonus + streakBonus)

      if (foundWords.length + 1 >= words.length) {
        if (level >= 100) {
          setGameState("success")
          onComplete()
        } else {
          setLevel(level + 1)
          setTimeout(() => {
            generateLevel(level + 1)
          }, 1500)
        }
      }
    } else {
      setStreak(0)
    }

    setSelectedCells([])
  }

  const handleMouseLeave = () => {
    if (isSelecting) {
      setIsSelecting(false)
      setSelectedCells([])
    }
  }

  const useHint = () => {
    if (hintUsed || foundWords.length >= words.length) return

    const remainingWords = words.filter((word) => !foundWords.includes(word))
    if (remainingWords.length > 0) {
      const hintWord = remainingWords[Math.floor(Math.random() * remainingWords.length)]
      setHintWord(hintWord)
      setShowHint(true)
      setHintUsed(true)

      setTimeout(() => {
        setShowHint(false)
      }, 3000)
    }
  }

  const getDifficultyName = () => {
    if (level <= 20) return "Beginner"
    if (level <= 40) return "Easy"
    if (level <= 60) return "Medium"
    if (level <= 80) return "Hard"
    return "Expert"
  }

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some((cell) => cell[0] === row && cell[1] === col)
  }

  const isCellFoundWord = (row: number, col: number) => {
    return false
  }

  const getCellClass = (row: number, col: number) => {
    if (isCellSelected(row, col)) {
      return "bg-gradient-to-br from-yellow-400/80 to-orange-500/80 text-white shadow-lg scale-105"
    } else if (isCellFoundWord(row, col)) {
      return "bg-gradient-to-br from-green-400/80 to-emerald-500/80 text-white"
    } else {
      return "bg-gradient-to-br from-white/60 to-blue-100/60 text-blue-900 hover:from-blue-200/70 hover:to-purple-200/70 hover:scale-105"
    }
  }

  const resetGame = () => {
    setLevel(1)
    setScore(0)
    setLives(3)
    setStreak(0)
    setFoundWords([])
    setSelectedCells([])
    setHintUsed(false)
    setShowHint(false)
    setGameState("waiting")
  }

  const getGridColsClass = () => {
    switch (gridSize) {
      case 8:
        return "grid-cols-8"
      case 10:
        return "grid-cols-10"
      case 12:
        return "grid-cols-12"
      case 14:
        return "grid-cols-14"
      case 16:
        return "grid-cols-16"
      default:
        return "grid-cols-8"
    }
  }

  const getCellSize = () => {
    switch (gridSize) {
      case 8:
        return "w-8 h-8 text-lg"
      case 10:
        return "w-7 h-7 text-base"
      case 12:
        return "w-6 h-6 text-sm"
      case 14:
        return "w-5 h-5 text-xs"
      case 16:
        return "w-4 h-4 text-xs"
      default:
        return "w-8 h-8"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
      <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">Word Search Master</span>
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
              { label: "Found", value: `${foundWords.length}/${words.length}`, icon: "🔍" },
              { label: "Grid", value: `${gridSize}×${gridSize}`, icon: "📐" },
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
                <span className={`font-bold ${timeLeft <= 30 ? "text-red-600" : "text-blue-900"}`}>{timeLeft}s</span>
              </div>
              <div className="w-full bg-white/40 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    timeLeft <= 30
                      ? "bg-gradient-to-r from-red-400 to-red-600"
                      : "bg-gradient-to-r from-blue-400 to-purple-600"
                  }`}
                  style={{ width: `${((timeLeft || 0) / timeLimit) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {gameState === "failed" && (
            <div className="text-center mb-6 p-6 bg-gradient-to-br from-red-100/80 to-pink-100/80 backdrop-blur-sm rounded-xl border border-white/30">
              <div className="text-3xl mb-3">💔</div>
              <p className="text-red-700 font-bold text-lg mb-2">Game Over!</p>
              <p className="text-red-600 mb-2">You reached level {level}</p>
              <p className="text-gray-600 text-sm">Score: {score} points</p>
            </div>
          )}

          {/* Success Screen */}
          {gameState === "success" && (
            <div className="text-center mb-6 p-6 bg-gradient-to-br from-green-100/80 to-teal-100/80 backdrop-blur-sm rounded-xl border border-white/30">
              <div className="text-4xl mb-3">🏆</div>
              <p className="text-green-700 font-bold text-xl mb-2">WORD MASTER!</p>
              <p className="text-green-600 mb-2">You completed all 100 levels!</p>
              <p className="text-gray-600 text-sm">Final Score: {score} points</p>
            </div>
          )}

          {/* Hint Display */}
          {showHint && (
            <div className="text-center mb-6 p-4 bg-gradient-to-br from-yellow-100/80 to-orange-100/80 backdrop-blur-sm rounded-xl border border-white/30">
              <p className="text-yellow-700 font-bold">💡 Hint:</p>
              <p className="text-yellow-600">Look for the word: {hintWord}</p>
            </div>
          )}

          {/* Word List */}
          <div className="mb-6">
            <h3 className="text-blue-700 font-bold mb-3 text-center">🎯 Words to Find:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {words.map((word, index) => (
                <Badge
                  key={index}
                  className={`transition-all duration-300 ${
                    foundWords.includes(word)
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                      : "bg-gradient-to-r from-white/60 to-blue-100/60 text-blue-700 border-white/40"
                  }`}
                >
                  {foundWords.includes(word) ? `✓ ${word}` : word}
                </Badge>
              ))}
            </div>
          </div>

          {/* Word Search Grid */}
          {gameState === "playing" && (
            <div
              ref={gridRef}
              className="mb-6 select-none touch-none"
              onMouseLeave={handleMouseLeave}
              onTouchEnd={handleCellMouseUp}
            >
              <div className="bg-gradient-to-br from-white/40 to-blue-100/40 backdrop-blur-sm p-4 rounded-xl border border-white/30 shadow-lg">
                <div
                  className={`grid ${getGridColsClass()} gap-1 mx-auto max-w-full overflow-hidden`}
                  style={{ touchAction: "none" }}
                >
                  {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`${getCellSize()} flex items-center justify-center font-bold border border-white/20 rounded-lg cursor-pointer transition-all duration-300 ${getCellClass(
                          rowIndex,
                          colIndex,
                        )}`}
                        onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                        onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                        onMouseUp={handleCellMouseUp}
                        onTouchStart={() => handleCellMouseDown(rowIndex, colIndex)}
                        onTouchMove={(e) => {
                          if (gridRef.current) {
                            const rect = gridRef.current.getBoundingClientRect()
                            const touch = e.touches[0]
                            const x = touch.clientX - rect.left
                            const y = touch.clientY - rect.top
                            const cellSize = rect.width / gridSize
                            const touchRow = Math.floor(y / cellSize)
                            const touchCol = Math.floor(x / cellSize)
                            if (touchRow >= 0 && touchRow < gridSize && touchCol >= 0 && touchCol < gridSize) {
                              handleCellMouseEnter(touchRow, touchCol)
                            }
                          }
                        }}
                      >
                        {cell}
                      </div>
                    )),
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Hint Button */}
          {gameState === "playing" && !hintUsed && (
            <Button
              onClick={useHint}
              className="w-full mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
              disabled={hintUsed}
            >
              💡 Use Hint
            </Button>
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
            <Button
              onClick={initializeGame}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
            >
              🚀 Start Word Search Challenge (100 Levels)
            </Button>
          )}

          {gameState === "failed" && (
            <Button
              onClick={initializeGame}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
            >
              🔄 Try Again
            </Button>
          )}

          {gameState === "success" && (
            <Button
              onClick={initializeGame}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
            >
              🎮 Play Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
