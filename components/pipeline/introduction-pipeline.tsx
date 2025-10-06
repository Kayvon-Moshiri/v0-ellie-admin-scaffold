"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import {
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  MessageSquare,
  Calendar,
  ArrowRight,
  Mail,
  Zap,
} from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Introduction {
  id: string
  status: "requested" | "pre_consented" | "scheduled" | "completed" | "declined"
  priority: number // Using the actual priority column instead of computed_priority
  context: string
  reason: string
  scheduled_for?: string
  created_at: string
  updated_at: string
  ellie_notes?: string
  requester_id: string
  person_a_id: string
  requester: {
    id: string
    full_name: string
    email: string
    membership_tier: string
  } | null
  target: {
    id: string
    full_name: string
    email: string
    membership_tier: string
  } | null
  last_touch?: string
  engagement_count: number
}

const COLUMN_CONFIG = {
  requested: {
    title: "Requested",
    color: "bg-yellow-50 border-yellow-200",
    icon: Clock,
    iconColor: "text-yellow-600",
  },
  pre_consented: {
    title: "Pre-consented",
    color: "bg-primary/10 border-primary/20",
    icon: MessageSquare,
    iconColor: "text-primary",
  },
  scheduled: {
    title: "Scheduled",
    color: "bg-primary/10 border-primary/20",
    icon: Calendar,
    iconColor: "text-primary",
  },
  completed: {
    title: "Completed",
    color: "bg-green-50 border-green-200",
    icon: CheckCircle,
    iconColor: "text-green-600",
  },
  declined: {
    title: "Declined",
    color: "bg-red-50 border-red-200",
    icon: XCircle,
    iconColor: "text-red-600",
  },
}

export function IntroductionPipeline() {
  const [introductions, setIntroductions] = useState<Introduction[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadIntroductions()
  }, [])

  const loadIntroductions = async () => {
    try {
      const { data: introductionsData, error: introError } = await supabase
        .from("introductions")
        .select(`
          id,
          status,
          priority,
          context,
          reason,
          scheduled_for,
          created_at,
          updated_at,
          ellie_notes,
          requester_id,
          person_a_id
        `)
        .order("priority", { ascending: false })

      if (introError) throw introError

      const profileIds = new Set<string>()
      introductionsData?.forEach((intro) => {
        if (intro.requester_id) profileIds.add(intro.requester_id)
        if (intro.person_a_id) profileIds.add(intro.person_a_id)
      })

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, membership_tier")
        .in("id", Array.from(profileIds))

      if (profilesError) throw profilesError

      const profilesMap = new Map()
      profilesData?.forEach((profile) => {
        profilesMap.set(profile.id, profile)
      })

      const introsWithEngagement = await Promise.all(
        (introductionsData || []).map(async (intro) => {
          return {
            ...intro,
            requester: profilesMap.get(intro.requester_id) || null,
            target: profilesMap.get(intro.person_a_id) || null,
            engagement_count: 0,
            last_touch: undefined,
          }
        }),
      )

      setIntroductions(introsWithEngagement)
    } catch (error) {
      console.error("Error loading introductions:", error)
      toast.error("Failed to load introductions")
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const newStatus = destination.droppableId as Introduction["status"]

    const intro = introductions.find((i) => i.id === draggableId)
    if (!intro || intro.status === newStatus) return

    setIntroductions((prev) => prev.map((i) => (i.id === draggableId ? { ...i, status: newStatus } : i)))

    try {
      const { error: updateError } = await supabase
        .from("introductions")
        .update({ status: newStatus })
        .eq("id", draggableId)

      if (updateError) throw updateError

      toast.success(`Introduction moved to ${COLUMN_CONFIG[newStatus].title}`)

      loadIntroductions()
    } catch (error) {
      console.error("Error updating introduction:", error)
      toast.error("Failed to update introduction")
      loadIntroductions()
    }
  }

  const handlePingForConsent = async (intro: Introduction) => {
    toast.info("Opening double opt-in generator...")
  }

  const handleProposeTimes = async (intro: Introduction) => {
    toast.info("Time proposal feature coming soon")
  }

  const handleConvertToEmail = async (intro: Introduction) => {
    toast.info("Opening introduction generator...")
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "text-green-600"
    if (priority >= 5) return "text-yellow-600"
    return "text-red-600"
  }

  const getRoutingBadge = () => {
    return (
      <Badge variant="secondary" className="text-xs">
        Standard
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading pipeline...</p>
        </div>
      </div>
    )
  }

  const groupedIntros = introductions.reduce(
    (acc, intro) => {
      if (!acc[intro.status]) acc[intro.status] = []
      acc[intro.status].push(intro)
      return acc
    },
    {} as Record<string, Introduction[]>,
  )

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-200px)]" data-tour="pipeline-kanban">
        {Object.entries(COLUMN_CONFIG).map(([status, config]) => {
          const Icon = config.icon
          const intros = groupedIntros[status] || []

          return (
            <div key={status} className={`rounded-lg border-2 ${config.color} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Zap className={`h-3 w-3 ${getPriorityColor(intros[0]?.priority || 0)}`} />
                    <span className={`text-xs font-medium ${getPriorityColor(intros[0]?.priority || 0)}`}>
                      {intros[0]?.priority || "N/A"}
                    </span>
                  </div>
                  {getRoutingBadge()}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {status === "requested" && (
                      <DropdownMenuItem onClick={() => handlePingForConsent(intros[0])}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Ping for Consent
                      </DropdownMenuItem>
                    )}
                    {status === "pre_consented" && (
                      <DropdownMenuItem onClick={() => handleProposeTimes(intros[0])}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Propose Times
                      </DropdownMenuItem>
                    )}
                    {status === "scheduled" && (
                      <DropdownMenuItem onClick={() => handleConvertToEmail(intros[0])}>
                        <Mail className="mr-2 h-4 w-4" />
                        Convert to Email
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[200px] ${snapshot.isDraggingOver ? "bg-primary/5 rounded-lg" : ""}`}
                  >
                    {intros.map((intro, index) => (
                      <Draggable key={intro.id} draggableId={intro.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-move transition-shadow kanban-card ${
                              snapshot.isDragging ? "shadow-lg rotate-2" : "hover:shadow-md"
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center space-x-1">
                                    <Zap className={`h-3 w-3 ${getPriorityColor(intro.priority || 0)}`} />
                                    <span className={`text-xs font-medium ${getPriorityColor(intro.priority || 0)}`}>
                                      {intro.priority || "N/A"}
                                    </span>
                                  </div>
                                  {getRoutingBadge()}
                                </div>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    {intro.status === "requested" && (
                                      <DropdownMenuItem onClick={() => handlePingForConsent(intro)}>
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Ping for Consent
                                      </DropdownMenuItem>
                                    )}
                                    {intro.status === "pre_consented" && (
                                      <DropdownMenuItem onClick={() => handleProposeTimes(intro)}>
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Propose Times
                                      </DropdownMenuItem>
                                    )}
                                    {intro.status === "scheduled" && (
                                      <DropdownMenuItem onClick={() => handleConvertToEmail(intro)}>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Convert to Email
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <div className="flex items-center space-x-2 mb-3">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {intro.requester?.full_name
                                      ?.split(" ")
                                      .map((n) => n[0])
                                      .join("") || "R"}
                                  </AvatarFallback>
                                </Avatar>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {intro.target?.full_name
                                      ?.split(" ")
                                      .map((n) => n[0])
                                      .join("") || "T"}
                                  </AvatarFallback>
                                </Avatar>
                                {intro.target?.membership_tier === "vip" && (
                                  <Badge variant="secondary" className="text-xs px-1 py-0">
                                    VIP
                                  </Badge>
                                )}
                              </div>

                              <div className="text-xs space-y-1 mb-3">
                                <div className="font-medium">{intro.requester?.full_name || "Unknown"}</div>
                                <div className="text-muted-foreground">→ {intro.target?.full_name || "Unknown"}</div>
                              </div>

                              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{intro.context}</p>

                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center space-x-2">
                                  {intro.engagement_count > 0 && (
                                    <div className="flex items-center space-x-1">
                                      <Zap className="h-3 w-3" />
                                      <span>{intro.engagement_count}</span>
                                    </div>
                                  )}
                                </div>
                                <span>
                                  {intro.last_touch
                                    ? formatDistanceToNow(new Date(intro.last_touch), { addSuffix: true })
                                    : formatDistanceToNow(new Date(intro.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}
