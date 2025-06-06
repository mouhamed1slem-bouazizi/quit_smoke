"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, Plus, CheckCircle, Clock } from "lucide-react"

interface Goal {
  id: string
  title: string
  target: number
  completed: boolean
}

interface UserData {
  goals: Goal[]
}

interface GoalSettingProps {
  userData: UserData
  updateUserData: (data: Partial<UserData>) => void
  daysSinceQuit: number
}

export default function GoalSetting({ userData, updateUserData, daysSinceQuit }: GoalSettingProps) {
  const [newGoalTitle, setNewGoalTitle] = useState("")
  const [newGoalTarget, setNewGoalTarget] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  const addGoal = () => {
    if (!newGoalTitle.trim() || !newGoalTarget) return

    const newGoal: Goal = {
      id: Date.now().toString(),
      title: newGoalTitle.trim(),
      target: Number.parseInt(newGoalTarget),
      completed: false,
    }

    const updatedGoals = [...userData.goals, newGoal]
    updateUserData({ goals: updatedGoals })

    setNewGoalTitle("")
    setNewGoalTarget("")
    setShowAddForm(false)
  }

  const toggleGoalCompletion = (goalId: string) => {
    const updatedGoals = userData.goals.map((goal) =>
      goal.id === goalId ? { ...goal, completed: daysSinceQuit >= goal.target } : goal,
    )
    updateUserData({ goals: updatedGoals })
  }

  const deleteGoal = (goalId: string) => {
    const updatedGoals = userData.goals.filter((goal) => goal.id !== goalId)
    updateUserData({ goals: updatedGoals })
  }

  const getGoalProgress = (target: number) => {
    return Math.min((daysSinceQuit / target) * 100, 100)
  }

  const completedGoals = userData.goals.filter((goal) => daysSinceQuit >= goal.target).length
  const totalGoals = userData.goals.length

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Your Goals
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {completedGoals}/{totalGoals} completed
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="w-full mb-4" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add New Goal
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
                  <Button onClick={addGoal} size="sm" className="flex-1">
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

      <div className="space-y-3">
        {userData.goals.map((goal) => {
          const progress = getGoalProgress(goal.target)
          const isCompleted = daysSinceQuit >= goal.target
          const daysRemaining = Math.max(0, goal.target - daysSinceQuit)

          return (
            <Card key={goal.id} className={isCompleted ? "bg-green-50 border-green-200" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className={`font-semibold ${isCompleted ? "text-green-700" : ""}`}>{goal.title}</h3>
                    <p className="text-sm text-gray-600">Target: {goal.target} days</p>
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
                  <div className="mt-3 p-2 bg-green-100 rounded-lg text-center">
                    <p className="text-green-700 font-semibold text-sm">🏆 Goal Achieved! Amazing work!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

        {userData.goals.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No goals set yet</p>
              <p className="text-sm text-gray-400">Set your first goal to stay motivated on your smoke-free journey!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
