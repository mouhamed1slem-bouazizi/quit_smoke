"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Search } from "lucide-react"

// Word search game component
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

  // Word lists by category and difficulty
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

  // Initialize game
  useEffect(() => {
    if (gameState === "waiting") {
      initializeGame()
    }
  }, [gameState])

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (timeLeft !== null && timeLeft > 0 && gameState === "playing") {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev !== null && prev <= 1) {
            // Time's up - lose a life
            const newLives = lives - 1
            setLives(newLives)
            if (newLives <= 0) {
              setGameState("failed")
              return null
            } else {
              // Reset current level
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

  // Get difficulty settings based on level
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

  // Initialize game
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

  // Generate a level
  const generateLevel = (currentLevel: number) => {
    const settings = getDifficultySettings(currentLevel)
    setGridSize(settings.gridSize)
    setTimeLimit(settings.timeLimit)
    setTimeLeft(settings.timeLimit)
    setHintUsed(false)
    setShowHint(false)

    // Select words for this level
    const categoryData = wordLists[settings.category as keyof typeof wordLists]
    const categories = Object.keys(categoryData)
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)]
    const categoryWords = categoryData[selectedCategory as keyof typeof categoryData]

    // Shuffle and select words
    const shuffledWords = [...categoryWords].sort(() => Math.random() - 0.5)
    const levelWords = shuffledWords.slice(0, settings.wordCount)

    // Generate grid with words
    const { grid, placedWords } = generateWordSearchGrid(settings.gridSize, levelWords)

    setGrid(grid)
    setWords(placedWords)
    setFoundWords([])
    setSelectedCells([])
    setGameState("playing")
  }

  // Generate word search grid
  const generateWordSearchGrid = (size: number, wordList: string[]) => {
    // Create empty grid
    const grid: string[][] = Array(size)
      .fill(0)
      .map(() => Array(size).fill(""))
    const placedWords: string[] = []

    // Try to place each word
    for (const word of wordList) {
      let placed = false
      let attempts = 0
      const maxAttempts = 100

      while (!placed && attempts < maxAttempts) {
        attempts++

        // Random direction (0: horizontal, 1: vertical, 2: diagonal down, 3: diagonal up)
        const direction = Math.floor(Math.random() * 4)

        // Random starting position
        let row, col
        let canPlace = false
        let positions: [number, number][] = []

        switch (direction) {
          case 0: // Horizontal
            row = Math.floor(Math.random() * size)
            col = Math.floor(Math.random() * (size - word.length + 1))

            // Check if word fits
            canPlace = true
            positions = []
            for (let i = 0; i < word.length; i++) {
              if (grid[row][col + i] !== "" && grid[row][col + i] !== word[i]) {
                canPlace = false
                break
              }
              positions.push([row, col + i])
            }

            // Place word
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

            // Check if word fits
            canPlace = true
            positions = []
            for (let i = 0; i < word.length; i++) {
              if (grid[row + i][col] !== "" && grid[row + i][col] !== word[i]) {
                canPlace = false
                break
              }
              positions.push([row + i, col])
            }

            // Place word
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

            // Check if word fits
            canPlace = true
            positions = []
            for (let i = 0; i < word.length; i++) {
              if (grid[row + i][col + i] !== "" && grid[row + i][col + i] !== word[i]) {
                canPlace = false
                break
              }
              positions.push([row + i, col + i])
            }

            // Place word
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

            // Check if word fits
            canPlace = true
            positions = []
            for (let i = 0; i < word.length; i++) {
              if (grid[row - i][col + i] !== "" && grid[row - i][col + i] !== word[i]) {
                canPlace = false
                break
              }
              positions.push([row - i, col + i])
            }

            // Place word
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

    // Fill remaining cells with random letters
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

  // Handle cell selection start
  const handleCellMouseDown = (row: number, col: number) => {
    setIsSelecting(true)
    setSelectedCells([[row, col]])
  }

  // Handle cell selection move
  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isSelecting) return

    // Check if cell is adjacent to last selected cell
    const lastCell = selectedCells[selectedCells.length - 1]
    const rowDiff = Math.abs(row - lastCell[0])
    const colDiff = Math.abs(col - lastCell[1])

    // Only allow selection in straight lines (horizontal, vertical, diagonal)
    if (
      (rowDiff === 0 && colDiff === 1) || // Horizontal
      (rowDiff === 1 && colDiff === 0) || // Vertical
      (rowDiff === 1 && colDiff === 1)
    ) {
      // Diagonal

      // Check if we're continuing in the same direction
      if (selectedCells.length >= 2) {
        const prevCell = selectedCells[selectedCells.length - 2]
        const currentDirection = getDirection(prevCell, lastCell)
        const newDirection = getDirection(lastCell, [row, col])

        if (currentDirection !== newDirection) {
          return // Don't allow changing direction
        }
      }

      // Check if cell is already selected
      const alreadySelected = selectedCells.some((cell) => cell[0] === row && cell[1] === col)
      if (!alreadySelected) {
        setSelectedCells([...selectedCells, [row, col]])
      }
    }
  }

  // Get direction between two cells
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

  // Handle cell selection end
  const handleCellMouseUp = () => {
    if (!isSelecting) return
    setIsSelecting(false)

    // Check if selected cells form a word
    const selectedWord = selectedCells.map(([row, col]) => grid[row][col]).join("")
    const reversedWord = selectedWord.split("").reverse().join("")

    // Check if word is in the list
    const foundWord = words.find((word) => word === selectedWord || word === reversedWord)

    if (foundWord && !foundWords.includes(foundWord)) {
      // Word found!
      setFoundWords([...foundWords, foundWord])
      setStreak(streak + 1)

      // Add points
      const wordLength = foundWord.length
      const basePoints = wordLength * 10
      const timeBonus = timeLeft ? Math.floor(timeLeft / 10) : 0
      const streakBonus = streak * 5

      setScore(score + basePoints + timeBonus + streakBonus)

      // Check if all words are found
      if (foundWords.length + 1 >= words.length) {
        // Level complete!
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
      // Wrong selection
      setStreak(0)
    }

    // Reset selection
    setSelectedCells([])
  }

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (isSelecting) {
      setIsSelecting(false)
      setSelectedCells([])
    }
  }

  // Use hint
  const useHint = () => {
    if (hintUsed || foundWords.length >= words.length) return

    // Find a word that hasn't been found yet
    const remainingWords = words.filter((word) => !foundWords.includes(word))
    if (remainingWords.length > 0) {
      const hintWord = remainingWords[Math.floor(Math.random() * remainingWords.length)]
      setHintWord(hintWord)
      setShowHint(true)
      setHintUsed(true)

      // Hide hint after 3 seconds
      setTimeout(() => {
        setShowHint(false)
      }, 3000)
    }
  }

  // Get difficulty name
  const getDifficultyName = () => {
    if (level <= 20) return "Beginner"
    if (level <= 40) return "Easy"
    if (level <= 60) return "Medium"
    if (level <= 80) return "Hard"
    return "Expert"
  }

  // Check if cell is selected
  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some((cell) => cell[0] === row && cell[1] === col)
  }

  // Check if cell is part of a found word
  const isCellFoundWord = (row: number, col: number) => {
    // This is a simplified check - in a real game you'd need to track which cells belong to which found words
    return false
  }

  // Get cell class
  const getCellClass = (row: number, col: number) => {
    if (isCellSelected(row, col)) {
      return "bg-blue-500 text-white"
    } else if (isCellFoundWord(row, col)) {
      return "bg-green-200 text-green-800"
    } else {
      return "bg-white hover:bg-blue-100"
    }
  }

  // Reset game
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

  // Get grid columns class
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

  // Calculate cell size based on grid size
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            <span>Word Search</span>
          </div>
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
            <div className="text-xs text-gray-600">Found</div>
            <div className="font-semibold text-sm">
              {foundWords.length}/{words.length}
            </div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600">Grid</div>
            <div className="font-semibold text-sm">
              {gridSize}×{gridSize}
            </div>
          </div>
        </div>

        {/* Timer */}
        {timeLimit && timeLeft !== null && gameState === "playing" && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Time Remaining:</span>
              <span className={`font-semibold ${timeLeft <= 30 ? "text-red-600" : "text-blue-600"}`}>{timeLeft}s</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${
                  timeLeft <= 30 ? "bg-red-500" : "bg-blue-500"
                }`}
                style={{ width: `${((timeLeft || 0) / timeLimit) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === "failed" && (
          <div className="text-center mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border-2 border-red-200">
            <div className="text-2xl mb-2">💔</div>
            <p className="text-red-700 font-semibold">Game Over!</p>
            <p className="text-sm text-red-600">You reached level {level}</p>
            <p className="text-xs text-gray-600 mt-2">Score: {score} points</p>
          </div>
        )}

        {/* Success Screen */}
        {gameState === "success" && (
          <div className="text-center mb-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border-2 border-green-200">
            <div className="text-3xl mb-2">🏆</div>
            <p className="text-green-700 font-bold text-lg">WORD MASTER!</p>
            <p className="text-sm text-green-600">You completed all 100 levels!</p>
            <p className="text-xs text-gray-600 mt-2">Final Score: {score} points</p>
          </div>
        )}

        {/* Hint Display */}
        {showHint && (
          <div className="text-center mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-700 font-semibold">💡 Hint:</p>
            <p className="text-sm text-yellow-600">Look for the word: {hintWord}</p>
          </div>
        )}

        {/* Word List */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Words to Find:</h3>
          <div className="flex flex-wrap gap-2">
            {words.map((word, index) => (
              <Badge
                key={index}
                variant={foundWords.includes(word) ? "default" : "outline"}
                className={foundWords.includes(word) ? "bg-green-500" : ""}
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
            className="mb-4 select-none touch-none"
            onMouseLeave={handleMouseLeave}
            onTouchEnd={handleCellMouseUp}
          >
            <div
              className={`grid ${getGridColsClass()} gap-0.5 mx-auto max-w-full overflow-hidden`}
              style={{ touchAction: "none" }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`${getCellSize()} flex items-center justify-center font-bold border rounded cursor-pointer transition-colors ${getCellClass(
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
        )}

        {/* Hint Button */}
        {gameState === "playing" && !hintUsed && (
          <Button onClick={useHint} variant="outline" className="w-full mb-4" disabled={hintUsed}>
            💡 Use Hint
          </Button>
        )}

        {/* Progress to Level 100 */}
        <div className="space-y-2">
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
          <Button onClick={initializeGame} className="w-full mt-4">
            Start Word Search Challenge (100 Levels)
          </Button>
        )}

        {gameState === "failed" && (
          <Button onClick={initializeGame} className="w-full mt-4">
            Try Again
          </Button>
        )}

        {gameState === "success" && (
          <Button onClick={initializeGame} className="w-full mt-4">
            Play Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
