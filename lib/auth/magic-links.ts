import { createServerClient } from "@/lib/supabase/server"

interface MagicLinkData {
  role: string
  tier: string
  tenant_id: string
}

export async function generateMagicLink(token: string, data: MagicLinkData): Promise<string> {
  // In a real implementation, this would create a secure magic link
  // that includes the invite token and metadata
  const baseUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || "http://localhost:3000"
  return `${baseUrl}/auth/accept-invite?token=${token}&role=${data.role}&tier=${data.tier}&tenant=${data.tenant_id}`
}

export async function validateMagicLink(token: string) {
  const supabase = createServerClient()

  const { data: invite, error } = await supabase
    .from("invites")
    .select("*")
    .eq("token", token)
    .eq("status", "sent")
    .single()

  if (error || !invite) {
    throw new Error("Invalid or expired invite")
  }

  // Check if invite is expired (7 days)
  const createdAt = new Date(invite.created_at)
  const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)

  if (new Date() > expiresAt) {
    // Mark as expired
    await supabase.from("invites").update({ status: "expired" }).eq("id", invite.id)

    throw new Error("Invite has expired")
  }

  return invite
}
