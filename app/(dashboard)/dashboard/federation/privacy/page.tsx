"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Shield, Clock, Users, AlertTriangle, Eye, EyeOff, Settings } from "lucide-react"
import { toast } from "sonner"
import { createBrowserClient } from "@/lib/supabase/client"
import { useTenant } from "@/lib/hooks/use-tenant"

interface RateLimitStatus {
  requester_tenant_id: string
  target_tenant_id: string
  requester_profile_id: string
  request_count: number
  window_start: string
  target_network_name: string
}

interface PrivacySettings {
  visibility: "private" | "members" | "federated"
  allow_cross_tenant_intros: boolean
  max_daily_intro_requests: number
  require_admin_approval: boolean
}

export default function FederationPrivacyPage() {
  const { tenant } = useTenant()
  const [loading, setLoading] = useState(true)
  const [rateLimits, setRateLimits] = useState<RateLimitStatus[]>([])
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    visibility: "members",
    allow_cross_tenant_intros: true,
    max_daily_intro_requests: 5,
    require_admin_approval: true,
  })
  const [saving, setSaving] = useState(false)

  const supabase = createBrowserClient()

  useEffect(() => {
    loadPrivacyData()
  }, [tenant])

  const loadPrivacyData = async () => {
    if (!tenant) return

    setLoading(true)
    try {
      // Load current user's profile settings
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("visibility").eq("user_id", user.id).single()

        if (profile) {
          setPrivacySettings((prev) => ({
            ...prev,
            visibility: profile.visibility || "members",
          }))
        }
      }

      // Load rate limit status
      const { data: rateLimitData } = await supabase
        .from("cross_tenant_rate_limits")
        .select(`
          *,
          target_tenant:tenants!cross_tenant_rate_limits_target_tenant_id_fkey(name)
        `)
        .eq("requester_tenant_id", tenant.id)

      setRateLimits(
        rateLimitData?.map((limit) => ({
          ...limit,
          target_network_name: limit.target_tenant?.name || "Unknown Network",
        })) || [],
      )
    } catch (error) {
      console.error("Error loading privacy data:", error)
      toast.error("Failed to load privacy settings")
    } finally {
      setLoading(false)
    }
  }

  const updatePrivacySettings = async () => {
    if (!tenant) return

    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Update user's profile visibility
      const { error } = await supabase
        .from("profiles")
        .update({ visibility: privacySettings.visibility })
        .eq("user_id", user.id)

      if (error) throw error

      toast.success("Privacy settings updated successfully")
    } catch (error) {
      console.error("Error updating privacy settings:", error)
      toast.error("Failed to update privacy settings")
    } finally {
      setSaving(false)
    }
  }

  const resetRateLimit = async (targetTenantId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single()

      if (!profile) throw new Error("Profile not found")

      const { error } = await supabase
        .from("cross_tenant_rate_limits")
        .update({
          request_count: 0,
          window_start: new Date().toISOString(),
        })
        .eq("requester_tenant_id", tenant.id)
        .eq("target_tenant_id", targetTenantId)
        .eq("requester_profile_id", profile.id)

      if (error) throw error

      toast.success("Rate limit reset successfully")
      loadPrivacyData()
    } catch (error) {
      console.error("Error resetting rate limit:", error)
      toast.error("Failed to reset rate limit")
    }
  }

  const getVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case "private":
        return "Only visible within your network. No federated access."
      case "members":
        return "Visible to your network members. Limited federated access."
      case "federated":
        return "Visible across federated networks. Full cross-network discovery."
      default:
        return ""
    }
  }

  const getRateLimitProgress = (count: number, max: number) => {
    return Math.min((count / max) * 100, 100)
  }

  const getRateLimitColor = (count: number, max: number) => {
    const percentage = (count / max) * 100
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 70) return "text-yellow-600"
    return "text-green-600"
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
          <h1 className="text-3xl font-bold">Privacy & Rate Limits</h1>
          <p className="text-muted-foreground">Manage your federation privacy settings and monitor rate limits</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="text-sm text-muted-foreground">Privacy Protected</span>
        </div>
      </div>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Profile Visibility</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="visibility-select">Visibility Level</Label>
            <Select
              value={privacySettings.visibility}
              onValueChange={(value: "private" | "members" | "federated") =>
                setPrivacySettings((prev) => ({ ...prev, visibility: value }))
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select visibility level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">
                  <div className="flex items-center space-x-2">
                    <EyeOff className="h-4 w-4" />
                    <span>Private</span>
                  </div>
                </SelectItem>
                <SelectItem value="members">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Members Only</span>
                  </div>
                </SelectItem>
                <SelectItem value="federated">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>Federated</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">{getVisibilityDescription(privacySettings.visibility)}</p>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="cross-tenant-intros">Allow Cross-Network Introductions</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users from other networks to request introductions to you
                </p>
              </div>
              <Switch
                id="cross-tenant-intros"
                checked={privacySettings.allow_cross_tenant_intros}
                onCheckedChange={(checked) =>
                  setPrivacySettings((prev) => ({ ...prev, allow_cross_tenant_intros: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="admin-approval">Require Admin Approval</Label>
                <p className="text-sm text-muted-foreground">All cross-network intro requests require admin approval</p>
              </div>
              <Switch
                id="admin-approval"
                checked={privacySettings.require_admin_approval}
                onCheckedChange={(checked) =>
                  setPrivacySettings((prev) => ({ ...prev, require_admin_approval: checked }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={updatePrivacySettings} disabled={saving}>
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Settings className="h-4 w-4 mr-2" />
              )}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Rate Limit Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rateLimits.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Rate Limits Active</h3>
              <p className="text-muted-foreground">You haven't made any cross-network introduction requests yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rateLimits.map((limit) => {
                const maxRequests = privacySettings.max_daily_intro_requests
                const progress = getRateLimitProgress(limit.request_count, maxRequests)
                const isNearLimit = limit.request_count >= maxRequests * 0.8

                return (
                  <div
                    key={`${limit.target_tenant_id}-${limit.requester_profile_id}`}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{limit.target_network_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Window started: {new Date(limit.window_start).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getRateLimitColor(limit.request_count, maxRequests)}`}>
                          {limit.request_count} / {maxRequests}
                        </div>
                        <div className="text-xs text-muted-foreground">requests</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Progress value={progress} className="h-2" />

                      <div className="flex items-center justify-between">
                        {isNearLimit && (
                          <div className="flex items-center space-x-1 text-yellow-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">Approaching limit</span>
                          </div>
                        )}

                        {limit.request_count >= maxRequests ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                Reset Limit
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reset Rate Limit</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will reset your rate limit for {limit.target_network_name} and start a new
                                  24-hour window. Use this sparingly to maintain good relationships with federated
                                  networks.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => resetRateLimit(limit.target_tenant_id)}>
                                  Reset Limit
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {maxRequests - limit.request_count} requests remaining
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Guidelines */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Privacy & Security Guidelines</h4>
              <div className="text-sm text-blue-700 mt-1 space-y-1">
                <p>• Only non-PII data is shared across federated networks</p>
                <p>• Email addresses and phone numbers remain private to your network</p>
                <p>• Rate limits prevent spam and maintain network quality</p>
                <p>• Admin approval ensures all cross-network activity is monitored</p>
                <p>• You can revoke federation access at any time</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
