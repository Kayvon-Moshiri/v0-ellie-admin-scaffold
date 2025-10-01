"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Mail,
  Phone,
  Briefcase,
  Building2,
} from "lucide-react"
import { toast } from "sonner"
import { createBrowserClient } from "@/lib/supabase/client"

interface WaitlistApplication {
  id: string
  full_name: string
  email: string
  phone?: string
  company?: string
  job_title?: string
  interests: string[]
  membership_tier?: string
  activity_score: number
  status: string
  created_at: string
  ai_recommendation?: "yes" | "no" | "maybe"
  ai_insights?: string
  recommended_tier?: string
  admin_notes?: string
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case "vip":
      return "bg-purple-100 text-purple-800"
    case "member":
      return "bg-blue-100 text-blue-800"
    case "startup":
      return "bg-orange-100 text-orange-800"
    case "guest":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getRecommendationColor = (recommendation: string) => {
  switch (recommendation) {
    case "yes":
      return "bg-green-100 text-green-800"
    case "no":
      return "bg-red-100 text-red-800"
    case "maybe":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getRecommendationIcon = (recommendation: string) => {
  switch (recommendation) {
    case "yes":
      return <ThumbsUp className="h-4 w-4" />
    case "no":
      return <ThumbsDown className="h-4 w-4" />
    case "maybe":
      return <AlertCircle className="h-4 w-4" />
    default:
      return null
  }
}

export function WaitlistReview() {
  const [applications, setApplications] = useState<WaitlistApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<WaitlistApplication | null>(null)
  const [selectedTier, setSelectedTier] = useState<string>("")
  const [adminNotes, setAdminNotes] = useState("")
  const [processing, setProcessing] = useState(false)

  const supabase = createBrowserClient()

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("status", ["pending_approval", "approved", "rejected", "scheduled_call"])
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Waitlist review error:", error)
        toast.error("Failed to load applications. The database may need to be updated.")
        setApplications([])
      } else {
        setApplications(data || [])
      }
    } catch (error) {
      console.error("[v0] Failed to load applications:", error)
      toast.error("Failed to load applications")
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (applicationId: string, tier: string, notes: string) => {
    setProcessing(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          status: "approved",
          membership_tier: tier,
          admin_notes: notes,
        })
        .eq("id", applicationId)

      if (error) throw error

      toast.success("Application approved successfully")
      setSelectedApplication(null)
      setSelectedTier("")
      setAdminNotes("")
      loadApplications()
    } catch (error) {
      console.error("Failed to approve application:", error)
      toast.error("Failed to approve application")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (applicationId: string, notes: string) => {
    setProcessing(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          status: "rejected",
          admin_notes: notes,
        })
        .eq("id", applicationId)

      if (error) throw error

      toast.success("Application rejected")
      setSelectedApplication(null)
      setAdminNotes("")
      loadApplications()
    } catch (error) {
      console.error("Failed to reject application:", error)
      toast.error("Failed to reject application")
    } finally {
      setProcessing(false)
    }
  }

  const handleScheduleCall = async (applicationId: string, notes: string) => {
    setProcessing(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          status: "scheduled_call",
          admin_notes: notes,
        })
        .eq("id", applicationId)

      if (error) throw error

      toast.success("Call scheduled - send calendar invite")
      setSelectedApplication(null)
      setAdminNotes("")
      loadApplications()
    } catch (error) {
      console.error("Failed to schedule call:", error)
      toast.error("Failed to schedule call")
    } finally {
      setProcessing(false)
    }
  }

  const openReviewDialog = (application: WaitlistApplication) => {
    setSelectedApplication(application)
    setSelectedTier(application.recommended_tier || "member")
    setAdminNotes(application.admin_notes || "")
  }

  const pendingApplications = applications.filter((a) => a.status === "pending_approval")
  const processedApplications = applications.filter((a) => a.status !== "pending_approval")

  if (loading) {
    return <div className="text-center py-8">Loading applications...</div>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Review
            {pendingApplications.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingApplications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="processed">Processed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingApplications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground">No pending applications to review.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>AI Recommendation</TableHead>
                    <TableHead>Activity Score</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{application.full_name}</div>
                            <div className="text-sm text-muted-foreground">{application.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {application.company && <div className="font-medium">{application.company}</div>}
                          {application.job_title && (
                            <div className="text-sm text-muted-foreground">{application.job_title}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {application.ai_recommendation && (
                          <div className="space-y-1">
                            <Badge variant="outline" className={getRecommendationColor(application.ai_recommendation)}>
                              {getRecommendationIcon(application.ai_recommendation)}
                              <span className="ml-1 capitalize">{application.ai_recommendation}</span>
                            </Badge>
                            {application.recommended_tier && (
                              <Badge variant="outline" className={getTierColor(application.recommended_tier)}>
                                {application.recommended_tier}
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="text-2xl font-bold">{application.activity_score}</div>
                          <div className="text-xs text-muted-foreground">/100</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(application.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => openReviewDialog(application)}>
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <User className="h-5 w-5" />
                                <span>Review: {application.full_name}</span>
                              </DialogTitle>
                              <DialogDescription>
                                Applied on {new Date(application.created_at).toLocaleDateString()}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                              {/* Profile Summary */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Profile Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium flex items-center space-x-2">
                                        <Mail className="h-4 w-4" />
                                        <span>Email</span>
                                      </Label>
                                      <p className="text-sm mt-1">{application.email}</p>
                                    </div>
                                    {application.phone && (
                                      <div>
                                        <Label className="text-sm font-medium flex items-center space-x-2">
                                          <Phone className="h-4 w-4" />
                                          <span>Phone</span>
                                        </Label>
                                        <p className="text-sm mt-1">{application.phone}</p>
                                      </div>
                                    )}
                                    {application.company && (
                                      <div>
                                        <Label className="text-sm font-medium flex items-center space-x-2">
                                          <Building2 className="h-4 w-4" />
                                          <span>Company</span>
                                        </Label>
                                        <p className="text-sm mt-1">{application.company}</p>
                                      </div>
                                    )}
                                    {application.job_title && (
                                      <div>
                                        <Label className="text-sm font-medium flex items-center space-x-2">
                                          <Briefcase className="h-4 w-4" />
                                          <span>Job Title</span>
                                        </Label>
                                        <p className="text-sm mt-1">{application.job_title}</p>
                                      </div>
                                    )}
                                  </div>
                                  {application.interests.length > 0 && (
                                    <div>
                                      <Label className="text-sm font-medium">Interests</Label>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {application.interests.map((interest, index) => (
                                          <Badge key={index} variant="secondary">
                                            {interest}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>

                              {/* AI Insights */}
                              {application.ai_insights && (
                                <Card className="border-blue-200 bg-blue-50">
                                  <CardHeader>
                                    <CardTitle className="text-lg flex items-center space-x-2">
                                      <Sparkles className="h-5 w-5 text-blue-600" />
                                      <span>AI Insights</span>
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-sm text-blue-900">{application.ai_insights}</p>
                                  </CardContent>
                                </Card>
                              )}

                              {/* AI Recommendation */}
                              {application.ai_recommendation && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">AI Recommendation</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex items-center space-x-4">
                                      <Badge
                                        variant="outline"
                                        className={`text-lg px-4 py-2 ${getRecommendationColor(application.ai_recommendation)}`}
                                      >
                                        {getRecommendationIcon(application.ai_recommendation)}
                                        <span className="ml-2 capitalize">{application.ai_recommendation}</span>
                                      </Badge>
                                      {application.recommended_tier && (
                                        <div>
                                          <Label className="text-sm font-medium">Suggested Tier</Label>
                                          <Badge
                                            variant="outline"
                                            className={`text-lg px-4 py-2 mt-1 ${getTierColor(application.recommended_tier)}`}
                                          >
                                            {application.recommended_tier}
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Admin Decision */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Admin Decision</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div>
                                    <Label htmlFor="tier-select" className="text-sm font-medium">
                                      Select Membership Tier (for approval)
                                    </Label>
                                    <Select value={selectedTier} onValueChange={setSelectedTier}>
                                      <SelectTrigger id="tier-select" className="mt-1">
                                        <SelectValue placeholder="Choose tier..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="vip">VIP</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="startup">Startup</SelectItem>
                                        <SelectItem value="guest">Guest</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label htmlFor="adminNotes" className="text-sm font-medium">
                                      Admin Notes
                                    </Label>
                                    <Textarea
                                      id="adminNotes"
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      placeholder="Add notes about your decision..."
                                      rows={3}
                                      className="mt-1"
                                    />
                                  </div>

                                  <div className="grid grid-cols-3 gap-2 pt-4">
                                    <Button
                                      onClick={() => handleApprove(application.id, selectedTier, adminNotes)}
                                      disabled={processing || !selectedTier}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      {processing ? "Approving..." : "Approve"}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => handleScheduleCall(application.id, adminNotes)}
                                      disabled={processing}
                                    >
                                      <Calendar className="h-4 w-4 mr-2" />
                                      {processing ? "Scheduling..." : "Schedule Call"}
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleReject(application.id, adminNotes)}
                                      disabled={processing}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      {processing ? "Rejecting..." : "Reject"}
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="processed" className="space-y-4">
          {processedApplications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No processed applications yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Applied</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.full_name}</div>
                          <div className="text-sm text-muted-foreground">{application.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{application.company || "—"}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            application.status === "approved"
                              ? "default"
                              : application.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                          className="capitalize"
                        >
                          {application.status === "scheduled_call" ? "Call Scheduled" : application.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {application.membership_tier && (
                          <Badge variant="outline" className={getTierColor(application.membership_tier)}>
                            {application.membership_tier}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(application.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
