"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { UserCheck, Users, MessageSquare, Search, CheckCircle, Clock } from "lucide-react"
import { checkInAttendee, createEventMeeting, getEventAttendees } from "@/app/actions/events"

interface Event {
  id: string
  name: string
  starts_at: string
  ends_at: string
  location: string
}

interface Attendee {
  id: string
  full_name: string
  email: string
  tier: string
  role: string
  checked_in: boolean
  checked_in_at?: string
}

export function LiveEventKiosk({ event }: { event: Event }) {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([])
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

  const filteredAttendees = attendees.filter(
    (attendee) =>
      attendee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCheckIn = async (attendeeId: string) => {
    try {
      await checkInAttendee(event.id, attendeeId)
      setAttendees((prev) =>
        prev.map((a) =>
          a.id === attendeeId ? { ...a, checked_in: true, checked_in_at: new Date().toISOString() } : a,
        ),
      )
    } catch (error) {
      console.error("Failed to check in attendee:", error)
    }
  }

  const handleMeetNow = async () => {
    if (selectedAttendees.length !== 2) return

    try {
      await createEventMeeting(event.id, selectedAttendees[0], selectedAttendees[1], "meet_now")
      setSelectedAttendees([])
      // Show success message
    } catch (error) {
      console.error("Failed to create meeting:", error)
    }
  }

  const handleSwapInfo = async () => {
    if (selectedAttendees.length !== 2) return

    try {
      await createEventMeeting(event.id, selectedAttendees[0], selectedAttendees[1], "swap_info")
      setSelectedAttendees([])
      // Show success message
    } catch (error) {
      console.error("Failed to swap info:", error)
    }
  }

  const toggleAttendeeSelection = (attendeeId: string) => {
    setSelectedAttendees((prev) => {
      if (prev.includes(attendeeId)) {
        return prev.filter((id) => id !== attendeeId)
      }
      if (prev.length < 2) {
        return [...prev, attendeeId]
      }
      return prev
    })
  }

  const checkedInCount = attendees.filter((a) => a.checked_in).length

  return (
    <div className="space-y-6 p-6">
      {/* Kiosk Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">{event.name}</h1>
        <p className="text-xl text-muted-foreground">{event.location}</p>
        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{checkedInCount}</div>
            <div className="text-sm text-muted-foreground">Checked In</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{attendees.length}</div>
            <div className="text-sm text-muted-foreground">Total Attendees</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search attendees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-lg h-12"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          className="h-16 px-8 text-lg"
          onClick={handleMeetNow}
          disabled={selectedAttendees.length !== 2}
        >
          <Users className="h-6 w-6 mr-3" />
          Meet Now ({selectedAttendees.length}/2)
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-16 px-8 text-lg bg-transparent"
          onClick={handleSwapInfo}
          disabled={selectedAttendees.length !== 2}
        >
          <MessageSquare className="h-6 w-6 mr-3" />
          Swap Info ({selectedAttendees.length}/2)
        </Button>
      </div>

      {/* Attendees Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAttendees.map((attendee) => (
          <Card
            key={attendee.id}
            className={`cursor-pointer transition-all ${
              selectedAttendees.includes(attendee.id) ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-md"
            }`}
            onClick={() => toggleAttendeeSelection(attendee.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{attendee.full_name}</CardTitle>
                {attendee.checked_in ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Checked In
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Not Checked In
                  </Badge>
                )}
              </div>
              <CardDescription>{attendee.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge variant="outline">{attendee.tier}</Badge>
                  <Badge variant="outline">{attendee.role}</Badge>
                </div>
                {!attendee.checked_in && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCheckIn(attendee.id)
                    }}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Check In
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
