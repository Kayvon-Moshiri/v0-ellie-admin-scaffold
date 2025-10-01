"use server"

import { createClient as createServerClient } from "@supabase/supabase-js"
import { getUserProfile } from "@/lib/auth"

export async function getHeatboardData() {
  try {
    const profile = await getUserProfile()

    if (!profile?.tenant_id) {
      throw new Error("Not authenticated")
    }

    // Use service role client to bypass RLS policies
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    const tenantId = profile.tenant_id
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const { data: peopleHeat, error: peopleError } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        membership_tier,
        activity_score,
        interests,
        last_active_at,
        company,
        job_title
      `)
      .eq("tenant_id", tenantId)
      .not("activity_score", "is", null)
      .order("activity_score", { ascending: false })
      .limit(20)

    if (peopleError) {
      console.error("[v0] Heatboard - People heat error:", peopleError)
      throw peopleError
    }

    // Fetch recent activities for trend calculation
    const { data: recentActivities, error: activitiesError } = await supabase
      .from("activities")
      .select("user_id, created_at, activity_type")
      .eq("tenant_id", tenantId)
      .gte("created_at", fourteenDaysAgo.toISOString())

    if (activitiesError) {
      console.error("[v0] Heatboard - Recent activities error:", activitiesError)
    }

    // Calculate trends for people
    const activityCounts = new Map<string, number>()
    recentActivities?.forEach((activity) => {
      const count = activityCounts.get(activity.user_id) || 0
      activityCounts.set(activity.user_id, count + 1)
    })

    const peopleWithTrends = peopleHeat?.map((person) => ({
      ...person,
      trend: activityCounts.get(person.id) || 0,
    }))

    const { data: startupHeat, error: startupError } = await supabase
      .from("startups")
      .select(`
        id,
        name,
        description,
        industry,
        stage,
        momentum_score,
        tags,
        logo_url,
        website_url,
        location,
        employee_count,
        funding_amount,
        created_at
      `)
      .eq("tenant_id", tenantId)
      .not("momentum_score", "is", null)
      .order("momentum_score", { ascending: false })
      .limit(20)

    if (startupError) {
      console.error("[v0] Heatboard - Startup heat error:", startupError)
      throw startupError
    }

    // Fetch startup activities for attribution
    const { data: startupActivities, error: startupActivitiesError } = await supabase
      .from("activities")
      .select(`
        id,
        user_id,
        activity_type,
        created_at,
        metadata,
        entity_id,
        profiles!activities_user_id_fkey(full_name)
      `)
      .eq("tenant_id", tenantId)
      .eq("entity_type", "startup")
      .gte("created_at", fourteenDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(100)

    if (startupActivitiesError) {
      console.error("[v0] Heatboard - Startup activities error:", startupActivitiesError)
    }

    // Group activities by startup
    const startupActivityMap = new Map<string, any[]>()
    startupActivities?.forEach((activity) => {
      if (activity.entity_id) {
        const activities = startupActivityMap.get(activity.entity_id) || []
        activities.push(activity)
        startupActivityMap.set(activity.entity_id, activities)
      }
    })

    const startupsWithAttribution = startupHeat?.map((startup) => {
      const activities = startupActivityMap.get(startup.id) || []
      const scouts = new Set(activities.map((a) => a.profiles?.full_name).filter(Boolean))

      return {
        ...startup,
        interest_score: activities.length,
        scout_attribution: Array.from(scouts).join(", ") || "No scouts",
      }
    })

    return {
      peopleHeat: peopleWithTrends || [],
      startupHeat: startupsWithAttribution || [],
    }
  } catch (error) {
    console.error("[v0] Heatboard error:", error)
    throw error
  }
}
