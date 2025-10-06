import { getUserProfile } from "@/lib/auth"
import { StartupsDiscoveryTable } from "@/components/tables"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Plus, TrendingUp, Heart, Users } from "lucide-react"

export default async function StartupsPage() {
  const profile = await getUserProfile()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Startup Discovery</h1>
          <p className="text-muted-foreground/80">Discover promising companies and express interest</p>
        </div>
        <Button size="sm" className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Startup
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/30 border-border/60 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground/80">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <Badge variant="default" className="text-xs mt-1 bg-primary/20 text-primary hover:bg-primary/30">
              +18 this month
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/60 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground/80">High Momentum</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">43</div>
            <Badge variant="default" className="text-xs mt-1 bg-primary/20 text-primary hover:bg-primary/30">
              Score 80+
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/60 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground/80">Your Interests</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <Badge variant="secondary" className="text-xs mt-1">
              Companies tracked
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/60 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground/80">Network Interest</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <Badge variant="default" className="text-xs mt-1 bg-primary/20 text-primary hover:bg-primary/30">
              Total expressions
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="discover" className="space-y-4">
        <TabsList className="bg-card/30 border border-border/60">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="interested">My Interests</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-4">
          <Card className="bg-card/30 border-border/60">
            <CardHeader>
              <CardTitle>Company Discovery</CardTitle>
              <p className="text-sm text-muted-foreground/80">
                Browse companies submitted by scouts and express your interest
              </p>
            </CardHeader>
            <CardContent>
              <StartupsDiscoveryTable filter="all" userId={profile.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interested" className="space-y-4">
          <Card className="bg-card/30 border-border/60">
            <CardHeader>
              <CardTitle>Your Interests</CardTitle>
              <p className="text-sm text-muted-foreground/80">Companies you've expressed interest in</p>
            </CardHeader>
            <CardContent>
              <StartupsDiscoveryTable filter="interested" userId={profile.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <Card className="bg-card/30 border-border/60">
            <CardHeader>
              <CardTitle>Trending Companies</CardTitle>
              <p className="text-sm text-muted-foreground/80">Companies with highest momentum and member interest</p>
            </CardHeader>
            <CardContent>
              <StartupsDiscoveryTable filter="trending" userId={profile.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
