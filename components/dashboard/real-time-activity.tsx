"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRealtimeActivities } from "@/lib/hooks/use-realtime"
import { formatDistanceToNow } from "date-fns"
import { Users, GitBranch, Calendar, UserPlus, Loader2 } from "lucide-react"

interface RealtimeActivityProps {
  tenantId: string
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "connection":
      return Users
    case "introduction":
      return GitBranch
    case "event":
      return Calendar
    case "member":
      return UserPlus
    default:
      return Users
  }
}

const getActivityColor = (type: string) => {
  switch (type) {
    case "introduction":
      return "default"
    case "connection":
      return "secondary"
    case "event":
      return "outline"
    case "member":
      return "default"
    default:
      return "secondary"
  }
}

export function RealtimeActivity({ tenantId }: RealtimeActivityProps) {
  const { data: activities, loading, error } = useRealtimeActivities(tenantId)

  if (loading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Live Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading real-time activity...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Live Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <p className="text-sm text-destructive">Error loading activity: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          Live Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center space-y-2 py-8">
            <Users className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          activities.slice(0, 10).map((activity: any) => {
            const Icon = getActivityIcon(activity.activity_type)
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {activity.metadata?.title || `${activity.activity_type} activity`}
                    </p>
                    <Badge variant={getActivityColor(activity.activity_type)} className="text-xs">
                      {activity.activity_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.metadata?.description || "Activity occurred"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
