"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Network, Plus, Check, X, Clock, Users, Building, Link2, Shield, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { createBrowserClient } from "@/lib/supabase/client"
import { useTenant } from "@/lib/hooks/use-tenant"

interface FederationConsent {
  id: string
  owner_tenant: string
  counterparty_tenant: string
  counterparty_name: string
  share_people: boolean
  share_edges: boolean
  share_companies: boolean
  status: "pending" | "active" | "revoked"
  created_at: string
}

interface Tenant {
  id: string
  name: string
  slug: string
  is_federated: boolean
}

export default function FederationPage() {
  const { tenant } = useTenant()
  const [consents, setConsents] = useState<FederationConsent[]>([])
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newRequest, setNewRequest] = useState({
    tenantSlug: "",
    sharePeople: true,
    shareEdges: false,
    shareCompanies: false,
  })

  const supabase = createBrowserClient()

  useEffect(() => {
    loadFederationData()
  }, [tenant])

  const loadFederationData = async () => {
    if (!tenant) return

    setLoading(true)
    try {
      // Load existing federation consents
      const { data: consentData } = await supabase
        .from("federation_consent")
        .select(`
          *,
          counterparty:tenants!federation_consent_counterparty_tenant_fkey(name)
        `)
        .or(`owner_tenant.eq.${tenant.id},counterparty_tenant.eq.${tenant.id}`)

      // Load available federated tenants
      const { data: tenantData } = await supabase
        .from("tenants")
        .select("id, name, slug, is_federated")
        .eq("is_federated", true)
        .neq("id", tenant.id)

      setConsents(
        consentData?.map((consent) => ({
          ...consent,
          counterparty_name: consent.counterparty?.name || "Unknown",
        })) || [],
      )
      setAvailableTenants(tenantData || [])
    } catch (error) {
      console.error("Error loading federation data:", error)
      toast.error("Failed to load federation data")
    } finally {
      setLoading(false)
    }
  }

  const createFederationRequest = async () => {
    if (!tenant || !newRequest.tenantSlug) return

    try {
      // Find target tenant by slug
      const targetTenant = availableTenants.find((t) => t.slug === newRequest.tenantSlug)
      if (!targetTenant) {
        toast.error("Tenant not found")
        return
      }

      // Create federation consent request
      const { error } = await supabase.from("federation_consent").insert({
        owner_tenant: tenant.id,
        counterparty_tenant: targetTenant.id,
        share_people: newRequest.sharePeople,
        share_edges: newRequest.shareEdges,
        share_companies: newRequest.shareCompanies,
        status: "pending",
      })

      if (error) throw error

      toast.success(`Federation request sent to ${targetTenant.name}`)
      setShowCreateDialog(false)
      setNewRequest({ tenantSlug: "", sharePeople: true, shareEdges: false, shareCompanies: false })
      loadFederationData()
    } catch (error) {
      console.error("Error creating federation request:", error)
      toast.error("Failed to create federation request")
    }
  }

  const respondToRequest = async (consentId: string, action: "accept" | "decline") => {
    try {
      if (action === "accept") {
        // Update status to active
        const { error } = await supabase.from("federation_consent").update({ status: "active" }).eq("id", consentId)

        if (error) throw error
        toast.success("Federation request accepted")
      } else {
        // Delete the request
        const { error } = await supabase.from("federation_consent").delete().eq("id", consentId)

        if (error) throw error
        toast.success("Federation request declined")
      }

      loadFederationData()
    } catch (error) {
      console.error("Error responding to request:", error)
      toast.error("Failed to respond to request")
    }
  }

  const revokeFederation = async (consentId: string) => {
    try {
      const { error } = await supabase.from("federation_consent").update({ status: "revoked" }).eq("id", consentId)

      if (error) throw error
      toast.success("Federation revoked")
      loadFederationData()
    } catch (error) {
      console.error("Error revoking federation:", error)
      toast.error("Failed to revoke federation")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "revoked":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Check className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "revoked":
        return <X className="h-4 w-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="font-serif text-4xl font-light tracking-tight text-foreground">Network Federation</h1>
          <p className="text-base text-muted-foreground/90">
            Connect with other tenant networks while preserving privacy
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-sm">
              <Plus className="h-4 w-4" />
              <span>Request Federation</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-light">Request Network Federation</DialogTitle>
              <DialogDescription className="text-muted-foreground/90">
                Send a federation request to another tenant network. Both parties must consent to share data.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="tenant-slug" className="text-sm font-medium">
                  Target Network Slug
                </Label>
                <Input
                  id="tenant-slug"
                  placeholder="e.g., acme-ventures"
                  value={newRequest.tenantSlug}
                  onChange={(e) => setNewRequest((prev) => ({ ...prev, tenantSlug: e.target.value }))}
                  className="border-border/60 focus:border-primary"
                />
              </div>

              <Separator className="bg-border/60" />

              <div className="space-y-4">
                <Label className="text-sm font-medium">Data Sharing Permissions</Label>

                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">People Directory</div>
                    <div className="text-sm text-muted-foreground/80">Share non-PII profile data</div>
                  </div>
                  <Switch
                    checked={newRequest.sharePeople}
                    onCheckedChange={(checked) => setNewRequest((prev) => ({ ...prev, sharePeople: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Network Connections</div>
                    <div className="text-sm text-muted-foreground/80">Share aggregated connection data</div>
                  </div>
                  <Switch
                    checked={newRequest.shareEdges}
                    onCheckedChange={(checked) => setNewRequest((prev) => ({ ...prev, shareEdges: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Company Directory</div>
                    <div className="text-sm text-muted-foreground/80">Share startup/company listings</div>
                  </div>
                  <Switch
                    checked={newRequest.shareCompanies}
                    onCheckedChange={(checked) => setNewRequest((prev) => ({ ...prev, shareCompanies: checked }))}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/10 rounded-lg">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-foreground/80">
                  Only non-PII data is shared. Email addresses and private information remain protected.
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-border/60">
                  Cancel
                </Button>
                <Button onClick={createFederationRequest} className="bg-primary hover:bg-primary/90 shadow-sm">
                  Send Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-50 rounded-lg">
                <Network className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-light">{consents.filter((c) => c.status === "active").length}</div>
                <div className="text-sm text-muted-foreground/80">Active Federations</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-light">{consents.filter((c) => c.status === "pending").length}</div>
                <div className="text-sm text-muted-foreground/80">Pending Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-light">{availableTenants.length}</div>
                <div className="text-sm text-muted-foreground/80">Available Networks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/30">
          <CardTitle className="font-serif text-2xl font-light">Federation Agreements</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {consents.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-muted/50 rounded-full mb-4">
                <Network className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <h3 className="font-serif text-xl font-light mb-2">No Federation Agreements</h3>
              <p className="text-muted-foreground/80 mb-6 max-w-md mx-auto">
                Start by requesting federation with another network to expand your reach.
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-primary hover:bg-primary/90 shadow-sm">
                Request Federation
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {consents.map((consent) => (
                <div
                  key={consent.id}
                  className="border border-border/60 rounded-lg p-5 hover:border-border transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-11 w-11 border border-border/60">
                        <AvatarFallback className="bg-muted/50 text-foreground/70 font-medium">
                          {consent.counterparty_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">{consent.counterparty_name}</div>
                        <div className="text-sm text-muted-foreground/80">
                          {consent.owner_tenant === tenant?.id ? "Outgoing Request" : "Incoming Request"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(consent.status)}>
                        {getStatusIcon(consent.status)}
                        <span className="ml-1.5 capitalize">{consent.status}</span>
                      </Badge>

                      {consent.status === "pending" && consent.counterparty_tenant === tenant?.id && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => respondToRequest(consent.id, "accept")}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => respondToRequest(consent.id, "decline")}
                            className="border-border/60"
                          >
                            Decline
                          </Button>
                        </div>
                      )}

                      {consent.status === "active" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" className="shadow-sm">
                              Revoke
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-serif text-2xl font-light">
                                Revoke Federation
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground/90">
                                This will immediately stop data sharing with {consent.counterparty_name}. This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-border/60">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => revokeFederation(consent.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Revoke Federation
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>

                  <Separator className="my-4 bg-border/60" />

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground/60" />
                      <span
                        className={consent.share_people ? "text-green-600 font-medium" : "text-muted-foreground/60"}
                      >
                        People {consent.share_people ? "✓" : "✗"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-muted-foreground/60" />
                      <span className={consent.share_edges ? "text-green-600 font-medium" : "text-muted-foreground/60"}>
                        Connections {consent.share_edges ? "✓" : "✗"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground/60" />
                      <span
                        className={consent.share_companies ? "text-green-600 font-medium" : "text-muted-foreground/60"}
                      >
                        Companies {consent.share_companies ? "✓" : "✗"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-amber-200/60 bg-amber-50/50 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
            </div>
            <div>
              <h4 className="font-medium text-amber-900 mb-1">Privacy & Security</h4>
              <p className="text-sm text-amber-800/90 leading-relaxed">
                Federation only shares non-personally identifiable information (non-PII). Email addresses, phone
                numbers, and private profile data remain protected within your tenant. You can revoke federation access
                at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
