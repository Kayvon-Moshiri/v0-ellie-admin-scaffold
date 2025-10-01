"use server"

import { createClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/auth"

export async function createActivity(
  activityType: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, any>,
) {
  try {
    const supabase = await createClient()
    const profile = await getUserProfile()

    const { data, error } = await supabase
      .from("activities")
      .insert({
        tenant_id: profile.tenant_id,
        user_id: profile.id,
        activity_type: activityType,
        entity_type: entityType,
        entity_id: entityId,
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error creating activity:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create activity",
    }
  }
}

export async function getRecentActivities(limit = 10) {
  try {
    const supabase = await createClient()
    const profile = await getUserProfile()

    const { data, error } = await supabase
      .from("activities")
      .select(`
        *,
        user:profiles(display_name, full_name, avatar_url)
      `)
      .eq("tenant_id", profile.tenant_id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching activities:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch activities",
    }
  }
}
