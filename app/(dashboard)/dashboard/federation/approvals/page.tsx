"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle, Clock, MessageSquare, Network, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { createBrowserClient } from "@/lib/supabase/client"
import { useTenant } from "@/lib/hooks/use-tenant"

interface CrossTenantRequest {
  id: string
  intro_id: string
  requester_tenant_id: string
  target_tenant_id: string
  requester_profile_id: string
  target_profile_id: string
  status: "pending_approval" | "approved" | "declined"
  created_at: string
  requester: {
    full_name: string
    email: string
    role: string
    membership_tier: string
  }
  target: {
    full_name: string
    email: string
    role: string
    membership_tier: string
  }
  intro: {
    context: string
  }
  requester_tenant: {
    name: string
    slug: string
  }
}

export default function FederationApprovalsPage() {
  const { tenant } = useTenant()
  const [requests, setRequests] = useState<CrossTenantRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<CrossTenantRequest | null>(null)
  const [declineReason, setDeclineReason] = useState("")
  const [processing, setProcessing] = useState(false)

  const supabase = createBrowserClient()

  useEffect(() => {
    loadApprovalRequests()
  }, [tenant])

  const loadApprovalRequests = async () => {
    if (!tenant) return

    setLoading(true)
    try {
      const { data: requestData } = await supabase
        .from("cross_tenant_intro_requests")
        .select(`
          *,
          intro:intros!inner(context),
          requester:profiles!cross_tenant_intro_requests_requester_profile_id_fkey(full_name, email, role, membership_tier),
          target:profiles!cross_tenant_intro_requests_target_profile_id_fkey(full_name, email, role, membership_tier),
          requester_tenant:tenants!cross_tenant_intro_requests_requester_tenant_id_fkey(name, slug)
        `)
        .eq("target_tenant_id", tenant.id)
        .order("created_at", { ascending: false })

      setRequests(requestData || [])
    } catch (error) {
      console.error("Error loading approval requests:", error)
      toast.error("Failed to load approval requests")
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (requestId: string, action: "approve" | "decline") => {
    setProcessing(true)
    try {
      const response = await fetch(`/api/federation/intro-approval/${requestId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: action === "decline" ? declineReason : undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${action} request`)
      }

      toast.success(`Request ${action}d successfully`)
      setSelectedRequest(null)
      setDeclineReason("")
      loadApprovalRequests()
    } catch (error) {
      console.error(`Error ${action}ing request:`, error)
      toast.error(`Failed to ${action} request`)
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "declined":
        return "bg-red-100 text-red-800"
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "declined":
        return <XCircle className="h-4 w-4" />
      case "pending_approval":
        return <Clock className="h-4 w-4" />
      default:
        return null
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "vip":
      case "plus":
        return "bg-primary/20 text-primary"
      case "member":
      case "core":
        return "bg-primary/20 text-primary"
      case "startup":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "pending_approval")
  const processedRequests = requests.filter((r) => r.status !== "pending_approval")

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
          <h1 className="font-serif text-4xl font-light tracking-tight text-foreground">Cross-Network Approvals</h1>
          <p className="text-base text-muted-foreground/90">
            Review and approve introduction requests from other networks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200/60 px-3 py-1">
            {pendingRequests.length} Pending
          </Badge>
        </div>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/30">
          <CardTitle className="flex items-center gap-2 font-serif text-2xl font-light">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <span>Pending Approvals</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-green-50 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-serif text-xl font-light mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground/80">No pending cross-network introduction requests to review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border border-amber-200/60 rounded-lg p-5 bg-amber-50/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-11 w-11 border border-border/60">
                        <AvatarFallback className="bg-muted/50 text-foreground/70 font-medium">
                          {request.requester.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">{request.requester.full_name}</div>
                        <div className="text-sm text-muted-foreground/80">from {request.requester_tenant.name}</div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="outline" className={getTierColor(request.requester.membership_tier)}>
                            {request.requester.membership_tier}
                          </Badge>
                          <Badge variant="outline" className="border-border/60">
                            {request.requester.role}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Network className="h-4 w-4 text-primary" />
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1.5 capitalize">{request.status.replace("_", " ")}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">
                      Wants introduction to: <span className="text-primary">{request.target.full_name}</span>
                    </div>
                    <div className="text-sm text-foreground/80 bg-white border border-border/60 p-4 rounded-lg leading-relaxed">
                      <strong className="text-foreground">Context:</strong> {request.intro.context}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproval(request.id, "approve")}
                      disabled={processing}
                      className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                      Approve
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setSelectedRequest(request)}
                          className="shadow-sm"
                        >
                          <XCircle className="h-4 w-4 mr-1.5" />
                          Decline
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="font-serif text-2xl font-light">
                            Decline Introduction Request
                          </DialogTitle>
                          <DialogDescription className="text-muted-foreground/90">
                            Decline the introduction request from {request.requester.full_name}
                            to {request.target.full_name}.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="decline-reason" className="text-sm font-medium">
                              Reason (Optional)
                            </Label>
                            <Textarea
                              id="decline-reason"
                              placeholder="Provide a reason for declining this request..."
                              value={declineReason}
                              onChange={(e) => setDeclineReason(e.target.value)}
                              className="border-border/60 focus:border-primary"
                            />
                          </div>

                          <div className="flex justify-end gap-3">
                            <Button
                              variant="outline"
                              onClick={() => setSelectedRequest(null)}
                              className="border-border/60"
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleApproval(request.id, "decline")}
                              disabled={processing}
                              className="shadow-sm"
                            >
                              {processing ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-2" />
                              )}
                              Decline Request
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <div className="text-xs text-muted-foreground/70 ml-auto">
                      Requested {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {processedRequests.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/60 bg-muted/30">
            <CardTitle className="flex items-center gap-2 font-serif text-2xl font-light">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <span>Recent Decisions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {processedRequests.slice(0, 10).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border border-border/60 rounded-lg hover:border-border transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-border/60">
                      <AvatarFallback className="text-xs bg-muted/50 text-foreground/70 font-medium">
                        {request.requester.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {request.requester.full_name} → {request.target.full_name}
                      </div>
                      <div className="text-xs text-muted-foreground/80">from {request.requester_tenant.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1.5 capitalize">{request.status}</span>
                    </Badge>
                    <div className="text-xs text-muted-foreground/70">
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <AlertTriangle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Approval Guidelines</h4>
              <div className="text-sm text-foreground/80 space-y-1.5 leading-relaxed">
                <p>• Review the context and ensure the introduction makes sense</p>
                <p>• Consider the target person's availability and preferences</p>
                <p>• Approve requests that add value to your network members</p>
                <p>• Decline spam, irrelevant, or low-quality requests</p>
                <p>• Provide feedback when declining to help improve future requests</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
