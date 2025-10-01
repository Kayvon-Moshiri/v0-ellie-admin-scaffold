import { createServerClient } from "@/lib/supabase/server"

interface CommsProvider {
  id: string
  provider_type: string
  provider_name: string
  credentials: Record<string, any>
  config: Record<string, any>
  status: string
  is_default: boolean
  is_enabled: boolean
}

export class ProviderManager {
  private supabase = createServerClient()

  async getDefaultProvider(tenantId: string, providerType: string): Promise<CommsProvider | null> {
    const { data, error } = await this.supabase
      .from("comms_providers")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("provider_type", providerType)
      .eq("is_default", true)
      .eq("is_enabled", true)
      .eq("status", "verified")
      .single()

    if (error) return null
    return data
  }

  async getAvailableProviders(tenantId: string, providerType: string): Promise<CommsProvider[]> {
    const { data, error } = await this.supabase
      .from("comms_providers")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("provider_type", providerType)
      .eq("is_enabled", true)
      .eq("status", "verified")
      .order("is_default", { ascending: false })

    if (error) return []
    return data || []
  }

  decryptCredentials(credentials: Record<string, any>): Record<string, any> {
    // In production, implement proper decryption
    const { _encrypted, ...decrypted } = credentials
    return decrypted
  }
}

export const providerManager = new ProviderManager()
