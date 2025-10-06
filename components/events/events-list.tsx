"use client"

import { useState, useEffect } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MapPin, Play, Settings, BarChart3 } from "lucide-react"
import Link from "next/link"
import { getEvents } from "@/app/actions/events"

interface Event {
  id: string
  name: string
  starts_at: string
  ends_at: string
  location: string
  roster: any
  attendee_count?: number
  checkin_count?: number
}

export function EventsList() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getEvents()
        setEvents(data)
      } catch (error) {
        console.error("Failed to load events:", error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  if (loading) {
    return <div className="animate-pulse h-32 bg-muted rounded"></div>
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No events yet</h3>
        <p className="text-muted-foreground/80 mb-4">Create your first networking event to get started</p>
        <Button asChild>
          <Link href="/dashboard/events/new">Create Event</Link>
        </Button>
      </div>
    )
  }

  const getEventStatus = (event: Event) => {
    const now = new Date()
    const starts = new Date(event.starts_at)
    const ends = new Date(event.ends_at)

    if (now < starts) return { status: "upcoming", color: "secondary" }
    if (now >= starts && now <= ends) return { status: "live", color: "destructive" }
    return { status: "completed", color: "default" }
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const { status, color } = getEventStatus(event)

        return (
          <Card key={event.id} className="bg-card/50 border-border/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {event.name}
                    <Badge variant={color as any}>{status}</Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.starts_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {event.attendee_count || 0} attendees
                    </span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {status === "upcoming" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/events/${event.id}?mode=pre`}>
                        <Settings className="h-4 w-4 mr-2" />
                        Pre-Event
                      </Link>
                    </Button>
                  )}
                  {status === "live" && (
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/events/${event.id}?mode=live`}>
                        <Play className="h-4 w-4 mr-2" />
                        Live Mode
                      </Link>
                    </Button>
                  )}
                  {status === "completed" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/events/${event.id}?mode=post`}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Post-Event
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}
