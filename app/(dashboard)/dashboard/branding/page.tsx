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
        <h1 className="text-3xl font-serif font-bold tracking-tight">Branding</h1>
        <p className="text-muted-foreground/80">
          Customize your white-label experience with your own colors, logo, and AI assistant name.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/30 border-border/60 hover:border-primary/40 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              Brand Colors
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Choose colors that match your brand identity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BrandingForm profile={profile} />
          </CardContent>
        </Card>

        <Card className="bg-card/30 border-border/60 hover:border-primary/40 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              Logo Upload
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Upload your company logo (coming soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 border-2 border-dashed border-border/60 rounded-lg hover:border-primary/40 transition-colors">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
                <p className="text-sm text-muted-foreground/80">Logo upload coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/30 border-border/60 hover:border-primary/40 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Type className="h-5 w-5 text-primary" />
              </div>
              AI Assistant Name
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Customize what your users call the AI assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground/80">Configure through the brand colors form above</p>
          </CardContent>
        </Card>

        <Card className="bg-card/30 border-border/60 hover:border-primary/40 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              Preview
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              See how your branding looks in action
            </CardDescription>
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
