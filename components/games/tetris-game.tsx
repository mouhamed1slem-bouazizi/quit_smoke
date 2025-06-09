"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Play, Pause, Square } from "lucide-react"

interface TetrisGameProps {
  onComplete: () => void
}

// Tetromino shapes
const TETROMINOES = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: "#00f0f0",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#f0f000",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#a000f0",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#00f000",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#f00000",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#0000f0",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "#f0a000",
  },
}

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20

export default function TetrisGame({ onComplete }: TetrisGameProps) {
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [gameState, setGameState] = useState<"menu" | "playing" | "paused" | "gameOver">("menu")
  const [board, setBoard] = useState<(string | null)[][]>(() =>
    Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(null)),
  )
  const [currentPiece, setCurrentPiece] = useState<{
    shape: number[][]
    color: string
    x: number
    y: number
  } | null>(null)
  const [nextPiece, setNextPiece] = useState<{
    shape: number[][]
    color: string
  } | null>(null)

  const gameLoopRef = useRef<number>()

  // Get random tetromino
  const getRandomTetromino = useCallback(() => {
    const pieces = Object.keys(TETROMINOES)
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)] as keyof typeof TETROMINOES
    const tetromino = TETROMINOES[randomPiece]
    return {
      shape: tetromino.shape,
      color: tetromino.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2),
      y: 0,
    }
  }, [])

  // Check if piece can be placed at position
  const canPlacePiece = useCallback((piece: any, x: number, y: number, board: (string | null)[][]) => {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const newX = x + col
          const newY = y + row

          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false
          }

          if (newY >= 0 && board[newY][newX]) {
            return false
          }
        }
      }
    }
    return true
  }, [])

  // Place piece on board
  const placePiece = useCallback((piece: any, x: number, y: number, board: (string | null)[][]) => {
    const newBoard = board.map((row) => [...row])

    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const newX = x + col
          const newY = y + row

          if (newY >= 0) {
            newBoard[newY][newX] = piece.color
          }
        }
      }
    }

    return newBoard
  }, [])

  // Clear completed lines
  const clearLines = useCallback((board: (string | null)[][]) => {
    const newBoard = board.filter((row) => row.some((cell) => cell === null))
    const clearedLines = BOARD_HEIGHT - newBoard.length

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null))
    }

    return { newBoard, clearedLines }
  }, [])

  // Rotate piece
  const rotatePiece = useCallback((piece: any) => {
    const rotated = piece.shape[0].map((_: any, index: number) => piece.shape.map((row: any) => row[index]).reverse())
    return { ...piece, shape: rotated }
  }, [])

  // Move piece down
  const movePieceDown = useCallback(() => {
    if (!currentPiece || gameState !== "playing") return

    const newY = currentPiece.y + 1

    if (canPlacePiece(currentPiece, currentPiece.x, newY, board)) {
      setCurrentPiece({ ...currentPiece, y: newY })
    } else {
      // Place piece and spawn new one
      const newBoard = placePiece(currentPiece, currentPiece.x, currentPiece.y, board)
      const { newBoard: clearedBoard, clearedLines } = clearLines(newBoard)

      setBoard(clearedBoard)
      setLines((prev) => prev + clearedLines)
      setScore((prev) => prev + clearedLines * 100 * level)

      // Check game over
      const newPiece = nextPiece
        ? { ...nextPiece, x: Math.floor(BOARD_WIDTH / 2) - Math.floor(nextPiece.shape[0].length / 2), y: 0 }
        : getRandomTetromino()

      if (!canPlacePiece(newPiece, newPiece.x, newPiece.y, clearedBoard)) {
        setGameState("gameOver")
        return
      }

      setCurrentPiece(newPiece)
      setNextPiece(getRandomTetromino())
    }
  }, [currentPiece, board, gameState, canPlacePiece, placePiece, clearLines, level, nextPiece, getRandomTetromino])

  // Handle keyboard input
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (!currentPiece || gameState !== "playing") return

      switch (e.key) {
        case "ArrowLeft":
          if (canPlacePiece(currentPiece, currentPiece.x - 1, currentPiece.y, board)) {
            setCurrentPiece({ ...currentPiece, x: currentPiece.x - 1 })
          }
          break
        case "ArrowRight":
          if (canPlacePiece(currentPiece, currentPiece.x + 1, currentPiece.y, board)) {
            setCurrentPiece({ ...currentPiece, x: currentPiece.x + 1 })
          }
          break
        case "ArrowDown":
          movePieceDown()
          break
        case "ArrowUp":
          const rotated = rotatePiece(currentPiece)
          if (canPlacePiece(rotated, currentPiece.x, currentPiece.y, board)) {
            setCurrentPiece({ ...rotated, x: currentPiece.x, y: currentPiece.y })
          }
          break
      }
    },
    [currentPiece, board, gameState, canPlacePiece, movePieceDown, rotatePiece],
  )

  // Game loop
  useEffect(() => {
    if (gameState === "playing") {
      const interval = setInterval(movePieceDown, Math.max(50, 1000 - (level - 1) * 100))
      return () => clearInterval(interval)
    }
  }, [gameState, level, movePieceDown])

  // Keyboard event listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress])

  // Initialize game
  const initGame = useCallback(() => {
    const newBoard = Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(null))
    setBoard(newBoard)
    setCurrentPiece(getRandomTetromino())
    setNextPiece(getRandomTetromino())
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameState("playing")
  }, [getRandomTetromino])

  // Render board with current piece
  const renderBoard = () => {
    const displayBoard = board.map((row) => [...row])

    // Add current piece to display board
    if (currentPiece) {
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col]) {
            const x = currentPiece.x + col
            const y = currentPiece.y + row
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
              displayBoard[y][x] = currentPiece.color
            }
          }
        }
      }
    }

    return displayBoard
  }

  if (gameState === "menu") {
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border-2 border-purple-200 dark:border-gray-600">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-800 dark:text-purple-300 flex items-center justify-center gap-2">
            <Square className="w-6 h-6" />
            Tetris Blocks
          </CardTitle>
          <p className="text-purple-600 dark:text-purple-400">Clear lines with falling blocks!</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">Use arrow keys to:</p>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>← → Move left/right</p>
              <p>↓ Move down faster</p>
              <p>↑ Rotate piece</p>
            </div>
          </div>
          <Button onClick={initGame} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
            <Play className="w-4 h-4 mr-2" />
            Start Game
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (gameState === "gameOver") {
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 border-2 border-red-200 dark:border-gray-600">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-800 dark:text-red-300">Game Over!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">Final Score: {score}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Lines Cleared: {lines}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Level Reached: {level}</p>
          </div>
          <Button onClick={initGame} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border-2 border-purple-200 dark:border-gray-600">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold text-purple-800 dark:text-purple-300">Tetris</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setGameState(gameState === "playing" ? "paused" : "playing")}
              className="border-purple-300 dark:border-gray-600 text-purple-700 dark:text-purple-300"
            >
              {gameState === "playing" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <Badge variant="secondary" className="bg-purple-100 dark:bg-gray-700 text-purple-800 dark:text-purple-300">
            Score: {score}
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-blue-300">
            Lines: {lines}
          </Badge>
          <Badge variant="secondary" className="bg-green-100 dark:bg-gray-700 text-green-800 dark:text-green-300">
            Level: {level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {gameState === "paused" && (
          <div className="text-center py-8">
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">Game Paused</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Click play to continue</p>
          </div>
        )}

        {gameState === "playing" && (
          <div className="space-y-4">
            {/* Game Board */}
            <div
              className="border-2 border-gray-300 dark:border-gray-600 bg-black mx-auto"
              style={{ width: BOARD_WIDTH * 20, height: BOARD_HEIGHT * 20 }}
            >
              {renderBoard().map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    className="absolute border border-gray-800"
                    style={{
                      left: x * 20,
                      top: y * 20,
                      width: 20,
                      height: 20,
                      backgroundColor: cell || "transparent",
                    }}
                  />
                )),
              )}
            </div>

            {/* Next Piece */}
            {nextPiece && (
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Next:</p>
                <div className="inline-block border border-gray-300 dark:border-gray-600 bg-black p-2">
                  {nextPiece.shape.map((row, y) =>
                    row.map((cell, x) => (
                      <div
                        key={`next-${x}-${y}`}
                        className="inline-block border border-gray-800"
                        style={{
                          width: 15,
                          height: 15,
                          backgroundColor: cell ? nextPiece.color : "transparent",
                        }}
                      />
                    )),
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
