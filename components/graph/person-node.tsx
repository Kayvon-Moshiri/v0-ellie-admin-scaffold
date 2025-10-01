"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { User } from "lucide-react"
import { NodeContextMenu } from "./node-context-menu"

interface PersonNodeData {
  label: string
  role: string
  company: string
  tier: string
  avatar?: string
  activityScore: number
  connections: number
  scarcityScore: number
  tags?: string
  offers?: string
  asks?: string
  id?: string
  email?: string
  phone?: string
}

interface PersonNodeProps extends NodeProps<PersonNodeData> {
  onContextAction?: (action: string, nodeId: string) => void
}

export const PersonNode = memo(({ data, selected, onContextAction }: PersonNodeProps) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case "vip":
        return "hsl(var(--primary))"
      case "member":
        return "hsl(var(--secondary))"
      case "guest":
        return "hsl(var(--muted))"
      default:
        return "hsl(var(--muted))"
    }
  }

  const hasHighScarcity = (data.scarcityScore || 0) >= 7
  const glowClass = hasHighScarcity ? "person-node-glow" : ""

  return (
    <NodeContextMenu
      node={{ id: data.id || "", data, type: "person" } as any}
      onAction={(action, nodeId) => {
        console.log(`[v0] Node action: ${action} on ${nodeId}`)
        onContextAction?.(action, nodeId)
      }}
    >
      <div
        className={`relative bg-card border-2 rounded-full p-2 shadow-sm transition-all ${glowClass} ${
          selected ? "border-primary shadow-lg scale-110" : "border-border hover:border-border/80"
        }`}
        style={{
          borderColor: selected ? "hsl(var(--primary))" : getTierColor(data.tier),
        }}
      >
        <Handle type="target" position={Position.Top} className="w-2 h-2 bg-primary opacity-0" />
        <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-primary opacity-0" />

        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex-shrink-0 mb-1">
            {data.avatar ? (
              <img
                src={data.avatar || "/placeholder.svg"}
                alt={data.label}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${getTierColor(data.tier)}20` }}
              >
                <User className="w-4 h-4" style={{ color: getTierColor(data.tier) }} />
              </div>
            )}
          </div>

          <div className="text-center">
            <h3 className="font-semibold text-xs truncate max-w-[60px]" title={data.label}>
              {data.label.split(" ")[0]}
            </h3>
            <p className="text-[10px] text-muted-foreground truncate max-w-[60px]" title={data.role}>
              {data.role}
            </p>
          </div>
        </div>

        <div className="absolute -top-1 -right-1">
          <div
            className="w-3 h-3 rounded-full border-2 border-background"
            style={{
              backgroundColor: data.activityScore >= 80 ? "#22c55e" : data.activityScore >= 50 ? "#eab308" : "#6b7280",
            }}
          />
        </div>

        {hasHighScarcity && (
          <div className="absolute -top-2 -left-2">
            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </NodeContextMenu>
  )
})

PersonNode.displayName = "PersonNode"
