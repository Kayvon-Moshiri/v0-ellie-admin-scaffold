"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useTenant } from "@/lib/hooks/use-tenant"
import { ChevronDown, Building2, Settings, Loader2 } from "lucide-react"

export function TenantSwitcher() {
  const { currentTenant, availableTenants, switchTenant, loading } = useTenant()
  const [switching, setSwitching] = useState(false)

  const handleTenantSwitch = async (tenantId: string) => {
    if (tenantId === currentTenant?.id) return

    setSwitching(true)
    try {
      await switchTenant(tenantId)
    } catch (error) {
      console.error("Failed to switch tenant:", error)
    } finally {
      setSwitching(false)
    }
  }

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled className="bg-background/50">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="bg-background/50" disabled={switching}>
          {switching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Building2 className="h-4 w-4 mr-2" />}
          <span className="max-w-32 truncate">{currentTenant?.name || "Select Tenant"}</span>
          <ChevronDown className="ml-2 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Tenant</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {availableTenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => handleTenantSwitch(tenant.id)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">{tenant.name.charAt(0)}</span>
              </div>
              <span>{tenant.name}</span>
            </div>
            {currentTenant?.id === tenant.id && (
              <Badge variant="default" className="text-xs">
                Current
              </Badge>
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Manage Tenants
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
