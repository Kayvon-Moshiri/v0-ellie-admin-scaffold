import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/send"

interface RouteParams {
  params: {
    requestId: string
    action: "approve" | "decline"
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { requestId, action } = params
    const { reason } = await request.json()

    const supabase = createServerClient()

    // Get current user's profile
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: approverProfile } = await supabase
      .from("profiles")
      .select("id, tenant_id, full_name, email, role")
      .eq("user_id", user.id)
      .single()

    if (!approverProfile || approverProfile.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get the cross-tenant intro request
    const { data: crossTenantRequest } = await supabase
      .from("cross_tenant_intro_requests")
      .select(`
        *,
        intro:intros!inner(*),
        requester:profiles!cross_tenant_intro_requests_requester_profile_id_fkey(full_name, email),
        target:profiles!cross_tenant_intro_requests_target_profile_id_fkey(full_name, email)
      `)
      .eq("id", requestId)
      .eq("target_tenant_id", approverProfile.tenant_id)
      .eq("status", "pending_approval")
      .single()

    if (!crossTenantRequest) {
      return NextResponse.json({ error: "Request not found or already processed" }, { status: 404 })
    }

    if (action === "approve") {
      // Update cross-tenant request status
      const { error: updateError } = await supabase
        .from("cross_tenant_intro_requests")
        .update({
          status: "approved",
          approved_by: approverProfile.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", requestId)

      if (updateError) {
        console.error("Error updating request:", updateError)
        return NextResponse.json({ error: "Failed to approve request" }, { status: 500 })
      }

      // Update intro status to allow proceeding with double opt-in
      await supabase.from("intros").update({ status: "pre_consented" }).eq("id", crossTenantRequest.intro_id)

      // Notify requester of approval
      await sendEmail({
        to: crossTenantRequest.requester.email,
        subject: `Cross-Network Introduction Request Approved`,
        html: `
          <h2>Introduction Request Approved</h2>
          <p>Hello ${crossTenantRequest.requester.full_name},</p>
          <p>Your cross-network introduction request to <strong>${crossTenantRequest.target.full_name}</strong> has been approved!</p>
          <p>The introduction process will now proceed with the standard double opt-in flow.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pipeline" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Pipeline</a></p>
        `,
        tenantId: crossTenantRequest.requester_tenant_id,
      })

      return NextResponse.json({
        success: true,
        message: "Cross-tenant introduction request approved",
      })
    } else if (action === "decline") {
      // Update cross-tenant request status
      const { error: updateError } = await supabase
        .from("cross_tenant_intro_requests")
        .update({
          status: "declined",
          approved_by: approverProfile.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", requestId)

      if (updateError) {
        console.error("Error updating request:", updateError)
        return NextResponse.json({ error: "Failed to decline request" }, { status: 500 })
      }

      // Update intro status
      await supabase.from("intros").update({ status: "declined" }).eq("id", crossTenantRequest.intro_id)

      // Notify requester of decline
      await sendEmail({
        to: crossTenantRequest.requester.email,
        subject: `Cross-Network Introduction Request Declined`,
        html: `
          <h2>Introduction Request Declined</h2>
          <p>Hello ${crossTenantRequest.requester.full_name},</p>
          <p>Your cross-network introduction request to <strong>${crossTenantRequest.target.full_name}</strong> has been declined.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          <p>You may try reaching out through other channels or request different introductions.</p>
        `,
        tenantId: crossTenantRequest.requester_tenant_id,
      })

      return NextResponse.json({
        success: true,
        message: "Cross-tenant introduction request declined",
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in intro approval:", error)
    return NextResponse.json({ error: "Failed to process approval" }, { status: 500 })
  }
}
