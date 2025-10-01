"use server"

import { createServerClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/auth"
import { generateMagicLink } from "@/lib/auth/magic-links"
import { sendEmail } from "@/lib/email/send"
import { sendSms } from "@/lib/sms/send"
import { revalidatePath } from "next/cache"

interface InviteData {
  email?: string
  phone?: string
  role: string
  tier: string
  sendVia: string[]
  customMessage?: string
}

interface BulkInviteData {
  csvData: string
  defaultRole: string
  defaultTier: string
}

export async function sendInvite(data: InviteData) {
  const profile = await getUserProfile()
  const supabase = createServerClient()

  // Create invite record
  const { data: invite, error: inviteError } = await supabase
    .from("invites")
    .insert({
      tenant_id: profile.tenant_id,
      email: data.email,
      phone: data.phone,
      role: data.role,
      tier: data.tier,
      status: "sent",
      sent_via: data.sendVia,
    })
    .select()
    .single()

  if (inviteError) {
    throw new Error("Failed to create invite")
  }

  // Generate magic link
  const magicLink = await generateMagicLink(invite.token, {
    role: data.role,
    tier: data.tier,
    tenant_id: profile.tenant_id,
  })

  // Send via selected channels
  const promises = []

  if (data.sendVia.includes("email") && data.email) {
    promises.push(
      sendEmail({
        to: data.email,
        template: "invite",
        data: {
          role: data.role,
          tier: data.tier,
          tenant: profile.tenant?.name || "Network",
          magic_link: magicLink,
          custom_message: data.customMessage,
        },
        tenantId: profile.tenant_id, // Added tenantId for provider lookup
      }),
    )
  }

  if (data.sendVia.includes("sms") && data.phone) {
    promises.push(
      sendSms({
        to: data.phone,
        template: "invite",
        data: {
          role: data.role,
          tier: data.tier,
          tenant: profile.tenant?.name || "Network",
          magic_link: magicLink,
          custom_message: data.customMessage,
        },
        tenantId: profile.tenant_id, // Added tenantId for provider lookup
      }),
    )
  }

  await Promise.all(promises)
  revalidatePath("/dashboard/invites")
}

export async function saveDraftInvite(data: InviteData) {
  const profile = await getUserProfile()
  const supabase = createServerClient()

  const { error } = await supabase.from("invites").insert({
    tenant_id: profile.tenant_id,
    email: data.email,
    phone: data.phone,
    role: data.role,
    tier: data.tier,
    status: "draft",
    sent_via: data.sendVia,
  })

  if (error) {
    throw new Error("Failed to save draft")
  }

  revalidatePath("/dashboard/invites")
}

export async function getInvites() {
  const profile = await getUserProfile()
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("invites")
    .select("*")
    .eq("tenant_id", profile.tenant_id)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to fetch invites")
  }

  return data
}

export async function resendInvite(inviteId: string) {
  const profile = await getUserProfile()
  const supabase = createServerClient()

  const { data: invite, error } = await supabase
    .from("invites")
    .select("*")
    .eq("id", inviteId)
    .eq("tenant_id", profile.tenant_id)
    .single()

  if (error || !invite) {
    throw new Error("Invite not found")
  }

  // Generate new magic link
  const magicLink = await generateMagicLink(invite.token, {
    role: invite.role,
    tier: invite.tier,
    tenant_id: profile.tenant_id,
  })

  // Resend via original channels
  const promises = []

  if (invite.sent_via.includes("email") && invite.email) {
    promises.push(
      sendEmail({
        to: invite.email,
        template: "invite",
        data: {
          role: invite.role,
          tier: invite.tier,
          tenant: profile.tenant?.name || "Network",
          magic_link: magicLink,
        },
        tenantId: profile.tenant_id, // Added tenantId for provider lookup
      }),
    )
  }

  if (invite.sent_via.includes("sms") && invite.phone) {
    promises.push(
      sendSms({
        to: invite.phone,
        template: "invite",
        data: {
          role: invite.role,
          tier: invite.tier,
          tenant: profile.tenant?.name || "Network",
          magic_link: magicLink,
        },
        tenantId: profile.tenant_id, // Added tenantId for provider lookup
      }),
    )
  }

  await Promise.all(promises)
  revalidatePath("/dashboard/invites")
}

export async function deleteInvite(inviteId: string) {
  const profile = await getUserProfile()
  const supabase = createServerClient()

  const { error } = await supabase.from("invites").delete().eq("id", inviteId).eq("tenant_id", profile.tenant_id)

  if (error) {
    throw new Error("Failed to delete invite")
  }

  revalidatePath("/dashboard/invites")
}

export async function processBulkInvites(data: BulkInviteData) {
  const profile = await getUserProfile()
  const supabase = createServerClient()

  const lines = data.csvData.trim().split("\n")
  const headers = lines[0].split(",").map((h) => h.trim())
  const rows = lines.slice(1)

  const results = { success: 0, errors: [] as string[] }

  for (let i = 0; i < rows.length; i++) {
    try {
      const values = rows[i].split(",").map((v) => v.trim())
      const rowData: any = {}

      headers.forEach((header, index) => {
        rowData[header] = values[index] || ""
      })

      if (!rowData.email && !rowData.phone) {
        results.errors.push(`Row ${i + 2}: Missing email or phone`)
        continue
      }

      // Create invite
      const { data: invite, error: inviteError } = await supabase
        .from("invites")
        .insert({
          tenant_id: profile.tenant_id,
          email: rowData.email || null,
          phone: rowData.phone || null,
          role: rowData.role || data.defaultRole,
          tier: rowData.tier || data.defaultTier,
          status: "sent",
          sent_via: rowData.email ? ["email"] : ["sms"],
        })
        .select()
        .single()

      if (inviteError) {
        results.errors.push(`Row ${i + 2}: Failed to create invite`)
        continue
      }

      // Generate magic link and send
      const magicLink = await generateMagicLink(invite.token, {
        role: invite.role,
        tier: invite.tier,
        tenant_id: profile.tenant_id,
      })

      if (rowData.email) {
        await sendEmail({
          to: rowData.email,
          template: "invite",
          data: {
            role: invite.role,
            tier: invite.tier,
            tenant: profile.tenant?.name || "Network",
            magic_link: magicLink,
            custom_message: rowData.custom_message,
          },
          tenantId: profile.tenant_id, // Added tenantId for provider lookup
        })
      }

      if (rowData.phone) {
        await sendSms({
          to: rowData.phone,
          template: "invite",
          data: {
            role: invite.role,
            tier: invite.tier,
            tenant: profile.tenant?.name || "Network",
            magic_link: magicLink,
            custom_message: rowData.custom_message,
          },
          tenantId: profile.tenant_id, // Added tenantId for provider lookup
        })
      }

      results.success++
    } catch (error) {
      results.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  revalidatePath("/dashboard/invites")
  return results
}
