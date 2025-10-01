const DEMO_USER = {
  id: "demo-user",
  email: "demo@example.com",
  full_name: "Demo User",
}

const DEMO_PROFILE = {
  id: "demo-user",
  email: "demo@example.com",
  full_name: "Demo User",
  tenant_id: "00000000-0000-0000-0000-000000000001",
  tenant: {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Demo Organization",
    slug: "demo-org",
  },
}

export async function getUser() {
  // Always return demo user
  console.log("[v0] Returning demo user")
  return DEMO_USER
}

export async function requireAuth() {
  // Always return demo user, never redirect
  console.log("[v0] Auth required - returning demo user")
  return DEMO_USER
}

export async function getUserProfile() {
  // Always return demo profile
  console.log("[v0] Returning demo profile")
  return DEMO_PROFILE
}

export async function signOut() {
  // Do nothing for signout in demo mode
  console.log("[v0] Sign out called - ignoring in demo mode")
}
