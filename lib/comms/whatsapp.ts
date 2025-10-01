import { TwilioProvider } from "@/lib/sms/twilio"
import { providerManager } from "./provider-manager"

interface WhatsAppMessage {
  to: string
  message: string
  tenantId: string
}

export async function sendWhatsApp(data: WhatsAppMessage) {
  const provider = await providerManager.getDefaultProvider(data.tenantId, "whatsapp_twilio")

  if (!provider) {
    throw new Error("No WhatsApp provider configured for tenant")
  }

  const credentials = providerManager.decryptCredentials(provider.credentials)
  const twilio = new TwilioProvider({
    accountSid: credentials.account_sid,
    authToken: credentials.auth_token,
    phoneNumber: credentials.phone_number,
  })

  await twilio.sendWhatsApp({
    to: data.to,
    body: data.message,
  })
}

export async function sendVoiceCall(tenantId: string, to: string, twimlUrl: string) {
  const provider = await providerManager.getDefaultProvider(tenantId, "voice_twilio")

  if (!provider) {
    throw new Error("No voice provider configured for tenant")
  }

  const credentials = providerManager.decryptCredentials(provider.credentials)
  const twilio = new TwilioProvider({
    accountSid: credentials.account_sid,
    authToken: credentials.auth_token,
    phoneNumber: credentials.phone_number,
  })

  await twilio.makeCall(to, twimlUrl)
}
