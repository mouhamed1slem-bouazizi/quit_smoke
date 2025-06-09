"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Heart,
  TreesIcon as Lungs,
  Brain,
  Shield,
  Clock,
  TrendingUp,
  RefreshCw,
  Eye,
  Activity,
  Smile,
  FlaskConical,
  Utensils,
} from "lucide-react"

interface HealthRecoveryProps {
  daysSinceQuit: number
}

interface RecoveryMilestone {
  day: number
  title: string
  description: string
  details: string
  completed: boolean
}

interface BodySystem {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  bgColor: string
  milestones: RecoveryMilestone[]
}

export default function HealthRecovery({ daysSinceQuit }: HealthRecoveryProps) {
  const [selectedSystem, setSelectedSystem] = useState("respiratory")
  const [systemImage, setSystemImage] = useState<string>("")
  const [isLoadingImage, setIsLoadingImage] = useState(false)

  const bodySystems: BodySystem[] = [
    {
      id: "respiratory",
      name: "Respiratory System",
      icon: <Lungs className="w-5 h-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      milestones: [
        {
          day: 0.5,
          title: "Carbon monoxide levels drop by half",
          description: "Oxygen levels begin to normalize",
          details:
            "Your blood oxygen levels start to improve as carbon monoxide from cigarette smoke begins to leave your system.",
          completed: daysSinceQuit >= 0.5,
        },
        {
          day: 1,
          title: "Carbon monoxide eliminated",
          description: "Blood oxygen returns to normal",
          details:
            "Your blood oxygen levels return to normal as carbon monoxide is fully eliminated. Oxygen can now properly reach your cells and tissues.",
          completed: daysSinceQuit >= 1,
        },
        {
          day: 3,
          title: "Bronchial tubes relax",
          description: "Breathing becomes easier",
          details:
            "The bronchial tubes that carry air to your lungs start to relax and widen, reducing resistance to airflow. You may notice less wheezing and shortness of breath.",
          completed: daysSinceQuit >= 3,
        },
        {
          day: 5,
          title: "Mucus production normalizes",
          description: "Lungs begin clearing tar and debris",
          details:
            "Excess mucus production starts to decrease. Your lungs begin the process of clearing accumulated tar and debris.",
          completed: daysSinceQuit >= 5,
        },
        {
          day: 14,
          title: "Lung function increases by 30%",
          description: "Physical activities become easier",
          details:
            "Your FEV1 (Forced Expiratory Volume) improves significantly. Physical activities become noticeably easier as your lungs can process more air with each breath.",
          completed: daysSinceQuit >= 14,
        },
        {
          day: 30,
          title: "Cilia regrow in lungs",
          description: "Improved ability to clean lungs",
          details:
            "Microscopic hair-like structures called cilia begin to regrow in your airways. These structures help trap and remove contaminants, reducing your risk of infection.",
          completed: daysSinceQuit >= 30,
        },
        {
          day: 60,
          title: "Respiratory symptoms improve",
          description: "Less coughing and wheezing",
          details:
            "Your respiratory symptoms continue to improve. Many people report significantly less coughing, wheezing, and sinus congestion at this stage.",
          completed: daysSinceQuit >= 60,
        },
        {
          day: 90,
          title: "Lung capacity significantly improves",
          description: "Cilia function fully restored",
          details:
            "Your lungs can now take in more air with each breath. The cilia in your airways are now functioning normally, efficiently cleaning your lungs.",
          completed: daysSinceQuit >= 90,
        },
        {
          day: 180,
          title: "Reduced phlegm production",
          description: "Improved overall respiratory function",
          details:
            "Your lungs continue to clear themselves of tar and other toxins. Phlegm production decreases substantially, and your respiratory system functions more efficiently.",
          completed: daysSinceQuit >= 180,
        },
        {
          day: 270,
          title: "Lung function increases further",
          description: "Additional 10% improvement",
          details:
            "Your lung function continues to improve beyond the initial recovery. Breathing becomes even easier during physical activities.",
          completed: daysSinceQuit >= 270,
        },
        {
          day: 365,
          title: "Infection risk reduced by 50%",
          description: "Stronger respiratory defenses",
          details:
            "Your immune system and respiratory defenses are significantly stronger. You're now half as likely to get bronchitis, pneumonia, and other respiratory infections compared to when you smoked.",
          completed: daysSinceQuit >= 365,
        },
        {
          day: 1825,
          title: "Lung cancer risk drops by 50%",
          description: "Dramatic risk reduction",
          details:
            "After 5 years, your risk of developing lung cancer has decreased dramatically. The lungs have cleared much of the precancerous cells and repaired significant damage.",
          completed: daysSinceQuit >= 1825,
        },
      ],
    },
    {
      id: "cardiovascular",
      name: "Cardiovascular System",
      icon: <Heart className="w-5 h-5" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
      milestones: [
        {
          day: 0.014,
          title: "Heart rate normalizes",
          description: "Blood pressure drops",
          details:
            "Within 20 minutes, your heart rate and blood pressure drop to more normal levels, reducing strain on your cardiovascular system.",
          completed: daysSinceQuit >= 0.014,
        },
        {
          day: 1,
          title: "Heart attack risk begins to drop",
          description: "Cardiovascular stress reduces",
          details:
            "After 24 hours, your risk of heart attack begins to decrease as your heart doesn't have to work as hard to pump blood through your body.",
          completed: daysSinceQuit >= 1,
        },
        {
          day: 14,
          title: "Circulation improves",
          description: "Blood flow increases",
          details:
            "Blood circulation improves throughout your body. Walking and physical activities become easier as oxygen-rich blood reaches your muscles more efficiently.",
          completed: daysSinceQuit >= 14,
        },
        {
          day: 30,
          title: "Blood pressure stabilizes",
          description: "Cardiovascular function improves",
          details:
            "Your blood pressure continues to improve and stabilize. The risk of blood clots decreases significantly.",
          completed: daysSinceQuit >= 30,
        },
        {
          day: 90,
          title: "Arterial function improves",
          description: "Blood vessel flexibility increases",
          details:
            "Your arteries become more flexible and responsive. Blood flow to extremities improves, reducing numbness and tingling.",
          completed: daysSinceQuit >= 90,
        },
        {
          day: 365,
          title: "Heart disease risk halved",
          description: "Major cardiovascular improvement",
          details:
            "After one year, your risk of coronary heart disease is about half that of a smoker's. Your heart is significantly healthier.",
          completed: daysSinceQuit >= 365,
        },
        {
          day: 1825,
          title: "Stroke risk normalized",
          description: "Risk same as non-smoker",
          details:
            "After 5 years, your risk of stroke has decreased to that of a non-smoker. Your cardiovascular system has largely recovered.",
          completed: daysSinceQuit >= 1825,
        },
        {
          day: 5475,
          title: "Complete cardiovascular recovery",
          description: "Heart disease risk like non-smoker",
          details:
            "After 15 years, your risk of heart disease is the same as someone who never smoked. Your cardiovascular system has fully recovered.",
          completed: daysSinceQuit >= 5475,
        },
      ],
    },
    {
      id: "nervous",
      name: "Nervous System",
      icon: <Brain className="w-5 h-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      milestones: [
        {
          day: 2,
          title: "Taste and smell improve",
          description: "Nerve endings begin to regrow",
          details:
            "Damaged nerve endings in your nose and mouth start to regrow, improving your ability to taste and smell.",
          completed: daysSinceQuit >= 2,
        },
        {
          day: 7,
          title: "Nicotine withdrawal peaks",
          description: "Brain chemistry adjusting",
          details:
            "Your brain is adjusting to functioning without nicotine. While withdrawal symptoms peak, your brain is beginning to heal.",
          completed: daysSinceQuit >= 7,
        },
        {
          day: 14,
          title: "Mental clarity improves",
          description: "Cognitive function enhances",
          details:
            "Many people report improved concentration and mental clarity as brain fog from smoking begins to lift.",
          completed: daysSinceQuit >= 14,
        },
        {
          day: 30,
          title: "Stress response normalizes",
          description: "Natural stress management returns",
          details:
            "Your brain's natural stress response mechanisms begin to function normally without relying on nicotine.",
          completed: daysSinceQuit >= 30,
        },
        {
          day: 90,
          title: "Dopamine levels stabilize",
          description: "Natural reward system recovers",
          details:
            "Your brain's dopamine receptors begin to return to normal levels, improving mood and motivation naturally.",
          completed: daysSinceQuit >= 90,
        },
        {
          day: 365,
          title: "Cognitive function fully restored",
          description: "Memory and focus improve",
          details:
            "Your cognitive abilities, including memory, attention, and processing speed, have significantly improved.",
          completed: daysSinceQuit >= 365,
        },
      ],
    },
    {
      id: "immune",
      name: "Immune System",
      icon: <Shield className="w-5 h-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
      milestones: [
        {
          day: 3,
          title: "White blood cell count improves",
          description: "Immune response strengthens",
          details:
            "Your white blood cell count begins to normalize, improving your body's ability to fight infections.",
          completed: daysSinceQuit >= 3,
        },
        {
          day: 14,
          title: "Wound healing improves",
          description: "Tissue repair accelerates",
          details:
            "Your body's ability to heal wounds and repair tissue improves as circulation and oxygen delivery increase.",
          completed: daysSinceQuit >= 14,
        },
        {
          day: 30,
          title: "Infection resistance increases",
          description: "Fewer colds and illnesses",
          details:
            "Your immune system is stronger, making you less susceptible to common colds, flu, and other infections.",
          completed: daysSinceQuit >= 30,
        },
        {
          day: 90,
          title: "Inflammatory markers decrease",
          description: "Chronic inflammation reduces",
          details:
            "Markers of chronic inflammation in your blood decrease significantly, reducing your risk of various diseases.",
          completed: daysSinceQuit >= 90,
        },
        {
          day: 365,
          title: "Cancer surveillance improves",
          description: "Immune system monitors better",
          details: "Your immune system's ability to detect and destroy abnormal cells improves, reducing cancer risk.",
          completed: daysSinceQuit >= 365,
        },
      ],
    },
    {
      id: "sensory",
      name: "Sensory System",
      icon: <Eye className="w-5 h-5" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      milestones: [
        {
          day: 2,
          title: "Taste buds regenerate",
          description: "Food tastes better",
          details:
            "Your taste buds begin to regenerate, making food taste more vibrant and flavorful than it has in years.",
          completed: daysSinceQuit >= 2,
        },
        {
          day: 3,
          title: "Smell sensitivity returns",
          description: "Olfactory function improves",
          details: "Your sense of smell begins to return as the chemicals from smoking clear from your nasal passages.",
          completed: daysSinceQuit >= 3,
        },
        {
          day: 14,
          title: "Vision clarity improves",
          description: "Eye health enhances",
          details: "Blood flow to your eyes improves, potentially enhancing vision clarity and reducing eye strain.",
          completed: daysSinceQuit >= 14,
        },
        {
          day: 30,
          title: "Hearing sensitivity increases",
          description: "Auditory function improves",
          details: "Improved circulation can enhance hearing sensitivity and reduce the risk of hearing loss.",
          completed: daysSinceQuit >= 30,
        },
        {
          day: 90,
          title: "Sensory integration improves",
          description: "All senses work better together",
          details:
            "Your brain's ability to process and integrate information from all your senses improves significantly.",
          completed: daysSinceQuit >= 90,
        },
      ],
    },
    {
      id: "psychological",
      name: "Psychological Health",
      icon: <Smile className="w-5 h-5" />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      milestones: [
        {
          day: 1,
          title: "Sense of accomplishment",
          description: "Pride in taking control",
          details:
            "You begin to experience a sense of pride and accomplishment for taking control of your health and making a positive change.",
          completed: daysSinceQuit >= 1,
        },
        {
          day: 7,
          title: "Anxiety levels decrease",
          description: "Mood begins to stabilize",
          details:
            "Despite common belief that smoking reduces anxiety, research shows that after the initial withdrawal period, anxiety levels actually decrease below what they were when smoking.",
          completed: daysSinceQuit >= 7,
        },
        {
          day: 14,
          title: "Stress response improves",
          description: "Better natural coping mechanisms",
          details:
            "Your body's natural stress management systems begin to function more effectively without the interference of nicotine.",
          completed: daysSinceQuit >= 14,
        },
        {
          day: 30,
          title: "Self-esteem increases",
          description: "Confidence in ability to change",
          details:
            "Successfully abstaining from smoking for a month significantly boosts self-efficacy and confidence in your ability to make positive life changes.",
          completed: daysSinceQuit >= 30,
        },
        {
          day: 90,
          title: "Depression risk decreases",
          description: "Mood regulation improves",
          details:
            "Studies show that former smokers experience significant decreases in depression after 3 months of abstinence, as brain chemistry normalizes.",
          completed: daysSinceQuit >= 90,
        },
        {
          day: 180,
          title: "Psychological dependence fades",
          description: "Freedom from mental cravings",
          details:
            "The psychological habit and dependence on cigarettes significantly diminishes, with many ex-smokers reporting feeling truly free from the mental addiction.",
          completed: daysSinceQuit >= 180,
        },
        {
          day: 365,
          title: "Quality of life improves",
          description: "Overall wellbeing enhanced",
          details:
            "Research shows that after one year, former smokers report significantly higher quality of life scores and overall psychological wellbeing.",
          completed: daysSinceQuit >= 365,
        },
      ],
    },
    {
      id: "hormonal",
      name: "Hormonal System",
      icon: <FlaskConical className="w-5 h-5" />,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      milestones: [
        {
          day: 3,
          title: "Adrenaline levels normalize",
          description: "Stress hormone balance improves",
          details:
            "Nicotine triggers adrenaline release, creating a 'fight or flight' response. After quitting, these levels begin to normalize, reducing feelings of anxiety and tension.",
          completed: daysSinceQuit >= 3,
        },
        {
          day: 14,
          title: "Insulin sensitivity improves",
          description: "Blood sugar regulation enhances",
          details:
            "Smoking reduces insulin sensitivity, making it harder for your body to regulate blood sugar. After two weeks, this begins to improve significantly.",
          completed: daysSinceQuit >= 14,
        },
        {
          day: 30,
          title: "Thyroid function improves",
          description: "Metabolism begins to normalize",
          details:
            "Smoking affects thyroid hormone levels. After a month without cigarettes, thyroid function begins to normalize, improving energy levels and metabolism.",
          completed: daysSinceQuit >= 30,
        },
        {
          day: 60,
          title: "Sex hormone balance improves",
          description: "Reproductive health enhances",
          details:
            "Smoking disrupts sex hormones like estrogen and testosterone. After two months, these begin to balance, improving fertility and sexual health.",
          completed: daysSinceQuit >= 60,
        },
        {
          day: 90,
          title: "Cortisol levels stabilize",
          description: "Stress response normalizes",
          details:
            "Chronic smoking elevates cortisol, the primary stress hormone. After three months, these levels typically return to normal, improving mood and reducing chronic stress.",
          completed: daysSinceQuit >= 90,
        },
        {
          day: 180,
          title: "Growth hormone production improves",
          description: "Cell repair and regeneration increases",
          details:
            "Smoking suppresses growth hormone, which is essential for tissue repair. After six months, production increases, enhancing overall healing and regeneration.",
          completed: daysSinceQuit >= 180,
        },
        {
          day: 365,
          title: "Complete hormonal rebalancing",
          description: "Endocrine system fully recovers",
          details:
            "After one year, most hormone systems have fully recovered from the effects of smoking, resulting in better energy, mood, metabolism, and reproductive health.",
          completed: daysSinceQuit >= 365,
        },
      ],
    },
    {
      id: "digestive",
      name: "Digestive System",
      icon: <Utensils className="w-5 h-5" />,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      milestones: [
        {
          day: 2,
          title: "Taste buds recover",
          description: "Food tastes better",
          details:
            "As taste buds recover, food begins to taste better and more flavorful, which can improve appetite and enjoyment of meals.",
          completed: daysSinceQuit >= 2,
        },
        {
          day: 7,
          title: "Oral health improves",
          description: "Gum inflammation reduces",
          details:
            "Smoking causes inflammation in the gums and mouth. After a week, this inflammation begins to subside, improving oral health and reducing risk of gum disease.",
          completed: daysSinceQuit >= 7,
        },
        {
          day: 14,
          title: "Stomach acid normalizes",
          description: "Reduced heartburn and reflux",
          details:
            "Smoking increases stomach acid production and relaxes the esophageal sphincter. After two weeks, many people experience less heartburn and acid reflux.",
          completed: daysSinceQuit >= 14,
        },
        {
          day: 30,
          title: "Gut motility improves",
          description: "Better digestive transit",
          details:
            "Smoking affects the muscles that move food through your digestive system. After a month, gut motility often improves, reducing constipation and bloating.",
          completed: daysSinceQuit >= 30,
        },
        {
          day: 90,
          title: "Gut microbiome rebalances",
          description: "Healthier intestinal bacteria",
          details:
            "Smoking disrupts the balance of beneficial bacteria in your gut. After three months, the microbiome begins to rebalance, improving digestion and immune function.",
          completed: daysSinceQuit >= 90,
        },
        {
          day: 180,
          title: "Reduced ulcer risk",
          description: "Stomach lining heals",
          details:
            "Smoking increases the risk of peptic ulcers and slows healing. After six months, the stomach lining is healthier and more resistant to damage.",
          completed: daysSinceQuit >= 180,
        },
        {
          day: 365,
          title: "Colon cancer risk begins to drop",
          description: "Digestive cancer risk reduces",
          details:
            "After one year, your risk of colorectal cancer begins to decrease as the digestive tract heals from exposure to carcinogens in cigarette smoke.",
          completed: daysSinceQuit >= 365,
        },
      ],
    },
  ]

  const currentSystem = bodySystems.find((system) => system.id === selectedSystem) || bodySystems[0]
  const completedMilestones = currentSystem.milestones.filter((m) => m.completed).length
  const nextMilestone = currentSystem.milestones.find((m) => !m.completed)
  const progressPercentage = (completedMilestones / currentSystem.milestones.length) * 100

  useEffect(() => {
    generateSystemVisualization()
  }, [selectedSystem, daysSinceQuit])

  const generateSystemVisualization = async () => {
    setIsLoadingImage(true)
    try {
      let prompt = ""
      const systemName = currentSystem.name.toLowerCase()

      // More specific prompts for each system
      switch (currentSystem.id) {
        case "respiratory":
          if (daysSinceQuit < 1) {
            prompt = `Medical cross-section illustration of human lungs and bronchial tubes beginning to heal, showing initial clearing of smoke damage, clean medical diagram style`
          } else if (daysSinceQuit < 30) {
            prompt = `Medical illustration of healthy human lungs with clear airways after ${daysSinceQuit} days smoke-free, showing improved bronchial tubes and reduced inflammation, bright pink healthy lung tissue`
          } else if (daysSinceQuit < 365) {
            prompt = `Medical diagram of fully functioning human respiratory system after ${daysSinceQuit} days without smoking, showing clear healthy lungs with optimal airflow, vibrant pink lung tissue, clean medical illustration`
          } else {
            prompt = `Medical illustration of completely recovered human lungs after ${daysSinceQuit} days smoke-free, showing pristine respiratory system with perfect lung capacity, bright healthy pink lungs, professional medical diagram`
          }
          break

        case "cardiovascular":
          if (daysSinceQuit < 1) {
            prompt = `Medical illustration of human heart and blood vessels beginning to heal after quitting smoking, showing improved blood flow, anatomical heart diagram with red blood vessels`
          } else if (daysSinceQuit < 30) {
            prompt = `Medical diagram of healthy human cardiovascular system after ${daysSinceQuit} days smoke-free, showing strong heart with improved circulation, bright red heart and clear blood vessels`
          } else if (daysSinceQuit < 365) {
            prompt = `Medical illustration of robust human heart and circulatory system after ${daysSinceQuit} days without smoking, showing optimal cardiac function, vibrant red heart with healthy arteries`
          } else {
            prompt = `Medical diagram of completely recovered human cardiovascular system after ${daysSinceQuit} days smoke-free, showing perfect heart health and circulation, bright red healthy heart, professional medical illustration`
          }
          break

        case "nervous":
          if (daysSinceQuit < 1) {
            prompt = `Medical illustration of human brain and nervous system beginning to recover from smoking, showing neural pathways starting to heal, anatomical brain diagram with neural networks`
          } else if (daysSinceQuit < 30) {
            prompt = `Medical diagram of human brain after ${daysSinceQuit} days smoke-free, showing improved neural connections and cognitive function, bright brain tissue with healthy neural pathways`
          } else if (daysSinceQuit < 365) {
            prompt = `Medical illustration of healthy human brain and nervous system after ${daysSinceQuit} days without smoking, showing optimal neural function, vibrant brain tissue with clear neural networks`
          } else {
            prompt = `Medical diagram of fully recovered human brain after ${daysSinceQuit} days smoke-free, showing perfect cognitive function and neural health, bright healthy brain tissue, professional medical illustration`
          }
          break

        case "immune":
          if (daysSinceQuit < 1) {
            prompt = `Medical illustration of human immune system beginning to strengthen after quitting smoking, showing white blood cells and lymph nodes starting to recover, anatomical immune system diagram`
          } else if (daysSinceQuit < 30) {
            prompt = `Medical diagram of strengthening human immune system after ${daysSinceQuit} days smoke-free, showing active white blood cells and healthy lymph nodes, bright immune cells and organs`
          } else if (daysSinceQuit < 365) {
            prompt = `Medical illustration of robust human immune system after ${daysSinceQuit} days without smoking, showing optimal immune function, vibrant immune cells and healthy lymphatic system`
          } else {
            prompt = `Medical diagram of fully recovered human immune system after ${daysSinceQuit} days smoke-free, showing perfect immune defense, bright healthy immune cells and organs, professional medical illustration`
          }
          break

        case "sensory":
          if (daysSinceQuit < 1) {
            prompt = `Medical illustration of human sensory organs (eyes, nose, tongue, ears) beginning to recover after quitting smoking, showing initial healing of taste buds and olfactory receptors`
          } else if (daysSinceQuit < 30) {
            prompt = `Medical diagram of human sensory system after ${daysSinceQuit} days smoke-free, showing improved taste buds, smell receptors, and sensory function, bright healthy sensory organs`
          } else if (daysSinceQuit < 365) {
            prompt = `Medical illustration of fully functioning human sensory system after ${daysSinceQuit} days without smoking, showing optimal taste, smell, and sensory perception, vibrant healthy sensory organs`
          } else {
            prompt = `Medical diagram of completely recovered human sensory organs after ${daysSinceQuit} days smoke-free, showing perfect sensory function, bright healthy eyes, nose, tongue, and ears, professional medical illustration`
          }
          break

        case "psychological":
          if (daysSinceQuit < 1) {
            prompt = `Medical illustration of human brain with focus on emotional centers beginning to recover after quitting smoking, showing mood and psychological health improvements, clean medical diagram style`
          } else if (daysSinceQuit < 30) {
            prompt = `Medical diagram of human brain after ${daysSinceQuit} days smoke-free, highlighting improved mood centers and reduced anxiety pathways, bright healthy emotional centers`
          } else if (daysSinceQuit < 365) {
            prompt = `Medical illustration of human brain showing psychological health improvements after ${daysSinceQuit} days without smoking, with focus on serotonin and dopamine pathways, vibrant healthy brain regions`
          } else {
            prompt = `Medical diagram of fully recovered human brain psychology after ${daysSinceQuit} days smoke-free, showing optimal emotional balance and mental wellbeing, bright healthy brain emotional centers, professional medical illustration`
          }
          break

        case "hormonal":
          if (daysSinceQuit < 1) {
            prompt = `Medical illustration of human endocrine system beginning to recover after quitting smoking, showing glands and hormone production starting to normalize, clean medical diagram style`
          } else if (daysSinceQuit < 30) {
            prompt = `Medical diagram of human hormonal system after ${daysSinceQuit} days smoke-free, showing improved adrenal, thyroid and reproductive hormone balance, bright healthy endocrine glands`
          } else if (daysSinceQuit < 365) {
            prompt = `Medical illustration of human endocrine system showing significant recovery after ${daysSinceQuit} days without smoking, with balanced hormone production and healthy glands, vibrant medical diagram`
          } else {
            prompt = `Medical diagram of fully recovered human hormonal system after ${daysSinceQuit} days smoke-free, showing optimal hormone balance and endocrine function, bright healthy glands, professional medical illustration`
          }
          break

        case "digestive":
          if (daysSinceQuit < 1) {
            prompt = `Medical illustration of human digestive system beginning to recover after quitting smoking, showing improved oral health and digestive tract healing, clean medical diagram style`
          } else if (daysSinceQuit < 30) {
            prompt = `Medical diagram of human digestive system after ${daysSinceQuit} days smoke-free, showing healthier stomach lining and intestinal function, bright healthy digestive organs`
          } else if (daysSinceQuit < 365) {
            prompt = `Medical illustration of human digestive tract showing significant recovery after ${daysSinceQuit} days without smoking, with healthy gut microbiome and reduced inflammation, vibrant medical diagram`
          } else {
            prompt = `Medical diagram of fully recovered human digestive system after ${daysSinceQuit} days smoke-free, showing optimal digestive function and healthy gastrointestinal tract, bright healthy organs, professional medical illustration`
          }
          break

        default:
          prompt = `Medical illustration of healthy human ${systemName} showing recovery after ${daysSinceQuit} days without smoking, clean medical diagram style`
      }

      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=300&model=flux&enhance=true`
      setSystemImage(imageUrl)
    } catch (error) {
      console.error("Error generating system visualization:", error)
    } finally {
      setIsLoadingImage(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Next Milestone */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Your Health Recovery
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nextMilestone ? (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Next milestone: {nextMilestone.title}</h3>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-blue-600">
                  in {Math.max(0, Math.ceil(nextMilestone.day - daysSinceQuit))} days
                </span>
              </div>
              <p className="text-sm text-gray-600">{nextMilestone.description}</p>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-2">🎉 All major milestones achieved!</h3>
              <p className="text-sm text-gray-600">Your body has made incredible progress in its recovery journey.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Body Systems Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Body Systems Recovery</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedSystem} onValueChange={setSelectedSystem}>
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="respiratory" className="text-xs">
                <Lungs className="w-4 h-4 mr-1" />
                Respiratory
              </TabsTrigger>
              <TabsTrigger value="cardiovascular" className="text-xs">
                <Heart className="w-4 h-4 mr-1" />
                Heart
              </TabsTrigger>
              <TabsTrigger value="nervous" className="text-xs">
                <Brain className="w-4 h-4 mr-1" />
                Brain
              </TabsTrigger>
              <TabsTrigger value="immune" className="text-xs">
                <Shield className="w-4 h-4 mr-1" />
                Immune
              </TabsTrigger>
            </TabsList>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="sensory" className="text-xs">
                <Eye className="w-4 h-4 mr-1" />
                Sensory
              </TabsTrigger>
              <TabsTrigger value="psychological" className="text-xs">
                <Smile className="w-4 h-4 mr-1" />
                Psychological
              </TabsTrigger>
              <TabsTrigger value="hormonal" className="text-xs">
                <FlaskConical className="w-4 h-4 mr-1" />
                Hormonal
              </TabsTrigger>
              <TabsTrigger value="digestive" className="text-xs">
                <Utensils className="w-4 h-4 mr-1" />
                Digestive
              </TabsTrigger>
            </TabsList>

            {bodySystems.map((system) => (
              <TabsContent key={system.id} value={system.id} className="space-y-4">
                {/* System Overview */}
                <div className={`p-4 rounded-lg ${system.bgColor}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={system.color}>{system.icon}</div>
                      <h3 className="font-semibold">{system.name}</h3>
                    </div>
                    <Badge variant="secondary">
                      {completedMilestones}/{system.milestones.length} milestones
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Healing Progress</span>
                      <span className="font-semibold">{progressPercentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                    {nextMilestone && <p className="text-sm text-gray-600 mt-2">{nextMilestone.details}</p>}
                  </div>
                </div>

                {/* Recovery Timeline */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Recovery Timeline
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {system.milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border transition-all ${
                          milestone.completed
                            ? "bg-green-50 border-green-200"
                            : milestone === nextMilestone
                              ? "bg-blue-50 border-blue-200"
                              : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <Badge variant={milestone.completed ? "default" : "outline"}>
                              Day {milestone.day < 1 ? `${Math.round(milestone.day * 24)}h` : Math.floor(milestone.day)}
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <h5
                              className={`font-semibold ${
                                milestone.completed
                                  ? "text-green-700"
                                  : milestone === nextMilestone
                                    ? "text-blue-700"
                                    : "text-gray-600"
                              }`}
                            >
                              {milestone.title}
                            </h5>
                            <p
                              className={`text-sm ${
                                milestone.completed
                                  ? "text-green-600"
                                  : milestone === nextMilestone
                                    ? "text-blue-600"
                                    : "text-gray-500"
                              }`}
                            >
                              {milestone.description}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">{milestone.details}</p>
                          </div>
                          {milestone.completed && (
                            <div className="text-green-600">
                              <TrendingUp className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Body Healing Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className={currentSystem.color}>{currentSystem.icon}</div>
            Body Healing Visualization
          </CardTitle>
          <p className="text-sm text-gray-600">
            Visualization of your <span className="font-semibold">{currentSystem.name.toLowerCase()}</span> after{" "}
            <span className="font-semibold text-blue-600">{daysSinceQuit}</span> days without smoking
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoadingImage ? (
              <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Generating {currentSystem.name.toLowerCase()} visualization...
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={systemImage || "/placeholder.svg"}
                  alt={`${currentSystem.name} recovery visualization`}
                  className="w-full h-48 object-cover rounded-lg"
                  crossOrigin="anonymous"
                />
                <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs">
                  Day {daysSinceQuit}
                </div>
                <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium">
                  {currentSystem.name}
                </div>
              </div>
            )}

            <Button
              onClick={generateSystemVisualization}
              variant="outline"
              size="sm"
              className="w-full"
              disabled={isLoadingImage}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New {currentSystem.name} Visualization
            </Button>

            <div className={`text-center p-3 rounded-lg ${currentSystem.bgColor}`}>
              <p className="text-sm text-gray-700">
                Your <span className={`font-semibold ${currentSystem.color}`}>{currentSystem.name.toLowerCase()}</span>{" "}
                has completed <span className="font-semibold text-blue-600">{completedMilestones}</span> out of{" "}
                <span className="font-semibold">{currentSystem.milestones.length}</span> major healing milestones!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
