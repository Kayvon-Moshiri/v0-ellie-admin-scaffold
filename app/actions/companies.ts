"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getCurrentProfile } from "@/lib/auth/server"
import { revalidatePath } from "next/cache"

export async function getCompanies(filter: "all" | "interested" | "trending", userId: string) {
  const profile = await getCurrentProfile()
  if (!profile) {
    throw new Error("Not authenticated")
  }

  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  let query = supabase
    .from("startups")
    .select(`
      id,
      name,
      description,
      industry,
      stage,
      funding_amount,
      employee_count,
      location,
      founded_year,
      momentum_score,
      website_url,
      tags,
      member_interests!left(
        id,
        member_id,
        interest_level
      ),
      scout_submissions!left(
        id,
        quality,
        notes,
        profiles!scout_id(
          display_name,
          full_name
        )
      )
    `)
    .eq("tenant_id", profile.tenant_id)

  // Apply filters
  switch (filter) {
    case "interested":
      query = query.not("member_interests", "is", null).eq("member_interests.member_id", userId)
      break
    case "trending":
      query = query.gte("momentum_score", 70).order("momentum_score", { ascending: false })
      break
    default:
      query = query.order("momentum_score", { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching companies:", error)
    throw new Error("Failed to fetch companies")
  }

  // Transform the data to include interest counts and user interest status
  return data.map((company: any) => ({
    id: company.id,
    name: company.name,
    description: company.description,
    industry: company.industry,
    stage: company.stage,
    funding_amount: company.funding_amount,
    employee_count: company.employee_count,
    location: company.location,
    founded_year: company.founded_year,
    momentum_score: company.momentum_score,
    website_url: company.website_url,
    tags: company.tags || [],
    traction_links: [], // Removed traction_links as it doesn't exist in startups table
    interest_count: company.member_interests?.length || 0,
    user_interested: company.member_interests?.some((interest: any) => interest.member_id === userId) || false,
    scout_submissions:
      company.scout_submissions?.map((submission: any) => ({
        scout_name: submission.profiles?.display_name || submission.profiles?.full_name || "Anonymous",
        quality: submission.quality,
        notes: submission.notes,
      })) || [],
  }))
}

export async function expressInterest(companyId: string) {
  const profile = await getCurrentProfile()
  if (!profile) {
    throw new Error("Not authenticated")
  }

  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  try {
    // Insert member interest
    const { error: interestError } = await supabase.from("member_interests").insert({
      tenant_id: profile.tenant_id,
      company_id: companyId,
      member_id: profile.id,
      interest_level: "interested",
    })

    if (interestError) throw interestError

    // Log engagement event
    await supabase.from("engagement_events").insert({
      tenant_id: profile.tenant_id,
      actor: profile.id,
      event_type: "express_interest",
      payload: {
        company_id: companyId,
      },
    })

    revalidatePath("/dashboard/startups")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error expressing interest:", error)
    throw new Error("Failed to express interest")
  }
}

export async function removeInterest(companyId: string) {
  const profile = await getCurrentProfile()
  if (!profile) {
    throw new Error("Not authenticated")
  }

  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  try {
    const { error } = await supabase
      .from("member_interests")
      .delete()
      .eq("tenant_id", profile.tenant_id)
      .eq("company_id", companyId)
      .eq("member_id", profile.id)

    if (error) throw error

    revalidatePath("/dashboard/startups")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error removing interest:", error)
    throw new Error("Failed to remove interest")
  }
}
