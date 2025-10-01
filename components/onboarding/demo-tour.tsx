"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  ArrowRight,
  ArrowLeft,
  X,
  Network,
  BarChart3,
  GitBranch,
  Zap,
  Users,
  TrendingUp,
  CheckCircle,
  Eye,
  MousePointer,
  Keyboard,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface TourStep {
  id: string
  title: string
  description: string
  page: string
  target?: string
  position?: "top" | "bottom" | "left" | "right"
  action?: string
  icon: React.ComponentType<any>
  highlight?: string[]
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Ellie Admin",
    description:
      "Let's take a 60-second tour of your networking command center. We'll show you the Graph, Pipeline, and Heatboard with real demo data.",
    page: "/dashboard",
    icon: Play,
  },
  {
    id: "graph-overview",
    title: "Network Graph",
    description:
      "Your network visualized. Each node represents a person or startup, with connections showing relationship strength. Notice the different colors for VIP members and federated connections.",
    page: "/graph",
    target: ".react-flow",
    position: "top",
    icon: Network,
    highlight: ["person-node", "startup-node", "federated-node"],
  },
  {
    id: "graph-federation",
    title: "Federation Toggle",
    description:
      "Toggle federated connections on/off to see cross-network relationships. The blue nodes represent people from partner networks.",
    page: "/graph",
    target: "[data-tour='federation-panel']",
    position: "right",
    action: "Click the federation toggle",
    icon: Network,
  },
  {
    id: "graph-interactions",
    title: "Node Interactions",
    description:
      "Click any node to open the People drawer with detailed info, or right-click for quick actions like invite, nudge, or email.",
    page: "/graph",
    target: ".react-flow__node",
    position: "top",
    action: "Try clicking a node",
    icon: MousePointer,
  },
  {
    id: "graph-shortcuts",
    title: "Keyboard Shortcuts",
    description:
      "Power users love keyboards! Use H to hide, P to pin, I to invite, E to email, and more. Press Cmd+K for global search.",
    page: "/graph",
    target: "[data-tour='shortcuts-panel']",
    position: "right",
    icon: Keyboard,
  },
  {
    id: "pipeline-overview",
    title: "Introduction Pipeline",
    description:
      "Manage double-opt-in introductions with minimal friction. Drag cards between columns to update status. Notice the priority scores and routing decisions.",
    page: "/dashboard/pipeline",
    target: ".grid.grid-cols-1.lg\\:grid-cols-5",
    position: "top",
    icon: GitBranch,
  },
  {
    id: "pipeline-priority",
    title: "Priority Scoring",
    description:
      "Each introduction gets a priority score based on member tiers, fit, and fatigue. High-priority intros go direct, low-priority go to digest.",
    page: "/dashboard/pipeline",
    target: "[data-tour='priority-insights']",
    position: "bottom",
    icon: Zap,
  },
  {
    id: "pipeline-actions",
    title: "Quick Actions",
    description:
      "Use the dropdown menus for quick actions like 'Ping for Consent' or 'Propose Times'. The system tracks all engagement automatically.",
    page: "/dashboard/pipeline",
    target: ".kanban-card",
    position: "left",
    action: "Try the dropdown menu",
    icon: Users,
  },
  {
    id: "heatboard-overview",
    title: "Heatboard Analytics",
    description:
      "Real-time activity and momentum across your network. See who's hot, which startups are trending, and track engagement patterns.",
    page: "/dashboard/heatboard",
    target: ".heatboard-container",
    position: "top",
    icon: BarChart3,
  },
  {
    id: "heatboard-people",
    title: "People Heat",
    description:
      "Top 20 most active members by weighted connections and recent activity. The trend arrows show 14-day momentum changes.",
    page: "/dashboard/heatboard",
    target: "[data-tour='people-heat']",
    position: "right",
    icon: TrendingUp,
  },
  {
    id: "heatboard-startups",
    title: "Startup Heat",
    description:
      "Companies ranked by member interest and scout quality ratings. This helps you identify the hottest opportunities in your network.",
    page: "/dashboard/heatboard",
    target: "[data-tour='startup-heat']",
    position: "left",
    icon: TrendingUp,
  },
  {
    id: "global-search",
    title: "Global Search",
    description:
      "Press Cmd+K anywhere to search across people, companies, and events. Use shortcuts like Cmd+Shift+G for Graph or Cmd+Shift+P for Pipeline.",
    page: "/dashboard/heatboard",
    target: "header",
    position: "bottom",
    action: "Try pressing Cmd+K",
    icon: Eye,
  },
  {
    id: "complete",
    title: "You're Ready!",
    description:
      "That's it! You now know the core workflows. Explore the demo data, try the features, and see how Ellie Admin can transform your networking operations.",
    page: "/dashboard",
    icon: CheckCircle,
  },
]

interface DemoTourProps {
  autoStart?: boolean
  onComplete?: () => void
}

export function DemoTour({ autoStart = false, onComplete }: DemoTourProps) {
  const [isActive, setIsActive] = useState(autoStart)
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  const step = TOUR_STEPS[currentStep]
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100

  useEffect(() => {
    if (isActive && step) {
      // Navigate to the step's page if needed
      if (window.location.pathname !== step.page) {
        router.push(step.page)
      }

      // Show tour overlay after navigation
      const timer = setTimeout(() => {
        setIsVisible(true)

        // Highlight target elements
        if (step.highlight) {
          step.highlight.forEach((className) => {
            const elements = document.querySelectorAll(`.${className}`)
            elements.forEach((el) => {
              el.classList.add("tour-highlight")
            })
          })
        }
      }, 500)

      return () => {
        clearTimeout(timer)
        // Remove highlights
        if (step.highlight) {
          step.highlight.forEach((className) => {
            const elements = document.querySelectorAll(`.${className}`)
            elements.forEach((el) => {
              el.classList.remove("tour-highlight")
            })
          })
        }
      }
    }
  }, [isActive, currentStep, step, router])

  const startTour = () => {
    setIsActive(true)
    setCurrentStep(0)
    setIsVisible(true)
  }

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 300)
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
      }, 300)
    }
  }

  const completeTour = () => {
    setIsActive(false)
    setIsVisible(false)
    setCurrentStep(0)
    onComplete?.()

    // Store completion in localStorage
    localStorage.setItem("ellie-demo-tour-completed", "true")
  }

  const skipTour = () => {
    completeTour()
  }

  if (!isActive) {
    return (
      <Button
        onClick={startTour}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Play className="h-4 w-4 mr-2" />
        Take Demo Tour
      </Button>
    )
  }

  if (!step) return null

  const Icon = step.icon

  return (
    <>
      {/* Tour Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 pointer-events-none">
        {/* Spotlight effect for target elements */}
        {step.target && (
          <div
            className="absolute bg-white/10 rounded-lg border-2 border-primary animate-pulse"
            style={
              {
                // This would be calculated based on target element position
                // For demo purposes, we'll use fixed positioning
              }
            }
          />
        )}
      </div>

      {/* Tour Card */}
      <Card
        className={`fixed z-50 w-96 transition-all duration-300 pointer-events-auto ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{step.title}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={skipTour}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>
              <Badge variant="secondary">{Math.round(progress)}% complete</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed">{step.description}</p>

          {step.action && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Try this:</p>
              <p className="text-sm">{step.action}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" onClick={prevStep} disabled={currentStep === 0}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={skipTour}>
                Skip Tour
              </Button>
              <Button size="sm" onClick={nextStep}>
                {currentStep === TOUR_STEPS.length - 1 ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tour Styles */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 51;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.3), 0 0 20px rgba(99, 102, 241, 0.2);
          border-radius: 8px;
          animation: tour-pulse 2s infinite;
        }
        
        @keyframes tour-pulse {
          0%, 100% { 
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.3), 0 0 20px rgba(99, 102, 241, 0.2);
          }
          50% { 
            box-shadow: 0 0 0 8px rgba(99, 102, 241, 0.2), 0 0 30px rgba(99, 102, 241, 0.3);
          }
        }
      `}</style>
    </>
  )
}
