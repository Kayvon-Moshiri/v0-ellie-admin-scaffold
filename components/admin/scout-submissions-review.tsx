"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Star, ExternalLink, Calendar, User, Building2, CheckCircle, XCircle, Clock } from "lucide-react"
import { getPendingSubmissions, rateSubmission } from "@/app/actions/admin"

interface PendingSubmission {
  id: string
  company_name: string
  company_description: string
  company_website?: string
  sector: string
  stage: string
  raise_amount?: number
  traction_links: Array<{
    type: string
    url: string
    description: string
  }>
  notes?: string
  scout_name: string
  scout_email: string
  created_at: string
  status: string
  quality?: number
  admin_notes?: string
}

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  }
  return `$${amount}`
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "default"
    case "rejected":
      return "destructive"
    case "needs_review":
      return "secondary"
    default:
      return "outline"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return CheckCircle
    case "rejected":
      return XCircle
    default:
      return Clock
  }
}

export function ScoutSubmissionsReview() {
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<PendingSubmission | null>(null)
  const [rating, setRating] = useState(0)
  const [adminNotes, setAdminNotes] = useState("")
  const [isRating, setIsRating] = useState(false)

  const loadSubmissions = async () => {
    try {
      const data = await getPendingSubmissions()
      setSubmissions(data)
    } catch (error) {
      console.error("Failed to load submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubmissions()
  }, [])

  const handleRate = async (submissionId: string, quality: number, status: "approved" | "rejected", notes: string) => {
    setIsRating(true)
    try {
      await rateSubmission(submissionId, quality, status, notes)
      await loadSubmissions() // Refresh the list
      setSelectedSubmission(null)
      setRating(0)
      setAdminNotes("")
    } catch (error) {
      console.error("Failed to rate submission:", error)
    } finally {
      setIsRating(false)
    }
  }

  const openReviewDialog = (submission: PendingSubmission) => {
    setSelectedSubmission(submission)
    setRating(submission.quality || 0)
    setAdminNotes(submission.admin_notes || "")
  }

  const pendingSubmissions = submissions.filter((s) => s.status === "pending")
  const reviewedSubmissions = submissions.filter((s) => s.status !== "pending")

  if (loading) {
    return <div className="text-center py-8">Loading submissions...</div>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Review
            {pendingSubmissions.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingSubmissions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingSubmissions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No pending submissions to review.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Scout</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Raise</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{submission.company_name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {submission.company_description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">{submission.scout_name}</div>
                            <div className="text-xs text-muted-foreground">{submission.scout_email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{submission.sector}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{submission.stage}</Badge>
                      </TableCell>
                      <TableCell>
                        {submission.raise_amount ? formatCurrency(submission.raise_amount / 100) : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(submission.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => openReviewDialog(submission)}>
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <Building2 className="h-5 w-5" />
                                <span>Review: {submission.company_name}</span>
                              </DialogTitle>
                              <DialogDescription>
                                Submitted by {submission.scout_name} on{" "}
                                {new Date(submission.created_at).toLocaleDateString()}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                              {/* Company Details */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Company Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">Sector</Label>
                                      <p className="text-sm">{submission.sector}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Stage</Label>
                                      <p className="text-sm">{submission.stage}</p>
                                    </div>
                                    {submission.raise_amount && (
                                      <div>
                                        <Label className="text-sm font-medium">Raise Amount</Label>
                                        <p className="text-sm">{formatCurrency(submission.raise_amount / 100)}</p>
                                      </div>
                                    )}
                                    {submission.company_website && (
                                      <div>
                                        <Label className="text-sm font-medium">Website</Label>
                                        <a
                                          href={submission.company_website}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-primary hover:underline flex items-center"
                                        >
                                          Visit site <ExternalLink className="h-3 w-3 ml-1" />
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Description</Label>
                                    <p className="text-sm mt-1">{submission.company_description}</p>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Traction Links */}
                              {submission.traction_links.length > 0 && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Traction Links</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-2">
                                      {submission.traction_links.map((link, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between p-3 border rounded"
                                        >
                                          <div className="flex items-center space-x-3">
                                            <Badge variant="outline">{link.type}</Badge>
                                            <span className="text-sm">{link.description || link.url}</span>
                                          </div>
                                          <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                          >
                                            <ExternalLink className="h-4 w-4" />
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Scout Notes */}
                              {submission.notes && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Scout Notes</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-sm">{submission.notes}</p>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Rating Section */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Admin Review</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-medium">Quality Rating (1-10)</Label>
                                    <div className="flex items-center space-x-2 mt-2">
                                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                        <button
                                          key={star}
                                          type="button"
                                          onClick={() => setRating(star)}
                                          className={`p-1 ${
                                            star <= rating ? "text-yellow-500" : "text-gray-300"
                                          } hover:text-yellow-400`}
                                        >
                                          <Star className="h-5 w-5 fill-current" />
                                        </button>
                                      ))}
                                      <span className="ml-2 text-sm font-medium">{rating}/10</span>
                                    </div>
                                  </div>

                                  <div>
                                    <Label htmlFor="adminNotes" className="text-sm font-medium">
                                      Admin Notes
                                    </Label>
                                    <Textarea
                                      id="adminNotes"
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      placeholder="Add notes about the submission quality, potential, concerns, etc."
                                      rows={3}
                                      className="mt-1"
                                    />
                                  </div>

                                  <div className="flex space-x-2 pt-4">
                                    <Button
                                      onClick={() => handleRate(submission.id, rating, "approved", adminNotes)}
                                      disabled={isRating || rating === 0}
                                      className="flex-1"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      {isRating ? "Approving..." : "Approve"}
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleRate(submission.id, rating, "rejected", adminNotes)}
                                      disabled={isRating || rating === 0}
                                      className="flex-1"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      {isRating ? "Rejecting..." : "Reject"}
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

        <TabsContent value="reviewed" className="space-y-4">
          {reviewedSubmissions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No reviewed submissions yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Scout</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewedSubmissions.map((submission) => {
                    const StatusIcon = getStatusIcon(submission.status)
                    return (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{submission.company_name}</div>
                            <div className="text-sm text-muted-foreground">{submission.sector}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{submission.scout_name}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(submission.status)} className="capitalize">
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {submission.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {submission.quality && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-medium">{submission.quality}/10</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(submission.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {submission.admin_notes && (
                            <Button variant="ghost" size="sm">
                              View Notes
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
