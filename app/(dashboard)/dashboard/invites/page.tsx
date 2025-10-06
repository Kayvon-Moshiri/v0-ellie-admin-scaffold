import { getUserProfile } from "@/lib/auth"
import { InviteManager } from "@/components/invites/invite-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageSquare, Users, Clock } from "lucide-react"

export default async function InvitesPage() {
  const profile = await getUserProfile()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Invites</h1>
          <p className="text-muted-foreground/80">Grow your network deliberately with targeted invitations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/30 border-border/60 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground/80">Total Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <Badge variant="default" className="text-xs mt-1 bg-primary/20 text-primary hover:bg-primary/30">
              +23 this week
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/60 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground/80">Accepted</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">189</div>
            <Badge variant="secondary" className="text-xs mt-1">
              76% rate
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/60 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground/80">SMS Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">43</div>
            <Badge variant="default" className="text-xs mt-1 bg-primary/20 text-primary hover:bg-primary/30">
              +12 this week
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/60 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground/80">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <Badge variant="secondary" className="text-xs mt-1">
              awaiting response
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Invite Manager */}
      <InviteManager />
    </div>
  )
}
