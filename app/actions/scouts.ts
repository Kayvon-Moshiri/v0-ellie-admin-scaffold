"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getCurrentProfile } from "@/lib/auth/server"
import { revalidatePath } from "next/cache"

interface CompanySubmission {
  name: string
  website_url?: string
  description: string
  sector: string
  stage: string
  raise_amount?: number | null
  traction_links: Array<{
    type: string
    url: string
    description: string
  }>
  notes?: string
}

export async function submitCompany(data: CompanySubmission) {
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
    // First, create or find the company
    let companyId: string

    // Check if company already exists
    const { data: existingCompany } = await supabase
      .from("companies")
      .select("id")
      .eq("tenant_id", profile.tenant_id)
      .ilike("name", data.name)
      .single()

    if (existingCompany) {
      companyId = existingCompany.id
    } else {
      // Create new company
      const { data: newCompany, error: companyError } = await supabase
        .from("companies")
        .insert({
          tenant_id: profile.tenant_id,
          name: data.name,
          slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: data.description,
          website_url: data.website_url,
          industry: data.sector,
          stage: data.stage.toLowerCase().replace(/\s+/g, "-"),
          funding_amount: data.raise_amount,
          traction_links: data.traction_links,
        })
        .select("id")
        .single()

      if (companyError) throw companyError
      companyId = newCompany.id
    }

    // Create scout submission
    const { error: submissionError } = await supabase.from("scout_submissions").insert({
      tenant_id: profile.tenant_id,
      company_id: companyId,
      scout_id: profile.id,
      sector: data.sector,
      stage: data.stage,
      raise_amount: data.raise_amount,
      traction_links: data.traction_links,
      notes: data.notes,
      status: "pending",
    })

    if (submissionError) throw submissionError

    // Log engagement event
    await supabase.from("engagement_events").insert({
      tenant_id: profile.tenant_id,
      actor: profile.id,
      event_type: "submit_company",
      payload: {
        company_id: companyId,
        sector: data.sector,
        stage: data.stage,
      },
    })

    revalidatePath("/dashboard/scouts")
    return { success: true }
  } catch (error) {
    console.error("Error submitting company:", error)
    throw new Error("Failed to submit company")
  }
}

export async function getScoutSubmissions(scoutId: string) {
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

  const { data, error } = await supabase
    .from("scout_submissions")
    .select(`
      id,
      sector,
      stage,
      raise_amount,
      status,
      quality,
      admin_notes,
      created_at,
      rated_at,
      companies!inner(
        name,
        website_url
      )
    `)
    .eq("tenant_id", profile.tenant_id)
    .eq("scout_id", scoutId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching scout submissions:", error)
    throw new Error("Failed to fetch submissions")
  }

  // Transform the data to flatten company info
  return data.map((submission: any) => ({
    id: submission.id,
    company_name: submission.companies.name,
    company_website: submission.companies.website_url,
    sector: submission.sector,
    stage: submission.stage,
    raise_amount: submission.raise_amount,
    status: submission.status,
    quality: submission.quality,
    admin_notes: submission.admin_notes,
    created_at: submission.created_at,
    rated_at: submission.rated_at,
  }))
}
