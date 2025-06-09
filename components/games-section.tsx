"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Trophy } from "lucide-react"

// Import all game components
import MemoryGame from "./games/memory-game"
import ReactionGame from "./games/reaction-game"
import BreathingGame from "./games/breathing-game"
import ColorMemoryGame from "./games/color-memory-game"
import WordPuzzleGame from "./games/word-puzzle-game"
import NumberSequenceGame from "./games/number-sequence-game"
import PatternMatchingGame from "./games/pattern-matching-game"
import BubblePopGame from "./games/bubble-pop-game"

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
      id: "bubble-pop",
      title: "Bubble Pop",
      description: "Pop bubbles to relieve stress and improve focus",
      icon: "🫧",
      component: <BubblePopGame onComplete={incrementGamesPlayed} />,
    },
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
    {
      id: "color-memory",
      title: "Color Memory",
      description: "Remember and repeat color sequences",
      icon: "🎨",
      component: <ColorMemoryGame onComplete={incrementGamesPlayed} />,
    },
    {
      id: "word-puzzle",
      title: "Word Puzzle",
      description: "Find hidden words and improve vocabulary",
      icon: "📝",
      component: <WordPuzzleGame onComplete={incrementGamesPlayed} />,
    },
    {
      id: "number-sequence",
      title: "Number Sequence",
      description: "Solve mathematical patterns and sequences",
      icon: "🔢",
      component: <NumberSequenceGame onComplete={incrementGamesPlayed} />,
    },
    {
      id: "pattern-matching",
      title: "Pattern Matching",
      description: "Match visual patterns and logical sequences",
      icon: "🧩",
      component: <PatternMatchingGame onComplete={incrementGamesPlayed} />,
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
