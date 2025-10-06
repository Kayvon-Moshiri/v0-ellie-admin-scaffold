import { createBrowserClient } from "@supabase/ssr"

export interface ThemeConfig {
  brand_bg: string
  brand_primary: string
  brand_accent: string
  ai_name: string
}

export const defaultTheme: ThemeConfig = {
  brand_bg: "#232323",
  brand_primary: "#d1ecea",
  brand_accent: "#d1ecea",
  ai_name: "Ellie",
}

export function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement

  root.style.setProperty("--brand-bg", theme.brand_bg)
  root.style.setProperty("--brand-primary", theme.brand_primary)
  root.style.setProperty("--brand-accent", theme.brand_accent)

  // Update derived colors
  root.style.setProperty("--brand-primary-hover", `color-mix(in srgb, ${theme.brand_primary} 90%, white)`)
  root.style.setProperty("--brand-primary-light", `color-mix(in srgb, ${theme.brand_primary} 20%, white)`)
  root.style.setProperty("--brand-accent-hover", `color-mix(in srgb, ${theme.brand_accent} 90%, white)`)
  root.style.setProperty("--brand-accent-light", `color-mix(in srgb, ${theme.brand_accent} 20%, white)`)
}

export async function loadTenantTheme(tenantId: string) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data: tenant } = await supabase.from("tenants").select("theme_config").eq("id", tenantId).single()

  if (tenant?.theme_config) {
    applyTheme(tenant.theme_config as ThemeConfig)
    return tenant.theme_config as ThemeConfig
  }

  applyTheme(defaultTheme)
  return defaultTheme
}
