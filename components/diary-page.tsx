"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, Edit3, Trash2, Calendar, Heart, X, Save, Smile, Clock } from "lucide-react"

interface DiaryEntry {
  id: string
  date: string
  mood: string
  moodLabel: string
  note: string
  timestamp: number
  time?: string
}

interface DiaryPageProps {
  daysSinceQuit: number
  updateUserData: (data: any) => void
}

export default function DiaryPage({ daysSinceQuit, updateUserData }: DiaryPageProps) {
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [newEntry, setNewEntry] = useState({
    mood: "",
    moodLabel: "",
    note: "",
  })
  const [editNote, setEditNote] = useState("")

  const moodOptions = [
    { emoji: "😊", label: "Great", color: "bg-green-100 text-green-700" },
    { emoji: "🙂", label: "Good", color: "bg-blue-100 text-blue-700" },
    { emoji: "😐", label: "Okay", color: "bg-yellow-100 text-yellow-700" },
    { emoji: "😔", label: "Sad", color: "bg-orange-100 text-orange-700" },
    { emoji: "😤", label: "Frustrated", color: "bg-red-100 text-red-700" },
    { emoji: "😰", label: "Anxious", color: "bg-purple-100 text-purple-700" },
    { emoji: "💪", label: "Strong", color: "bg-emerald-100 text-emerald-700" },
    { emoji: "😴", label: "Tired", color: "bg-gray-100 text-gray-700" },
    { emoji: "🎉", label: "Excited", color: "bg-pink-100 text-pink-700" },
    { emoji: "🤔", label: "Thoughtful", color: "bg-indigo-100 text-indigo-700" },
  ]

  useEffect(() => {
    loadDiaryEntries()
  }, [])

  const loadDiaryEntries = () => {
    const savedEntries = localStorage.getItem("diaryEntries")
    if (savedEntries) {
      setDiaryEntries(JSON.parse(savedEntries))
    }
  }

  const saveDiaryEntries = (entries: DiaryEntry[]) => {
    setDiaryEntries(entries)
    localStorage.setItem("diaryEntries", JSON.stringify(entries))
    // Force a re-render by updating a timestamp
    updateUserData({ lastDiaryUpdate: Date.now() })
  }

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0]
  }

  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateString === today.toISOString().split("T")[0]) {
      return "Today"
    } else if (dateString === yesterday.toISOString().split("T")[0]) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    }
  }

  const getTodayEntries = () => {
    const today = getTodayDate()
    return diaryEntries.filter((entry) => entry.date === today)
  }

  const getLatestMood = () => {
    const todayEntries = getTodayEntries()
    if (todayEntries.length === 0) return null

    // Sort by timestamp and get the latest mood
    return todayEntries.sort((a, b) => b.timestamp - a.timestamp)[0]
  }

  const getLast7DaysMoods = () => {
    const last7Days = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      // Get the latest mood for this day
      const dayEntries = diaryEntries.filter((e) => e.date === dateString)
      let latestMood = null
      if (dayEntries.length > 0) {
        latestMood = dayEntries.sort((a, b) => b.timestamp - a.timestamp)[0]
      }

      last7Days.push({
        date: dateString,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        mood: latestMood?.mood || "",
        moodLabel: latestMood?.moodLabel || "",
      })
    }

    return last7Days
  }

  const addDiaryEntry = () => {
    if (!newEntry.note.trim()) return

    const today = getTodayDate()
    const currentTime = getCurrentTime()

    // Create new entry
    const entry: DiaryEntry = {
      id: `diary_${Date.now()}`,
      date: today,
      mood: newEntry.mood || "😐", // Default mood if none selected
      moodLabel: newEntry.moodLabel || "Okay", // Default mood label
      note: newEntry.note.trim(),
      timestamp: Date.now(),
      time: currentTime,
    }

    saveDiaryEntries([...diaryEntries, entry])

    // Reset form and close
    setNewEntry({ mood: "", moodLabel: "", note: "" })
    setShowAddEntry(false)
  }

  const updateMood = (mood: string, moodLabel: string) => {
    const today = getTodayDate()
    const latestMood = getLatestMood()
    const currentTime = getCurrentTime()

    if (latestMood) {
      // Update latest entry's mood
      const updatedEntries = diaryEntries.map((entry) =>
        entry.id === latestMood.id
          ? {
              ...entry,
              mood,
              moodLabel,
              timestamp: Date.now(),
            }
          : entry,
      )
      saveDiaryEntries(updatedEntries)
    } else {
      // Create new entry with just mood
      const entry: DiaryEntry = {
        id: `diary_${Date.now()}`,
        date: today,
        mood,
        moodLabel,
        note: "",
        timestamp: Date.now(),
        time: currentTime,
      }
      saveDiaryEntries([...diaryEntries, entry])
    }
  }

  const updateNote = (entryId: string, newNote: string) => {
    const updatedEntries = diaryEntries.map((entry) =>
      entry.id === entryId
        ? {
            ...entry,
            note: newNote.trim(),
            timestamp: Date.now(),
          }
        : entry,
    )
    saveDiaryEntries(updatedEntries)
    setEditingEntry(null)
    setEditNote("")
  }

  const deleteEntry = (entryId: string) => {
    const updatedEntries = diaryEntries.filter((entry) => entry.id !== entryId)
    saveDiaryEntries(updatedEntries)
  }

  const last7DaysMoods = getLast7DaysMoods()
  const todayEntries = getTodayEntries()
  const latestMood = getLatestMood()

  // Get all entries with notes, sorted by timestamp (newest first)
  const allEntries = diaryEntries.filter((entry) => entry.note.trim() !== "").sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Diary</h1>
        <p className="text-gray-600">Track your mood and thoughts on your smoke-free journey</p>
      </div>

      {/* Today's Mood */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Smile className="w-5 h-5 text-blue-600" />
            How are you feeling today?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {latestMood && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <span className="text-2xl">{latestMood.mood}</span>
                <div>
                  <p className="font-semibold">{latestMood.moodLabel}</p>
                  <p className="text-sm text-gray-600">Current mood</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-5 gap-2">
              {moodOptions.map((mood) => (
                <button
                  key={mood.emoji}
                  onClick={() => updateMood(mood.emoji, mood.label)}
                  className={`p-3 rounded-lg border transition-all hover:scale-105 ${
                    latestMood?.mood === mood.emoji
                      ? `${mood.color} border-current scale-105`
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{mood.emoji}</div>
                    <div className="text-xs font-medium">{mood.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last 7 Days Mood Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Last 7 Days Mood
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {last7DaysMoods.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs font-medium text-gray-600 mb-2">{day.dayName}</div>
                <div
                  className={`p-3 rounded-lg border ${
                    day.mood ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  {day.mood ? (
                    <div>
                      <div className="text-2xl mb-1">{day.mood}</div>
                      <div className="text-xs text-gray-600">{day.moodLabel}</div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">No mood</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Notes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-purple-600" />
            Today's Notes
          </CardTitle>
          <Button onClick={() => setShowAddEntry(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Note
          </Button>
        </CardHeader>
        <CardContent>
          {showAddEntry && (
            <div className="space-y-3 mb-4 p-4 bg-blue-50 rounded-lg">
              <Textarea
                value={newEntry.note}
                onChange={(e) => setNewEntry({ ...newEntry, note: e.target.value })}
                placeholder="How are you feeling today? What's on your mind about your smoke-free journey?"
                rows={4}
              />
              <div className="flex gap-2">
                <Button onClick={addDiaryEntry} size="sm" className="flex-1" disabled={!newEntry.note.trim()}>
                  <Save className="w-4 h-4 mr-1" />
                  Save Note
                </Button>
                <Button
                  onClick={() => {
                    setShowAddEntry(false)
                    setNewEntry({ mood: "", moodLabel: "", note: "" })
                  }}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {todayEntries.length > 0 ? (
            <div className="space-y-4">
              {todayEntries
                .filter((entry) => entry.note.trim() !== "")
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((entry) => (
                  <div key={entry.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      {entry.mood && (
                        <div className="flex-shrink-0">
                          <span className="text-2xl">{entry.mood}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-gray-700 leading-relaxed mb-2">{entry.note}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {entry.time && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {entry.time}
                              </div>
                            )}
                            {entry.moodLabel && (
                              <Badge variant="secondary" className="text-xs">
                                {entry.moodLabel}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => {
                                setEditingEntry(entry.id)
                                setEditNote(entry.note)
                              }}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => deleteEntry(entry.id)}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {editingEntry === entry.id && (
                      <div className="mt-3 pt-3 border-t space-y-3">
                        <Textarea
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          placeholder="Edit your note..."
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button onClick={() => updateNote(entry.id, editNote)} size="sm" className="flex-1">
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingEntry(null)
                              setEditNote("")
                            }}
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 mb-4">No notes added for today</p>
              <Button onClick={() => setShowAddEntry(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Today's Note
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Previous Entries */}
      {allEntries.filter((entry) => entry.date !== getTodayDate()).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-600" />
              Previous Diary Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allEntries
                .filter((entry) => entry.date !== getTodayDate())
                .slice(0, 10)
                .map((entry) => (
                  <div key={entry.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      {entry.mood && (
                        <div className="flex-shrink-0">
                          <span className="text-2xl">{entry.mood}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-gray-700 leading-relaxed mb-2">{entry.note}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {formatDate(entry.date)}
                            </Badge>
                            {entry.time && <div className="text-xs text-gray-500">{entry.time}</div>}
                            {entry.moodLabel && (
                              <Badge variant="secondary" className="text-xs">
                                {entry.moodLabel}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-4 text-center">
          <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-800 mb-2">Keep Writing Your Story</h3>
          <p className="text-sm text-gray-600">
            Day {daysSinceQuit} of your smoke-free journey. Every day is a new chapter in your success story!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
