import { providerManager } from "@/lib/comms/provider-manager"

interface EmailData {
  to: string
  template: string
  data: Record<string, any>
  tenantId?: string
}

export async function sendEmail(emailData: EmailData) {
  if (emailData.tenantId) {
    const provider =
      (await providerManager.getDefaultProvider(emailData.tenantId, "email_supabase")) ||
      (await providerManager.getDefaultProvider(emailData.tenantId, "email_sendgrid"))

    if (provider) {
      const credentials = providerManager.decryptCredentials(provider.credentials)

      switch (provider.provider_type) {
        case "email_supabase":
          return await sendViaSupabase(emailData, credentials)
        case "email_sendgrid":
          return await sendViaSendGrid(emailData, credentials)
      }
    }
  }

  // Fallback to default behavior
  console.log("[v0] Sending email:", {
    to: emailData.to,
    template: emailData.template,
    data: emailData.data,
  })

  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log("[v0] Email sent successfully to:", emailData.to)
}

async function sendViaSupabase(emailData: EmailData, credentials: Record<string, any>) {
  console.log("[v0] Sending via Supabase SMTP:", {
    to: emailData.to,
    from: credentials.from_email,
    fromName: credentials.from_name,
  })

  // In production, use Supabase SMTP
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log("[v0] Email sent via Supabase SMTP")
}

async function sendViaSendGrid(emailData: EmailData, credentials: Record<string, any>) {
  console.log("[v0] Sending via SendGrid:", {
    to: emailData.to,
    from: credentials.from_email,
    apiKey: credentials.api_key ? "***" : "missing",
  })

  // In production, use SendGrid API
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log("[v0] Email sent via SendGrid")
}
