"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Lightbulb, Edit3, Eye } from "lucide-react"

interface SudokuGameProps {
  onComplete: () => void
}

export default function SudokuGame({ onComplete }: SudokuGameProps) {
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameState, setGameState] = useState<"waiting" | "playing" | "success" | "failed">("waiting")
  const [grid, setGrid] = useState<number[][]>([])
  const [solution, setSolution] = useState<number[][]>([])
  const [initialGrid, setInitialGrid] = useState<number[][]>([])
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [notesMode, setNotesMode] = useState(false)
  const [notes, setNotes] = useState<number[][][]>([])
  const [hintsUsed, setHintsUsed] = useState(0)
  const [maxHints, setMaxHints] = useState(3)
  const [timeLimit, setTimeLimit] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [gridSize, setGridSize] = useState(4)
  const [streak, setStreak] = useState(0)
  const [showWrongAnswer, setShowWrongAnswer] = useState(false)

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
              generatePuzzle(level)
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
    let gridSize = 4
    let timeLimit: number | null = null
    let maxHints = 3
    let difficulty = "Beginner"
    let emptyCells = 8

    if (currentLevel <= 15) {
      // Beginner: 4x4 grids
      gridSize = 4
      emptyCells = Math.min(8 + Math.floor(currentLevel / 3), 12)
      maxHints = 3
      difficulty = "Beginner"
      timeLimit = currentLevel >= 10 ? 300 : null // 5 minutes
    } else if (currentLevel <= 40) {
      // Intermediate: 6x6 grids
      gridSize = 6
      emptyCells = Math.min(18 + Math.floor((currentLevel - 15) / 2), 28)
      maxHints = 2
      difficulty = "Intermediate"
      timeLimit = Math.max(240, 360 - (currentLevel - 15) * 5) // 4-6 minutes
    } else {
      // Advanced: 9x9 grids
      gridSize = 9
      emptyCells = Math.min(45 + Math.floor((currentLevel - 40) / 3), 65)
      maxHints = currentLevel <= 60 ? 2 : 1
      difficulty = "Advanced"
      timeLimit = Math.max(180, 300 - (currentLevel - 40) * 2) // 3-5 minutes
    }

    return { gridSize, timeLimit, maxHints, difficulty, emptyCells }
  }

  const initializeGame = () => {
    setLevel(1)
    setScore(0)
    setLives(3)
    setStreak(0)
    setHintsUsed(0)
    setSelectedCell(null)
    setNotesMode(false)
    setShowWrongAnswer(false)
    setGameState("waiting")
    generatePuzzle(1)
  }

  const generatePuzzle = (currentLevel: number) => {
    const settings = getDifficultySettings(currentLevel)
    setGridSize(settings.gridSize)
    setTimeLimit(settings.timeLimit)
    setTimeLeft(settings.timeLimit)
    setMaxHints(settings.maxHints)
    setHintsUsed(0)
    setSelectedCell(null)
    setNotesMode(false)
    setShowWrongAnswer(false)

    // Generate a complete valid Sudoku grid
    const completeGrid = generateCompleteGrid(settings.gridSize)
    setSolution(completeGrid)

    // Create puzzle by removing numbers
    const puzzle = createPuzzle(completeGrid, settings.emptyCells)
    setGrid(puzzle)
    setInitialGrid(JSON.parse(JSON.stringify(puzzle)))

    // Initialize notes array
    const notesArray = Array(settings.gridSize)
      .fill(null)
      .map(() =>
        Array(settings.gridSize)
          .fill(null)
          .map(() => []),
      )
    setNotes(notesArray)

    setGameState("playing")
  }

  const generateCompleteGrid = (size: number): number[][] => {
    const grid = Array(size)
      .fill(null)
      .map(() => Array(size).fill(0))

    const getBoxSize = (size: number) => {
      if (size === 4) return 2
      if (size === 6) return { rows: 2, cols: 3 }
      return 3
    }

    const isValid = (grid: number[][], row: number, col: number, num: number) => {
      // Check row
      for (let x = 0; x < size; x++) {
        if (grid[row][x] === num) return false
      }

      // Check column
      for (let x = 0; x < size; x++) {
        if (grid[x][col] === num) return false
      }

      // Check box
      const boxSize = getBoxSize(size)
      let boxRows, boxCols
      if (typeof boxSize === "number") {
        boxRows = boxCols = boxSize
      } else {
        boxRows = boxSize.rows
        boxCols = boxSize.cols
      }

      const startRow = row - (row % boxRows)
      const startCol = col - (col % boxCols)

      for (let i = 0; i < boxRows; i++) {
        for (let j = 0; j < boxCols; j++) {
          if (grid[i + startRow][j + startCol] === num) return false
        }
      }

      return true
    }

    const fillGrid = (grid: number[][]): boolean => {
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (grid[row][col] === 0) {
            const numbers = Array.from({ length: size }, (_, i) => i + 1)
            // Shuffle numbers for randomness
            for (let i = numbers.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1))
              ;[numbers[i], numbers[j]] = [numbers[j], numbers[i]]
            }

            for (const num of numbers) {
              if (isValid(grid, row, col, num)) {
                grid[row][col] = num
                if (fillGrid(grid)) return true
                grid[row][col] = 0
              }
            }
            return false
          }
        }
      }
      return true
    }

    fillGrid(grid)
    return grid
  }

  const createPuzzle = (completeGrid: number[][], emptyCells: number): number[][] => {
    const puzzle = JSON.parse(JSON.stringify(completeGrid))
    const size = puzzle.length
    let removed = 0

    while (removed < emptyCells) {
      const row = Math.floor(Math.random() * size)
      const col = Math.floor(Math.random() * size)

      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0
        removed++
      }
    }

    return puzzle
  }

  const handleCellClick = (row: number, col: number) => {
    if (gameState !== "playing" || initialGrid[row][col] !== 0) return
    setSelectedCell({ row, col })
  }

  const handleNumberInput = (num: number) => {
    if (!selectedCell || gameState !== "playing") return

    const { row, col } = selectedCell
    if (initialGrid[row][col] !== 0) return

    const newGrid = [...grid]
    const newNotes = [...notes]

    if (notesMode) {
      // Toggle note
      const cellNotes = [...newNotes[row][col]]
      const noteIndex = cellNotes.indexOf(num)
      if (noteIndex > -1) {
        cellNotes.splice(noteIndex, 1)
      } else {
        cellNotes.push(num)
        cellNotes.sort()
      }
      newNotes[row][col] = cellNotes
      setNotes(newNotes)
    } else {
      // Place number
      if (newGrid[row][col] === num) {
        // Remove number if clicking the same number
        newGrid[row][col] = 0
      } else {
        newGrid[row][col] = num
        // Clear notes for this cell
        newNotes[row][col] = []

        // Check if the move is correct
        if (solution[row][col] !== num) {
          // Wrong move
          setShowWrongAnswer(true)
          setTimeout(() => {
            setShowWrongAnswer(false)
            newGrid[row][col] = 0
            setGrid([...newGrid])
          }, 1500)

          const newLives = lives - 1
          setLives(newLives)
          setStreak(0)

          if (newLives <= 0) {
            setGameState("failed")
            return
          }
        }
      }

      setGrid(newGrid)
      setNotes(newNotes)

      // Check if puzzle is complete
      if (isPuzzleComplete(newGrid)) {
        // Level completed
        const basePoints = level * 20
        const timeBonus = timeLeft ? timeLeft * 2 : 0
        const hintPenalty = hintsUsed * 20
        const streakBonus = streak * 10
        const sizeBonus = gridSize * 5

        const totalPoints = Math.max(0, basePoints + timeBonus + streakBonus + sizeBonus - hintPenalty)
        setScore(score + totalPoints)
        setStreak(streak + 1)

        if (level >= 100) {
          setGameState("success")
          onComplete()
        } else {
          setLevel(level + 1)
          setTimeout(() => {
            generatePuzzle(level + 1)
          }, 2000)
        }
      }
    }
  }

  const isPuzzleComplete = (grid: number[][]): boolean => {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (grid[row][col] === 0 || grid[row][col] !== solution[row][col]) {
          return false
        }
      }
    }
    return true
  }

  const getHint = () => {
    if (hintsUsed >= maxHints || !selectedCell || gameState !== "playing") return

    const { row, col } = selectedCell
    if (initialGrid[row][col] !== 0) return

    const newGrid = [...grid]
    newGrid[row][col] = solution[row][col]
    setGrid(newGrid)
    setHintsUsed(hintsUsed + 1)

    // Clear notes for this cell
    const newNotes = [...notes]
    newNotes[row][col] = []
    setNotes(newNotes)

    // Check if puzzle is complete
    if (isPuzzleComplete(newGrid)) {
      const basePoints = level * 20
      const timeBonus = timeLeft ? timeLeft * 2 : 0
      const hintPenalty = hintsUsed * 20
      const streakBonus = streak * 10

      const totalPoints = Math.max(0, basePoints + timeBonus + streakBonus - hintPenalty)
      setScore(score + totalPoints)
      setStreak(streak + 1)

      if (level >= 100) {
        setGameState("success")
        onComplete()
      } else {
        setLevel(level + 1)
        setTimeout(() => {
          generatePuzzle(level + 1)
        }, 2000)
      }
    }
  }

  const resetGame = () => {
    setLevel(1)
    setScore(0)
    setLives(3)
    setStreak(0)
    setHintsUsed(0)
    setSelectedCell(null)
    setNotesMode(false)
    setShowWrongAnswer(false)
    setGameState("waiting")
    setTimeLeft(null)
  }

  const getDifficultyName = () => {
    if (level <= 15) return "Beginner"
    if (level <= 40) return "Intermediate"
    return "Advanced"
  }

  const isGameOver = lives <= 0 || (level > 100 && gameState === "success")

  const getCellStyle = (row: number, col: number) => {
    let baseStyle =
      "w-8 h-8 border border-gray-400 flex items-center justify-center text-sm font-semibold cursor-pointer transition-colors "

    // Adjust size based on grid
    if (gridSize === 6) baseStyle = baseStyle.replace("w-8 h-8", "w-7 h-7")
    if (gridSize === 9) baseStyle = baseStyle.replace("w-8 h-8", "w-6 h-6").replace("text-sm", "text-xs")

    // Cell selection
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      baseStyle += "bg-blue-200 "
    } else if (initialGrid[row][col] !== 0) {
      baseStyle += "bg-gray-100 "
    } else {
      baseStyle += "bg-white hover:bg-gray-50 "
    }

    // Highlight same numbers
    if (
      selectedCell &&
      grid[selectedCell.row][selectedCell.col] !== 0 &&
      grid[row][col] === grid[selectedCell.row][selectedCell.col]
    ) {
      baseStyle += "bg-yellow-100 "
    }

    // Box borders
    const getBoxSize = (size: number) => {
      if (size === 4) return 2
      if (size === 6) return { rows: 2, cols: 3 }
      return 3
    }

    const boxSize = getBoxSize(gridSize)
    let boxRows, boxCols
    if (typeof boxSize === "number") {
      boxRows = boxCols = boxSize
    } else {
      boxRows = boxSize.rows
      boxCols = boxSize.cols
    }

    if (row % boxRows === 0) baseStyle += "border-t-2 border-t-gray-800 "
    if (col % boxCols === 0) baseStyle += "border-l-2 border-l-gray-800 "
    if (row === gridSize - 1) baseStyle += "border-b-2 border-b-gray-800 "
    if (col === gridSize - 1) baseStyle += "border-r-2 border-r-gray-800 "

    return baseStyle
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sudoku</span>
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
              <span className={`font-semibold ${timeLeft <= 30 ? "text-red-600" : "text-blue-600"}`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </span>
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
        {isGameOver && (
          <div className="text-center mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
            {level > 100 ? (
              <div>
                <div className="text-3xl mb-2">👑</div>
                <p className="text-purple-700 font-bold text-lg">SUDOKU MASTER!</p>
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
            {/* Sudoku Grid */}
            <div className="flex justify-center">
              <div className="inline-block border-2 border-gray-800">
                {grid.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex">
                    {row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={getCellStyle(rowIndex, colIndex)}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      >
                        {cell !== 0 ? (
                          <span className={initialGrid[rowIndex][colIndex] !== 0 ? "text-gray-800" : "text-blue-600"}>
                            {cell}
                          </span>
                        ) : notes[rowIndex][colIndex].length > 0 ? (
                          <div className="text-xs text-gray-500 leading-none">
                            {notes[rowIndex][colIndex].slice(0, 4).join("")}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-3">
              {/* Mode Toggle */}
              <div className="flex justify-center gap-2">
                <Button variant={notesMode ? "outline" : "default"} size="sm" onClick={() => setNotesMode(false)}>
                  <Edit3 className="w-4 h-4 mr-1" />
                  Number
                </Button>
                <Button variant={notesMode ? "default" : "outline"} size="sm" onClick={() => setNotesMode(true)}>
                  <Eye className="w-4 h-4 mr-1" />
                  Notes
                </Button>
                <Button variant="outline" size="sm" onClick={getHint} disabled={hintsUsed >= maxHints || !selectedCell}>
                  <Lightbulb className="w-4 h-4 mr-1" />
                  Hint ({maxHints - hintsUsed})
                </Button>
              </div>

              {/* Number Pad */}
              <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
                {Array.from({ length: gridSize }, (_, i) => i + 1).map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    className="aspect-square"
                    onClick={() => handleNumberInput(num)}
                    disabled={!selectedCell}
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>

            {/* Wrong Answer Display */}
            {showWrongAnswer && (
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-700 font-semibold">❌ Incorrect!</p>
                <p className="text-sm text-red-600">That number doesn't belong there</p>
              </div>
            )}

            {/* Instructions */}
            {selectedCell ? (
              <div className="text-center text-sm text-gray-600">
                Selected: Row {selectedCell.row + 1}, Column {selectedCell.col + 1}
                <br />
                {notesMode ? "Notes mode: Add candidate numbers" : "Number mode: Place final numbers"}
              </div>
            ) : (
              <div className="text-center text-sm text-gray-600">Tap a cell to select it, then choose a number</div>
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
          <Button onClick={() => generatePuzzle(1)} className="w-full">
            Start Sudoku Challenge (100 Levels)
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
