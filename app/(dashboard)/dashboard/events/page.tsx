import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Users, MapPin } from "lucide-react"
import Link from "next/link"
import { EventsList } from "@/components/events/events-list"

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Events</h1>
          <p className="text-muted-foreground/80">Manage networking events and capture connection moments</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events/new">
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground/80">Events this month</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground/80">Across all events</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections Made</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground/80">New connections this month</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
          <CardDescription>Manage pre-event matches, at-event check-ins, and post-event follow-ups</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="animate-pulse h-32 bg-muted rounded"></div>}>
            <EventsList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
