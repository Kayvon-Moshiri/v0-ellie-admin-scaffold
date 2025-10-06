"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function GeneralSettings() {
  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/30">
          <CardTitle className="font-serif text-2xl font-light">Platform Settings</CardTitle>
          <CardDescription className="text-muted-foreground/90">
            Configure general platform settings and branding.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="platform-name" className="text-sm font-medium">
              Platform Name
            </Label>
            <Input
              id="platform-name"
              placeholder="Your Network Name"
              defaultValue="Ellie Admin"
              className="border-border/60 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="platform-description"
              placeholder="Brief description of your network"
              defaultValue="Professional networking platform"
              className="border-border/60 focus:border-primary min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-email" className="text-sm font-medium">
              Support Email
            </Label>
            <Input
              id="support-email"
              type="email"
              placeholder="support@yournetwork.com"
              className="border-border/60 focus:border-primary"
            />
          </div>

          <div className="pt-2">
            <Button className="bg-primary hover:bg-primary/90 shadow-sm">Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
