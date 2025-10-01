"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, CheckCircle, X, Clock, Users, TrendingUp } from "lucide-react"

interface Event {
  id: string
  name: string
  starts_at: string
  ends_at: string
  location: string
}

interface EventMeeting {
  id: string
  person_a: {
    id: string
    full_name: string
    email: string
    role: string
  }
  person_b: {
    id: string
    full_name: string
    email: string
    role: string
  }
  meeting_type: "meet_now" | "swap_info" | "scheduled"
  created_at: string
}

interface EventNudge {
  id: string
  person_a: {
    id: string
    full_name: string
    email: string
    role: string
  }
  person_b: {
    id: string
    full_name: string
    email: string
    role: string
  }
  status: "pending" | "accepted" | "declined" | "expired"
  nudge_sent_at: string
  responded_at?: string
}

export function PostEventNudges({ event }: { event: Event }) {
  const [meetings, setMeetings] = useState<EventMeeting[]>([])
  const [nudges, setNudges] = useState<EventNudge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // TODO: Implement API calls to fetch meetings and nudges
        // const meetingsData = await getEventMeetings(event.id)
        // const nudgesData = await getEventNudges(event.id)

        // Mock data for now
        const mockMeetings: EventMeeting[] = [
          {
            id: "1",
            person_a: { id: "1", full_name: "Alice Johnson", email: "alice@example.com", role: "founder" },
            person_b: { id: "2", full_name: "Bob Smith", email: "bob@example.com", role: "investor" },
            meeting_type: "meet_now",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            person_a: { id: "3", full_name: "Carol Davis", email: "carol@example.com", role: "scout" },
            person_b: { id: "4", full_name: "David Wilson", email: "david@example.com", role: "founder" },
            meeting_type: "swap_info",
            created_at: new Date().toISOString(),
          },
        ]

        const mockNudges: EventNudge[] = [
          {
            id: "1",
            person_a: { id: "1", full_name: "Alice Johnson", email: "alice@example.com", role: "founder" },
            person_b: { id: "2", full_name: "Bob Smith", email: "bob@example.com", role: "investor" },
            status: "pending",
            nudge_sent_at: new Date().toISOString(),
          },
        ]

        setMeetings(mockMeetings)
        setNudges(mockNudges)
      } catch (error) {
        console.error("Failed to load post-event data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [event.id])

  const handleSendNudge = async (meeting: EventMeeting) => {
    try {
      // TODO: Implement nudge sending
      console.log("Sending nudge for meeting:", meeting)

      // Add to nudges list
      const newNudge: EventNudge = {
        id: `nudge-${meeting.id}`,
        person_a: meeting.person_a,
        person_b: meeting.person_b,
        status: "pending",
        nudge_sent_at: new Date().toISOString(),
      }

      setNudges((prev) => [...prev, newNudge])
    } catch (error) {
      console.error("Failed to send nudge:", error)
    }
  }

  const handleNudgeResponse = async (nudgeId: string, response: "accepted" | "declined") => {
    try {
      // TODO: Implement nudge response handling
      console.log("Nudge response:", nudgeId, response)

      setNudges((prev) =>
        prev.map((nudge) =>
          nudge.id === nudgeId ? { ...nudge, status: response, responded_at: new Date().toISOString() } : nudge,
        ),
      )
    } catch (error) {
      console.error("Failed to handle nudge response:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "accepted":
        return <CheckCircle className="h-4 w-4" />
      case "declined":
        return <X className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "accepted":
        return "default"
      case "declined":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return <div className="animate-pulse h-96 bg-muted rounded"></div>
  }

  const pendingNudges = nudges.filter((n) => n.status === "pending")
  const respondedNudges = nudges.filter((n) => n.status !== "pending")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Post-Event Follow-ups</h2>
          <p className="text-muted-foreground">Convert event connections into formal introductions</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">
            <Users className="h-3 w-3 mr-1" />
            {meetings.length} Meetings
          </Badge>
          <Badge variant="secondary">
            <MessageSquare className="h-3 w-3 mr-1" />
            {nudges.length} Nudges
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="meetings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="meetings">Event Meetings</TabsTrigger>
          <TabsTrigger value="nudges">Nudge Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connections Made at Event</CardTitle>
              <CardDescription>People who met during the event - ready for follow-up nudges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {meeting.person_a.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{meeting.person_a.full_name}</p>
                        <p className="text-sm text-muted-foreground">{meeting.person_a.role}</p>
                      </div>
                    </div>

                    <TrendingUp className="h-4 w-4 text-muted-foreground" />

                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium">{meeting.person_b.full_name}</p>
                        <p className="text-sm text-muted-foreground">{meeting.person_b.role}</p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {meeting.person_b.full_name.charAt(0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{meeting.meeting_type.replace("_", " ")}</Badge>
                    <Button size="sm" onClick={() => handleSendNudge(meeting)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Nudge
                    </Button>
                  </div>
                </div>
              ))}

              {meetings.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No meetings recorded</h3>
                  <p className="text-muted-foreground">Meetings will appear here as people connect during the event</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nudges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Nudges
                </CardTitle>
                <CardDescription>Awaiting responses from participants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingNudges.map((nudge) => (
                  <div key={nudge.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">
                        {nudge.person_a.full_name} ↔ {nudge.person_b.full_name}
                      </p>
                      <Badge variant={getStatusColor(nudge.status) as any}>
                        {getStatusIcon(nudge.status)}
                        <span className="ml-1">{nudge.status}</span>
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      "You met {nudge.person_b.full_name} at {event.name} — should I connect you two formally?"
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => handleNudgeResponse(nudge.id, "accepted")}>
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleNudgeResponse(nudge.id, "declined")}>
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}

                {pendingNudges.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No pending nudges</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Responded Nudges
                </CardTitle>
                <CardDescription>Completed nudge responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {respondedNudges.map((nudge) => (
                  <div key={nudge.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">
                        {nudge.person_a.full_name} ↔ {nudge.person_b.full_name}
                      </p>
                      <Badge variant={getStatusColor(nudge.status) as any}>
                        {getStatusIcon(nudge.status)}
                        <span className="ml-1">{nudge.status}</span>
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Responded {nudge.responded_at ? new Date(nudge.responded_at).toLocaleDateString() : ""}
                    </p>
                  </div>
                ))}

                {respondedNudges.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No responses yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
