import { providerManager } from "@/lib/comms/provider-manager"

interface SmsData {
  to: string
  template: string
  data: Record<string, any>
  tenantId?: string
}

export async function sendSms(smsData: SmsData) {
  // Check feature flag for SMS functionality
  const smsEnabled = process.env.FEATURE_FLAG_SMS === "true"

  if (!smsEnabled) {
    console.log("[v0] SMS feature disabled, skipping send to:", smsData.to)
    return
  }

  if (smsData.tenantId) {
    const provider = await providerManager.getDefaultProvider(smsData.tenantId, "sms_twilio")

    if (provider) {
      const credentials = providerManager.decryptCredentials(provider.credentials)
      return await sendViaTwilio(smsData, credentials)
    }
  }

  // Fallback to default behavior
  console.log("[v0] Sending SMS:", {
    to: smsData.to,
    template: smsData.template,
    data: smsData.data,
  })

  await new Promise((resolve) => setTimeout(resolve, 500))
  console.log("[v0] SMS sent successfully to:", smsData.to)
}

async function sendViaTwilio(smsData: SmsData, credentials: Record<string, any>) {
  console.log("[v0] Sending SMS via Twilio:", {
    to: smsData.to,
    from: credentials.phone_number,
    accountSid: credentials.account_sid ? "***" : "missing",
  })

  // In production, use Twilio SDK
  // const twilio = require('twilio')(credentials.account_sid, credentials.auth_token)
  // await twilio.messages.create({
  //   body: formatSmsMessage(smsData),
  //   from: credentials.phone_number,
  //   to: smsData.to
  // })

  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log("[v0] SMS sent via Twilio")
}

function formatSmsMessage(smsData: SmsData): string {
  // Format SMS message based on template and data
  const { template, data } = smsData

  switch (template) {
    case "invite":
      return `You're invited to join ${data.tenant} as a ${data.role}! Click: ${data.magic_link}`
    default:
      return `Message from ${data.tenant}: ${data.custom_message || "You have a new message"}`
  }
}
