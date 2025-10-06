"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@supabase/ssr"
import { useToast } from "@/hooks/use-toast"
import { applyTheme, loadTenantTheme, type ThemeConfig } from "@/lib/theme"
import type { Profile } from "@/lib/types"

interface BrandingFormProps {
  profile: Profile
}

export function BrandingForm({ profile }: BrandingFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState<ThemeConfig>({
    brand_bg: "#232323",
    brand_primary: "#d1ecea",
    brand_accent: "#d1ecea",
    ai_name: "Ellie",
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    loadCurrentTheme()
  }, [])

  const loadCurrentTheme = async () => {
    if (profile.tenant_id) {
      const currentTheme = await loadTenantTheme(profile.tenant_id)
      setTheme(currentTheme)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from("tenants")
        .update({
          theme_config: theme,
        })
        .eq("id", profile.tenant_id)

      if (error) throw error

      // Apply theme immediately
      applyTheme(theme)

      toast({
        title: "Branding updated",
        description: "Your brand colors and settings have been saved.",
      })
    } catch (error) {
      console.error("Error updating branding:", error)
      toast({
        title: "Error",
        description: "Failed to update branding. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleColorChange = (field: keyof ThemeConfig, value: string) => {
    const newTheme = { ...theme, [field]: value }
    setTheme(newTheme)
    // Apply theme in real-time for preview
    applyTheme(newTheme)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="brand_primary">Primary Brand Color</Label>
        <div className="flex gap-2">
          <Input
            id="brand_primary"
            type="color"
            value={theme.brand_primary}
            onChange={(e) => handleColorChange("brand_primary", e.target.value)}
            className="w-16 h-10 p-1 border rounded"
          />
          <Input
            type="text"
            value={theme.brand_primary}
            onChange={(e) => handleColorChange("brand_primary", e.target.value)}
            placeholder="#d1ecea"
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand_accent">Accent Brand Color</Label>
        <div className="flex gap-2">
          <Input
            id="brand_accent"
            type="color"
            value={theme.brand_accent}
            onChange={(e) => handleColorChange("brand_accent", e.target.value)}
            className="w-16 h-10 p-1 border rounded"
          />
          <Input
            type="text"
            value={theme.brand_accent}
            onChange={(e) => handleColorChange("brand_accent", e.target.value)}
            placeholder="#d1ecea"
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand_bg">Background Brand Color</Label>
        <div className="flex gap-2">
          <Input
            id="brand_bg"
            type="color"
            value={theme.brand_bg}
            onChange={(e) => handleColorChange("brand_bg", e.target.value)}
            className="w-16 h-10 p-1 border rounded"
          />
          <Input
            type="text"
            value={theme.brand_bg}
            onChange={(e) => handleColorChange("brand_bg", e.target.value)}
            placeholder="#232323"
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ai_name">AI Assistant Name</Label>
        <Input
          id="ai_name"
          type="text"
          value={theme.ai_name}
          onChange={(e) => handleColorChange("ai_name", e.target.value)}
          placeholder="Ellie"
        />
        <p className="text-xs text-muted-foreground">
          What should users call your AI assistant? (e.g., "Ellie", "Assistant", your company name)
        </p>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Branding"}
      </Button>
    </form>
  )
}
