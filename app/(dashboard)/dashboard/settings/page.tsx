import { Suspense } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChannelsSettings } from "@/components/settings/channels-settings"
import { GeneralSettings } from "@/components/settings/general-settings"
import { AdminSettings } from "@/components/settings/admin-settings"
import { Skeleton } from "@/components/ui/skeleton"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const profile = await getUser()

  if (!profile) {
    redirect("/auth/login")
  }

  const isAdmin = profile.role === "admin"

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-serif text-4xl font-light tracking-tight text-foreground">Settings</h1>
        <p className="text-base text-muted-foreground/90">
          Manage your platform configuration and communication channels.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50 border border-border/60">
          <TabsTrigger value="general" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            General
          </TabsTrigger>
          <TabsTrigger value="channels" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Channels
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Admin
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Suspense fallback={<SettingsSkeleton />}>
            <GeneralSettings />
          </Suspense>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <Suspense fallback={<SettingsSkeleton />}>
            <ChannelsSettings />
          </Suspense>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin" className="space-y-4">
            <Suspense fallback={<SettingsSkeleton />}>
              <AdminSettings />
            </Suspense>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  )
}
