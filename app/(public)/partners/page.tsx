import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Building2, Users, Zap, Shield, Crown, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">E</span>
              </div>
              <span className="font-semibold text-lg">Ellie Admin</span>
            </div>
            <Link href="/auth/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            Partner Program
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
            Build the Future of
            <span className="text-primary"> AI-Powered Networking</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Join our partner ecosystem and help organizations transform their networking capabilities with white-label
            AI solutions that scale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              Become a Partner
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
              View Partner Portal
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Partner with Ellie Admin?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Unlock new revenue streams while delivering cutting-edge networking solutions to your clients
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Building2 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>White-Label Ready</CardTitle>
                <CardDescription>Complete branding customization with your logo, colors, and domain</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Custom branding & themes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Your domain & SSL
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Branded AI assistant
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Multi-Tenant Architecture</CardTitle>
                <CardDescription>Manage multiple client networks from a single platform</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Isolated client data
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Centralized management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Scalable infrastructure
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Revenue Opportunities</CardTitle>
                <CardDescription>Multiple monetization models to fit your business strategy</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Recurring revenue share
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Implementation fees
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Custom development
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Partner Types</h2>
            <p className="text-lg text-muted-foreground">Choose the partnership model that fits your business</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge>Most Popular</Badge>
              </div>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Solution Partner</CardTitle>
                <CardDescription className="text-base">
                  Resell and implement Ellie Admin for your clients with full white-label capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Perfect for:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Digital agencies</li>
                    <li>• Business consultants</li>
                    <li>• Technology integrators</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Benefits:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 30-50% revenue share</li>
                    <li>• Full white-label rights</li>
                    <li>• Technical support</li>
                    <li>• Sales & marketing materials</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Crown className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Enterprise Partner</CardTitle>
                <CardDescription className="text-base">
                  Large-scale deployments with custom development and dedicated support
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Perfect for:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• System integrators</li>
                    <li>• Enterprise software vendors</li>
                    <li>• Large consulting firms</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Benefits:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Custom revenue models</li>
                    <li>• Dedicated engineering</li>
                    <li>• Priority support</li>
                    <li>• Co-marketing opportunities</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join our growing network of partners and start building the future of AI-powered networking
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">E</span>
              </div>
              <span className="font-semibold">Ellie Admin</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/partners" className="hover:text-foreground">
                Partners
              </Link>
              <Link href="/auth/login" className="hover:text-foreground">
                Sign In
              </Link>
              <Link href="mailto:partners@ellie-admin.com" className="hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
