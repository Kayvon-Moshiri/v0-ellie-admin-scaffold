import { Suspense } from "react"
import { notFound } from "next/navigation"
import { EventModeView } from "@/components/events/event-mode-view"
import { getEvent } from "@/app/actions/events"

interface EventPageProps {
  params: {
    id: string
  }
  searchParams: {
    mode?: "pre" | "live" | "post"
    kiosk?: string
  }
}

export default async function EventPage({ params, searchParams }: EventPageProps) {
  const event = await getEvent(params.id)

  if (!event) {
    notFound()
  }

  const mode = searchParams.mode || "pre"
  const isKioskMode = searchParams.kiosk === "true"

  return (
    <div className="h-full">
      <Suspense fallback={<div className="animate-pulse h-full bg-muted rounded"></div>}>
        <EventModeView event={event} mode={mode} isKioskMode={isKioskMode} />
      </Suspense>
    </div>
  )
}
