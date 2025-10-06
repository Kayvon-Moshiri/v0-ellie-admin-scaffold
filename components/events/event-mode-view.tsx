"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Tablet, Monitor, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PreEventMatches } from "./pre-event-matches"
import { LiveEventKiosk } from "./live-event-kiosk"
import { PostEventNudges } from "./post-event-nudges"
import { EventGraphFilter } from "./event-graph-filter"

interface Event {
  id: string
  name: string
  starts_at: string
  ends_at: string
  location: string
  roster: any
}

interface EventModeViewProps {
  event: Event
  mode: "pre" | "live" | "post"
  isKioskMode: boolean
}

export function EventModeView({ event, mode, isKioskMode }: EventModeViewProps) {
  const [currentMode, setCurrentMode] = useState(mode)

  // If in kiosk mode, show only the live kiosk interface
  if (isKioskMode) {
    return (
      <div className="h-screen bg-background">
        <LiveEventKiosk event={event} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-serif tracking-tight">{event.name}</h1>
            <div className="flex items-center gap-4 text-muted-foreground/80 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(event.starts_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {event.location}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/events/${event.id}?kiosk=true`}>
              <Tablet className="h-4 w-4 mr-2" />
              Kiosk Mode
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/graph?event=${event.id}`}>
              <Monitor className="h-4 w-4 mr-2" />
              Graph View
            </Link>
          </Button>
        </div>
      </div>

      {/* Mode Tabs */}
      <Tabs value={currentMode} onValueChange={(value) => setCurrentMode(value as any)}>
        <TabsList className="grid w-full grid-cols-3 bg-muted/30">
          <TabsTrigger value="pre">Pre-Event</TabsTrigger>
          <TabsTrigger value="live">At-Event</TabsTrigger>
          <TabsTrigger value="post">Post-Event</TabsTrigger>
        </TabsList>

        <TabsContent value="pre" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PreEventMatches event={event} />
            </div>
            <div>
              <EventGraphFilter event={event} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="live" className="space-y-6">
          <LiveEventKiosk event={event} />
        </TabsContent>

        <TabsContent value="post" className="space-y-6">
          <PostEventNudges event={event} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
