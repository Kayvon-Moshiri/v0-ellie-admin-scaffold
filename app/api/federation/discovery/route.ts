import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "people"
    const search = searchParams.get("search") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const supabase = createServerClient()

    // Get current user's profile for tenant context
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("tenant_id, role").eq("user_id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Get federated tenants where both sides have active consent
    const { data: federatedTenants } = await supabase
      .from("federation_consent")
      .select(`
        counterparty_tenant,
        share_people,
        share_companies,
        counterparty:tenants!federation_consent_counterparty_tenant_fkey(id, name, slug)
      `)
      .eq("owner_tenant", profile.tenant_id)
      .eq("status", "active")

    if (!federatedTenants || federatedTenants.length === 0) {
      return NextResponse.json({ data: [], total: 0 })
    }

    const allowedTenantIds = federatedTenants
      .filter((ft) => (type === "people" ? ft.share_people : ft.share_companies))
      .map((ft) => ft.counterparty_tenant)

    if (allowedTenantIds.length === 0) {
      return NextResponse.json({ data: [], total: 0 })
    }

    let data = []
    let total = 0

    if (type === "people") {
      let query = supabase
        .from("profiles")
        .select(`
          id,
          tenant_id,
          full_name,
          role,
          membership_tier,
          interests,
          activity_score,
          created_at,
          tenant:tenants!inner(name, slug)
        `)
        .in("tenant_id", allowedTenantIds)
        .range(offset, offset + limit - 1)

      if (search) {
        query = query.or(`full_name.ilike.%${search}%`)
      }

      const { data: profileData, count } = await query
      data = profileData || []
      total = count || 0
    } else if (type === "companies") {
      let query = supabase
        .from("startups")
        .select(`
          id,
          tenant_id,
          name,
          industry,
          stage,
          tags,
          created_at,
          tenant:tenants!inner(name, slug)
        `)
        .in("tenant_id", allowedTenantIds)
        .range(offset, offset + limit - 1)

      if (search) {
        query = query.or(`name.ilike.%${search}%,industry.ilike.%${search}%`)
      }

      const { data: companyData, count } = await query
      data = companyData || []
      total = count || 0
    }

    return NextResponse.json({
      data: data.map((item) => ({
        ...item,
        is_federated: true,
        source_network: item.tenant?.name || "Unknown Network",
      })),
      total,
    })
  } catch (error) {
    console.error("Error in federation discovery:", error)
    return NextResponse.json({ error: "Failed to fetch federated data" }, { status: 500 })
  }
}
