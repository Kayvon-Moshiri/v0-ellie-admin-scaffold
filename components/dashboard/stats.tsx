import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, GitBranch, TrendingUp, Calendar } from "lucide-react"

const stats = [
  {
    title: "Active Members",
    value: "1,247",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
    description: "Total network members",
  },
  {
    title: "Pending Intros",
    value: "23",
    change: "+5",
    changeType: "neutral" as const,
    icon: GitBranch,
    description: "Awaiting consent",
  },
  {
    title: "Network Activity",
    value: "89%",
    change: "+7%",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "30-day engagement",
  },
  {
    title: "Upcoming Events",
    value: "4",
    change: "This month",
    changeType: "neutral" as const,
    icon: Calendar,
    description: "Scheduled gatherings",
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="bg-card border-border hover:border-primary/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant={
                    stat.changeType === "positive"
                      ? "default"
                      : stat.changeType === "negative"
                        ? "destructive"
                        : "secondary"
                  }
                  className={stat.changeType === "positive" ? "bg-primary text-primary-foreground" : ""}
                >
                  {stat.change}
                </Badge>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
