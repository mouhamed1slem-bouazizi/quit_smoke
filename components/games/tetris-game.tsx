"use client"

import { useState, useCallback, useRef } from "react"

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
const CELL_SIZE = 20

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
  const [dropTime, setDropTime] = useState(1000)
  const [lastDrop, setLastDrop] = useState(Date.now())

  const gameLoopRef = useRef<number>()
  const boardRef = useRef<HTMLCanvasElement>(null)

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
    setDropTime(Math.max(50, 1000 - (1 \
