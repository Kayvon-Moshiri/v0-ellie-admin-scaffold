"use client"

import { useState, useEffect } from "react"
import { X, MessageCircle, UserPlus, ExternalLink, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Node } from "reactflow"

interface NodeInspectorProps {
  node: Node
  onClose: () => void
  tenantId: string
}

export function NodeInspector({ node, onClose, tenantId }: NodeInspectorProps) {
  const [engagements, setEngagements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEngagements = async () => {
      setLoading(true)
      try {
        // Mock data for now - replace with actual API call
        const mockEngagements = [
          {
            id: 1,
            type: "intro",
            description: "Introduced to Sarah Chen",
            timestamp: "2 hours ago",
            actor: "John Smith",
          },
          {
            id: 2,
            type: "message",
            description: "Sent follow-up message",
            timestamp: "1 day ago",
            actor: node.data.label,
          },
          {
            id: 3,
            type: "meeting",
            description: "Coffee meeting scheduled",
            timestamp: "3 days ago",
            actor: "Mike Johnson",
          },
        ]
        setEngagements(mockEngagements)
      } catch (error) {
        console.error("Failed to load engagements:", error)
      } finally {
        setLoading(false)
      }
    }

    loadEngagements()
  }, [node.id, tenantId])

  const getEngagementIcon = (type: string) => {
    switch (type) {
      case "intro":
        return <UserPlus className="w-3 h-3" />
      case "message":
        return <MessageCircle className="w-3 h-3" />
      case "meeting":
        return <ExternalLink className="w-3 h-3" />
      default:
        return <Zap className="w-3 h-3" />
    }
  }

  return (
    <div className="absolute right-4 top-4 bottom-4 w-80 z-20">
      <Card className="h-full bg-card/95 backdrop-blur-sm border-border">
        <div className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={node.data.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {node.data.label
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{node.data.label}</h3>
                <p className="text-sm text-muted-foreground">
                  {node.data.role} {node.data.company && `at ${node.data.company}`}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="text-lg font-semibold">{node.data.activityScore || 0}</div>
              <div className="text-xs text-muted-foreground">Activity</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="text-lg font-semibold">{node.data.connections || 0}</div>
              <div className="text-xs text-muted-foreground">Connections</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="text-lg font-semibold">{node.data.scarcityScore || 0}</div>
              <div className="text-xs text-muted-foreground">Scarcity</div>
            </div>
          </div>

          {/* Offers/Asks */}
          {(node.data.offers || node.data.asks) && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Offers & Asks</h4>
              <div className="space-y-2">
                {node.data.offers && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Offers:</div>
                    <div className="flex flex-wrap gap-1">
                      {node.data.offers.split(",").map((offer: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {offer.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {node.data.asks && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Asks:</div>
                    <div className="flex flex-wrap gap-1">
                      {node.data.asks.split(",").map((ask: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {ask.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator className="mb-4" />

          {/* Recent Engagements */}
          <div className="flex-1 overflow-hidden">
            <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
            <div className="space-y-2 overflow-y-auto h-full">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                engagements.map((engagement: any) => (
                  <div key={engagement.id} className="flex items-start gap-2 p-2 bg-muted/30 rounded text-xs">
                    <div className="mt-0.5 text-muted-foreground">{getEngagementIcon(engagement.type)}</div>
                    <div className="flex-1">
                      <p>{engagement.description}</p>
                      <p className="text-muted-foreground mt-1">{engagement.timestamp}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-border">
            <div className="grid grid-cols-3 gap-2">
              <Button size="sm" variant="outline" className="text-xs bg-transparent">
                <Zap className="w-3 h-3 mr-1" />
                Nudge
              </Button>
              <Button size="sm" variant="outline" className="text-xs bg-transparent">
                <UserPlus className="w-3 h-3 mr-1" />
                Invite
              </Button>
              <Button size="sm" variant="outline" className="text-xs bg-transparent">
                <ExternalLink className="w-3 h-3 mr-1" />
                Pipeline
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
