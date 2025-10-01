"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { createBrowserClient } from "@/lib/supabase/client"
import {
  Network,
  UserPlus,
  Mail,
  Calendar,
  Phone,
  TrendingUp,
  Users,
  Zap,
  ExternalLink,
  Star,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Node } from "reactflow"

interface PeopleDrawerProps {
  node: Node | null
  onClose: () => void
  tenantId: string
}

export function PeopleDrawer({ node, onClose, tenantId }: PeopleDrawerProps) {
  const [profileData, setProfileData] = useState<any>(null)
  const [recentIntros, setRecentIntros] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!node) return

    const fetchDetailedData = async () => {
      setLoading(true)
      const supabase = createBrowserClient()

      try {
        // Fetch detailed profile data
        const { data: profile } = await supabase
          .from("profiles")
          .select(`
            *,
            companies(name, industry, stage),
            scout_profiles(quality_score, submission_count)
          `)
          .eq("id", node.id)
          .single()

        // Fetch recent introductions
        const { data: intros } = await supabase
          .from("introductions")
          .select(`
            id,
            status,
            context,
            priority_score,
            created_at,
            requester:profiles!introductions_requester_id_fkey(full_name, avatar_url),
            person_a:profiles!introductions_person_a_id_fkey(full_name, avatar_url),
            person_b:profiles!introductions_person_b_id_fkey(full_name, avatar_url)
          `)
          .or(`person_a_id.eq.${node.id},person_b_id.eq.${node.id}`)
          .order("created_at", { ascending: false })
          .limit(5)

        setProfileData(profile)
        setRecentIntros(intros || [])
      } catch (error) {
        console.error("Error fetching detailed profile data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDetailedData()
  }, [node, tenantId])

  if (!node) return null

  const data = node.data
  const isPerson = node.type === "person" || node.type === "federated"

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "vip":
        return "bg-purple-500 text-white"
      case "member":
        return "bg-blue-500 text-white"
      case "guest":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getScarcityLevel = (score: number) => {
    if (score >= 8) return { label: "Ultra Rare", color: "text-red-500", bg: "bg-red-50" }
    if (score >= 6) return { label: "Rare", color: "text-orange-500", bg: "bg-orange-50" }
    if (score >= 4) return { label: "Selective", color: "text-yellow-500", bg: "bg-yellow-50" }
    return { label: "Available", color: "text-green-500", bg: "bg-green-50" }
  }

  const scarcityInfo = getScarcityLevel(data.scarcityScore || 0)

  const handleAction = async (action: string) => {
    console.log(`[v0] Performing action: ${action} on node:`, node.id)
    // TODO: Implement actual actions
    switch (action) {
      case "invite":
        // Open invite modal or navigate to invite flow
        break
      case "nudge":
        // Send nudge notification
        break
      case "email":
        // Open email client or compose modal
        window.open(`mailto:${profileData?.email || ""}`)
        break
      case "sms":
        // Open SMS client
        window.open(`sms:${profileData?.phone || ""}`)
        break
      case "propose-times":
        // Open calendar scheduling
        break
    }
  }

  return (
    <Sheet open={!!node} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center space-x-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={data.avatar || "/placeholder.svg"} />
              <AvatarFallback className={cn(getTierColor(data.tier))}>{data.label?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-xl">{data.label}</SheetTitle>
                {data.isFederated && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    <Network className="h-3 w-3 mr-1" />
                    {data.sourceNetwork}
                  </Badge>
                )}
              </div>
              <SheetDescription className="text-base">
                {data.role} {data.company && `at ${data.company}`}
              </SheetDescription>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn("text-xs", getTierColor(data.tier))}>{data.tier?.toUpperCase()}</Badge>
                <Badge variant="outline" className={cn("text-xs", scarcityInfo.color, scarcityInfo.bg)}>
                  <Star className="h-3 w-3 mr-1" />
                  {scarcityInfo.label}
                </Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" className="bg-transparent" onClick={() => handleAction("invite")}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite
                </Button>
                <Button size="sm" variant="outline" className="bg-transparent" onClick={() => handleAction("nudge")}>
                  <Zap className="w-4 h-4 mr-2" />
                  Nudge
                </Button>
                <Button size="sm" variant="outline" className="bg-transparent" onClick={() => handleAction("email")}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button size="sm" variant="outline" className="bg-transparent" onClick={() => handleAction("sms")}>
                  <Phone className="w-4 h-4 mr-2" />
                  SMS
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-transparent col-span-2"
                  onClick={() => handleAction("propose-times")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Propose Times
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{data.activityScore || 0}</div>
                  <div className="text-xs text-muted-foreground">Activity Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{data.connections || 0}</div>
                  <div className="text-xs text-muted-foreground">Connections</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{Math.round((data.scarcityScore || 0) * 10)}</div>
                  <div className="text-xs text-muted-foreground">Scarcity (0-10)</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Scarcity Level</span>
                  <span className={scarcityInfo.color}>{scarcityInfo.label}</span>
                </div>
                <Progress value={(data.scarcityScore || 0) * 10} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Offers & Asks */}
          {(data.offers || data.asks) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Offers & Asks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.offers && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Offers:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {data.offers
                        .split(",")
                        .slice(0, 6)
                        .map((offer: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {offer.trim()}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
                {data.asks && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Asks:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {data.asks
                        .split(",")
                        .slice(0, 6)
                        .map((ask: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {ask.trim()}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Top Tags */}
          {data.tags && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Top Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(data.tags) ? data.tags : data.tags.split(","))
                    .slice(0, 8)
                    .map((tag: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Introductions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Latest Intros
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : recentIntros.length > 0 ? (
                <div className="space-y-3">
                  {recentIntros.map((intro) => (
                    <div key={intro.id} className="flex items-start gap-3 p-2 bg-muted/30 rounded">
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            intro.status === "completed"
                              ? "bg-green-500"
                              : intro.status === "pending"
                                ? "bg-yellow-500"
                                : intro.status === "declined"
                                  ? "bg-red-500"
                                  : "bg-blue-500",
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {intro.person_a?.full_name} ↔ {intro.person_b?.full_name}
                          </p>
                          {intro.priority_score && (
                            <Badge variant="outline" className="text-xs">
                              Priority: {intro.priority_score}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{intro.context || "No context provided"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(intro.created_at).toLocaleDateString()} • {intro.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">No recent introductions</div>
              )}
            </CardContent>
          </Card>

          {/* Additional Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full bg-transparent">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in People Directory
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              <Network className="h-4 w-4 mr-2" />
              View Full Network
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
