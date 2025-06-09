"use client"

import { useNotifications } from "@/contexts/notification-context"
import { useAuth } from "@/contexts/auth-context"

export function useNotificationHelpers() {
  const { addNotification } = useNotifications()
  const { userData } = useAuth()

  const notifyAchievement = (title: string, description: string, achievementId?: string) => {
    addNotification({
      title,
      message: description,
      type: "achievement",
      data: { achievementId },
    })
  }

  const notifyMilestone = (title: string, description: string, milestoneType?: string) => {
    addNotification({
      title,
      message: description,
      type: "milestone",
      data: { milestoneType },
    })
  }

  const notifyGoalCompleted = (title: string, description: string, goalId?: string) => {
    addNotification({
      title,
      message: description,
      type: "goal",
      data: { goalId },
    })
  }

  const notifyHealthUpdate = (title: string, description: string) => {
    addNotification({
      title,
      message: description,
      type: "health",
    })
  }

  const notifyReminder = (title: string, description: string) => {
    addNotification({
      title,
      message: description,
      type: "reminder",
    })
  }

  const notifySystem = (title: string, description: string) => {
    addNotification({
      title,
      message: description,
      type: "system",
    })
  }

  // Auto-generate milestone notifications based on days smoke-free
  const checkMilestones = (daysSinceQuit: number) => {
    const milestones = [
      { days: 1, title: "First Day Complete!", message: "You've made it through your first smoke-free day! 🎉" },
      { days: 3, title: "3 Days Strong!", message: "Your body is already starting to heal. Keep going! 💪" },
      {
        days: 7,
        title: "One Week Milestone!",
        message: "A full week without smoking! Your lungs are thanking you. 🫁",
      },
      {
        days: 14,
        title: "Two Weeks Achievement!",
        message: "Your circulation is improving and your sense of taste is returning! 👅",
      },
      {
        days: 30,
        title: "One Month Victory!",
        message: "30 days smoke-free! Your risk of heart attack is already decreasing. ❤️",
      },
      {
        days: 90,
        title: "Three Months Champion!",
        message: "Your lung function has improved by up to 30%! Amazing progress! 🏆",
      },
      {
        days: 180,
        title: "Six Months Hero!",
        message: "Half a year smoke-free! Your risk of stroke has significantly decreased. 🧠",
      },
      {
        days: 365,
        title: "One Year Legend!",
        message: "A full year without smoking! Your risk of heart disease is now half that of a smoker! 🎊",
      },
    ]

    const milestone = milestones.find((m) => m.days === daysSinceQuit)
    if (milestone) {
      notifyMilestone(milestone.title, milestone.message, `${milestone.days}_days`)
    }
  }

  return {
    notifyAchievement,
    notifyMilestone,
    notifyGoalCompleted,
    notifyHealthUpdate,
    notifyReminder,
    notifySystem,
    checkMilestones,
  }
}
