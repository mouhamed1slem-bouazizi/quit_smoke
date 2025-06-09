"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Heart, TreesIcon as Lungs, Brain, Shield } from "lucide-react"

interface HealthTimelineProps {
  daysSinceQuit: number
}

export default function HealthTimeline({ daysSinceQuit }: HealthTimelineProps) {
  const healthMilestones = [
    {
      time: "20 minutes",
      days: 0.014,
      title: "Heart Rate Normalizes",
      description: "Heart rate and blood pressure drop",
      icon: <Heart className="w-4 h-4" />,
      color: "text-red-500",
    },
    {
      time: "12 hours",
      days: 0.5,
      title: "Carbon Monoxide Clears",
      description: "CO levels in blood return to normal",
      icon: <Lungs className="w-4 h-4" />,
      color: "text-blue-500",
    },
    {
      time: "24 hours",
      days: 1,
      title: "Heart Attack Risk Drops",
      description: "Risk of heart attack begins to decrease",
      icon: <Heart className="w-4 h-4" />,
      color: "text-red-500",
    },
    {
      time: "48 hours",
      days: 2,
      title: "Taste & Smell Return",
      description: "Nerve endings start to regrow",
      icon: <Brain className="w-4 h-4" />,
      color: "text-purple-500",
    },
    {
      time: "72 hours",
      days: 3,
      title: "Breathing Improves",
      description: "Bronchial tubes relax, lung capacity increases",
      icon: <Lungs className="w-4 h-4" />,
      color: "text-blue-500",
    },
    {
      time: "2 weeks",
      days: 14,
      title: "Circulation Improves",
      description: "Blood flow increases throughout body",
      icon: <Heart className="w-4 h-4" />,
      color: "text-red-500",
    },
    {
      time: "1 month",
      days: 30,
      title: "Lung Function Increases",
      description: "Coughing and shortness of breath decrease",
      icon: <Lungs className="w-4 h-4" />,
      color: "text-blue-500",
    },
    {
      time: "3 months",
      days: 90,
      title: "Major Lung Improvement",
      description: "Lung capacity increases up to 30%",
      icon: <Lungs className="w-4 h-4" />,
      color: "text-blue-500",
    },
    {
      time: "1 year",
      days: 365,
      title: "Heart Disease Risk Halved",
      description: "Risk of coronary heart disease is 50% less",
      icon: <Shield className="w-4 h-4" />,
      color: "text-green-500",
    },
    {
      time: "5 years",
      days: 1825,
      title: "Stroke Risk Normalized",
      description: "Stroke risk same as non-smoker",
      icon: <Brain className="w-4 h-4" />,
      color: "text-purple-500",
    },
    {
      time: "10 years",
      days: 3650,
      title: "Lung Cancer Risk Halved",
      description: "Risk of lung cancer drops by 50%",
      icon: <Shield className="w-4 h-4" />,
      color: "text-green-500",
    },
    {
      time: "15 years",
      days: 5475,
      title: "Complete Recovery",
      description: "Risk of heart disease same as non-smoker",
      icon: <Heart className="w-4 h-4" />,
      color: "text-red-500",
    },
  ]

  const completedMilestones = healthMilestones.filter((milestone) => daysSinceQuit >= milestone.days)
  const nextMilestone = healthMilestones.find((milestone) => daysSinceQuit < milestone.days)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Your Health Recovery Timeline
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {completedMilestones.length}/{healthMilestones.length} milestones reached
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Next Milestone Preview */}
          {nextMilestone && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-800">Next: {nextMilestone.title}</h3>
                  <p className="text-sm text-blue-600">{nextMilestone.description}</p>
                  <p className="text-xs text-blue-500 mt-1">
                    In {Math.ceil(nextMilestone.days - daysSinceQuit)} days ({nextMilestone.time})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {healthMilestones.map((milestone, index) => {
              const isCompleted = daysSinceQuit >= milestone.days
              const isNext = nextMilestone?.days === milestone.days

              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isCompleted
                      ? "bg-green-50 border border-green-200"
                      : isNext
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className={`${milestone.color}`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : milestone.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-semibold ${
                          isCompleted ? "text-green-700" : isNext ? "text-blue-700" : "text-gray-600"
                        }`}
                      >
                        {milestone.title}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {milestone.time}
                      </Badge>
                    </div>
                    <p
                      className={`text-sm ${
                        isCompleted ? "text-green-600" : isNext ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      {milestone.description}
                    </p>
                    {isCompleted && (
                      <p className="text-xs text-green-500 mt-1">✓ Achieved on day {Math.floor(milestone.days)}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="text-center p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-green-600">{completedMilestones.length}</span> health milestones
              achieved in <span className="font-semibold text-blue-600">{daysSinceQuit}</span> days!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
