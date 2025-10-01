"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Mail, Sparkles } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const router = useRouter()

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    console.log("[v0] Starting magic link authentication for:", email)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          shouldCreateUser: true, // Explicitly allow new user creation
        },
      })

      console.log("[v0] Magic link response:", { error })

      if (error) {
        if (error.message.includes("Supabase not configured")) {
          console.log("[v0] Supabase not configured, redirecting to demo")
          router.push("/dashboard")
          return
        }
        throw error
      }
      setMagicLinkSent(true)
      console.log("[v0] Magic link sent successfully")
    } catch (error: unknown) {
      console.log("[v0] Magic link error:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoMode = () => {
    console.log("[v0] Entering demo mode")
    router.push("/dashboard")
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-semibold">Check your email</CardTitle>
              <CardDescription className="text-muted-foreground">
                We've sent a magic link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Click the link in your email to sign in to Ellie Admin. The link will expire in 1 hour.
                <br />
                <br />
                <strong>New user?</strong> No problem! The magic link will automatically create your account.
              </p>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  setMagicLinkSent(false)
                  setEmail("")
                }}
              >
                Use a different email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Ellie</h1>
          <p className="text-muted-foreground mt-2">Your AI-powered networking concierge admin console</p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Sign in or Sign up</CardTitle>
            <CardDescription>
              Enter your email to receive a magic link. New users will be automatically registered.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMagicLink}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {error}
                    <br />
                    <small className="text-muted-foreground">
                      Make sure your email is correct and check your spam folder.
                    </small>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Sending magic link...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send magic link
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full bg-transparent" onClick={handleDemoMode}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Continue with Demo Mode
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>By signing in, you agree to our terms of service and privacy policy.</p>
              <p className="mt-2 text-xs">
                Don't have an account? No worries! We'll create one for you automatically when you use the magic link.
              </p>
              <p className="mt-2 text-xs text-primary/70">
                Demo Mode: Experience Ellie with sample data - no account required.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
