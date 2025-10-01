"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TrendingUp, TrendingDown, Minus, Users, Building2, Flame, Zap, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface PeopleHeatItem {
  id: string
  full_name: string
  email: string
  membership_tier: string
  activity_score: number
  interests: string[]
  last_active_at: string
  company: string
  job_title: string
  trend?: number
}

interface StartupHeatItem {
  id: string
  name: string
  description: string
  industry: string
  stage: string
  momentum_score: number
  tags: string[]
  logo_url: string
  website_url: string
  location: string
  employee_count: number
  funding_amount: number
  interest_score?: number
  scout_attribution?: string
}

interface ActivityItem {
  user_id: string
  created_at: string
  activity_type: string
}

interface StartupActivityItem {
  id: string
  user_id: string
  activity_type: string
  created_at: string
  metadata: any
  profiles: {
    display_name: string
    full_name: string
  }
}

interface HeatboardViewProps {
  peopleHeat: PeopleHeatItem[]
  recentActivities: ActivityItem[]
  startupHeat: StartupHeatItem[]
  startupActivities: StartupActivityItem[]
}

export function HeatboardView({ peopleHeat, recentActivities, startupHeat, startupActivities }: HeatboardViewProps) {
  const [selectedItem, setSelectedItem] = useState<{
    type: "person" | "startup"
    data: PeopleHeatItem | StartupHeatItem
  } | null>(null)

  const peopleWithTrends = peopleHeat.map((person) => {
    if (person.trend !== undefined) {
      return person
    }

    const personActivities = recentActivities.filter((a) => a.user_id === person.id)

    const recentActivity = personActivities.filter((a) => {
      const activityDate = new Date(a.created_at)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return activityDate >= sevenDaysAgo
    })

    const olderActivity = personActivities.filter((a) => {
      const activityDate = new Date(a.created_at)
      const sevenDaysAgo = new Date()
      const fourteenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
      return activityDate >= fourteenDaysAgo && activityDate < sevenDaysAgo
    })

    const trend = recentActivity.length - olderActivity.length
    return { ...person, trend }
  })

  const startupsWithEngagement = startupHeat.map((startup) => {
    if (startup.interest_score !== undefined && startup.scout_attribution !== undefined) {
      return {
        ...startup,
        engagement_count: startup.interest_score,
        unique_users: 0,
        recent_activity_count: startup.interest_score,
        scout_names: startup.scout_attribution,
      }
    }

    const activities = startupActivities.filter((a) => a.metadata?.startup_id === startup.id)
    const uniqueUsers = new Set(activities.map((a) => a.user_id)).size
    const recentCount = activities.filter((a) => {
      const activityDate = new Date(a.created_at)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return activityDate >= sevenDaysAgo
    }).length

    const scouts = activities
      .filter((a) => a.profiles)
      .map((a) => a.profiles.display_name || a.profiles.full_name)
      .filter((name, index, self) => self.indexOf(name) === index)
      .slice(0, 3)

    return {
      ...startup,
      engagement_count: activities.length,
      unique_users: uniqueUsers,
      recent_activity_count: recentCount,
      scout_names: scouts.join(", "),
    }
  })

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-3 w-3 text-green-500" />
    if (trend < 0) return <TrendingDown className="h-3 w-3 text-red-500" />
    return <Minus className="h-3 w-3 text-muted-foreground" />
  }

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "vip":
        return "bg-purple-500"
      case "member":
        return "bg-blue-500"
      case "guest":
        return "bg-gray-500"
      case "startup":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case "seed":
        return "bg-green-500"
      case "series-a":
      case "series a":
        return "bg-blue-500"
      case "series-b":
      case "series b":
        return "bg-purple-500"
      case "series-c":
      case "series c":
      case "series-c+":
        return "bg-red-500"
      case "pre-seed":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const totalPeopleHeat = peopleHeat.reduce((sum, p) => sum + (p.activity_score || 0), 0)
  const totalStartupHeat = startupHeat.reduce((sum, s) => sum + (s.momentum_score || 0), 0)
  const highActivityCount = peopleHeat.filter((p) => p.activity_score > 80).length
  const recentEngagementCount = startupActivities.filter((a) => {
    const activityDate = new Date(a.created_at)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return activityDate >= sevenDaysAgo
  }).length

  return (
    <>
      <div className="grid gap-4 md:grid-cols-4" data-tour="heatboard-stats">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Network Heat</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalPeopleHeat)}</div>
            <p className="text-xs text-muted-foreground">Activity score across top 20</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Startup Momentum</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalStartupHeat)}</div>
            <p className="text-xs text-muted-foreground">Combined momentum score</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Activity Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highActivityCount}</div>
            <p className="text-xs text-muted-foreground">Activity score &gt; 80</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Engagement</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentEngagementCount}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* People Heat */}
        <Card data-tour="people-heat">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              People Heat
            </CardTitle>
            <CardDescription>Top 20 by activity score with 14-day trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {peopleWithTrends.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No active members yet</p>
              ) : (
                peopleWithTrends.map((person, index) => (
                  <div
                    key={person.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => setSelectedItem({ type: "person", data: person })}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono text-muted-foreground w-6">#{index + 1}</span>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={cn("text-white", getTierColor(person.membership_tier))}>
                          {person.full_name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{person.full_name || "Unknown"}</p>
                        {person.activity_score > 80 && (
                          <Badge variant="secondary" className="text-xs">
                            High Activity
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Score: {Math.round(person.activity_score || 0)}</span>
                        {person.membership_tier && (
                          <>
                            <span>•</span>
                            <span>{person.membership_tier}</span>
                          </>
                        )}
                        {person.company && (
                          <>
                            <span>•</span>
                            <span className="truncate">{person.company}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(person.trend || 0)}
                      <span className="text-sm font-mono">{Math.round(person.activity_score || 0)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Startup Heat */}
        <Card data-tour="startup-heat">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Startup Heat
            </CardTitle>
            <CardDescription>Top companies by momentum score with engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {startupsWithEngagement.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No startups tracked yet</p>
              ) : (
                startupsWithEngagement.map((startup, index) => (
                  <div
                    key={startup.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => setSelectedItem({ type: "startup", data: startup })}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono text-muted-foreground w-6">#{index + 1}</span>
                      <div
                        className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold",
                          getStageColor(startup.stage),
                        )}
                      >
                        {startup.name?.charAt(0) || "?"}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{startup.name || "Unknown"}</p>
                        {startup.unique_users > 1 && (
                          <Badge variant="outline" className="text-xs">
                            {startup.unique_users} members
                          </Badge>
                        )}
                        {startup.recent_activity_count > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <Heart className="h-3 w-3 mr-1" />
                            {startup.recent_activity_count}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {startup.industry && <span>{startup.industry}</span>}
                        {startup.stage && (
                          <>
                            <span>•</span>
                            <span>{startup.stage}</span>
                          </>
                        )}
                        {startup.scout_names && (
                          <>
                            <span>•</span>
                            <span className="truncate">by {startup.scout_names}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-sm font-mono">{Math.round(startup.momentum_score || 0)}</div>
                        {startup.engagement_count > 0 && (
                          <div className="text-xs text-muted-foreground">{startup.engagement_count} activities</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
