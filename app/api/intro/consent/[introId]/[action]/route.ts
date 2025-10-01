import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

interface RouteParams {
  params: {
    introId: string
    action: "accept" | "decline"
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { introId, action } = params
    const supabase = createServerClient()

    // Get intro details
    const { data: intro, error: introError } = await supabase
      .from("intros")
      .select(`
        id,
        tenant_id,
        requester,
        target,
        context,
        requester:requester(full_name),
        target:target(full_name)
      `)
      .eq("id", introId)
      .single()

    if (introError || !intro) {
      return NextResponse.redirect(new URL("/intro/not-found", request.url))
    }

    if (action === "accept") {
      // Update intro status to pre_consented
      await supabase.from("intros").update({ status: "pre_consented" }).eq("id", introId)

      // Log engagement event
      await supabase.from("engagement_events").insert({
        tenant_id: intro.tenant_id,
        intro_id: introId,
        actor: intro.target,
        kind: "accept",
        payload: {
          action: "consent_accepted",
          timestamp: new Date().toISOString(),
        },
      })

      // Redirect to success page
      return NextResponse.redirect(new URL(`/intro/consent-accepted?intro=${introId}`, request.url))
    } else if (action === "decline") {
      // Update intro status to declined
      await supabase.from("intros").update({ status: "declined" }).eq("id", introId)

      // Log engagement event
      await supabase.from("engagement_events").insert({
        tenant_id: intro.tenant_id,
        intro_id: introId,
        actor: intro.target,
        kind: "decline",
        payload: {
          action: "consent_declined",
          timestamp: new Date().toISOString(),
        },
      })

      // Redirect to decline page
      return NextResponse.redirect(new URL(`/intro/consent-declined?intro=${introId}`, request.url))
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error handling consent:", error)
    return NextResponse.redirect(new URL("/intro/error", request.url))
  }
}
