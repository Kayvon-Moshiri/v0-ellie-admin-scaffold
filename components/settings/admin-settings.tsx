import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { UserPlus, Building2, Users, Crown, Info } from "lucide-react"

export function AdminSettings() {
  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/30">
          <CardTitle className="flex items-center gap-2 font-serif text-2xl font-light">
            <Crown className="h-5 w-5 text-primary" />
            <span>Admin Management</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground/90">
            Manage administrative access and reseller partnerships
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 border border-border/60 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted/50 rounded-lg">
                <UserPlus className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-medium text-muted-foreground">Add Admin User</h4>
                <p className="text-sm text-muted-foreground/80">Grant administrative access to team members</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-muted border-border/60">
                Coming Soon
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" disabled className="border-border/60 bg-transparent">
                      <Info className="h-4 w-4 mr-2" />
                      Add Admin
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      This feature will allow you to invite additional administrators to help manage your network.
                      Perfect for larger organizations with multiple team members.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-border/60 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted/50 rounded-lg">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-medium text-muted-foreground">Reseller Access</h4>
                <p className="text-sm text-muted-foreground/80">Enable partner/reseller login capabilities</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-muted border-border/60">
                Coming Soon
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" disabled className="border-border/60 bg-transparent">
                      <Info className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      This feature will enable reseller and partner organizations to access and manage their client
                      networks through dedicated login portals with appropriate permissions.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-border/60 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted/50 rounded-lg">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-medium text-muted-foreground">Multi-Admin Workflows</h4>
                <p className="text-sm text-muted-foreground/80">Advanced permission management and approval flows</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-muted border-border/60">
                Coming Soon
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" disabled className="border-border/60 bg-transparent">
                      <Info className="h-4 w-4 mr-2" />
                      Setup
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Advanced workflows for teams with multiple administrators, including approval processes,
                      role-based permissions, and collaborative management features.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader className="border-b border-primary/10">
          <CardTitle className="font-serif text-xl font-light">Current Admin Status</CardTitle>
          <CardDescription className="text-muted-foreground/90">
            Your current administrative privileges and access level
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Primary Administrator</h4>
              <p className="text-sm text-muted-foreground/80">You have full administrative access to this tenant</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
