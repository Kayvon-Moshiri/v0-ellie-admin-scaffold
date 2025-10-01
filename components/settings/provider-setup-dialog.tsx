"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { createProvider, updateProvider } from "@/app/actions/comms-providers"
import { useToast } from "@/hooks/use-toast"

interface ProviderField {
  key: string
  label: string
  type: string
  required: boolean
}

interface ProviderConfig {
  name: string
  description: string
  icon: string
  fields: ProviderField[]
  disabled?: boolean
  tooltip?: string
}

interface CommsProvider {
  id: string
  provider_type: string
  provider_name: string
  status: string
  is_default: boolean
  is_enabled: boolean
  credentials: Record<string, any>
  config: Record<string, any>
}

interface ProviderSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  providerType: string
  providerConfig?: ProviderConfig
  existingProvider?: CommsProvider
  onSuccess: () => void
}

export function ProviderSetupDialog({
  open,
  onOpenChange,
  providerType,
  providerConfig,
  existingProvider,
  onSuccess,
}: ProviderSetupDialogProps) {
  const [formData, setFormData] = useState(() => {
    const initialData: Record<string, any> = {
      provider_name: existingProvider?.provider_name || providerConfig?.name || "",
      is_default: existingProvider?.is_default || false,
      is_enabled: existingProvider?.is_enabled !== false,
    }

    // Initialize field values from existing provider
    if (existingProvider && providerConfig) {
      providerConfig.fields.forEach((field) => {
        initialData[field.key] = existingProvider.credentials[field.key] || ""
      })
    }

    return initialData
  })

  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!providerConfig) return

    setLoading(true)
    try {
      // Separate credentials from config
      const credentials: Record<string, any> = {}
      const config: Record<string, any> = {}

      providerConfig.fields.forEach((field) => {
        credentials[field.key] = formData[field.key]
      })

      const providerData = {
        provider_type: providerType,
        provider_name: formData.provider_name,
        credentials,
        config,
        is_default: formData.is_default,
        is_enabled: formData.is_enabled,
      }

      if (existingProvider) {
        await updateProvider(existingProvider.id, providerData)
        toast({
          title: "Provider Updated",
          description: "Communication provider has been updated successfully",
        })
      } else {
        await createProvider(providerData)
        toast({
          title: "Provider Added",
          description: "Communication provider has been added successfully",
        })
      }

      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save provider configuration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  if (!providerConfig) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{providerConfig.icon}</span>
            {existingProvider ? "Configure" : "Add"} {providerConfig.name}
          </DialogTitle>
          <DialogDescription>
            {providerConfig.description}
            {providerConfig.tooltip && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                {providerConfig.tooltip}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider_name">Provider Name</Label>
            <Input
              id="provider_name"
              value={formData.provider_name}
              onChange={(e) => handleFieldChange("provider_name", e.target.value)}
              placeholder={`My ${providerConfig.name}`}
              required
            />
          </div>

          {providerConfig.fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={field.key}
                  value={formData[field.key] || ""}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  required={field.required}
                />
              ) : (
                <Input
                  id={field.key}
                  type={field.type}
                  value={formData[field.key] || ""}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  required={field.required}
                  placeholder={field.type === "password" ? "••••••••" : ""}
                />
              )}
            </div>
          ))}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_default"
                checked={formData.is_default}
                onCheckedChange={(checked) => handleFieldChange("is_default", checked)}
              />
              <Label htmlFor="is_default">Set as default provider</Label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_enabled"
                checked={formData.is_enabled}
                onCheckedChange={(checked) => handleFieldChange("is_enabled", checked)}
              />
              <Label htmlFor="is_enabled">Enable provider</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : existingProvider ? "Update" : "Add"} Provider
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
