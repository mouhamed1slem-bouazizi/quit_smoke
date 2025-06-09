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
            const newLives = lives - 1
            setLives(newLives)
            if (newLives <= 0) {
              setGameState("failed")
              return null
            } else {
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
      gridSize = 4
      emptyCells = Math.min(8 + Math.floor(currentLevel / 3), 12)
      maxHints = 3
      difficulty = "Beginner"
      timeLimit = currentLevel >= 10 ? 300 : null
    } else if (currentLevel <= 40) {
      gridSize = 6
      emptyCells = Math.min(18 + Math.floor((currentLevel - 15) / 2), 28)
      maxHints = 2
      difficulty = "Intermediate"
      timeLimit = Math.max(240, 360 - (currentLevel - 15) * 5)
    } else {
      gridSize = 9
      emptyCells = Math.min(45 + Math.floor((currentLevel - 40) / 3), 65)
      maxHints = currentLevel <= 60 ? 2 : 1
      difficulty = "Advanced"
      timeLimit = Math.max(180, 300 - (currentLevel - 40) * 2)
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

    const completeGrid = generateCompleteGrid(settings.gridSize)
    setSolution(completeGrid)

    const puzzle = createPuzzle(completeGrid, settings.emptyCells)
    setGrid(puzzle)
    setInitialGrid(JSON.parse(JSON.stringify(puzzle)))

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
      for (let x = 0; x < size; x++) {
        if (grid[row][x] === num) return false
      }

      for (let x = 0; x < size; x++) {
        if (grid[x][col] === num) return false
      }

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
      if (newGrid[row][col] === num) {
        newGrid[row][col] = 0
      } else {
        newGrid[row][col] = num
        newNotes[row][col] = []

        if (solution[row][col] !== num) {
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

      if (isPuzzleComplete(newGrid)) {
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

    const newNotes = [...notes]
    newNotes[row][col] = []
    setNotes(newNotes)

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
      "w-8 h-8 border border-white/20 flex items-center justify-center text-sm font-bold cursor-pointer transition-all duration-300 rounded-lg backdrop-blur-sm "

    if (gridSize === 6) baseStyle = baseStyle.replace("w-8 h-8", "w-7 h-7")
    if (gridSize === 9) baseStyle = baseStyle.replace("w-8 h-8", "w-6 h-6").replace("text-sm", "text-xs")

    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      baseStyle += "bg-gradient-to-br from-yellow-400/80 to-orange-500/80 text-white shadow-lg scale-105 "
    } else if (initialGrid[row][col] !== 0) {
      baseStyle += "bg-gradient-to-br from-gray-200/80 to-gray-300/80 text-gray-800 "
    } else {
      baseStyle +=
        "bg-gradient-to-br from-white/60 to-blue-50/60 text-blue-900 hover:from-blue-100/70 hover:to-blue-200/70 hover:scale-105 "
    }

    if (
      selectedCell &&
      grid[selectedCell.row][selectedCell.col] !== 0 &&
      grid[row][col] === grid[selectedCell.row][selectedCell.col]
    ) {
      baseStyle += "ring-2 ring-yellow-400/60 "
    }

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

    if (row % boxRows === 0) baseStyle += "border-t-2 border-t-blue-600/60 "
    if (col % boxCols === 0) baseStyle += "border-l-2 border-l-blue-600/60 "
    if (row === gridSize - 1) baseStyle += "border-b-2 border-b-blue-600/60 "
    if (col === gridSize - 1) baseStyle += "border-r-2 border-r-blue-600/60 "

    return baseStyle
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
      <Card className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">🧩</span>
              </div>
              <span className="text-xl font-bold">Sudoku Master</span>
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
              { label: "Streak", value: streak, icon: "🔥" },
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
                <span className={`font-bold ${timeLeft <= 30 ? "text-red-600" : "text-blue-900"}`}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
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
          {isGameOver && (
            <div className="text-center mb-6 p-6 bg-gradient-to-br from-purple-100/80 to-pink-100/80 backdrop-blur-sm rounded-xl border border-white/30">
              {level > 100 ? (
                <div>
                  <div className="text-4xl mb-3">👑</div>
                  <p className="text-purple-700 font-bold text-xl mb-2">SUDOKU MASTER!</p>
                  <p className="text-purple-600 mb-2">You completed all 100 levels!</p>
                  <p className="text-gray-600 text-sm">Final Score: {score} points</p>
                </div>
              ) : (
                <div>
                  <div className="text-3xl mb-3">💔</div>
                  <p className="text-red-700 font-bold text-lg mb-2">Game Over!</p>
                  <p className="text-red-600 mb-2">You reached level {level}</p>
                  <p className="text-gray-600 text-sm">Score: {score} points</p>
                </div>
              )}
            </div>
          )}

          {/* Game Content */}
          {!isGameOver && gameState !== "waiting" && (
            <div className="space-y-6">
              {/* Sudoku Grid */}
              <div className="flex justify-center">
                <div className="inline-block bg-gradient-to-br from-white/40 to-blue-100/40 backdrop-blur-sm p-4 rounded-xl border-2 border-white/30 shadow-lg">
                  {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex">
                      {row.map((cell, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={getCellStyle(rowIndex, colIndex)}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                        >
                          {cell !== 0 ? (
                            <span className={initialGrid[rowIndex][colIndex] !== 0 ? "text-gray-800" : "text-blue-700"}>
                              {cell}
                            </span>
                          ) : notes[rowIndex][colIndex].length > 0 ? (
                            <div className="text-xs text-blue-600 leading-none">
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
              <div className="space-y-4">
                {/* Mode Toggle */}
                <div className="flex justify-center gap-3">
                  <Button
                    variant={notesMode ? "outline" : "default"}
                    size="sm"
                    onClick={() => setNotesMode(false)}
                    className={`transition-all duration-300 hover:scale-105 ${
                      !notesMode
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "bg-white/60 text-blue-700 border-white/40 hover:bg-white/80"
                    }`}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Number
                  </Button>
                  <Button
                    variant={notesMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNotesMode(true)}
                    className={`transition-all duration-300 hover:scale-105 ${
                      notesMode
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "bg-white/60 text-blue-700 border-white/40 hover:bg-white/80"
                    }`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Notes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={getHint}
                    disabled={hintsUsed >= maxHints || !selectedCell}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Hint ({maxHints - hintsUsed})
                  </Button>
                </div>

                {/* Number Pad */}
                <div className="grid grid-cols-3 gap-3 max-w-64 mx-auto">
                  {Array.from({ length: gridSize }, (_, i) => i + 1).map((num) => (
                    <Button
                      key={num}
                      variant="outline"
                      className="aspect-square bg-gradient-to-br from-white/60 to-blue-100/60 border-white/40 text-blue-900 font-bold hover:from-blue-200/70 hover:to-purple-200/70 hover:scale-105 transition-all duration-300 disabled:opacity-50"
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
                <div className="text-center p-4 bg-gradient-to-br from-red-100/80 to-pink-100/80 backdrop-blur-sm rounded-xl border border-red-200/50">
                  <p className="text-red-700 font-bold">❌ Incorrect!</p>
                  <p className="text-red-600 text-sm">That number doesn't belong there</p>
                </div>
              )}

              {/* Instructions */}
              {selectedCell ? (
                <div className="text-center text-sm text-blue-700 bg-gradient-to-r from-white/40 to-blue-100/40 backdrop-blur-sm p-3 rounded-lg border border-white/30">
                  <span className="font-medium">
                    Selected: Row {selectedCell.row + 1}, Column {selectedCell.col + 1}
                  </span>
                  <br />
                  <span className="text-blue-600">
                    {notesMode ? "Notes mode: Add candidate numbers" : "Number mode: Place final numbers"}
                  </span>
                </div>
              ) : (
                <div className="text-center text-sm text-blue-700 bg-gradient-to-r from-white/40 to-blue-100/40 backdrop-blur-sm p-3 rounded-lg border border-white/30">
                  Tap a cell to select it, then choose a number
                </div>
              )}
            </div>
          )}

          {/* Progress to Level 100 */}
          <div className="space-y-3 mt-6">
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
              onClick={() => generatePuzzle(1)}
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
            >
              🚀 Start Sudoku Challenge (100 Levels)
            </Button>
          )}

          {isGameOver && (
            <Button
              onClick={initializeGame}
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
            >
              {level > 100 ? "🎮 Play Again" : "🚀 Start Challenge (100 Levels)"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
