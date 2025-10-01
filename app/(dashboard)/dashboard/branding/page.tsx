import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BrandingForm } from "@/components/branding/branding-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, Upload, Type, Sparkles } from "lucide-react"

export default async function BrandingPage() {
  const profile = await getUser()

  if (!profile) {
    redirect("/auth/login")
  }

  if (profile.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Branding</h1>
        <p className="text-muted-foreground">
          Customize your white-label experience with your own colors, logo, and AI assistant name.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Brand Colors
            </CardTitle>
            <CardDescription>Choose colors that match your brand identity</CardDescription>
          </CardHeader>
          <CardContent>
            <BrandingForm profile={profile} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Logo Upload
            </CardTitle>
            <CardDescription>Upload your company logo (coming soon)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Logo upload coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              AI Assistant Name
            </CardTitle>
            <CardDescription>Customize what your users call the AI assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Configure through the brand colors form above</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Preview
            </CardTitle>
            <CardDescription>See how your branding looks in action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg brand-primary">
                <p className="text-sm font-medium">Primary Brand Color</p>
              </div>
              <div className="p-3 rounded-lg brand-accent">
                <p className="text-sm font-medium">Accent Brand Color</p>
              </div>
              <div className="p-3 rounded-lg brand-bg">
                <p className="text-sm font-medium">Background Brand Color</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
