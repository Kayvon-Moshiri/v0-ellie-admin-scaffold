"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Tenant } from "@/lib/types"

interface TenantContextType {
  currentTenant: Tenant | null
  availableTenants: Tenant[]
  switchTenant: (tenantId: string) => Promise<void>
  loading: boolean
  error: string | null
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({ children, initialTenant }: { children: ReactNode; initialTenant?: Tenant }) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(initialTenant || null)
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAvailableTenants()
  }, [])

  const loadAvailableTenants = async () => {
    try {
      const supabase = createClient()

      // Get current user's profile to find their tenant
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Get user's profile with tenant info
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(`
          *,
          tenant:tenants(*)
        `)
        .eq("id", user.id)
        .single()

      if (profileError) throw profileError

      if (profile?.tenant) {
        setAvailableTenants([profile.tenant])
        if (!currentTenant) {
          setCurrentTenant(profile.tenant)
        }
      }

      // In a real app, you might fetch multiple tenants the user has access to
      // For now, we'll just use the user's primary tenant
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tenants")
    } finally {
      setLoading(false)
    }
  }

  const switchTenant = async (tenantId: string) => {
    try {
      setLoading(true)
      const tenant = availableTenants.find((t) => t.id === tenantId)
      if (!tenant) throw new Error("Tenant not found")

      setCurrentTenant(tenant)

      // Store tenant preference in localStorage
      localStorage.setItem("selectedTenantId", tenantId)

      // Trigger page refresh to update all data
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch tenant")
    } finally {
      setLoading(false)
    }
  }

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        availableTenants,
        switchTenant,
        loading,
        error,
      }}
    >
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider")
  }
  return context
}
