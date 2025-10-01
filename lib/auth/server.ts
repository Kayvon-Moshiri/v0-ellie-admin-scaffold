import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function getUser() {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function requireAuth() {
  const user = await getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return user
}

export async function getCurrentProfile() {
  const supabase = await createServerClient()
  const user = await requireAuth()

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      *,
      tenant:tenants(*)
    `)
    .eq("user_id", user.id)
    .single()

  if (error || !profile) {
    throw new Error("Profile not found")
  }

  return profile
}

export async function signOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
