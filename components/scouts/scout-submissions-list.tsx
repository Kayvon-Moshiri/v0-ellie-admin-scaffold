"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExternalLink, Calendar, Star } from "lucide-react"
import { getScoutSubmissions } from "@/app/actions/scouts"

interface ScoutSubmission {
  id: string
  company_name: string
  company_website?: string
  sector: string
  stage: string
  raise_amount?: number
  status: string
  quality?: number
  admin_notes?: string
  created_at: string
  rated_at?: string
}

interface ScoutSubmissionsListProps {
  scoutId: string
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

export function ScoutSubmissionsList({ scoutId }: ScoutSubmissionsListProps) {
  const [submissions, setSubmissions] = useState<ScoutSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const data = await getScoutSubmissions(scoutId)
        setSubmissions(data)
      } catch (error) {
        console.error("Failed to load submissions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSubmissions()
  }, [scoutId])

  if (loading) {
    return <div className="text-center py-8">Loading submissions...</div>
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No submissions yet. Submit your first company above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Raise</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quality</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{submission.company_name}</div>
                    {submission.company_website && (
                      <a
                        href={submission.company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center"
                      >
                        Visit site <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{submission.sector}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{submission.stage}</Badge>
                </TableCell>
                <TableCell>{submission.raise_amount ? formatCurrency(submission.raise_amount / 100) : "—"}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(submission.status)} className="capitalize">
                    {submission.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  {submission.quality ? (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{submission.quality}/10</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
