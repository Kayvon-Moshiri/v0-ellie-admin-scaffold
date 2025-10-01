import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/send"
import { sendSms } from "@/lib/sms/send"

export async function POST(request: NextRequest) {
  try {
    const { introId, targetId, message, subject, sendViaSms, phone } = await request.json()

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

    // Get target profile details
    const { data: target } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", targetId)
      .single()

    if (!target) {
      return NextResponse.json({ error: "Target not found" }, { status: 404 })
    }

    // Generate consent links (these would be actual URLs in production)
    const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/intro/consent/${introId}/accept`
    const declineUrl = `${process.env.NEXT_PUBLIC_APP_URL}/intro/consent/${introId}/decline`

    // Replace placeholder links with actual URLs
    const finalMessage = message
      .replace("[Yes, I'm interested]", `[Yes, I'm interested](${acceptUrl})`)
      .replace("[Not right now]", `[Not right now](${declineUrl})`)

    // Send via SMS or Email
    if (sendViaSms && phone) {
      await sendSms({
        to: phone,
        message: finalMessage.replace(/\[([^\]]+)\]$$[^)]+$$/g, "$1"), // Remove markdown links for SMS
        tenantId: profile.tenant_id,
      })
    } else {
      await sendEmail({
        to: target.email,
        subject,
        html: finalMessage.replace(/\n/g, "<br>"),
        tenantId: profile.tenant_id,
      })
    }

    // Log engagement event
    await supabase.from("engagement_events").insert({
      tenant_id: profile.tenant_id,
      intro_id: introId,
      actor: profile.id,
      kind: "nudge",
      payload: {
        action: "consent_request_sent",
        method: sendViaSms ? "sms" : "email",
        target: targetId,
      },
    })

    // Update intro status
    await supabase.from("intros").update({ status: "pre_consented" }).eq("id", introId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending consent request:", error)
    return NextResponse.json({ error: "Failed to send consent request" }, { status: 500 })
  }
}
