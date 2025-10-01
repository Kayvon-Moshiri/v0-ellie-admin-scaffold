import type React from "react"
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = {
    id: "demo-user",
    email: "demo@example.com",
    full_name: "Demo User",
    tenant: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Demo Organization",
      slug: "demo-org",
    },
  }

  console.log("[v0] Dashboard layout rendering with demo profile:", profile.email)

  return <DashboardLayoutClient profile={profile}>{children}</DashboardLayoutClient>
}
