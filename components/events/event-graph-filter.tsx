"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Network, Users, Eye, EyeOff, Filter } from "lucide-react"
import Link from "next/link"
import { getEventAttendees } from "@/app/actions/events"

interface Event {
  id: string
  name: string
  starts_at: string
  ends_at: string
  location: string
  roster: any
}

interface Attendee {
  id: string
  full_name: string
  email: string
  tier: string
  role: string
  checked_in: boolean
}

export function EventGraphFilter({ event }: { event: Event }) {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [highlightAttendees, setHighlightAttendees] = useState(true)
  const [dimNonAttendees, setDimNonAttendees] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAttendees = async () => {
      try {
        const data = await getEventAttendees(event.id)
        setAttendees(data)
      } catch (error) {
        console.error("Failed to load attendees:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAttendees()
  }, [event.id])

  const checkedInCount = attendees.filter((a) => a.checked_in).length
  const tierCounts = attendees.reduce(
    (acc, attendee) => {
      acc[attendee.tier] = (acc[attendee.tier] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const roleCounts = attendees.reduce(
    (acc, attendee) => {
      acc[attendee.role] = (acc[attendee.role] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  if (loading) {
    return <div className="animate-pulse h-96 bg-muted rounded"></div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Graph Filters
          </CardTitle>
          <CardDescription>Control how event attendees appear in the network graph</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Highlight Attendees</label>
              <p className="text-xs text-muted-foreground">Make event attendees more prominent</p>
            </div>
            <Switch checked={highlightAttendees} onCheckedChange={setHighlightAttendees} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Dim Non-Attendees</label>
              <p className="text-xs text-muted-foreground">Reduce opacity of people not at event</p>
            </div>
            <Switch checked={dimNonAttendees} onCheckedChange={setDimNonAttendees} />
          </div>

          <div className="pt-2">
            <Button asChild className="w-full">
              <Link href={`/dashboard/graph?event=${event.id}&highlight=${highlightAttendees}&dim=${dimNonAttendees}`}>
                <Filter className="h-4 w-4 mr-2" />
                Apply to Graph View
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Event Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{attendees.length}</div>
              <div className="text-xs text-muted-foreground">Total Attendees</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{checkedInCount}</div>
              <div className="text-xs text-muted-foreground">Checked In</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-2">By Tier</h4>
              <div className="flex flex-wrap gap-1">
                {Object.entries(tierCounts).map(([tier, count]) => (
                  <Badge key={tier} variant="secondary" className="text-xs">
                    {tier.replace("tier_", "T")}: {count}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">By Role</h4>
              <div className="flex flex-wrap gap-1">
                {Object.entries(roleCounts).map(([role, count]) => (
                  <Badge key={role} variant="outline" className="text-xs">
                    {role}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" asChild>
            <Link href={`/dashboard/events/${event.id}?mode=live&kiosk=true`}>
              <Eye className="h-4 w-4 mr-2" />
              Kiosk Mode
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" asChild>
            <Link href={`/dashboard/events/${event.id}?mode=post`}>
              <EyeOff className="h-4 w-4 mr-2" />
              Post-Event
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
