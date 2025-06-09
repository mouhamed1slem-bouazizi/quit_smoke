"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Brain } from "lucide-react"

interface MemoryGameProps {
  onComplete: () => void
}

export default function MemoryGame({ onComplete }: MemoryGameProps) {
  const [cards, setCards] = useState<Array<{ id: number; value: string; flipped: boolean; matched: boolean }>>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [timeLimit, setTimeLimit] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [gridSize, setGridSize] = useState(4)
  const [flipBackDelay, setFlipBackDelay] = useState(1000)
  const [maxFlippedTime, setMaxFlippedTime] = useState<number | null>(null)

  // Expanded symbol sets for higher levels
  const allSymbols = [
    "🌟",
    "🌈",
    "🦋",
    "🌸",
    "🍀",
    "⭐",
    "🌺",
    "🌻",
    "🌙",
    "☀️",
    "🌊",
    "🔥",
    "🌿",
    "🌵",
    "🌲",
    "🍄",
    "🐝",
    "🐞",
    "🦜",
    "🐢",
    "🐙",
    "🦋",
    "🐠",
    "🦊",
    "🍎",
    "🍊",
    "🍋",
    "🍇",
    "🍓",
    "🥝",
    "🍑",
    "🥭",
    "⚽",
    "🎯",
    "🎨",
    "🎭",
    "🎪",
    "🎸",
    "🎺",
    "🎲",
    "💎",
    "💍",
    "👑",
    "🔮",
    "⚡",
    "✨",
    "💫",
    "🌠",
    "🚀",
    "🛸",
    "🌌",
    "🔭",
    "⚛️",
    "🧬",
    "🔬",
    "💊",
  ]

  useEffect(() => {
    initializeGame()
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (timeLeft !== null && timeLeft > 0 && !gameComplete) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev !== null && prev <= 1) {
            const newLives = lives - 1
            setLives(newLives)
            if (newLives <= 0) {
              setGameComplete(true)
              return null
            } else {
              initializeLevel(level)
              return timeLimit
            }
          }
          return prev !== null ? prev - 1 : null
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [timeLeft, gameComplete, lives, level, timeLimit])

  const getDifficultySettings = (currentLevel: number) => {
    let newGridSize = 4
    if (currentLevel >= 15) newGridSize = 5
    if (currentLevel >= 30) newGridSize = 6
    if (currentLevel >= 50) newGridSize = 7
    if (currentLevel >= 75) newGridSize = 8

    let newTimeLimit: number | null = null
    if (currentLevel >= 10) newTimeLimit = Math.max(30, 120 - currentLevel * 2)

    const newFlipBackDelay = Math.max(300, 1000 - currentLevel * 10)

    let newMaxFlippedTime: number | null = null
    if (currentLevel >= 25) newMaxFlippedTime = Math.max(2000, 5000 - currentLevel * 50)

    return {
      gridSize: newGridSize,
      timeLimit: newTimeLimit,
      flipBackDelay: newFlipBackDelay,
      maxFlippedTime: newMaxFlippedTime,
    }
  }

  const initializeGame = () => {
    setLevel(1)
    setScore(0)
    setLives(3)
    setMoves(0)
    setGameComplete(false)
    initializeLevel(1)
  }

  const initializeLevel = (currentLevel: number) => {
    const settings = getDifficultySettings(currentLevel)
    setGridSize(settings.gridSize)
    setTimeLimit(settings.timeLimit)
    setTimeLeft(settings.timeLimit)
    setFlipBackDelay(settings.flipBackDelay)
    setMaxFlippedTime(settings.maxFlippedTime)

    const totalCards = settings.gridSize * settings.gridSize
    const pairsNeeded = totalCards / 2

    const symbolsForLevel = allSymbols.slice(0, pairsNeeded)
    const gameCards = [...symbolsForLevel, ...symbolsForLevel]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        value: symbol,
        flipped: false,
        matched: false,
      }))

    setCards(gameCards)
    setFlippedCards([])
    setMoves(0)
  }

  const nextLevel = () => {
    if (level >= 100) {
      onComplete()
      return
    }

    const levelBonus = level * 50
    const timeBonus = timeLeft ? timeLeft * 5 : 0
    const moveBonus = Math.max(0, (cards.length - moves) * 10)
    const newScore = score + levelBonus + timeBonus + moveBonus

    setScore(newScore)
    setLevel(level + 1)
    initializeLevel(level + 1)
  }

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2 || cards[cardId].flipped || cards[cardId].matched || gameComplete) return

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    const newCards = cards.map((card) => (card.id === cardId ? { ...card, flipped: true } : card))
    setCards(newCards)

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1)
      const [first, second] = newFlippedCards

      if (cards[first].value === cards[second].value) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) => (card.id === first || card.id === second ? { ...card, matched: true } : card)),
          )
          setFlippedCards([])

          const allMatched = newCards.every((card) => card.id === first || card.id === second || card.matched)
          if (allMatched) {
            setTimeout(() => {
              nextLevel()
            }, 500)
          }
        }, flipBackDelay)
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) => (card.id === first || card.id === second ? { ...card, flipped: false } : card)),
          )
          setFlippedCards([])
        }, flipBackDelay)
      }
    }

    if (maxFlippedTime && newFlippedCards.length === 1) {
      setTimeout(() => {
        setCards((prev) =>
          prev.map((card) => (card.id === cardId && !card.matched ? { ...card, flipped: false } : card)),
        )
        setFlippedCards([])
      }, maxFlippedTime)
    }
  }

  const getDifficultyName = () => {
    if (level <= 10) return "Beginner"
    if (level <= 25) return "Easy"
    if (level <= 40) return "Medium"
    if (level <= 60) return "Hard"
    if (level <= 80) return "Expert"
    return "Master"
  }

  const getGridCols = () => {
    switch (gridSize) {
      case 4:
        return "grid-cols-4"
      case 5:
        return "grid-cols-5"
      case 6:
        return "grid-cols-6"
      case 7:
        return "grid-cols-7"
      case 8:
        return "grid-cols-8"
      default:
        return "grid-cols-4"
    }
  }

  const isGameOver = lives <= 0 || (level > 100 && gameComplete)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-4xl mx-auto bg-white/80 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6" />
              <span>Memory Match</span>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Level: {level}/100
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Score: {score}
              </Badge>
              <Button
                size="sm"
                variant="secondary"
                onClick={initializeGame}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {/* Game Info */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-lg">
              <div className="text-xs text-blue-600 font-medium">Difficulty</div>
              <div className="font-bold text-blue-800">{getDifficultyName()}</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-red-100 to-pink-200 rounded-xl shadow-lg">
              <div className="text-xs text-red-600 font-medium">Lives</div>
              <div className="font-bold text-red-800">
                {"❤️".repeat(lives)}
                {"🤍".repeat(3 - lives)}
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl shadow-lg">
              <div className="text-xs text-green-600 font-medium">Moves</div>
              <div className="font-bold text-green-800">{moves}</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-100 to-violet-200 rounded-xl shadow-lg">
              <div className="text-xs text-purple-600 font-medium">Grid</div>
              <div className="font-bold text-purple-800">
                {gridSize}×{gridSize}
              </div>
            </div>
          </div>

          {/* Timer */}
          {timeLimit && timeLeft !== null && (
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl shadow-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-orange-700">Time Remaining:</span>
                <span className={`font-bold ${timeLeft <= 10 ? "text-red-600" : "text-orange-600"}`}>{timeLeft}s</span>
              </div>
              <div className="w-full bg-white/50 rounded-full h-3 shadow-inner">
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
            <div className="text-center mb-6 p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl border-2 border-purple-200 shadow-lg">
              {level > 100 ? (
                <div>
                  <div className="text-4xl mb-3">👑</div>
                  <p className="text-purple-700 font-bold text-xl">MEMORY MASTER!</p>
                  <p className="text-purple-600">You completed all 100 levels!</p>
                  <p className="text-gray-600 mt-2">Final Score: {score} points</p>
                </div>
              ) : (
                <div>
                  <div className="text-3xl mb-3">💔</div>
                  <p className="text-red-700 font-bold text-lg">Game Over!</p>
                  <p className="text-red-600">You reached level {level}</p>
                  <p className="text-gray-600 mt-2">Score: {score} points</p>
                </div>
              )}
            </div>
          )}

          {/* Game Grid */}
          {!isGameOver && (
            <div className={`grid ${getGridCols()} gap-3 mb-6 max-w-2xl mx-auto`}>
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`aspect-square flex items-center justify-center text-2xl rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    card.flipped || card.matched
                      ? "bg-gradient-to-br from-white to-gray-50 shadow-xl rotate-0"
                      : "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                  } ${gridSize >= 6 ? "text-lg" : gridSize >= 7 ? "text-base" : ""}`}
                  onClick={() => handleCardClick(card.id)}
                >
                  {card.flipped || card.matched ? (
                    <span className="drop-shadow-sm">{card.value}</span>
                  ) : (
                    <span className="text-white font-bold text-xl">?</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Progress to Level 100 */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-700">Overall Progress:</span>
              <span className="text-blue-600">{level}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${(level / 100) * 100}%` }}
              />
            </div>
          </div>

          {/* Start Button */}
          {isGameOver && (
            <Button
              onClick={initializeGame}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              size="lg"
            >
              {level > 100 ? "Play Again" : "Start Challenge (100 Levels)"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
