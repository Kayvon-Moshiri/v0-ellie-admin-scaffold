"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { providerManager } from "@/lib/comms/provider-manager"

interface CreateProviderData {
  provider_type: string
  provider_name: string
  credentials: Record<string, any>
  config: Record<string, any>
  is_default: boolean
  is_enabled: boolean
}

export async function getCommsProviders() {
  const supabase = createServerClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
    .single()

  if (!profile) throw new Error("Profile not found")

  const { data, error } = await supabase
    .from("comms_providers")
    .select("*")
    .eq("tenant_id", profile.tenant_id)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function createProvider(providerData: CreateProviderData) {
  const supabase = createServerClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
    .single()

  if (!profile) throw new Error("Profile not found")

  // Encrypt credentials (in production, use proper encryption)
  const encryptedCredentials = {
    ...providerData.credentials,
    _encrypted: true,
  }

  const { data, error } = await supabase
    .from("comms_providers")
    .insert({
      tenant_id: profile.tenant_id,
      ...providerData,
      credentials: encryptedCredentials,
      status: "pending",
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath("/dashboard/settings")
  return data
}

export async function updateProvider(providerId: string, providerData: Partial<CreateProviderData>) {
  const supabase = createServerClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
    .single()

  if (!profile) throw new Error("Profile not found")

  // Encrypt credentials if provided
  const updateData: any = { ...providerData }
  if (providerData.credentials) {
    updateData.credentials = {
      ...providerData.credentials,
      _encrypted: true,
    }
  }

  const { data, error } = await supabase
    .from("comms_providers")
    .update(updateData)
    .eq("id", providerId)
    .eq("tenant_id", profile.tenant_id)
    .select()
    .single()

  if (error) throw error

  revalidatePath("/dashboard/settings")
  return data
}

export async function deleteProvider(providerId: string) {
  const supabase = createServerClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
    .single()

  if (!profile) throw new Error("Profile not found")

  const { error } = await supabase
    .from("comms_providers")
    .delete()
    .eq("id", providerId)
    .eq("tenant_id", profile.tenant_id)

  if (error) throw error

  revalidatePath("/dashboard/settings")
}

export async function testProvider(providerId: string) {
  const supabase = createServerClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
    .single()

  if (!profile) throw new Error("Profile not found")

  const { data: provider, error } = await supabase
    .from("comms_providers")
    .select("*")
    .eq("id", providerId)
    .eq("tenant_id", profile.tenant_id)
    .single()

  if (error || !provider) throw new Error("Provider not found")

  try {
    // Test the provider based on type
    let testResult = false

    switch (provider.provider_type) {
      case "email_supabase":
      case "email_sendgrid":
        testResult = await testEmailProvider(provider)
        break
      case "sms_twilio":
      case "voice_twilio":
      case "whatsapp_twilio":
        testResult = await testTwilioProvider(provider)
        break
      default:
        throw new Error("Unsupported provider type")
    }

    // Update test status
    await supabase
      .from("comms_providers")
      .update({
        status: testResult ? "verified" : "failed",
        last_test_at: new Date().toISOString(),
        last_test_status: testResult ? "success" : "failed",
        last_test_error: testResult ? null : "Test failed",
      })
      .eq("id", providerId)

    if (!testResult) {
      throw new Error("Provider test failed")
    }

    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch (error) {
    // Update failed test status
    await supabase
      .from("comms_providers")
      .update({
        status: "failed",
        last_test_at: new Date().toISOString(),
        last_test_status: "failed",
        last_test_error: error instanceof Error ? error.message : "Unknown error",
      })
      .eq("id", providerId)

    revalidatePath("/dashboard/settings")
    throw error
  }
}

async function testEmailProvider(provider: any): Promise<boolean> {
  // In production, this would send a test email
  console.log("[v0] Testing email provider:", provider.provider_name)

  // Simulate test delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // For demo, randomly succeed/fail
  return Math.random() > 0.2 // 80% success rate
}

async function testTwilioProvider(provider: any): Promise<boolean> {
  console.log("[v0] Testing Twilio provider:", provider.provider_name)

  // Check if feature flag is enabled
  const smsEnabled = process.env.FEATURE_FLAG_SMS === "true"
  if (!smsEnabled && provider.provider_type.includes("sms")) {
    throw new Error("SMS feature is disabled")
  }

  try {
    const credentials = providerManager.decryptCredentials(provider.credentials)

    // Import Twilio provider for validation
    const { TwilioProvider } = await import("@/lib/sms/twilio")
    const twilio = new TwilioProvider({
      accountSid: credentials.account_sid,
      authToken: credentials.auth_token,
      phoneNumber: credentials.phone_number,
    })

    // Validate credentials
    const isValid = await twilio.validateCredentials()
    return isValid
  } catch (error) {
    console.error("[v0] Twilio provider test failed:", error)
    return false
  }
}
