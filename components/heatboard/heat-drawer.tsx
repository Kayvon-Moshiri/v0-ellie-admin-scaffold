"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserClient } from "@/lib/supabase/client"
import { Network, UserPlus, Mail, Calendar, MessageSquare, Users, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface HeatDrawerProps {
  item: {
    type: "person" | "startup"
    data: any
  } | null
  onClose: () => void
}

export function HeatDrawer({ item, onClose }: HeatDrawerProps) {
  const [activityData, setActivityData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!item) return

    const fetchActivityData = async () => {
      setLoading(true)
      const supabase = createBrowserClient()

      try {
        if (item.type === "person") {
          // Fetch recent engagement events for the person
          const { data } = await supabase
            .from("engagement_events")
            .select(`
              id,
              kind,
              created_at,
              payload,
              intros!inner(
                id,
                context,
                status,
                requester,
                target,
                profiles!intros_requester_fkey(full_name),
                profiles!intros_target_fkey(full_name)
              )
            `)
            .eq("actor", item.data.profile_id)
            .order("created_at", { ascending: false })
            .limit(10)

          setActivityData(data || [])
        } else {
          // Fetch scout submissions and engagement for the startup
          const { data } = await supabase
            .from("scout_submissions")
            .select(`
              id,
              quality,
              notes,
              created_at,
              scouts!inner(
                profile_id,
                profiles!inner(full_name)
              )
            `)
            .eq("company_id", item.data.company_id)
            .order("created_at", { ascending: false })
            .limit(10)

          setActivityData(data || [])
        }
      } catch (error) {
        console.error("Error fetching activity data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivityData()
  }, [item])

  if (!item) return null

  const isPerson = item.type === "person"
  const data = item.data

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "vip":
        return "bg-primary"
      case "member":
        return "bg-primary"
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
      case "series a":
        return "bg-primary"
      case "series b":
        return "bg-primary"
      case "series c+":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getKindIcon = (kind: string) => {
    switch (kind) {
      case "view":
        return <Users className="h-4 w-4" />
      case "reply":
        return <MessageSquare className="h-4 w-4" />
      case "meet":
        return <Calendar className="h-4 w-4" />
      case "note":
        return <Mail className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  return (
    <Sheet open={!!item} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center space-x-3">
            {isPerson ? (
              <Avatar className="h-12 w-12">
                <AvatarFallback className={cn("text-white", getTierColor(data.profiles.tier))}>
                  {data.profiles.full_name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div
                className={cn(
                  "h-12 w-12 rounded-lg flex items-center justify-center text-white text-lg font-semibold",
                  getStageColor(data.companies.stage),
                )}
              >
                {data.companies.name?.charAt(0) || "?"}
              </div>
            )}
            <div>
              <SheetTitle>{isPerson ? data.profiles.full_name : data.companies.name}</SheetTitle>
              <SheetDescription>
                {isPerson
                  ? `${data.profiles.tier} • Weighted degree: ${Math.round(data.weighted_degree)}`
                  : `${data.companies.sector} • ${data.companies.stage} • Score: ${Math.round(data.interest_score * 10) / 10}`}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isPerson ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Scarcity Score</span>
                    <span className="text-sm font-medium">{Math.round(data.profiles.scarcity_score * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Active</span>
                    <span className="text-sm font-medium">{new Date(data.last_active).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tags</span>
                    <div className="flex gap-1">
                      {data.profiles.tags.slice(0, 2).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Scout Submissions</span>
                    <span className="text-sm font-medium">{data.submissionCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Top Scout</span>
                    <span className="text-sm font-medium">{data.scoutAttribution || "None"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tags</span>
                    <div className="flex gap-1">
                      {data.companies.tags.slice(0, 2).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading activity...</div>
              ) : activityData.length > 0 ? (
                <div className="space-y-3">
                  {activityData.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="mt-1">
                        {isPerson ? getKindIcon(activity.kind) : <Building2 className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          {isPerson ? (
                            <>
                              <span className="font-medium">{activity.kind}</span>
                              {activity.intros && (
                                <span className="text-muted-foreground">
                                  {" "}
                                  with {activity.intros.profiles?.full_name}
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="font-medium">Scout submission</span>
                              <span className="text-muted-foreground"> by {activity.scouts.profiles.full_name}</span>
                            </>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No recent activity</div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href={`/dashboard/graph?focus=${isPerson ? data.profile_id : data.company_id}`}>
                <Network className="h-4 w-4 mr-2" />
                Open in Graph
              </Link>
            </Button>
            {isPerson && (
              <Button variant="outline" className="w-full bg-transparent">
                <UserPlus className="h-4 w-4 mr-2" />
                Create Intro
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
