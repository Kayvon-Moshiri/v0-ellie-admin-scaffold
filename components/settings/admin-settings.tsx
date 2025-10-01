import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { UserPlus, Building2, Users, Crown, Info } from "lucide-react"

export function AdminSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Admin Management
          </CardTitle>
          <CardDescription>Manage administrative access and reseller partnerships</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <UserPlus className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium text-muted-foreground">Add Admin User</h4>
                <p className="text-sm text-muted-foreground">Grant administrative access to team members</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Coming Soon</Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" disabled>
                      <Info className="h-4 w-4 mr-2" />
                      Add Admin
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      This feature will allow you to invite additional administrators to help manage your network.
                      Perfect for larger organizations with multiple team members.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium text-muted-foreground">Reseller Access</h4>
                <p className="text-sm text-muted-foreground">Enable partner/reseller login capabilities</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Coming Soon</Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" disabled>
                      <Info className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      This feature will enable reseller and partner organizations to access and manage their client
                      networks through dedicated login portals with appropriate permissions.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium text-muted-foreground">Multi-Admin Workflows</h4>
                <p className="text-sm text-muted-foreground">Advanced permission management and approval flows</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Coming Soon</Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" disabled>
                      <Info className="h-4 w-4 mr-2" />
                      Setup
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
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

      <Card>
        <CardHeader>
          <CardTitle>Current Admin Status</CardTitle>
          <CardDescription>Your current administrative privileges and access level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <Crown className="h-5 w-5 text-primary" />
            <div>
              <h4 className="font-medium">Primary Administrator</h4>
              <p className="text-sm text-muted-foreground">You have full administrative access to this tenant</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
