import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Users, GitBranch, Calendar, UserPlus } from "lucide-react"

const activities = [
  {
    id: "1",
    type: "introduction",
    title: "New introduction request",
    description: "Sarah Chen wants to connect Alex Kim with Jordan Smith",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    icon: GitBranch,
    priority: "high",
  },
  {
    id: "2",
    type: "connection",
    title: "New connection made",
    description: "Maria Rodriguez connected with David Park",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    icon: Users,
    priority: "medium",
  },
  {
    id: "3",
    type: "event",
    title: "Event registration",
    description: "12 new registrations for AI Founders Mixer",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    icon: Calendar,
    priority: "low",
  },
  {
    id: "4",
    type: "member",
    title: "New member joined",
    description: "Emily Zhang joined the network",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    icon: UserPlus,
    priority: "medium",
  },
  {
    id: "5",
    type: "introduction",
    title: "Introduction completed",
    description: "Successfully connected Lisa Wang with Michael Chen",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    icon: GitBranch,
    priority: "low",
  },
]

export function RecentActivity() {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <Badge
                    variant={
                      activity.priority === "high"
                        ? "destructive"
                        : activity.priority === "medium"
                          ? "default"
                          : "secondary"
                    }
                    className="text-xs"
                  >
                    {activity.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
