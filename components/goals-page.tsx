"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Target,
  Plus,
  Heart,
  TrendingUp,
  Leaf,
  User,
  Smile,
  TreesIcon as Lungs,
  Clock,
  Zap,
  Trophy,
  Medal,
  Star,
  CheckCircle,
  X,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface Goal {
  id: string
  title: string
  description: string
  target: number
  current: number
  category: string
  completed: boolean
  completedDate?: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedDate?: string
}

interface GoalsPageProps {
  daysSinceQuit: number
}

export default function GoalsPage({ daysSinceQuit }: GoalsPageProps) {
  const { userData, updateUserData, loading } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    target: "",
    category: "health",
  })

  // Show loading state if user data is not loaded yet
  if (loading || !userData) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-3 gap-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const goalCategories = [
    {
      id: "health",
      name: "Health",
      icon: <Heart className="w-6 h-6" />,
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      id: "progress",
      name: "Progress",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      id: "ecology",
      name: "Ecology",
      icon: <Leaf className="w-6 h-6" />,
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      id: "body",
      name: "Body",
      icon: <User className="w-6 h-6" />,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      id: "wellbeing",
      name: "Wellbeing",
      icon: <Smile className="w-6 h-6" />,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      id: "lungs",
      name: "Lungs",
      icon: <Lungs className="w-6 h-6" />,
      color: "text-cyan-500",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-200",
    },
    {
      id: "time",
      name: "Time",
      icon: <Clock className="w-6 h-6" />,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      id: "nicotine",
      name: "Nicotine",
      icon: <Zap className="w-6 h-6" />,
      color: "text-pink-500",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
    },
    {
      id: "trophies",
      name: "Trophies",
      icon: <Trophy className="w-6 h-6" />,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
  ]

  // Calculate cigarettes not smoked
  const cigarettesNotSmoked = daysSinceQuit * userData.smokesPerDay
  const nextMilestone = Math.ceil(cigarettesNotSmoked / 100) * 100
  const progressToNext = ((cigarettesNotSmoked % 100) / 100) * 100

  // Merge default goals with user goals
  const defaultGoals: Goal[] = [
    // Health Goals - 10 goals
    {
      id: "health_1",
      title: "First Day Health Boost",
      description: "Complete 1 day without smoking for initial health benefits",
      target: 1,
      current: Math.min(daysSinceQuit, 1),
      category: "health",
      completed: daysSinceQuit >= 1,
    },
    {
      id: "health_2",
      title: "First Week Milestone",
      description: "Complete 7 days without smoking for improved circulation",
      target: 7,
      current: Math.min(daysSinceQuit, 7),
      category: "health",
      completed: daysSinceQuit >= 7,
    },
    {
      id: "health_3",
      title: "Two Weeks Smoke-Free",
      description: "Reach 14 days for improved lung function",
      target: 14,
      current: Math.min(daysSinceQuit, 14),
      category: "health",
      completed: daysSinceQuit >= 14,
    },
    {
      id: "health_4",
      title: "One Month Milestone",
      description: "Reach 30 days smoke-free for significant health improvements",
      target: 30,
      current: Math.min(daysSinceQuit, 30),
      category: "health",
      completed: daysSinceQuit >= 30,
    },
    {
      id: "health_5",
      title: "Three Month Champion",
      description: "Achieve 90 days without smoking for major health benefits",
      target: 90,
      current: Math.min(daysSinceQuit, 90),
      category: "health",
      completed: daysSinceQuit >= 90,
    },
    {
      id: "health_6",
      title: "Six Month Milestone",
      description: "Complete 180 days for reduced risk of heart disease",
      target: 180,
      current: Math.min(daysSinceQuit, 180),
      category: "health",
      completed: daysSinceQuit >= 180,
    },
    {
      id: "health_7",
      title: "One Year Smoke-Free",
      description: "Reach 365 days for 50% reduced risk of heart disease",
      target: 365,
      current: Math.min(daysSinceQuit, 365),
      category: "health",
      completed: daysSinceQuit >= 365,
    },
    {
      id: "health_8",
      title: "Two Year Milestone",
      description: "Complete 730 days for significantly reduced stroke risk",
      target: 730,
      current: Math.min(daysSinceQuit, 730),
      category: "health",
      completed: daysSinceQuit >= 730,
    },
    {
      id: "health_9",
      title: "Five Year Achievement",
      description: "Reach 1825 days for 50% reduced risk of lung cancer",
      target: 1825,
      current: Math.min(daysSinceQuit, 1825),
      category: "health",
      completed: daysSinceQuit >= 1825,
    },
    {
      id: "health_10",
      title: "Ten Year Transformation",
      description: "Complete 3650 days for health similar to a non-smoker",
      target: 3650,
      current: Math.min(daysSinceQuit, 3650),
      category: "health",
      completed: daysSinceQuit >= 3650,
    },

    // Progress Goals - 10 goals
    {
      id: "progress_1",
      title: "10 Cigarettes Avoided",
      description: "Avoid smoking your first 10 cigarettes",
      target: 10,
      current: Math.min(cigarettesNotSmoked, 10),
      category: "progress",
      completed: cigarettesNotSmoked >= 10,
    },
    {
      id: "progress_2",
      title: "50 Cigarettes Avoided",
      description: "Avoid smoking 50 cigarettes",
      target: 50,
      current: Math.min(cigarettesNotSmoked, 50),
      category: "progress",
      completed: cigarettesNotSmoked >= 50,
    },
    {
      id: "progress_3",
      title: "100 Cigarettes Avoided",
      description: "Avoid smoking 100 cigarettes",
      target: 100,
      current: Math.min(cigarettesNotSmoked, 100),
      category: "progress",
      completed: cigarettesNotSmoked >= 100,
    },
    {
      id: "progress_4",
      title: "250 Cigarettes Avoided",
      description: "Avoid smoking 250 cigarettes",
      target: 250,
      current: Math.min(cigarettesNotSmoked, 250),
      category: "progress",
      completed: cigarettesNotSmoked >= 250,
    },
    {
      id: "progress_5",
      title: "500 Cigarettes Avoided",
      description: "Avoid smoking 500 cigarettes",
      target: 500,
      current: Math.min(cigarettesNotSmoked, 500),
      category: "progress",
      completed: cigarettesNotSmoked >= 500,
    },
    {
      id: "progress_6",
      title: "1,000 Cigarettes Avoided",
      description: "Avoid smoking 1,000 cigarettes",
      target: 1000,
      current: Math.min(cigarettesNotSmoked, 1000),
      category: "progress",
      completed: cigarettesNotSmoked >= 1000,
    },
    {
      id: "progress_7",
      title: "2,500 Cigarettes Avoided",
      description: "Avoid smoking 2,500 cigarettes",
      target: 2500,
      current: Math.min(cigarettesNotSmoked, 2500),
      category: "progress",
      completed: cigarettesNotSmoked >= 2500,
    },
    {
      id: "progress_8",
      title: "5,000 Cigarettes Avoided",
      description: "Avoid smoking 5,000 cigarettes",
      target: 5000,
      current: Math.min(cigarettesNotSmoked, 5000),
      category: "progress",
      completed: cigarettesNotSmoked >= 5000,
    },
    {
      id: "progress_9",
      title: "10,000 Cigarettes Avoided",
      description: "Avoid smoking 10,000 cigarettes",
      target: 10000,
      current: Math.min(cigarettesNotSmoked, 10000),
      category: "progress",
      completed: cigarettesNotSmoked >= 10000,
    },
    {
      id: "progress_10",
      title: "20,000 Cigarettes Avoided",
      description: "Avoid smoking 20,000 cigarettes",
      target: 20000,
      current: Math.min(cigarettesNotSmoked, 20000),
      category: "progress",
      completed: cigarettesNotSmoked >= 20000,
    },

    // Ecology Goals - 10 goals
    {
      id: "ecology_1",
      title: "10 Butts Not Littered",
      description: "Prevent 10 cigarette butts from polluting",
      target: 10,
      current: Math.min(cigarettesNotSmoked, 10),
      category: "ecology",
      completed: cigarettesNotSmoked >= 10,
    },
    {
      id: "ecology_2",
      title: "50 Butts Environmental Save",
      description: "Save environment from 50 cigarette butts",
      target: 50,
      current: Math.min(cigarettesNotSmoked, 50),
      category: "ecology",
      completed: cigarettesNotSmoked >= 50,
    },
    {
      id: "ecology_3",
      title: "100 Butts Not Polluting",
      description: "Prevent 100 cigarette butts from polluting water",
      target: 100,
      current: Math.min(cigarettesNotSmoked, 100),
      category: "ecology",
      completed: cigarettesNotSmoked >= 100,
    },
    {
      id: "ecology_4",
      title: "500 Butts Saved",
      description: "Keep 500 cigarette butts out of the environment",
      target: 500,
      current: Math.min(cigarettesNotSmoked, 500),
      category: "ecology",
      completed: cigarettesNotSmoked >= 500,
    },
    {
      id: "ecology_5",
      title: "1,000 Butts Milestone",
      description: "Prevent 1,000 cigarette butts from polluting",
      target: 1000,
      current: Math.min(cigarettesNotSmoked, 1000),
      category: "ecology",
      completed: cigarettesNotSmoked >= 1000,
    },
    {
      id: "ecology_6",
      title: "1 kg Plastic Saved",
      description: "Save 1 kg of plastic from cigarette packaging",
      target: 2000,
      current: Math.min(cigarettesNotSmoked, 2000),
      category: "ecology",
      completed: cigarettesNotSmoked >= 2000,
    },
    {
      id: "ecology_7",
      title: "5,000 Butts Milestone",
      description: "Prevent 5,000 cigarette butts from polluting",
      target: 5000,
      current: Math.min(cigarettesNotSmoked, 5000),
      category: "ecology",
      completed: cigarettesNotSmoked >= 5000,
    },
    {
      id: "ecology_8",
      title: "5 kg Plastic Saved",
      description: "Save 5 kg of plastic from cigarette packaging",
      target: 10000,
      current: Math.min(cigarettesNotSmoked, 10000),
      category: "ecology",
      completed: cigarettesNotSmoked >= 10000,
    },
    {
      id: "ecology_9",
      title: "10,000 Butts Milestone",
      description: "Prevent 10,000 cigarette butts from polluting",
      target: 10000,
      current: Math.min(cigarettesNotSmoked, 10000),
      category: "ecology",
      completed: cigarettesNotSmoked >= 10000,
    },
    {
      id: "ecology_10",
      title: "10 kg Plastic Saved",
      description: "Save 10 kg of plastic from cigarette packaging",
      target: 20000,
      current: Math.min(cigarettesNotSmoked, 20000),
      category: "ecology",
      completed: cigarettesNotSmoked >= 20000,
    },

    // Body Goals - 10 goals
    {
      id: "body_1",
      title: "Blood Pressure Improvement",
      description: "First 20 minutes: Blood pressure begins to normalize",
      target: 0.014,
      current: Math.min(daysSinceQuit, 0.014),
      category: "body",
      completed: daysSinceQuit >= 0.014,
    },
    {
      id: "body_2",
      title: "Carbon Monoxide Reduction",
      description: "After 8 hours: Carbon monoxide levels drop by half",
      target: 0.33,
      current: Math.min(daysSinceQuit, 0.33),
      category: "body",
      completed: daysSinceQuit >= 0.33,
    },
    {
      id: "body_3",
      title: "Taste Buds Recovery",
      description: "After 2 days: Taste buds begin to recover",
      target: 2,
      current: Math.min(daysSinceQuit, 2),
      category: "body",
      completed: daysSinceQuit >= 2,
    },
    {
      id: "body_4",
      title: "Smell Improvement",
      description: "After 3 days: Sense of smell enhances",
      target: 3,
      current: Math.min(daysSinceQuit, 3),
      category: "body",
      completed: daysSinceQuit >= 3,
    },
    {
      id: "body_5",
      title: "Circulation Improvement",
      description: "After 2 weeks: Blood circulation improves",
      target: 14,
      current: Math.min(daysSinceQuit, 14),
      category: "body",
      completed: daysSinceQuit >= 14,
    },
    {
      id: "body_6",
      title: "Walking Easier",
      description: "After 3 weeks: Walking becomes easier",
      target: 21,
      current: Math.min(daysSinceQuit, 21),
      category: "body",
      completed: daysSinceQuit >= 21,
    },
    {
      id: "body_7",
      title: "Skin Improvement",
      description: "After 1 month: Skin appearance improves",
      target: 30,
      current: Math.min(daysSinceQuit, 30),
      category: "body",
      completed: daysSinceQuit >= 30,
    },
    {
      id: "body_8",
      title: "Teeth Whitening",
      description: "After 3 months: Teeth begin to whiten",
      target: 90,
      current: Math.min(daysSinceQuit, 90),
      category: "body",
      completed: daysSinceQuit >= 90,
    },
    {
      id: "body_9",
      title: "Hair Health Improvement",
      description: "After 6 months: Hair becomes healthier",
      target: 180,
      current: Math.min(daysSinceQuit, 180),
      category: "body",
      completed: daysSinceQuit >= 180,
    },
    {
      id: "body_10",
      title: "Full Body Rejuvenation",
      description: "After 1 year: Body has significantly rejuvenated",
      target: 365,
      current: Math.min(daysSinceQuit, 365),
      category: "body",
      completed: daysSinceQuit >= 365,
    },

    // Wellbeing Goals - 10 goals
    {
      id: "wellbeing_1",
      title: "First Achievement Pride",
      description: "After 1 day: Feel pride in your first accomplishment",
      target: 1,
      current: Math.min(daysSinceQuit, 1),
      category: "wellbeing",
      completed: daysSinceQuit >= 1,
    },
    {
      id: "wellbeing_2",
      title: "Stress Reduction Begins",
      description: "After 3 days: Begin to feel less stressed",
      target: 3,
      current: Math.min(daysSinceQuit, 3),
      category: "wellbeing",
      completed: daysSinceQuit >= 3,
    },
    {
      id: "wellbeing_3",
      title: "Withdrawal Peak Overcome",
      description: "After 1 week: Overcome the peak of withdrawal symptoms",
      target: 7,
      current: Math.min(daysSinceQuit, 7),
      category: "wellbeing",
      completed: daysSinceQuit >= 7,
    },
    {
      id: "wellbeing_4",
      title: "Mental Clarity Boost",
      description: "After 2 weeks: Experience improved mental clarity",
      target: 14,
      current: Math.min(daysSinceQuit, 14),
      category: "wellbeing",
      completed: daysSinceQuit >= 14,
    },
    {
      id: "wellbeing_5",
      title: "Stress Level Improvement",
      description: "After 1 month: Natural stress management returns",
      target: 30,
      current: Math.min(daysSinceQuit, 30),
      category: "wellbeing",
      completed: daysSinceQuit >= 30,
    },
    {
      id: "wellbeing_6",
      title: "Anxiety Reduction",
      description: "After 2 months: Experience reduced anxiety levels",
      target: 60,
      current: Math.min(daysSinceQuit, 60),
      category: "wellbeing",
      completed: daysSinceQuit >= 60,
    },
    {
      id: "wellbeing_7",
      title: "Mood Stabilization",
      description: "After 3 months: Enjoy more stable moods",
      target: 90,
      current: Math.min(daysSinceQuit, 90),
      category: "wellbeing",
      completed: daysSinceQuit >= 90,
    },
    {
      id: "wellbeing_8",
      title: "Depression Risk Decrease",
      description: "After 6 months: Experience decreased depression risk",
      target: 180,
      current: Math.min(daysSinceQuit, 180),
      category: "wellbeing",
      completed: daysSinceQuit >= 180,
    },
    {
      id: "wellbeing_9",
      title: "Psychological Freedom",
      description: "After 9 months: Feel psychologically free from smoking",
      target: 270,
      current: Math.min(daysSinceQuit, 270),
      category: "wellbeing",
      completed: daysSinceQuit >= 270,
    },
    {
      id: "wellbeing_10",
      title: "Complete Mental Wellbeing",
      description: "After 1 year: Experience complete mental wellbeing improvement",
      target: 365,
      current: Math.min(daysSinceQuit, 365),
      category: "wellbeing",
      completed: daysSinceQuit >= 365,
    },

    // Lungs Goals - 10 goals
    {
      id: "lungs_1",
      title: "Oxygen Levels Improve",
      description: "After 8 hours: Oxygen levels return to normal",
      target: 0.33,
      current: Math.min(daysSinceQuit, 0.33),
      category: "lungs",
      completed: daysSinceQuit >= 0.33,
    },
    {
      id: "lungs_2",
      title: "Carbon Monoxide Eliminated",
      description: "After 24 hours: Carbon monoxide eliminated from lungs",
      target: 1,
      current: Math.min(daysSinceQuit, 1),
      category: "lungs",
      completed: daysSinceQuit >= 1,
    },
    {
      id: "lungs_3",
      title: "Bronchial Tubes Relaxation",
      description: "After 3 days: Bronchial tubes begin to relax",
      target: 3,
      current: Math.min(daysSinceQuit, 3),
      category: "lungs",
      completed: daysSinceQuit >= 3,
    },
    {
      id: "lungs_4",
      title: "Mucus Clearing Begins",
      description: "After 5 days: Lungs start clearing mucus",
      target: 5,
      current: Math.min(daysSinceQuit, 5),
      category: "lungs",
      completed: daysSinceQuit >= 5,
    },
    {
      id: "lungs_5",
      title: "Lung Function Increase",
      description: "After 2 weeks: 30% lung function improvement",
      target: 14,
      current: Math.min(daysSinceQuit, 14),
      category: "lungs",
      completed: daysSinceQuit >= 14,
    },
    {
      id: "lungs_6",
      title: "Cilia Regrowth",
      description: "After 1 month: Cilia regrow in lungs",
      target: 30,
      current: Math.min(daysSinceQuit, 30),
      category: "lungs",
      completed: daysSinceQuit >= 30,
    },
    {
      id: "lungs_7",
      title: "Reduced Coughing",
      description: "After 2 months: Significantly less coughing",
      target: 60,
      current: Math.min(daysSinceQuit, 60),
      category: "lungs",
      completed: daysSinceQuit >= 60,
    },
    {
      id: "lungs_8",
      title: "Lung Capacity Boost",
      description: "After 3 months: Lung capacity significantly improves",
      target: 90,
      current: Math.min(daysSinceQuit, 90),
      category: "lungs",
      completed: daysSinceQuit >= 90,
    },
    {
      id: "lungs_9",
      title: "Infection Risk Halved",
      description: "After 1 year: Lung infection risk reduced by 50%",
      target: 365,
      current: Math.min(daysSinceQuit, 365),
      category: "lungs",
      completed: daysSinceQuit >= 365,
    },
    {
      id: "lungs_10",
      title: "Lung Cancer Risk Halved",
      description: "After 10 years: Lung cancer risk reduced by 50%",
      target: 3650,
      current: Math.min(daysSinceQuit, 3650),
      category: "lungs",
      completed: daysSinceQuit >= 3650,
    },

    // Time Goals - 10 goals
    {
      id: "time_1",
      title: "First Hour Milestone",
      description: "Complete your first hour smoke-free",
      target: 0.042,
      current: Math.min(daysSinceQuit, 0.042),
      category: "time",
      completed: daysSinceQuit >= 0.042,
    },
    {
      id: "time_2",
      title: "First Day Achievement",
      description: "Complete 24 hours without smoking",
      target: 1,
      current: Math.min(daysSinceQuit, 1),
      category: "time",
      completed: daysSinceQuit >= 1,
    },
    {
      id: "time_3",
      title: "Three Day Challenge",
      description: "Complete 3 days smoke-free",
      target: 3,
      current: Math.min(daysSinceQuit, 3),
      category: "time",
      completed: daysSinceQuit >= 3,
    },
    {
      id: "time_4",
      title: "One Week Milestone",
      description: "Complete one full week without smoking",
      target: 7,
      current: Math.min(daysSinceQuit, 7),
      category: "time",
      completed: daysSinceQuit >= 7,
    },
    {
      id: "time_5",
      title: "Two Week Achievement",
      description: "Complete two weeks smoke-free",
      target: 14,
      current: Math.min(daysSinceQuit, 14),
      category: "time",
      completed: daysSinceQuit >= 14,
    },
    {
      id: "time_6",
      title: "One Month Milestone",
      description: "Complete one month without smoking",
      target: 30,
      current: Math.min(daysSinceQuit, 30),
      category: "time",
      completed: daysSinceQuit >= 30,
    },
    {
      id: "time_7",
      title: "100 Days Achievement",
      description: "Complete 100 days smoke-free",
      target: 100,
      current: Math.min(daysSinceQuit, 100),
      category: "time",
      completed: daysSinceQuit >= 100,
    },
    {
      id: "time_8",
      title: "Six Month Milestone",
      description: "Complete six months without smoking",
      target: 180,
      current: Math.min(daysSinceQuit, 180),
      category: "time",
      completed: daysSinceQuit >= 180,
    },
    {
      id: "time_9",
      title: "One Year Achievement",
      description: "Complete one full year smoke-free",
      target: 365,
      current: Math.min(daysSinceQuit, 365),
      category: "time",
      completed: daysSinceQuit >= 365,
    },
    {
      id: "time_10",
      title: "Five Year Milestone",
      description: "Complete five years without smoking",
      target: 1825,
      current: Math.min(daysSinceQuit, 1825),
      category: "time",
      completed: daysSinceQuit >= 1825,
    },

    // Nicotine Goals - 10 goals
    {
      id: "nicotine_1",
      title: "First Craving Overcome",
      description: "Overcome your first major craving",
      target: 0.125,
      current: Math.min(daysSinceQuit, 0.125),
      category: "nicotine",
      completed: daysSinceQuit >= 0.125,
    },
    {
      id: "nicotine_2",
      title: "Nicotine Leaving Body",
      description: "After 3 days: Most nicotine has left your body",
      target: 3,
      current: Math.min(daysSinceQuit, 3),
      category: "nicotine",
      completed: daysSinceQuit >= 3,
    },
    {
      id: "nicotine_3",
      title: "Nicotine Withdrawal Peak",
      description: "After 1 week: Survive the peak of withdrawal",
      target: 7,
      current: Math.min(daysSinceQuit, 7),
      category: "nicotine",
      completed: daysSinceQuit >= 7,
    },
    {
      id: "nicotine_4",
      title: "Craving Frequency Reduced",
      description: "After 2 weeks: Experience fewer cravings",
      target: 14,
      current: Math.min(daysSinceQuit, 14),
      category: "nicotine",
      completed: daysSinceQuit >= 14,
    },
    {
      id: "nicotine_5",
      title: "Craving Intensity Decreased",
      description: "After 1 month: Cravings become less intense",
      target: 30,
      current: Math.min(daysSinceQuit, 30),
      category: "nicotine",
      completed: daysSinceQuit >= 30,
    },
    {
      id: "nicotine_6",
      title: "Nicotine Receptors Reduced",
      description: "After 2 months: Nicotine receptors decrease",
      target: 60,
      current: Math.min(daysSinceQuit, 60),
      category: "nicotine",
      completed: daysSinceQuit >= 60,
    },
    {
      id: "nicotine_7",
      title: "Dopamine Level Stabilization",
      description: "After 3 months: Dopamine levels stabilize",
      target: 90,
      current: Math.min(daysSinceQuit, 90),
      category: "nicotine",
      completed: daysSinceQuit >= 90,
    },
    {
      id: "nicotine_8",
      title: "Craving-Free Days",
      description: "After 6 months: Experience days without cravings",
      target: 180,
      current: Math.min(daysSinceQuit, 180),
      category: "nicotine",
      completed: daysSinceQuit >= 180,
    },
    {
      id: "nicotine_9",
      title: "Psychological Dependence Gone",
      description: "After 9 months: Psychological dependence fades",
      target: 270,
      current: Math.min(daysSinceQuit, 270),
      category: "nicotine",
      completed: daysSinceQuit >= 270,
    },
    {
      id: "nicotine_10",
      title: "Complete Nicotine Freedom",
      description: "After 1 year: Complete freedom from nicotine",
      target: 365,
      current: Math.min(daysSinceQuit, 365),
      category: "nicotine",
      completed: daysSinceQuit >= 365,
    },

    // Trophies Goals - 10 goals
    {
      id: "trophies_1",
      title: "First Day Trophy",
      description: "Earn your first day trophy",
      target: 1,
      current: Math.min(daysSinceQuit, 1),
      category: "trophies",
      completed: daysSinceQuit >= 1,
    },
    {
      id: "trophies_2",
      title: "First Week Trophy",
      description: "Earn the week warrior trophy",
      target: 7,
      current: Math.min(daysSinceQuit, 7),
      category: "trophies",
      completed: daysSinceQuit >= 7,
    },
    {
      id: "trophies_3",
      title: "Two Week Trophy",
      description: "Earn the two-week milestone trophy",
      target: 14,
      current: Math.min(daysSinceQuit, 14),
      category: "trophies",
      completed: daysSinceQuit >= 14,
    },
    {
      id: "trophies_4",
      title: "One Month Trophy",
      description: "Earn the one month achievement trophy",
      target: 30,
      current: Math.min(daysSinceQuit, 30),
      category: "trophies",
      completed: daysSinceQuit >= 30,
    },
    {
      id: "trophies_5",
      title: "100 Days Trophy",
      description: "Earn the 100 days milestone trophy",
      target: 100,
      current: Math.min(daysSinceQuit, 100),
      category: "trophies",
      completed: daysSinceQuit >= 100,
    },
    {
      id: "trophies_6",
      title: "Six Month Trophy",
      description: "Earn the six month achievement trophy",
      target: 180,
      current: Math.min(daysSinceQuit, 180),
      category: "trophies",
      completed: daysSinceQuit >= 180,
    },
    {
      id: "trophies_7",
      title: "One Year Trophy",
      description: "Earn the one year milestone trophy",
      target: 365,
      current: Math.min(daysSinceQuit, 365),
      category: "trophies",
      completed: daysSinceQuit >= 365,
    },
    {
      id: "trophies_8",
      title: "1000 Cigarettes Trophy",
      description: "Earn the 1000 cigarettes avoided trophy",
      target: 1000,
      current: Math.min(cigarettesNotSmoked, 1000),
      category: "trophies",
      completed: cigarettesNotSmoked >= 1000,
    },
    {
      id: "trophies_9",
      title: "Health Champion Trophy",
      description: "Complete all health goals for 1 year",
      target: 365,
      current: Math.min(daysSinceQuit, 365),
      category: "trophies",
      completed: daysSinceQuit >= 365,
    },
    {
      id: "trophies_10",
      title: "Ultimate Freedom Trophy",
      description: "Complete 5 years smoke-free",
      target: 1825,
      current: Math.min(daysSinceQuit, 1825),
      category: "trophies",
      completed: daysSinceQuit >= 1825,
    },
  ]

  // Merge default goals with user goals
  const allGoals = [...defaultGoals, ...(userData.goals || [])]

  const addCustomGoal = async () => {
    if (!newGoal.title.trim() || !newGoal.target) return

    try {
      const customGoal: Goal = {
        id: `custom_${Date.now()}`,
        title: newGoal.title.trim(),
        description: newGoal.description.trim(),
        target: Number.parseInt(newGoal.target),
        current: 0,
        category: newGoal.category,
        completed: false,
      }

      const updatedGoals = [...(userData.goals || []), customGoal]
      await updateUserData({ goals: updatedGoals })

      setNewGoal({ title: "", description: "", target: "", category: "health" })
      setShowAddGoal(false)
    } catch (error) {
      console.error("Error adding custom goal:", error)
    }
  }

  const getNextGoal = () => {
    const incompleteGoals = allGoals.filter((goal) => !goal.completed)
    if (incompleteGoals.length === 0) return null

    return incompleteGoals.reduce((closest, goal) => {
      const goalProgress = (goal.current / goal.target) * 100
      const closestProgress = (closest.current / closest.target) * 100
      return goalProgress > closestProgress ? goal : closest
    })
  }

  const getGoalsByCategory = (categoryId: string) => {
    return allGoals.filter((goal) => goal.category === categoryId)
  }

  const getCategoryProgress = (categoryId: string) => {
    const categoryGoals = getGoalsByCategory(categoryId)
    if (categoryGoals.length === 0) return 0
    const completedGoals = categoryGoals.filter((goal) => goal.completed).length
    return (completedGoals / categoryGoals.length) * 100
  }

  const nextGoal = getNextGoal()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Goals</h1>
      </div>

      {/* Next Goal Section */}
      {nextGoal && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-800">Next goal</h3>
            </div>
            <p className="text-gray-700 mb-3">{nextGoal.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {nextGoal.target}:</span>
                <span className="font-semibold">
                  {nextGoal.current}/{nextGoal.target}
                </span>
              </div>
              <Progress value={(nextGoal.current / nextGoal.target) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goal Categories Grid */}
      <div className="grid grid-cols-3 gap-3">
        {goalCategories.map((category) => {
          const categoryGoals = getGoalsByCategory(category.id)
          const completedCount = categoryGoals.filter((goal) => goal.completed).length
          const progress = getCategoryProgress(category.id)

          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all hover:shadow-md ${category.bgColor} ${category.borderColor} ${
                selectedCategory === category.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`${category.color} mb-2 flex justify-center`}>{category.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                <div className="text-xs text-gray-600">
                  {completedCount}/{categoryGoals.length}
                </div>
                {progress > 0 && (
                  <div className="mt-2">
                    <Progress value={progress} className="h-1" />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Selected Category Goals */}
      {selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {goalCategories.find((cat) => cat.id === selectedCategory)?.icon}
              {goalCategories.find((cat) => cat.id === selectedCategory)?.name} Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getGoalsByCategory(selectedCategory).map((goal) => (
                <div
                  key={goal.id}
                  className={`p-3 rounded-lg border ${
                    goal.completed ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${goal.completed ? "text-green-700" : "text-gray-800"}`}>
                        {goal.title}
                      </h4>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    </div>
                    {goal.completed && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progress:</span>
                      <span className="font-semibold">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                    <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Set Personal Goal */}
      <Card className="border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Set a Personal Goal</h3>
                <p className="text-sm text-gray-600">Create custom goals to stay motivated on your journey</p>
              </div>
            </div>
            <Button onClick={() => setShowAddGoal(!showAddGoal)} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {showAddGoal && (
            <div className="mt-4 space-y-3 border-t pt-4">
              <Input
                placeholder="Goal title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              />
              <Textarea
                placeholder="Goal description"
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                rows={2}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Target (days)"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                />
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  className="px-3 py-2 border rounded-md"
                >
                  {goalCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={addCustomGoal} size="sm" className="flex-1">
                  Add Goal
                </Button>
                <Button onClick={() => setShowAddGoal(false)} variant="outline" size="sm" className="flex-1">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Your Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Your Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* First Day Achievement */}
            {daysSinceQuit >= 1 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="p-2 bg-green-100 rounded-full">
                  <Medal className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-green-700">First Day Complete</h4>
                  <p className="text-sm text-green-600">You've completed your first day without smoking!</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Day 1
                </Badge>
              </div>
            )}

            {/* Week Warrior Achievement */}
            {daysSinceQuit >= 7 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-700">Week Warrior</h4>
                  <p className="text-sm text-blue-600">Amazing! You've completed one full week smoke-free!</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Week 1
                </Badge>
              </div>
            )}

            {/* Month Master Achievement */}
            {daysSinceQuit >= 30 && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-700">Month Master</h4>
                  <p className="text-sm text-purple-600">Incredible! You've reached the one month milestone!</p>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  Month 1
                </Badge>
              </div>
            )}

            {daysSinceQuit === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Complete your first day to unlock achievements!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
