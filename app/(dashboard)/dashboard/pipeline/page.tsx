import { getUserProfile } from "@/lib/auth"
import { WaitlistReview } from "@/components/pipeline/waitlist-review"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, Calendar } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"

export default async function PipelinePage() {
  const profile = await getUserProfile()
  const supabase = await createServerClient()

  const { data: applications, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("tenant_id", profile.tenant_id)
    .in("status", ["pending_approval", "approved", "rejected", "scheduled_call"])

  if (error) {
    console.error("[v0] Pipeline page error:", error)
  }

  const stats = {
    pending: applications?.filter((a) => a.status === "pending_approval").length || 0,
    approved: applications?.filter((a) => a.status === "approved").length || 0,
    rejected: applications?.filter((a) => a.status === "rejected").length || 0,
    scheduledCalls: applications?.filter((a) => a.status === "scheduled_call").length || 0,
  }

  const totalProcessed = stats.approved + stats.rejected
  const approvalRate = totalProcessed > 0 ? (stats.approved / totalProcessed) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Waitlist Pipeline</h1>
          <p className="text-muted-foreground">Review and approve member applications with AI insights</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2 border-primary/30 bg-primary/5">
          <Clock className="h-4 w-4 mr-2 text-primary" />
          {stats.pending} Pending Review
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <Badge variant="secondary" className="text-xs mt-1">
              Awaiting decision
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <Badge variant="default" className="text-xs mt-1 bg-primary text-primary-foreground">
              {approvalRate.toFixed(0)}% approval rate
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled Calls</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledCalls}</div>
            <Badge variant="default" className="text-xs mt-1 bg-primary text-primary-foreground">
              15-min intro calls
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <Badge variant="secondary" className="text-xs mt-1">
              Not a fit
            </Badge>
          </CardContent>
        </Card>
      </div>

      <WaitlistReview />
    </div>
  )
}
