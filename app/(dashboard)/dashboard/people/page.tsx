import { getUserProfile } from "@/lib/auth"
import { PeopleTable } from "@/components/tables/people-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Filter, Download } from "lucide-react"

export default async function PeoplePage() {
  const profile = await getUserProfile()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">People</h1>
          <p className="text-muted-foreground/80">Manage your network members and their connections</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="border-border/60 hover:border-primary/40 bg-transparent">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="border-border/60 hover:border-primary/40 bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/30 border-border/60 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground/80">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <Badge variant="default" className="text-xs mt-1 bg-primary/20 text-primary hover:bg-primary/30">
              +12% this month
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/60 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground/80">Active This Week</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <Badge variant="secondary" className="text-xs mt-1">
              71% engagement
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/60 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground/80">New This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">43</div>
            <Badge variant="default" className="text-xs mt-1 bg-primary/20 text-primary hover:bg-primary/30">
              +8 this week
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/60 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground/80">Avg Connections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.4</div>
            <Badge variant="secondary" className="text-xs mt-1">
              per member
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/30 border-border/60">
        <CardHeader>
          <CardTitle>Network Members</CardTitle>
        </CardHeader>
        <CardContent>
          <PeopleTable />
        </CardContent>
      </Card>
    </div>
  )
}
