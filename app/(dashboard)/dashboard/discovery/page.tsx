"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Network, Users, Building2, Search, ExternalLink, MessageSquare, Filter, Globe, Clock } from "lucide-react"
import { toast } from "sonner"
import { createBrowserClient } from "@/lib/supabase/client"
import { useTenant } from "@/lib/hooks/use-tenant"

interface FederatedProfile {
  id: string
  tenant_id: string
  full_name: string
  role: string
  tier: string
  tags: string[]
  scarcity_score: number
  created_at: string
  is_federated: boolean
  source_network: string
}

interface FederatedCompany {
  id: string
  tenant_id: string
  name: string
  sector: string
  stage: string
  tags: string[]
  created_at: string
  is_federated: boolean
  source_network: string
}

export default function DiscoveryPage() {
  const { tenant } = useTenant()
  const [activeTab, setActiveTab] = useState("people")
  const [searchQuery, setSearchQuery] = useState("")
  const [profiles, setProfiles] = useState<FederatedProfile[]>([])
  const [companies, setCompanies] = useState<FederatedCompany[]>([])
  const [loading, setLoading] = useState(false)
  const [showIntroDialog, setShowIntroDialog] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<FederatedProfile | null>(null)
  const [introContext, setIntroContext] = useState("")
  const [submittingIntro, setSubmittingIntro] = useState(false)
  const [filters, setFilters] = useState({
    tier: "all",
    role: "all",
    stage: "all",
  })

  const supabase = createBrowserClient()

  useEffect(() => {
    loadDiscoveryData()
  }, [activeTab, searchQuery, filters])

  const loadDiscoveryData = async () => {
    if (!tenant) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        type: activeTab,
        search: searchQuery,
        limit: "50",
        offset: "0",
      })

      const response = await fetch(`/api/federation/discovery?${params}`)
      if (!response.ok) throw new Error("Failed to fetch discovery data")

      const result = await response.json()

      if (activeTab === "people") {
        let filteredProfiles = result.data
        if (filters.tier !== "all") {
          filteredProfiles = filteredProfiles.filter((p: FederatedProfile) => p.tier === filters.tier)
        }
        if (filters.role !== "all") {
          filteredProfiles = filteredProfiles.filter((p: FederatedProfile) => p.role === filters.role)
        }
        setProfiles(filteredProfiles)
      } else {
        let filteredCompanies = result.data
        if (filters.stage !== "all") {
          filteredCompanies = filteredCompanies.filter((c: FederatedCompany) => c.stage === filters.stage)
        }
        setCompanies(filteredCompanies)
      }
    } catch (error) {
      console.error("Error loading discovery data:", error)
      toast.error("Failed to load discovery data")
    } finally {
      setLoading(false)
    }
  }

  const handleIntroRequest = async () => {
    if (!selectedProfile || !introContext.trim()) return

    setSubmittingIntro(true)
    try {
      const response = await fetch("/api/federation/intro-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetProfileId: selectedProfile.id,
          context: introContext,
          requestType: "intro",
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please try again later.")
        } else {
          toast.error(result.error || "Failed to send introduction request")
        }
        return
      }

      if (result.requiresApproval) {
        toast.success("Cross-network introduction request sent for approval!")
      } else {
        toast.success("Introduction request sent!")
      }

      setShowIntroDialog(false)
      setSelectedProfile(null)
      setIntroContext("")
    } catch (error) {
      console.error("Error requesting intro:", error)
      toast.error("Failed to send introduction request")
    } finally {
      setSubmittingIntro(false)
    }
  }

  const openIntroDialog = (profile: FederatedProfile) => {
    setSelectedProfile(profile)
    setShowIntroDialog(true)
  }

  const getScarcityColor = (score: number) => {
    if (score > 0.7) return "bg-red-100 text-red-800"
    if (score > 0.4) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "vip":
        return "bg-primary/20 text-primary"
      case "member":
        return "bg-primary/20 text-primary"
      case "startup":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "seed":
        return "bg-green-100 text-green-800"
      case "series-a":
        return "bg-primary/20 text-primary"
      case "series-b":
        return "bg-primary/20 text-primary"
      case "growth":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif">Federated Discovery</h1>
          <p className="text-muted-foreground/80">Discover people and companies across connected networks</p>
        </div>
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-muted-foreground/60" />
          <span className="text-sm text-muted-foreground/80">Cross-network search</span>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                placeholder="Search across federated networks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground/60" />

              {activeTab === "people" && (
                <>
                  <Select
                    value={filters.tier}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, tier: value }))}
                  >
                    <SelectTrigger className="w-32 bg-background/50">
                      <SelectValue placeholder="Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.role}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger className="w-32 bg-background/50">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="scout">Scout</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}

              {activeTab === "companies" && (
                <Select
                  value={filters.stage}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, stage: value }))}
                >
                  <SelectTrigger className="w-32 bg-background/50">
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="seed">Seed</SelectItem>
                    <SelectItem value="series-a">Series A</SelectItem>
                    <SelectItem value="series-b">Series B</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discovery Results */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="people" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>People</span>
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Companies</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="people" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : profiles.length === 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Federated Profiles Found</h3>
                <p className="text-muted-foreground/80">Try adjusting your search or check your federation settings.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((profile) => (
                <Card key={profile.id} className="hover:shadow-md transition-shadow bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {profile.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{profile.full_name}</h3>
                          <p className="text-sm text-muted-foreground/80">{profile.source_network}</p>
                        </div>
                      </div>
                      <Network className="h-4 w-4 text-primary/60" />
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getTierColor(profile.tier)}>
                          {profile.tier}
                        </Badge>
                        <Badge variant="outline">{profile.role}</Badge>
                        <Badge variant="outline" className={getScarcityColor(profile.scarcity_score)}>
                          {(profile.scarcity_score * 100).toFixed(0)}% busy
                        </Badge>
                      </div>

                      {profile.tags && profile.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {profile.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {profile.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{profile.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => openIntroDialog(profile)} className="flex-1">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Request Intro
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : companies.length === 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-8 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Federated Companies Found</h3>
                <p className="text-muted-foreground/80">Try adjusting your search or check your federation settings.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((company) => (
                <Card key={company.id} className="hover:shadow-md transition-shadow bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{company.name}</h3>
                        <p className="text-sm text-muted-foreground/80">{company.source_network}</p>
                      </div>
                      <Network className="h-4 w-4 text-primary/60" />
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getStageColor(company.stage)}>
                          {company.stage}
                        </Badge>
                        {company.sector && <Badge variant="outline">{company.sector}</Badge>}
                      </div>

                      {company.tags && company.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {company.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {company.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{company.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Cross-Tenant Intro Request Dialog */}
      <Dialog open={showIntroDialog} onOpenChange={setShowIntroDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Cross-Network Introduction</DialogTitle>
            <DialogDescription>
              Request an introduction to {selectedProfile?.full_name} from {selectedProfile?.source_network}. This
              requires approval from their network administrators.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <Clock className="h-5 w-5 text-primary/60" />
              <div className="text-sm text-foreground/80">
                Cross-network introductions require approval and may take 24-48 hours to process.
              </div>
            </div>

            <div>
              <Label htmlFor="intro-context">Introduction Context</Label>
              <Textarea
                id="intro-context"
                placeholder="Explain why you'd like to be introduced and what you hope to discuss..."
                value={introContext}
                onChange={(e) => setIntroContext(e.target.value)}
                className="mt-1 bg-background/50"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowIntroDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleIntroRequest} disabled={!introContext.trim() || submittingIntro}>
                {submittingIntro ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <MessageSquare className="h-4 w-4 mr-2" />
                )}
                Send Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
