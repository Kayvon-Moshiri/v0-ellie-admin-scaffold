import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Supabase environment variables not found, returning mock client")
    return {
      auth: {
        signInWithOtp: () =>
          Promise.resolve({ error: new Error("Supabase not configured. Please set up your Supabase integration.") }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
    } as any
  }

  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey)
}

export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Supabase environment variables not found, returning mock client")
    return {
      auth: {
        signInWithOtp: () =>
          Promise.resolve({ error: new Error("Supabase not configured. Please set up your Supabase integration.") }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
    } as any
  }

  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey)
}
