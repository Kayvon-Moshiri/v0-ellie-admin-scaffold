"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getCurrentProfile } from "@/lib/auth/server"
import { revalidatePath } from "next/cache"

export async function getPendingSubmissions() {
  const profile = await getCurrentProfile()
  if (!profile || !["admin", "owner"].includes(profile.role)) {
    throw new Error("Not authorized")
  }

  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  const { data, error } = await supabase
    .from("scout_submissions")
    .select(`
      id,
      sector,
      stage,
      raise_amount,
      traction_links,
      notes,
      status,
      quality,
      admin_notes,
      created_at,
      rated_at,
      companies!inner(
        name,
        description,
        website_url
      ),
      profiles!scout_id(
        display_name,
        full_name,
        email
      )
    `)
    .eq("tenant_id", profile.tenant_id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching submissions:", error)
    throw new Error("Failed to fetch submissions")
  }

  // Transform the data
  return data.map((submission: any) => ({
    id: submission.id,
    company_name: submission.companies.name,
    company_description: submission.companies.description,
    company_website: submission.companies.website_url,
    sector: submission.sector,
    stage: submission.stage,
    raise_amount: submission.raise_amount,
    traction_links: submission.traction_links || [],
    notes: submission.notes,
    scout_name: submission.profiles?.display_name || submission.profiles?.full_name || "Anonymous",
    scout_email: submission.profiles?.email || "",
    status: submission.status,
    quality: submission.quality,
    admin_notes: submission.admin_notes,
    created_at: submission.created_at,
    rated_at: submission.rated_at,
  }))
}

export async function rateSubmission(
  submissionId: string,
  quality: number,
  status: "approved" | "rejected",
  adminNotes: string,
) {
  const profile = await getCurrentProfile()
  if (!profile || !["admin", "owner"].includes(profile.role)) {
    throw new Error("Not authorized")
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
      .from("scout_submissions")
      .update({
        quality,
        status,
        admin_notes: adminNotes,
        rated_by: profile.id,
        rated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", submissionId)
      .eq("tenant_id", profile.tenant_id)

    if (error) throw error

    // Log engagement event
    await supabase.from("engagement_events").insert({
      tenant_id: profile.tenant_id,
      actor: profile.id,
      event_type: "rate_submission",
      payload: {
        submission_id: submissionId,
        quality,
        status,
      },
    })

    revalidatePath("/dashboard/scouts")
    return { success: true }
  } catch (error) {
    console.error("Error rating submission:", error)
    throw new Error("Failed to rate submission")
  }
}
