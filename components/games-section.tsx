"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Trophy, RotateCcw } from "lucide-react"

export default function GamesSection() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [gamesPlayed, setGamesPlayed] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem("gamesPlayed")
    if (saved) {
      setGamesPlayed(Number.parseInt(saved))
    }
  }, [])

  const incrementGamesPlayed = () => {
    const newCount = gamesPlayed + 1
    setGamesPlayed(newCount)
    localStorage.setItem("gamesPlayed", newCount.toString())
  }

  const games = [
    {
      id: "memory",
      title: "Memory Match",
      description: "Match pairs of cards to improve focus",
      icon: "🧠",
      component: <MemoryGame onComplete={incrementGamesPlayed} />,
    },
    {
      id: "reaction",
      title: "Reaction Time",
      description: "Test your reflexes and stay alert",
      icon: "⚡",
      component: <ReactionGame onComplete={incrementGamesPlayed} />,
    },
    {
      id: "breathing",
      title: "Breathing Exercise",
      description: "Calm your mind with guided breathing",
      icon: "🫁",
      component: <BreathingGame onComplete={incrementGamesPlayed} />,
    },
  ]

  if (selectedGame) {
    const game = games.find((g) => g.id === selectedGame)
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedGame(null)} size="sm">
            ← Back to Games
          </Button>
          <Badge variant="secondary">
            <Trophy className="w-3 h-3 mr-1" />
            {gamesPlayed} played
          </Badge>
        </div>
        {game?.component}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-blue-600" />
            Distraction Games
          </CardTitle>
          <p className="text-sm text-gray-600">Play games when you feel a craving coming on</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Games played today:</span>
            <Badge variant="secondary">
              <Trophy className="w-3 h-3 mr-1" />
              {gamesPlayed}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {games.map((game) => (
          <Card key={game.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4" onClick={() => setSelectedGame(game.id)}>
                <div className="text-2xl">{game.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold">{game.title}</h3>
                  <p className="text-sm text-gray-600">{game.description}</p>
                </div>
                <Button size="sm">Play</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-green-50">
        <CardContent className="p-4 text-center">
          <div className="text-green-600 mb-2">🎯</div>
          <p className="text-sm text-green-700">
            Playing games helps distract from cravings and builds healthy habits!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Memory Game Component
function MemoryGame({ onComplete }: { onComplete: () => void }) {
  const [cards, setCards] = useState<Array<{ id: number; value: string; flipped: boolean; matched: boolean }>>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)

  const symbols = ["🌟", "🌈", "🦋", "🌸", "🍀", "⭐", "🌺", "🌻"]

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    const gameCards = [...symbols, ...symbols]
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
    setGameComplete(false)
  }

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2 || cards[cardId].flipped || cards[cardId].matched) return

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

          // Check if game is complete
          const allMatched = newCards.every((card) => card.id === first || card.id === second || card.matched)
          if (allMatched) {
            setGameComplete(true)
            onComplete()
          }
        }, 1000)
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) => (card.id === first || card.id === second ? { ...card, flipped: false } : card)),
          )
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Memory Match</span>
          <div className="flex gap-2">
            <Badge variant="outline">Moves: {moves}</Badge>
            <Button size="sm" variant="outline" onClick={initializeGame}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {gameComplete && (
          <div className="text-center mb-4 p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">🎉</div>
            <p className="text-green-700 font-semibold">Congratulations!</p>
            <p className="text-sm text-green-600">You completed the game in {moves} moves!</p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`aspect-square flex items-center justify-center text-2xl rounded-lg cursor-pointer transition-all ${
                card.flipped || card.matched ? "bg-white shadow-md" : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => handleCardClick(card.id)}
            >
              {card.flipped || card.matched ? card.value : "?"}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Reaction Game Component
function ReactionGame({ onComplete }: { onComplete: () => void }) {
  const [gameState, setGameState] = useState<"waiting" | "ready" | "go" | "result">("waiting")
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number>(0)

  const startGame = () => {
    setGameState("ready")
    const delay = Math.random() * 3000 + 2000 // 2-5 seconds

    setTimeout(() => {
      setGameState("go")
      setStartTime(Date.now())
    }, delay)
  }

  const handleClick = () => {
    if (gameState === "go") {
      const time = Date.now() - startTime
      setReactionTime(time)
      setGameState("result")
      onComplete()
    } else if (gameState === "ready") {
      setGameState("waiting")
      alert("Too early! Wait for the green signal.")
    }
  }

  const resetGame = () => {
    setGameState("waiting")
    setReactionTime(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reaction Time Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <div
            className={`h-32 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
              gameState === "waiting"
                ? "bg-gray-200"
                : gameState === "ready"
                  ? "bg-red-200"
                  : gameState === "go"
                    ? "bg-green-200"
                    : "bg-blue-200"
            }`}
            onClick={handleClick}
          >
            {gameState === "waiting" && (
              <div>
                <div className="text-2xl mb-2">⚡</div>
                <p>Click to start</p>
              </div>
            )}
            {gameState === "ready" && (
              <div>
                <div className="text-2xl mb-2">🔴</div>
                <p>Wait for green...</p>
              </div>
            )}
            {gameState === "go" && (
              <div>
                <div className="text-2xl mb-2">🟢</div>
                <p className="font-bold">CLICK NOW!</p>
              </div>
            )}
            {gameState === "result" && (
              <div>
                <div className="text-2xl mb-2">🎯</div>
                <p className="font-bold">{reactionTime}ms</p>
                <p className="text-sm">
                  {reactionTime! < 300 ? "Excellent!" : reactionTime! < 500 ? "Good!" : "Keep practicing!"}
                </p>
              </div>
            )}
          </div>

          {gameState === "waiting" && (
            <Button onClick={startGame} className="w-full">
              Start Test
            </Button>
          )}

          {gameState === "result" && (
            <Button onClick={resetGame} className="w-full">
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Breathing Game Component
function BreathingGame({ onComplete }: { onComplete: () => void }) {
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale")
  const [cycle, setCycle] = useState(0)
  const [timeLeft, setTimeLeft] = useState(4)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (phase === "inhale") {
              setPhase("hold")
              return 4
            } else if (phase === "hold") {
              setPhase("exhale")
              return 4
            } else {
              setPhase("inhale")
              setCycle((c) => {
                const newCycle = c + 1
                if (newCycle >= 5) {
                  setIsActive(false)
                  onComplete()
                }
                return newCycle
              })
              return 4
            }
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isActive, phase, onComplete])

  const startBreathing = () => {
    setIsActive(true)
    setCycle(0)
    setPhase("inhale")
    setTimeLeft(4)
  }

  const stopBreathing = () => {
    setIsActive(false)
    setCycle(0)
    setPhase("inhale")
    setTimeLeft(4)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Breathing Exercise</CardTitle>
        <p className="text-sm text-gray-600">Follow the breathing pattern to relax and reduce cravings</p>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-6">
          <div className="relative">
            <div
              className={`w-32 h-32 mx-auto rounded-full transition-all duration-1000 flex items-center justify-center ${
                phase === "inhale"
                  ? "bg-blue-200 scale-110"
                  : phase === "hold"
                    ? "bg-purple-200 scale-110"
                    : "bg-green-200 scale-90"
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{phase === "inhale" ? "🫁" : phase === "hold" ? "⏸️" : "💨"}</div>
                <div className="font-bold text-lg">{timeLeft}</div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-lg font-semibold capitalize mb-2">
              {phase === "inhale" ? "Breathe In" : phase === "hold" ? "Hold" : "Breathe Out"}
            </p>
            <p className="text-sm text-gray-600">Cycle {cycle}/5</p>
          </div>

          {!isActive ? (
            <Button onClick={startBreathing} className="w-full">
              Start Breathing Exercise
            </Button>
          ) : (
            <Button onClick={stopBreathing} variant="outline" className="w-full">
              Stop Exercise
            </Button>
          )}

          {cycle >= 5 && !isActive && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">✨</div>
              <p className="text-green-700 font-semibold">Well done!</p>
              <p className="text-sm text-green-600">You've completed a full breathing session</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
