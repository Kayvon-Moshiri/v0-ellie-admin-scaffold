import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/send"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { targetProfileId, digestType = "weekly" } = await request.json()

    const supabase = createServerClient()

    // Get current user's profile for tenant context
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id, id, role")
      .eq("user_id", user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get queued digest items for target
    const { data: digestItems } = await supabase
      .from("digest_queue")
      .select(`
        id,
        priority_score,
        queued_at,
        intro:intros!inner(
          id,
          context,
          computed_priority,
          priority_factors,
          requester:requester(full_name, email, tier),
          target:target(full_name, email)
        )
      `)
      .eq("target_profile_id", targetProfileId)
      .eq("status", "queued")
      .order("priority_score", { ascending: false })
      .limit(10)

    if (!digestItems || digestItems.length === 0) {
      return NextResponse.json({ message: "No digest items to send" })
    }

    // Get target profile for email
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", targetProfileId)
      .single()

    if (!targetProfile) {
      return NextResponse.json({ error: "Target profile not found" }, { status: 404 })
    }

    // Generate digest email content
    const digestHtml = `
      <h2>Your Weekly Introduction Digest</h2>
      <p>Hello ${targetProfile.full_name},</p>
      <p>Here are ${digestItems.length} introduction requests that were queued for your review:</p>
      
      ${digestItems
        .map(
          (item, index) => `
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937;">
            ${item.intro.requester.full_name} 
            <span style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px; color: #6b7280;">
              Priority: ${item.priority_score.toFixed(1)}
            </span>
          </h3>
          <p style="margin: 8px 0; color: #4b5563;">${item.intro.context}</p>
          <div style="margin-top: 12px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/intro/consent/${item.intro.id}/accept" 
               style="background: #10b981; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin-right: 8px;">
              Accept Introduction
            </a>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/intro/consent/${item.intro.id}/decline" 
               style="background: #6b7280; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">
              Decline
            </a>
          </div>
        </div>
      `,
        )
        .join("")}
      
      <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
        These requests were routed to your digest to help manage your introduction volume while ensuring you don't miss valuable connections.
      </p>
    `

    // Send digest email
    await sendEmail({
      to: targetProfile.email,
      subject: `Your Weekly Introduction Digest (${digestItems.length} requests)`,
      html: digestHtml,
      tenantId: profile.tenant_id,
    })

    // Mark digest items as sent
    await supabase
      .from("digest_queue")
      .update({
        status: "sent",
        digest_sent_at: new Date().toISOString(),
      })
      .in(
        "id",
        digestItems.map((item) => item.id),
      )

    return NextResponse.json({
      success: true,
      message: `Digest sent to ${targetProfile.full_name}`,
      itemCount: digestItems.length,
    })
  } catch (error) {
    console.error("Error generating digest:", error)
    return NextResponse.json({ error: "Failed to generate digest" }, { status: 500 })
  }
}
