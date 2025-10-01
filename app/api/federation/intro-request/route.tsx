import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/send"

export async function POST(request: NextRequest) {
  try {
    const { targetProfileId, context, requestType = "intro" } = await request.json()

    const supabase = createServerClient()

    // Get current user's profile
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: requesterProfile } = await supabase
      .from("profiles")
      .select("id, tenant_id, full_name, email, role, tier")
      .eq("user_id", user.id)
      .single()

    if (!requesterProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Get target profile details
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("id, tenant_id, full_name, email, visibility, tier")
      .eq("id", targetProfileId)
      .single()

    if (!targetProfile) {
      return NextResponse.json({ error: "Target profile not found" }, { status: 404 })
    }

    const { data: weeklyLimitCheck } = await supabase.rpc("check_weekly_intro_limit", {
      p_profile_id: targetProfile.id,
    })

    if (!weeklyLimitCheck) {
      return NextResponse.json(
        {
          error: "Target has reached their weekly introduction limit. Request will be queued for digest.",
          routing: "digest",
        },
        { status: 429 },
      )
    }

    const { data: priorityData } = await supabase.rpc("compute_priority_score", {
      p_requester_id: requesterProfile.id,
      p_target_id: targetProfile.id,
    })

    const priorityScore = priorityData?.final_priority || 0

    const { data: routingDecision } = await supabase.rpc("determine_routing", {
      p_tenant_id: requesterProfile.tenant_id,
      p_target_id: targetProfile.id,
      p_priority_score: priorityScore,
      p_requester_tier: requesterProfile.tier,
    })

    // Check if this is a cross-tenant request
    const isCrossTenant = requesterProfile.tenant_id !== targetProfile.tenant_id

    if (isCrossTenant) {
      // Verify federation is active between tenants
      const { data: federationCheck } = await supabase.rpc("is_federation_active", {
        tenant_a: requesterProfile.tenant_id,
        tenant_b: targetProfile.tenant_id,
      })

      if (!federationCheck) {
        return NextResponse.json(
          {
            error: "Federation not active between these networks",
          },
          { status: 403 },
        )
      }

      // Check rate limits
      const { data: rateLimitCheck } = await supabase.rpc("check_cross_tenant_rate_limit", {
        p_requester_tenant_id: requesterProfile.tenant_id,
        p_target_tenant_id: targetProfile.tenant_id,
        p_requester_profile_id: requesterProfile.id,
        p_max_requests: 5,
        p_window_hours: 24,
      })

      if (!rateLimitCheck) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded. Please try again later.",
          },
          { status: 429 },
        )
      }

      // Check target profile visibility
      if (targetProfile.visibility !== "federated") {
        return NextResponse.json(
          {
            error: "Target profile is not available for federated introductions",
          },
          { status: 403 },
        )
      }
    }

    // Create the introduction request
    const { data: intro, error: introError } = await supabase
      .from("intros")
      .insert({
        tenant_id: requesterProfile.tenant_id,
        requester: requesterProfile.id,
        target: targetProfile.id,
        context,
        status: routingDecision === "blocked" ? "declined" : isCrossTenant ? "requested" : "requested",
        is_cross_tenant: isCrossTenant,
        target_tenant_id: targetProfile.tenant_id,
        requester_tenant_id: requesterProfile.tenant_id,
        computed_priority: priorityScore,
        priority_factors: priorityData,
        routing_decision: routingDecision,
      })
      .select()
      .single()

    if (introError) {
      console.error("Error creating intro:", introError)
      return NextResponse.json({ error: "Failed to create introduction request" }, { status: 500 })
    }

    if (routingDecision === "blocked") {
      return NextResponse.json({
        success: false,
        message: "Introduction request blocked due to low priority score",
        priorityScore,
        routing: "blocked",
      })
    }

    if (routingDecision === "digest") {
      // Add to digest queue instead of direct notification
      await supabase.from("digest_queue").insert({
        tenant_id: targetProfile.tenant_id,
        intro_id: intro.id,
        target_profile_id: targetProfile.id,
        priority_score: priorityScore,
      })

      return NextResponse.json({
        success: true,
        message: "Introduction request queued for digest delivery",
        priorityScore,
        routing: "digest",
        introId: intro.id,
      })
    }

    await supabase
      .from("profiles")
      .update({ current_week_intros: supabase.raw("current_week_intros + 1") })
      .eq("id", targetProfile.id)

    if (isCrossTenant) {
      // Create cross-tenant intro request for approval workflow
      const { error: crossTenantError } = await supabase.from("cross_tenant_intro_requests").insert({
        intro_id: intro.id,
        requester_tenant_id: requesterProfile.tenant_id,
        target_tenant_id: targetProfile.tenant_id,
        requester_profile_id: requesterProfile.id,
        target_profile_id: targetProfile.id,
        status: "pending_approval",
      })

      if (crossTenantError) {
        console.error("Error creating cross-tenant request:", crossTenantError)
        return NextResponse.json({ error: "Failed to create cross-tenant request" }, { status: 500 })
      }

      // Get target tenant admins for approval notification
      const { data: targetAdmins } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("tenant_id", targetProfile.tenant_id)
        .eq("role", "admin")

      // Send approval request emails to target tenant admins
      if (targetAdmins && targetAdmins.length > 0) {
        const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/federation/approvals`

        const emailPromises = targetAdmins.map((admin) =>
          sendEmail({
            to: admin.email,
            subject: `Cross-Network Introduction Request Approval Needed`,
            html: `
              <h2>Cross-Network Introduction Request</h2>
              <p>Hello ${admin.full_name},</p>
              <p><strong>${requesterProfile.full_name}</strong> from another network has requested an introduction to <strong>${targetProfile.full_name}</strong> in your network.</p>
              <p><strong>Context:</strong> ${context}</p>
              <p>Please review and approve this request:</p>
              <p><a href="${approvalUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Request</a></p>
              <p>This helps maintain privacy and control over cross-network introductions.</p>
            `,
            tenantId: targetProfile.tenant_id,
          }),
        )

        await Promise.all(emailPromises)
      }

      return NextResponse.json({
        success: true,
        message: "Cross-tenant introduction request sent for approval",
        requiresApproval: true,
        priorityScore,
        routing: "direct",
        introId: intro.id,
      })
    } else {
      // Same-tenant intro - proceed with normal flow
      return NextResponse.json({
        success: true,
        message: "Introduction request created",
        requiresApproval: false,
        priorityScore,
        routing: "direct",
        introId: intro.id,
      })
    }
  } catch (error) {
    console.error("Error in intro request:", error)
    return NextResponse.json({ error: "Failed to process introduction request" }, { status: 500 })
  }
}
