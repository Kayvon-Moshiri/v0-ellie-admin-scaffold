"use server"

import { createServerClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/auth/server"
import { revalidatePath } from "next/cache"

export async function getEvents() {
  const supabase = await createServerClient()
  const profile = await getCurrentProfile()

  if (!profile) {
    throw new Error("Not authenticated")
  }

  const { data: events, error } = await supabase
    .from("events")
    .select(`
      *,
      attendee_count:event_checkins(count),
      checkin_count:event_checkins!inner(count)
    `)
    .eq("tenant_id", profile.tenant_id)
    .order("starts_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`)
  }

  return events || []
}

export async function getEvent(eventId: string) {
  const supabase = await createServerClient()
  const profile = await getCurrentProfile()

  if (!profile) {
    throw new Error("Not authenticated")
  }

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("tenant_id", profile.tenant_id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch event: ${error.message}`)
  }

  return event
}

export async function getEventAttendees(eventId: string) {
  const supabase = await createServerClient()
  const profile = await getCurrentProfile()

  if (!profile) {
    throw new Error("Not authenticated")
  }

  // Get attendees from event roster and check-in status
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("roster")
    .eq("id", eventId)
    .eq("tenant_id", profile.tenant_id)
    .single()

  if (eventError) {
    throw new Error(`Failed to fetch event: ${eventError.message}`)
  }

  const attendeeIds = event.roster?.attendees || []

  if (attendeeIds.length === 0) {
    return []
  }

  const { data: attendees, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      tier,
      role,
      event_checkins!left(checked_in_at)
    `)
    .in("id", attendeeIds)
    .eq("tenant_id", profile.tenant_id)

  if (error) {
    throw new Error(`Failed to fetch attendees: ${error.message}`)
  }

  return (
    attendees?.map((attendee) => ({
      ...attendee,
      checked_in: !!attendee.event_checkins?.[0]?.checked_in_at,
      checked_in_at: attendee.event_checkins?.[0]?.checked_in_at,
    })) || []
  )
}

export async function checkInAttendee(eventId: string, profileId: string) {
  const supabase = await createServerClient()
  const profile = await getCurrentProfile()

  if (!profile) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase.from("event_checkins").upsert({
    tenant_id: profile.tenant_id,
    event_id: eventId,
    profile_id: profileId,
    checked_in_by: profile.id,
    kiosk_mode: true,
  })

  if (error) {
    throw new Error(`Failed to check in attendee: ${error.message}`)
  }

  // Log engagement event
  await supabase.from("engagement_events").insert({
    tenant_id: profile.tenant_id,
    actor: profileId,
    kind: "checkin",
    payload: { event_id: eventId, checked_in_by: profile.id },
  })

  revalidatePath(`/dashboard/events/${eventId}`)
}

export async function createEventMeeting(
  eventId: string,
  personA: string,
  personB: string,
  meetingType: "meet_now" | "swap_info" | "scheduled",
) {
  const supabase = await createServerClient()
  const profile = await getCurrentProfile()

  if (!profile) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase.from("event_meetings").upsert({
    tenant_id: profile.tenant_id,
    event_id: eventId,
    person_a: personA,
    person_b: personB,
    initiated_by: profile.id,
    meeting_type: meetingType,
  })

  if (error) {
    throw new Error(`Failed to create meeting: ${error.message}`)
  }

  // Log engagement events for both people
  await supabase.from("engagement_events").insert([
    {
      tenant_id: profile.tenant_id,
      actor: personA,
      kind: "meet",
      payload: { event_id: eventId, meeting_type: meetingType, with: personB },
    },
    {
      tenant_id: profile.tenant_id,
      actor: personB,
      kind: "meet",
      payload: { event_id: eventId, meeting_type: meetingType, with: personA },
    },
  ])

  // Increment edge weights using the existing function
  await supabase.rpc("increment_edge", {
    p_tenant_id: profile.tenant_id,
    p_source: personA,
    p_target: personB,
    p_weight_inc: meetingType === "meet_now" ? 2 : 1,
    p_kind: "meeting",
  })

  revalidatePath(`/dashboard/events/${eventId}`)
}
