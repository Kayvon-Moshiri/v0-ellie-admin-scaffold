"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export function useRealtimeSubscription<T>(table: string, filter?: string, initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    const setupSubscription = async () => {
      try {
        // Initial data fetch
        let query = supabase.from(table).select("*")

        if (filter) {
          // Parse filter string like "tenant_id=eq.123"
          const [column, operator, value] = filter.split(/[=.]/)
          if (operator === "eq") {
            query = query.eq(column, value)
          }
        }

        const { data: initialData, error: fetchError } = await query

        if (fetchError) throw fetchError

        setData(initialData || [])
        setLoading(false)

        // Set up real-time subscription
        channel = supabase
          .channel(`${table}_changes`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: table,
              filter: filter,
            },
            (payload) => {
              console.log("[v0] Real-time update received:", payload)

              if (payload.eventType === "INSERT") {
                setData((current) => [...current, payload.new as T])
              } else if (payload.eventType === "UPDATE") {
                setData((current) => current.map((item: any) => (item.id === payload.new.id ? payload.new : item)))
              } else if (payload.eventType === "DELETE") {
                setData((current) => current.filter((item: any) => item.id !== payload.old.id))
              }
            },
          )
          .subscribe()
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setLoading(false)
      }
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [table, filter])

  return { data, loading, error }
}

export function useRealtimeActivities(tenantId: string) {
  return useRealtimeSubscription("activities", `tenant_id=eq.${tenantId}`, [])
}

export function useRealtimeIntroductions(tenantId: string) {
  return useRealtimeSubscription("introductions", `tenant_id=eq.${tenantId}`, [])
}

export function useRealtimeConnections(tenantId: string) {
  return useRealtimeSubscription("connections", `tenant_id=eq.${tenantId}`, [])
}
