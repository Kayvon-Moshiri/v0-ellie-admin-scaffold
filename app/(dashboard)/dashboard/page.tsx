import { getUserProfile } from "@/lib/auth"
import { NetworkGraphView } from "@/components/dashboard/network-graph-view"
import { DashboardStats } from "@/components/dashboard/stats"
import { RealtimeActivity } from "@/components/dashboard/real-time-activity"
import { WelcomeBanner } from "@/components/onboarding/welcome-banner"

export default async function DashboardPage() {
  const profile = await getUserProfile()

  return (
    <div className="space-y-6">
      <WelcomeBanner />

      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {profile.display_name || profile.full_name || "there"}
        </h1>
        <p className="text-muted-foreground">Here's what's happening in your network today.</p>
      </div>

      {/* Stats Overview */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Graph - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <NetworkGraphView />
        </div>

        <div className="lg:col-span-1">
          <RealtimeActivity tenantId={profile.tenant_id} />
        </div>
      </div>
    </div>
  )
}
