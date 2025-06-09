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
import WordSearchGame from "./games/word-search-game"
import SudokuGame from "./games/sudoku-game"
import ConnectDotsGame from "./games/connect-dots-game"
import TetrisGame from "./games/tetris-game"
import WaterSortGame from "./games/water-sort-game"

export default function GamesSection() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [gamesPlayed, setGamesPlayed] = useState(0)

  // Load games played count on initial render
  useEffect(() => {
    loadGamesPlayedCount()
  }, [])

  // Function to get today's date in YYYY-MM-DD format
  const getTodayDateKey = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  }

  // Load games played count for today
  const loadGamesPlayedCount = () => {
    const todayKey = getTodayDateKey()

    // Try the new format first
    const savedData = localStorage.getItem("gamesPlayedData")
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        const todayCount = data[todayKey] || 0
        setGamesPlayed(todayCount)
        return
      } catch (e) {
        console.error("Error parsing games played data:", e)
      }
    }

    // Fallback to old format
    const oldSaved = localStorage.getItem("gamesPlayed")
    if (oldSaved) {
      const count = Number.parseInt(oldSaved) || 0
      setGamesPlayed(count)
    } else {
      setGamesPlayed(0)
    }
  }

  // Increment games played count
  const incrementGamesPlayed = () => {
    const todayKey = getTodayDateKey()
    const newCount = gamesPlayed + 1

    setGamesPlayed(newCount)

    // Save to localStorage with date tracking
    const savedData = localStorage.getItem("gamesPlayedData")
    let data = {}

    if (savedData) {
      try {
        data = JSON.parse(savedData)
      } catch (e) {
        console.error("Error parsing games played data:", e)
      }
    }

    data[todayKey] = newCount
    localStorage.setItem("gamesPlayedData", JSON.stringify(data))

    // Also save in old format for compatibility
    localStorage.setItem("gamesPlayed", newCount.toString())
  }

  // Handle game selection and increment counter
  const handleGameSelect = (gameId: string) => {
    incrementGamesPlayed()
    setSelectedGame(gameId)
  }

  // Dummy onComplete function since we're not using it anymore
  const dummyOnComplete = () => {
    // No longer needed since we count on play, not completion
  }

  const games = [
    {
      id: "sudoku",
      title: "Sudoku",
      description: "Solve number puzzles with logic and strategy",
      icon: "🔢",
      component: <SudokuGame onComplete={dummyOnComplete} />,
    },
    {
      id: "word-search",
      title: "Word Search",
      description: "Find hidden words in a grid of letters",
      icon: "🔍",
      component: <WordSearchGame onComplete={dummyOnComplete} />,
    },
    {
      id: "bubble-pop",
      title: "Bubble Pop",
      description: "Pop bubbles to relieve stress and improve focus",
      icon: "🫧",
      component: <BubblePopGame onComplete={dummyOnComplete} />,
    },
    {
      id: "memory",
      title: "Memory Match",
      description: "Match pairs of cards to improve focus",
      icon: "🧠",
      component: <MemoryGame onComplete={dummyOnComplete} />,
    },
    {
      id: "reaction",
      title: "Reaction Time",
      description: "Test your reflexes and stay alert",
      icon: "⚡",
      component: <ReactionGame onComplete={dummyOnComplete} />,
    },
    {
      id: "breathing",
      title: "Breathing Exercise",
      description: "Calm your mind with guided breathing",
      icon: "🫁",
      component: <BreathingGame onComplete={dummyOnComplete} />,
    },
    {
      id: "color-memory",
      title: "Color Memory",
      description: "Remember and repeat color sequences",
      icon: "🎨",
      component: <ColorMemoryGame onComplete={dummyOnComplete} />,
    },
    {
      id: "word-puzzle",
      title: "Word Puzzle",
      description: "Find hidden words and improve vocabulary",
      icon: "📝",
      component: <WordPuzzleGame onComplete={dummyOnComplete} />,
    },
    {
      id: "number-sequence",
      title: "Number Sequence",
      description: "Solve mathematical patterns and sequences",
      icon: "🔢",
      component: <NumberSequenceGame onComplete={dummyOnComplete} />,
    },
    {
      id: "pattern-matching",
      title: "Pattern Matching",
      description: "Match visual patterns and logical sequences",
      icon: "🧩",
      component: <PatternMatchingGame onComplete={dummyOnComplete} />,
    },
    {
      id: "connect-dots",
      title: "Connect the Dots",
      description: "Connect numbered dots in sequence to reveal patterns",
      icon: "🔗",
      component: <ConnectDotsGame onComplete={dummyOnComplete} />,
    },
    {
      id: "tetris",
      title: "Tetris Blocks",
      description: "Clear lines with falling blocks in this classic puzzle",
      icon: "🧩",
      component: <TetrisGame onComplete={dummyOnComplete} />,
    },
    {
      id: "water-sort",
      title: "Water Color Sort",
      description: "Sort colored water between tubes until each contains one color",
      icon: "🧪",
      component: <WaterSortGame onComplete={dummyOnComplete} />,
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
            {gamesPlayed} played today
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
              <div className="flex items-center gap-4">
                <div className="text-2xl">{game.icon}</div>
                <div className="flex-1" onClick={() => handleGameSelect(game.id)}>
                  <h3 className="font-semibold">{game.title}</h3>
                  <p className="text-sm text-gray-600">{game.description}</p>
                </div>
                <Button size="sm" onClick={() => handleGameSelect(game.id)}>
                  Play
                </Button>
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
