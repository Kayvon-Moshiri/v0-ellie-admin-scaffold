"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { createBrowserClient } from "@/lib/supabase/client"
import { TrendingUp, TrendingDown, Clock, Zap, AlertTriangle, Users } from "lucide-react"

interface PriorityStats {
  totalIntros: number
  directRouted: number
  digestRouted: number
  blocked: number
  avgPriorityScore: number
  weeklyLimitUtilization: number
  topPriorityFactors: Array<{
    factor: string
    avgScore: number
    impact: "high" | "medium" | "low"
  }>
}

export function PriorityInsights() {
  const [stats, setStats] = useState<PriorityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadPriorityStats()
  }, [])

  const loadPriorityStats = async () => {
    try {
      // Get intro routing stats
      const { data: intros } = await supabase
        .from("introductions") // Changed from "intros" to "introductions"
        .select("routing_decision, computed_priority, priority_factors, created_at")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      // Get weekly limit utilization
      const { data: profiles } = await supabase.from("profiles").select("current_week_intros, weekly_intro_limit")

      if (!intros || !profiles) return

      const totalIntros = intros.length
      const directRouted = intros.filter((i) => i.routing_decision === "direct").length
      const digestRouted = intros.filter((i) => i.routing_decision === "digest").length
      const blocked = intros.filter((i) => i.routing_decision === "blocked").length

      const avgPriorityScore = intros.reduce((sum, i) => sum + (i.computed_priority || 0), 0) / totalIntros || 0

      const weeklyUtilization =
        (profiles.reduce((sum, p) => {
          return sum + p.current_week_intros / p.weekly_intro_limit
        }, 0) /
          profiles.length) *
        100

      // Analyze priority factors
      const factorAnalysis = intros.reduce(
        (acc, intro) => {
          if (intro.priority_factors) {
            Object.entries(intro.priority_factors).forEach(([key, value]) => {
              if (key.endsWith("_score") && typeof value === "number") {
                if (!acc[key]) acc[key] = []
                acc[key].push(value)
              }
            })
          }
          return acc
        },
        {} as Record<string, number[]>,
      )

      const topPriorityFactors = Object.entries(factorAnalysis)
        .map(([factor, values]) => ({
          factor: factor.replace("_score", "").replace("_", " "),
          avgScore: values.reduce((sum, v) => sum + v, 0) / values.length,
          impact:
            values.reduce((sum, v) => sum + v, 0) / values.length > 5
              ? "high"
              : values.reduce((sum, v) => sum + v, 0) / values.length > 3
                ? "medium"
                : "low",
        }))
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, 4)

      setStats({
        totalIntros,
        directRouted,
        digestRouted,
        blocked,
        avgPriorityScore,
        weeklyLimitUtilization: weeklyUtilization,
        topPriorityFactors,
      })
    } catch (error) {
      console.error("Error loading priority stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Priority Insights</CardTitle>
          <CardDescription>Loading priority scoring analytics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const getRoutingColor = (routing: string) => {
    switch (routing) {
      case "direct":
        return "bg-green-500"
      case "digest":
        return "bg-yellow-500"
      case "blocked":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "high":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "low":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="priority-insights">
      {/* Routing Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Routing Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs">Direct</span>
              </div>
              <span className="text-xs font-medium">{stats.directRouted}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-xs">Digest</span>
              </div>
              <span className="text-xs font-medium">{stats.digestRouted}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs">Blocked</span>
              </div>
              <span className="text-xs font-medium">{stats.blocked}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Priority Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Avg Priority Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span className="text-2xl font-bold">{stats.avgPriorityScore.toFixed(1)}</span>
          </div>
          <Progress value={(stats.avgPriorityScore / 10) * 100} className="mt-2" />
        </CardContent>
      </Card>

      {/* Weekly Limit Utilization */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Weekly Limit Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span className="text-2xl font-bold">{stats.weeklyLimitUtilization.toFixed(0)}%</span>
          </div>
          <Progress value={stats.weeklyLimitUtilization} className="mt-2" />
          {stats.weeklyLimitUtilization > 80 && (
            <div className="flex items-center space-x-1 mt-2">
              <AlertTriangle className="h-3 w-3 text-yellow-600" />
              <span className="text-xs text-yellow-600">High utilization</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Priority Factors */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Top Priority Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.topPriorityFactors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getImpactIcon(factor.impact)}
                  <span className="text-xs capitalize">{factor.factor}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {factor.avgScore.toFixed(1)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
