import { getUserProfile } from "@/lib/auth"
import { ScoutSubmissionForm } from "@/components/scouts/scout-submission-form"
import { ScoutSubmissionsList } from "@/components/scouts/scout-submissions-list"
import { ScoutSubmissionsReview } from "@/components/admin/scout-submissions-review"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserSearch, Plus, TrendingUp, CheckCircle, Clock, Shield } from "lucide-react"

export default async function ScoutsPage() {
  const profile = await getUserProfile()
  const isAdmin = profile.role === "admin" || profile.role === "owner"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scout Network</h1>
          <p className="text-muted-foreground">Submit and track company discoveries</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Submit Company
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Your Submissions</CardTitle>
            <UserSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <Badge variant="default" className="text-xs mt-1">
              +3 this month
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <Badge variant="default" className="text-xs mt-1">
              67% approval rate
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <Badge variant="secondary" className="text-xs mt-1">
              Awaiting admin
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Quality Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.8</div>
            <Badge variant="default" className="text-xs mt-1">
              Out of 10
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="submit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="submit">Submit Company</TabsTrigger>
          <TabsTrigger value="submissions">My Submissions</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin">
              <Shield className="h-4 w-4 mr-2" />
              Admin Review
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="submit" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Submit a Company</CardTitle>
              <p className="text-sm text-muted-foreground">
                Share promising startups with the network. Include sector, stage, and traction details.
              </p>
            </CardHeader>
            <CardContent>
              <ScoutSubmissionForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Your Submissions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track the status and quality ratings of your company submissions.
              </p>
            </CardHeader>
            <CardContent>
              <ScoutSubmissionsList scoutId={profile.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin" className="space-y-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Admin Review</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review and rate scout submissions to maintain quality standards.
                </p>
              </CardHeader>
              <CardContent>
                <ScoutSubmissionsReview />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
