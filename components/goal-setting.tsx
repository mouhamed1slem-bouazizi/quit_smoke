"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, Plus, CheckCircle, Clock, Heart, MessageCircle, Trophy, Star, Award, Medal } from "lucide-react"

interface Goal {
  id: string
  title: string
  target: number
  completed: boolean
  userComment?: string
  userReaction?: string
  completedDate?: string
}

interface UserData {
  goals: Goal[]
}

interface GoalSettingProps {
  userData: UserData
  updateUserData: (data: Partial<UserData>) => void
  daysSinceQuit: number
}

// Predefined 100 goals for 15 years
const PREDEFINED_GOALS = [
  // First Week (Days 1-7)
  { id: "g1", title: "First Hour Smoke-Free", target: 0.04, description: "Your first hour without smoking!" },
  { id: "g2", title: "First 6 Hours", target: 0.25, description: "Quarter day milestone" },
  { id: "g3", title: "First 12 Hours", target: 0.5, description: "Half day achievement" },
  { id: "g4", title: "First 24 Hours", target: 1, description: "Your first full day!" },
  { id: "g5", title: "48 Hours Strong", target: 2, description: "Two days of freedom" },
  { id: "g6", title: "72 Hours Champion", target: 3, description: "Three days milestone" },
  { id: "g7", title: "One Week Warrior", target: 7, description: "Seven days smoke-free!" },

  // First Month (Days 8-30)
  { id: "g8", title: "10 Days Achiever", target: 10, description: "Double digits!" },
  { id: "g9", title: "Two Weeks Hero", target: 14, description: "Fortnight of freedom" },
  { id: "g10", title: "Three Weeks Master", target: 21, description: "Habit formation period" },
  { id: "g11", title: "One Month Champion", target: 30, description: "First month completed!" },

  // First Quarter (Days 31-90)
  { id: "g12", title: "6 Weeks Strong", target: 42, description: "Six weeks of progress" },
  { id: "g13", title: "Two Months Hero", target: 60, description: "Two months milestone" },
  { id: "g14", title: "75 Days Achiever", target: 75, description: "Quarter way to 100!" },
  { id: "g15", title: "Three Months Master", target: 90, description: "Quarterly achievement" },

  // First Half Year (Days 91-180)
  { id: "g16", title: "100 Days Legend", target: 100, description: "Triple digits!" },
  { id: "g17", title: "120 Days Champion", target: 120, description: "Four months strong" },
  { id: "g18", title: "150 Days Hero", target: 150, description: "Five months milestone" },
  { id: "g19", title: "Six Months Master", target: 180, description: "Half year achievement!" },

  // First Year (Days 181-365)
  { id: "g20", title: "200 Days Warrior", target: 200, description: "200 days of freedom" },
  { id: "g21", title: "250 Days Champion", target: 250, description: "Eight months strong" },
  { id: "g22", title: "300 Days Legend", target: 300, description: "Ten months milestone" },
  { id: "g23", title: "11 Months Hero", target: 330, description: "Almost a year!" },
  { id: "g24", title: "One Year Master", target: 365, description: "Full year smoke-free!" },

  // Year 2 (Days 366-730)
  { id: "g25", title: "400 Days Champion", target: 400, description: "Over a year strong" },
  { id: "g26", title: "15 Months Hero", target: 450, description: "Fifteen months milestone" },
  { id: "g27", title: "500 Days Legend", target: 500, description: "500 days of freedom!" },
  { id: "g28", title: "18 Months Master", target: 540, description: "Year and a half" },
  { id: "g29", title: "600 Days Warrior", target: 600, description: "600 days strong" },
  { id: "g30", title: "21 Months Champion", target: 630, description: "Almost two years" },
  { id: "g31", title: "Two Years Master", target: 730, description: "Two full years!" },

  // Year 3 (Days 731-1095)
  { id: "g32", title: "800 Days Legend", target: 800, description: "800 days milestone" },
  { id: "g33", title: "30 Months Hero", target: 900, description: "Two and a half years" },
  { id: "g34", title: "1000 Days Champion", target: 1000, description: "Four digits achievement!" },
  { id: "g35", title: "Three Years Master", target: 1095, description: "Three years smoke-free!" },

  // Year 4 (Days 1096-1460)
  { id: "g36", title: "1200 Days Warrior", target: 1200, description: "1200 days strong" },
  { id: "g37", title: "42 Months Legend", target: 1260, description: "Three and a half years" },
  { id: "g38", title: "1300 Days Hero", target: 1300, description: "1300 days milestone" },
  { id: "g39", title: "Four Years Master", target: 1460, description: "Four years achievement!" },

  // Year 5 (Days 1461-1825)
  { id: "g40", title: "1500 Days Champion", target: 1500, description: "1500 days of freedom" },
  { id: "g41", title: "54 Months Warrior", target: 1620, description: "Four and a half years" },
  { id: "g42", title: "1700 Days Legend", target: 1700, description: "1700 days strong" },
  { id: "g43", title: "Five Years Master", target: 1825, description: "Five years smoke-free!" },

  // Year 6 (Days 1826-2190)
  { id: "g44", title: "1900 Days Hero", target: 1900, description: "1900 days milestone" },
  { id: "g45", title: "2000 Days Champion", target: 2000, description: "2000 days achievement!" },
  { id: "g46", title: "66 Months Warrior", target: 1980, description: "Five and a half years" },
  { id: "g47", title: "Six Years Master", target: 2190, description: "Six years smoke-free!" },

  // Year 7 (Days 2191-2555)
  { id: "g48", title: "2200 Days Legend", target: 2200, description: "2200 days strong" },
  { id: "g49", title: "2300 Days Hero", target: 2300, description: "2300 days milestone" },
  { id: "g50", title: "78 Months Champion", target: 2340, description: "Six and a half years" },
  { id: "g51", title: "Seven Years Master", target: 2555, description: "Seven years achievement!" },

  // Year 8 (Days 2556-2920)
  { id: "g52", title: "2600 Days Warrior", target: 2600, description: "2600 days of freedom" },
  { id: "g53", title: "2700 Days Legend", target: 2700, description: "2700 days strong" },
  { id: "g54", title: "90 Months Hero", target: 2700, description: "Seven and a half years" },
  { id: "g55", title: "Eight Years Master", target: 2920, description: "Eight years smoke-free!" },

  // Year 9 (Days 2921-3285)
  { id: "g56", title: "3000 Days Champion", target: 3000, description: "3000 days milestone!" },
  { id: "g57", title: "3100 Days Warrior", target: 3100, description: "3100 days achievement" },
  { id: "g58", title: "102 Months Legend", target: 3060, description: "Eight and a half years" },
  { id: "g59", title: "Nine Years Master", target: 3285, description: "Nine years smoke-free!" },

  // Year 10 (Days 3286-3650)
  { id: "g60", title: "3300 Days Hero", target: 3300, description: "3300 days strong" },
  { id: "g61", title: "3400 Days Champion", target: 3400, description: "3400 days milestone" },
  { id: "g62", title: "114 Months Warrior", target: 3420, description: "Nine and a half years" },
  { id: "g63", title: "Ten Years Master", target: 3650, description: "A full decade!" },

  // Year 11 (Days 3651-4015)
  { id: "g64", title: "3700 Days Legend", target: 3700, description: "3700 days achievement" },
  { id: "g65", title: "3800 Days Hero", target: 3800, description: "3800 days strong" },
  { id: "g66", title: "126 Months Champion", target: 3780, description: "Ten and a half years" },
  { id: "g67", title: "Eleven Years Master", target: 4015, description: "Eleven years smoke-free!" },

  // Year 12 (Days 4016-4380)
  { id: "g68", title: "4000 Days Warrior", target: 4000, description: "4000 days milestone!" },
  { id: "g69", title: "4100 Days Legend", target: 4100, description: "4100 days achievement" },
  { id: "g70", title: "138 Months Hero", target: 4140, description: "Eleven and a half years" },
  { id: "g71", title: "Twelve Years Master", target: 4380, description: "Twelve years smoke-free!" },

  // Year 13 (Days 4381-4745)
  { id: "g72", title: "4400 Days Champion", target: 4400, description: "4400 days strong" },
  { id: "g73", title: "4500 Days Warrior", target: 4500, description: "4500 days milestone" },
  { id: "g74", title: "150 Months Legend", target: 4500, description: "Twelve and a half years" },
  { id: "g75", title: "Thirteen Years Master", target: 4745, description: "Thirteen years achievement!" },

  // Year 14 (Days 4746-5110)
  { id: "g76", title: "4800 Days Hero", target: 4800, description: "4800 days strong" },
  { id: "g77", title: "4900 Days Champion", target: 4900, description: "4900 days milestone" },
  { id: "g78", title: "5000 Days Legend", target: 5000, description: "5000 days achievement!" },
  { id: "g79", title: "162 Months Warrior", target: 4860, description: "Thirteen and a half years" },
  { id: "g80", title: "Fourteen Years Master", target: 5110, description: "Fourteen years smoke-free!" },

  // Year 15 (Days 5111-5475)
  { id: "g81", title: "5200 Days Hero", target: 5200, description: "5200 days strong" },
  { id: "g82", title: "5300 Days Champion", target: 5300, description: "5300 days milestone" },
  { id: "g83", title: "174 Months Legend", target: 5220, description: "Fourteen and a half years" },
  { id: "g84", title: "5400 Days Warrior", target: 5400, description: "5400 days achievement" },
  { id: "g85", title: "Fifteen Years Master", target: 5475, description: "Fifteen years smoke-free!" },

  // Bonus Milestones
  { id: "g86", title: "Weekend Warrior", target: 14, description: "Two full weekends smoke-free" },
  { id: "g87", title: "Season Changer", target: 90, description: "A full season without smoking" },
  { id: "g88", title: "Holiday Hero", target: 365, description: "Celebrated all holidays smoke-free" },
  { id: "g89", title: "Leap Year Legend", target: 1461, description: "Survived a leap year smoke-free" },
  { id: "g90", title: "Olympic Cycle", target: 1460, description: "Four years like Olympic games" },
  { id: "g91", title: "Presidential Term", target: 1460, description: "A full presidential term" },
  { id: "g92", title: "Lucky 7 Years", target: 2555, description: "Seven lucky years" },
  { id: "g93", title: "Decade Plus", target: 3650, description: "More than a decade" },
  { id: "g94", title: "Baker's Dozen", target: 4745, description: "Thirteen years achievement" },
  { id: "g95", title: "Quinceañera", target: 5475, description: "Fifteen years celebration" },
  { id: "g96", title: "Century Months", target: 3000, description: "100 months milestone" },
  { id: "g97", title: "Millennium Days", target: 1000, description: "1000 days achievement" },
  { id: "g98", title: "Double Millennium", target: 2000, description: "2000 days strong" },
  { id: "g99", title: "Triple Millennium", target: 3000, description: "3000 days milestone" },
  { id: "g100", title: "Ultimate Master", target: 5475, description: "The ultimate 15-year achievement!" },
]

export default function GoalSetting({ userData, updateUserData, daysSinceQuit }: GoalSettingProps) {
  const [newGoalTitle, setNewGoalTitle] = useState("")
  const [newGoalTarget, setNewGoalTarget] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [commentText, setCommentText] = useState("")
  const [selectedReaction, setSelectedReaction] = useState("")
  const [goalsInitialized, setGoalsInitialized] = useState(false)

  // Initialize predefined goals on component mount
  useEffect(() => {
    if (!goalsInitialized && userData.goals) {
      const existingGoalIds = userData.goals.map((g) => g.id)
      const newGoals = PREDEFINED_GOALS.filter((pg) => !existingGoalIds.includes(pg.id)).map((pg) => ({
        id: pg.id,
        title: pg.title,
        target: Math.floor(pg.target),
        completed: false,
        userComment: "",
        userReaction: "",
      }))

      if (newGoals.length > 0) {
        const updatedGoals = [...userData.goals, ...newGoals].sort((a, b) => a.target - b.target)
        updateUserData({ goals: updatedGoals })
      }
      setGoalsInitialized(true)
    }
  }, [userData.goals, updateUserData, goalsInitialized])

  const addCustomGoal = () => {
    if (!newGoalTitle.trim() || !newGoalTarget) return

    const newGoal: Goal = {
      id: `custom_${Date.now()}`,
      title: newGoalTitle.trim(),
      target: Number.parseInt(newGoalTarget),
      completed: false,
      userComment: "",
      userReaction: "",
    }

    const updatedGoals = [...userData.goals, newGoal].sort((a, b) => a.target - b.target)
    updateUserData({ goals: updatedGoals })

    setNewGoalTitle("")
    setNewGoalTarget("")
    setShowAddForm(false)
  }

  const updateGoalReaction = (goalId: string, comment: string, reaction: string) => {
    const updatedGoals = userData.goals.map((goal) => {
      if (goal.id === goalId) {
        const isCompleted = daysSinceQuit >= goal.target
        return {
          ...goal,
          userComment: comment,
          userReaction: reaction,
          completed: isCompleted,
          completedDate: isCompleted && !goal.completed ? new Date().toISOString() : goal.completedDate,
        }
      }
      return goal
    })
    updateUserData({ goals: updatedGoals })
    setSelectedGoal(null)
    setCommentText("")
    setSelectedReaction("")
  }

  const getGoalProgress = (target: number) => {
    return Math.min((daysSinceQuit / target) * 100, 100)
  }

  const getGoalIcon = (goalId: string) => {
    if (goalId.includes("Master") || goalId === "g100") return <Trophy className="w-5 h-5" />
    if (goalId.includes("Legend") || goalId.includes("Champion")) return <Award className="w-5 h-5" />
    if (goalId.includes("Hero") || goalId.includes("Warrior")) return <Medal className="w-5 h-5" />
    return <Star className="w-5 h-5" />
  }

  const completedGoals = userData.goals.filter((goal) => daysSinceQuit >= goal.target).length
  const totalGoals = userData.goals.length
  const nextGoal = userData.goals.find((goal) => daysSinceQuit < goal.target)

  const reactions = ["❤️", "🎉", "💪", "🔥", "⭐", "🏆", "👏", "🎊", "💯", "🌟"]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Your Goals Journey
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {completedGoals}/{totalGoals} completed
            </Badge>
            {totalGoals > 0 && (
              <Badge variant="outline" className="text-green-600">
                {((completedGoals / totalGoals) * 100).toFixed(1)}% Complete
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {nextGoal && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">Next Goal</span>
                <span className="text-xs text-blue-600">{getGoalProgress(nextGoal.target).toFixed(0)}%</span>
              </div>
              <h3 className="font-semibold text-blue-800">{nextGoal.title}</h3>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getGoalProgress(nextGoal.target)}%` }}
                />
              </div>
              <p className="text-xs text-blue-600 mt-1">{Math.max(0, nextGoal.target - daysSinceQuit)} days to go</p>
            </div>
          )}

          <Button onClick={() => setShowAddForm(!showAddForm)} className="w-full mb-4" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Goal
          </Button>

          {showAddForm && (
            <Card className="mb-4">
              <CardContent className="p-4 space-y-3">
                <Input
                  placeholder="Goal title (e.g., '2 weeks smoke-free')"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Target days"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  min="1"
                />
                <div className="flex gap-2">
                  <Button onClick={addCustomGoal} size="sm" className="flex-1">
                    Add Goal
                  </Button>
                  <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {userData.goals
          .sort((a, b) => a.target - b.target)
          .map((goal) => {
            const progress = getGoalProgress(goal.target)
            const isCompleted = daysSinceQuit >= goal.target
            const daysRemaining = Math.max(0, goal.target - daysSinceQuit)

            return (
              <Card key={goal.id} className={isCompleted ? "bg-green-50 border-green-200" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getGoalIcon(goal.id)}
                        <h3 className={`font-semibold ${isCompleted ? "text-green-700" : ""}`}>{goal.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600">Target: {goal.target} days</p>
                      {goal.completedDate && (
                        <p className="text-xs text-green-600">
                          Completed: {new Date(goal.completedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {daysSinceQuit}/{goal.target} days
                      </span>
                      <span className={isCompleted ? "text-green-600 font-semibold" : "text-gray-600"}>
                        {isCompleted ? "Completed! 🎉" : `${daysRemaining} days to go`}
                      </span>
                    </div>
                  </div>

                  {isCompleted && (
                    <div className="mt-3 space-y-2">
                      <div className="p-2 bg-green-100 rounded-lg text-center">
                        <p className="text-green-700 font-semibold text-sm">🏆 Goal Achieved! Amazing work!</p>
                      </div>

                      {/* User Reaction and Comment */}
                      {(goal.userReaction || goal.userComment) && (
                        <div className="p-3 bg-white rounded-lg border">
                          {goal.userReaction && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{goal.userReaction}</span>
                              <span className="text-sm text-gray-600">Your reaction</span>
                            </div>
                          )}
                          {goal.userComment && <p className="text-sm text-gray-700 italic">"{goal.userComment}"</p>}
                        </div>
                      )}

                      <Button
                        onClick={() => {
                          setSelectedGoal(goal)
                          setCommentText(goal.userComment || "")
                          setSelectedReaction(goal.userReaction || "")
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {goal.userComment || goal.userReaction ? "Edit Reaction" : "Add Reaction"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
      </div>

      {/* Reaction Modal */}
      {selectedGoal && (
        <Card className="fixed inset-4 z-50 bg-white shadow-lg max-h-96 overflow-y-auto">
          <CardHeader>
            <CardTitle className="text-lg">Celebrate: {selectedGoal.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Choose your reaction:</label>
              <div className="grid grid-cols-5 gap-2">
                {reactions.map((reaction) => (
                  <button
                    key={reaction}
                    onClick={() => setSelectedReaction(reaction)}
                    className={`p-3 text-2xl rounded-lg border transition-all ${
                      selectedReaction === reaction
                        ? "bg-blue-100 border-blue-500 scale-110"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {reaction}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Add a personal note:</label>
              <Textarea
                placeholder="How do you feel about achieving this goal? Share your thoughts..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => updateGoalReaction(selectedGoal.id, commentText, selectedReaction)}
                className="flex-1"
              >
                <Heart className="w-4 h-4 mr-2" />
                Save Reaction
              </Button>
              <Button
                onClick={() => {
                  setSelectedGoal(null)
                  setCommentText("")
                  setSelectedReaction("")
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {userData.goals.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Loading your 100 goals...</p>
            <p className="text-sm text-gray-400">Your journey to 15 years smoke-free starts here!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
