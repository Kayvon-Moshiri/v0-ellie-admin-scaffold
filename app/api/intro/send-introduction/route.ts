import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/send"

export async function POST(request: NextRequest) {
  try {
    const { introId, requesterId, targetId, message, subject, context, timeSlots } = await request.json()

    const supabase = createServerClient()

    // Get current user's profile for tenant context
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("tenant_id, id").eq("user_id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Get requester and target details
    const { data: requester } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", requesterId)
      .single()

    const { data: target } = await supabase.from("profiles").select("full_name, email").eq("id", targetId).single()

    if (!requester || !target) {
      return NextResponse.json({ error: "Profiles not found" }, { status: 404 })
    }

    // Generate calendar link (placeholder - would integrate with actual calendar service)
    const calendarUrl = `${process.env.NEXT_PUBLIC_APP_URL}/calendar/schedule/${introId}`

    // Replace placeholder calendar link
    const finalMessage = message.replace(
      `[Schedule with ${target.full_name}]`,
      `[Schedule with ${target.full_name}](${calendarUrl})`,
    )

    // Send introduction email to both parties
    const emailPromises = [
      sendEmail({
        to: requester.email,
        subject,
        html: finalMessage.replace(/\n/g, "<br>"),
        tenantId: profile.tenant_id,
      }),
      sendEmail({
        to: target.email,
        subject,
        html: finalMessage.replace(/\n/g, "<br>"),
        tenantId: profile.tenant_id,
      }),
    ]

    await Promise.all(emailPromises)

    // Log engagement events for both parties
    const eventPromises = [
      supabase.from("engagement_events").insert({
        tenant_id: profile.tenant_id,
        intro_id: introId,
        actor: profile.id,
        kind: "reply",
        payload: {
          action: "introduction_sent",
          requester: requesterId,
          target: targetId,
          context,
          time_slots: timeSlots,
        },
      }),
    ]

    await Promise.all(eventPromises)

    // Update intro status
    await supabase
      .from("intros")
      .update({
        status: "scheduled",
        context: context, // Update with enhanced context if provided
      })
      .eq("id", introId)

    // Increment edge weight between requester and target
    await supabase.rpc("increment_edge", {
      p_source: requesterId,
      p_target: targetId,
      p_weight_inc: 1.0,
      p_kind: "intro",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending introduction:", error)
    return NextResponse.json({ error: "Failed to send introduction" }, { status: 500 })
  }
}
