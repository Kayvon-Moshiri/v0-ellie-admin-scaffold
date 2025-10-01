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
        return "bg-purple-100 text-purple-800"
      case "member":
      case "core":
        return "bg-blue-100 text-blue-800"
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cross-Network Approvals</h1>
          <p className="text-muted-foreground">Review and approve introduction requests from other networks</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            {pendingRequests.length} Pending
          </Badge>
        </div>
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span>Pending Approvals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">No pending cross-network introduction requests to review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 bg-yellow-50/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {request.requester.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{request.requester.full_name}</div>
                        <div className="text-sm text-muted-foreground">from {request.requester_tenant.name}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className={getTierColor(request.requester.membership_tier)}>
                            {request.requester.membership_tier}
                          </Badge>
                          <Badge variant="outline">{request.requester.role}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Network className="h-4 w-4 text-blue-500" />
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status.replace("_", " ")}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium mb-1">
                      Wants introduction to: <span className="text-primary">{request.target.full_name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground bg-white p-3 rounded border">
                      <strong>Context:</strong> {request.intro.context}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproval(request.id, "approve")}
                      disabled={processing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="destructive" onClick={() => setSelectedRequest(request)}>
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Decline Introduction Request</DialogTitle>
                          <DialogDescription>
                            Decline the introduction request from {request.requester.full_name}
                            to {request.target.full_name}.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="decline-reason">Reason (Optional)</Label>
                            <Textarea
                              id="decline-reason"
                              placeholder="Provide a reason for declining this request..."
                              value={declineReason}
                              onChange={(e) => setDeclineReason(e.target.value)}
                              className="mt-1"
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleApproval(request.id, "decline")}
                              disabled={processing}
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

                    <div className="text-xs text-muted-foreground ml-auto">
                      Requested {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Recent Decisions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {processedRequests.slice(0, 10).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {request.requester.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">
                        {request.requester.full_name} → {request.target.full_name}
                      </div>
                      <div className="text-xs text-muted-foreground">from {request.requester_tenant.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1 capitalize">{request.status}</span>
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guidelines */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Approval Guidelines</h4>
              <div className="text-sm text-blue-700 mt-1 space-y-1">
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
