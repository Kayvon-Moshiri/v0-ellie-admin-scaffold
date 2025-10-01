"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Building2, TrendingUp, MessageSquare, Calendar } from "lucide-react"
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

interface Match {
  id: string
  person_a: Attendee
  person_b: Attendee
  match_type: "attendee_to_attendee" | "attendee_to_startup"
  match_score: number
  reason: string
}

export function PreEventMatches({ event }: { event: Event }) {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const attendeeData = await getEventAttendees(event.id)
        setAttendees(attendeeData)

        // Generate matches based on attendee data
        const generatedMatches = generateMatches(attendeeData)
        setMatches(generatedMatches)
      } catch (error) {
        console.error("Failed to load event data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [event.id])

  const generateMatches = (attendees: Attendee[]): Match[] => {
    const matches: Match[] = []

    // Generate attendee-to-attendee matches
    for (let i = 0; i < attendees.length; i++) {
      for (let j = i + 1; j < attendees.length; j++) {
        const personA = attendees[i]
        const personB = attendees[j]

        // Skip if same tier (less valuable connection)
        if (personA.tier === personB.tier) continue

        // Higher score for complementary roles
        let score = 0.5
        let reason = "Complementary network positions"

        if (personA.tier === "tier_1" && personB.tier === "tier_2") {
          score = 0.9
          reason = "High-value tier connection"
        } else if (personA.role === "founder" && personB.role === "investor") {
          score = 0.95
          reason = "Founder-investor match"
        } else if (personA.role === "scout" && personB.role === "founder") {
          score = 0.8
          reason = "Scout-founder connection"
        }

        matches.push({
          id: `${personA.id}-${personB.id}`,
          person_a: personA,
          person_b: personB,
          match_type: "attendee_to_attendee",
          match_score: score,
          reason,
        })
      }
    }

    // Sort by match score and return top matches
    return matches.sort((a, b) => b.match_score - a.match_score).slice(0, 20)
  }

  const handleSendIntro = async (match: Match) => {
    // This would integrate with the double-opt-in intro system
    console.log("Sending intro for match:", match)
    // TODO: Integrate with intro generation system
  }

  if (loading) {
    return <div className="animate-pulse h-96 bg-muted rounded"></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pre-Event Matches</h2>
          <p className="text-muted-foreground">High-value connections to prime before the event</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">
            <Users className="h-3 w-3 mr-1" />
            {matches.filter((m) => m.match_type === "attendee_to_attendee").length} A2A
          </Badge>
          <Badge variant="secondary">
            <Building2 className="h-3 w-3 mr-1" />
            {matches.filter((m) => m.match_type === "attendee_to_startup").length} A2S
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {matches.map((match) => (
          <Card key={match.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{match.person_a.full_name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{match.person_a.full_name}</p>
                      <p className="text-sm text-muted-foreground">{match.person_a.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3">
                    <div className="h-px bg-border flex-1 w-8"></div>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div className="h-px bg-border flex-1 w-8"></div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium text-right">{match.person_b.full_name}</p>
                      <p className="text-sm text-muted-foreground text-right">{match.person_b.role}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{match.person_b.full_name.charAt(0)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{Math.round(match.match_score * 100)}%</div>
                    <div className="text-xs text-muted-foreground">Match</div>
                  </div>
                  <Button size="sm" onClick={() => handleSendIntro(match)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Intro
                  </Button>
                </div>
              </div>
              <CardDescription className="flex items-center gap-2">
                <span>{match.reason}</span>
                <Badge variant="outline" className="ml-auto">
                  {match.match_type === "attendee_to_attendee" ? "A2A" : "A2S"}
                </Badge>
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {matches.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No matches generated yet</h3>
            <p className="text-muted-foreground">Matches will appear as more attendees are added to the event roster</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
