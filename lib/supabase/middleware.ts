import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.log("[v0] Supabase environment variables not found, skipping auth middleware")

      const isPublicPath =
        request.nextUrl.pathname.startsWith("/auth") ||
        request.nextUrl.pathname === "/" ||
        request.nextUrl.pathname.startsWith("/api")

      if (request.nextUrl.pathname === "/auth/login") {
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
      }

      return supabaseResponse
    }

    // With Fluid compute, don't put this client in a global environment
    // variable. Always create a new one on each request.
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    })

    console.log("[v0] Middleware checking auth for:", request.nextUrl.pathname)

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: If you remove getUser() and you use server-side rendering
    // with the Supabase client, your users may be randomly logged out.
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("[v0] Middleware user check result:", user ? "authenticated" : "not authenticated")

    const isPublicPath =
      request.nextUrl.pathname.startsWith("/auth") ||
      request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname.startsWith("/api")

    if (!user && !isPublicPath) {
      console.log("[v0] Redirecting to login from:", request.nextUrl.pathname)
      // no user, potentially respond by redirecting the user to the login page
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    console.log("[v0] Middleware allowing access to:", request.nextUrl.pathname)
    return supabaseResponse
  } catch (error) {
    console.log("[v0] Middleware error:", error)
    return supabaseResponse
  }
}
