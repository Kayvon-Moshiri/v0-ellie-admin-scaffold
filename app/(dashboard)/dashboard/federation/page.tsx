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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Network Federation</h1>
          <p className="text-muted-foreground">Connect with other tenant networks while preserving privacy</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Request Federation</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Network Federation</DialogTitle>
              <DialogDescription>
                Send a federation request to another tenant network. Both parties must consent to share data.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tenant-slug">Target Network Slug</Label>
                <Input
                  id="tenant-slug"
                  placeholder="e.g., acme-ventures"
                  value={newRequest.tenantSlug}
                  onChange={(e) => setNewRequest((prev) => ({ ...prev, tenantSlug: e.target.value }))}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Data Sharing Permissions</Label>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">People Directory</div>
                    <div className="text-sm text-muted-foreground">Share non-PII profile data</div>
                  </div>
                  <Switch
                    checked={newRequest.sharePeople}
                    onCheckedChange={(checked) => setNewRequest((prev) => ({ ...prev, sharePeople: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Network Connections</div>
                    <div className="text-sm text-muted-foreground">Share aggregated connection data</div>
                  </div>
                  <Switch
                    checked={newRequest.shareEdges}
                    onCheckedChange={(checked) => setNewRequest((prev) => ({ ...prev, shareEdges: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Company Directory</div>
                    <div className="text-sm text-muted-foreground">Share startup/company listings</div>
                  </div>
                  <Switch
                    checked={newRequest.shareCompanies}
                    onCheckedChange={(checked) => setNewRequest((prev) => ({ ...prev, shareCompanies: checked }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <Shield className="h-4 w-4 text-blue-600" />
                <div className="text-sm text-blue-800">
                  Only non-PII data is shared. Email addresses and private information remain protected.
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createFederationRequest}>Send Request</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Federation Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Network className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{consents.filter((c) => c.status === "active").length}</div>
                <div className="text-sm text-muted-foreground">Active Federations</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{consents.filter((c) => c.status === "pending").length}</div>
                <div className="text-sm text-muted-foreground">Pending Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{availableTenants.length}</div>
                <div className="text-sm text-muted-foreground">Available Networks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Federation Consents */}
      <Card>
        <CardHeader>
          <CardTitle>Federation Agreements</CardTitle>
        </CardHeader>
        <CardContent>
          {consents.length === 0 ? (
            <div className="text-center py-8">
              <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Federation Agreements</h3>
              <p className="text-muted-foreground mb-4">
                Start by requesting federation with another network to expand your reach.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>Request Federation</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {consents.map((consent) => (
                <div key={consent.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {consent.counterparty_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{consent.counterparty_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {consent.owner_tenant === tenant?.id ? "Outgoing Request" : "Incoming Request"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(consent.status)}>
                        {getStatusIcon(consent.status)}
                        <span className="ml-1 capitalize">{consent.status}</span>
                      </Badge>

                      {consent.status === "pending" && consent.counterparty_tenant === tenant?.id && (
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => respondToRequest(consent.id, "accept")}>
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => respondToRequest(consent.id, "decline")}>
                            Decline
                          </Button>
                        </div>
                      )}

                      {consent.status === "active" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              Revoke
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke Federation</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will immediately stop data sharing with {consent.counterparty_name}. This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
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

                  <Separator className="my-3" />

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span className={consent.share_people ? "text-green-600" : "text-muted-foreground"}>
                        People {consent.share_people ? "✓" : "✗"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link2 className="h-4 w-4" />
                      <span className={consent.share_edges ? "text-green-600" : "text-muted-foreground"}>
                        Connections {consent.share_edges ? "✓" : "✗"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span className={consent.share_companies ? "text-green-600" : "text-muted-foreground"}>
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

      {/* Privacy Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Privacy & Security</h4>
              <p className="text-sm text-yellow-700 mt-1">
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
