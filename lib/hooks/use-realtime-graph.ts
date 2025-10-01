"use client"

import { useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

interface RealtimeGraphOptions {
  onNewEngagement?: (event: any) => void
  onEdgeUpdate?: (edge: any) => void
}

export function useRealtimeGraph(tenantId: string, options: RealtimeGraphOptions = {}) {
  const supabase = createBrowserClient()

  useEffect(() => {
    const engagementChannel = supabase
      .channel(`engagement_events:${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "engagement_events",
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          console.log("[v0] New engagement event:", payload.new)
          options.onNewEngagement?.(payload.new)
        },
      )
      .subscribe()

    const edgeChannel = supabase
      .channel(`edges:${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "edges",
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          console.log("[v0] Edge update:", payload)
          options.onEdgeUpdate?.(payload.new || payload.old)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(engagementChannel)
      supabase.removeChannel(edgeChannel)
    }
  }, [tenantId, supabase, options])
}
