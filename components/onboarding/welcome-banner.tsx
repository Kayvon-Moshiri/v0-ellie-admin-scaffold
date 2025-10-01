"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Play, Sparkles, Users, TrendingUp } from "lucide-react"
import { DemoTour } from "./demo-tour"

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showTour, setShowTour] = useState(false)

  useEffect(() => {
    // Check if user has completed the tour
    const tourCompleted = localStorage.getItem("ellie-demo-tour-completed")
    const bannerDismissed = localStorage.getItem("ellie-welcome-banner-dismissed")

    if (!tourCompleted && !bannerDismissed) {
      setIsVisible(true)
    }
  }, [])

  const startTour = () => {
    setShowTour(true)
    setIsVisible(false)
  }

  const dismissBanner = () => {
    setIsVisible(false)
    localStorage.setItem("ellie-welcome-banner-dismissed", "true")
  }

  const handleTourComplete = () => {
    setShowTour(false)
    setIsVisible(false)
  }

  if (!isVisible && !showTour) return null

  return (
    <>
      {isVisible && (
        <Card className="mb-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Welcome to Ellie Admin</h3>
                  <Badge variant="secondary" className="text-xs">
                    Demo Environment
                  </Badge>
                </div>

                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Your networking command center is ready! We've loaded realistic demo data including VIP members, hot
                  startups, and active introductions. Take the 60-second guided tour to see how everything works.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>10 demo members across all tiers</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>3 hot startups with real traction</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span>Bursty activity patterns</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Button onClick={startTour} className="bg-primary hover:bg-primary/90">
                    <Play className="h-4 w-4 mr-2" />
                    Take the 60s Tour
                  </Button>
                  <Button variant="outline" onClick={dismissBanner}>
                    Explore on my own
                  </Button>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={dismissBanner} className="ml-4">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showTour && <DemoTour autoStart={true} onComplete={handleTourComplete} />}
    </>
  )
}
