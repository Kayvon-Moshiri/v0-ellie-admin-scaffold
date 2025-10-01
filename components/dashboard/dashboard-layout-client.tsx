"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { TenantProvider } from "@/lib/hooks/use-tenant"
import { GlobalSearch } from "@/components/search/global-search"
import { SearchShortcuts } from "@/components/search/search-shortcuts"
import { Toaster } from "@/components/ui/toaster"

export function DashboardLayoutClient({
  children,
  profile,
}: {
  children: React.ReactNode
  profile: any
}) {
  const [searchOpen, setSearchOpen] = useState(false)

  console.log("[v0] Dashboard layout rendering with profile:", profile?.email)

  return (
    <TenantProvider initialTenant={profile.tenant}>
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <Suspense fallback={<div className="w-64 bg-card border-r" />}>
            <DashboardSidebar profile={profile} />
          </Suspense>
          <div className="flex-1 flex flex-col overflow-hidden">
            <Suspense fallback={<div className="h-16 bg-card border-b" />}>
              <DashboardHeader profile={profile} />
            </Suspense>
            <main className="flex-1 overflow-auto bg-muted/20 p-6">
              <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
                {children}
              </Suspense>
            </main>
          </div>
        </div>
        <Toaster />

        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
        <SearchShortcuts onOpenSearch={() => setSearchOpen(true)} />
      </div>
    </TenantProvider>
  )
}
