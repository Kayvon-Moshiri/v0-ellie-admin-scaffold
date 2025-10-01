"use client"
import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Network, Users } from "lucide-react"
import { NodeContextMenu } from "./node-context-menu"

interface FederatedNodeData {
  label: string
  role: string
  tier: string
  tags: string[]
  company?: string
  activityScore: number
  connections: number
  scarcityScore: number
  avatar: string
  isFederated: boolean
  sourceNetwork: string
  id?: string
  email?: string
  phone?: string
}

interface FederatedNodeProps extends NodeProps<FederatedNodeData> {
  onContextAction?: (action: string, nodeId: string) => void
}

function FederatedNode({ data, selected, onContextAction }: FederatedNodeProps) {
  const getScarcityColor = (score: number) => {
    if (score > 0.7) return "border-red-400 bg-red-50"
    if (score > 0.4) return "border-yellow-400 bg-yellow-50"
    return "border-green-400 bg-green-50"
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "vip":
        return "bg-purple-100 text-purple-800"
      case "member":
        return "bg-blue-100 text-blue-800"
      case "startup":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <NodeContextMenu
      node={{ id: data.id || "", data, type: "federated" } as any}
      onAction={(action, nodeId) => {
        console.log(`[v0] Federated node action: ${action} on ${nodeId}`)
        onContextAction?.(action, nodeId)
      }}
    >
      <div
        className={`
          relative bg-card border-2 rounded-lg p-3 shadow-sm transition-all duration-200 min-w-[180px]
          ${selected ? "border-primary shadow-lg" : "border-border hover:border-primary/50"}
          ${data.isFederated ? "ring-2 ring-blue-200 ring-offset-1" : ""}
          ${getScarcityColor(data.scarcityScore)}
        `}
      >
        {/* Federation indicator */}
        {data.isFederated && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
            <Network className="h-3 w-3" />
          </div>
        )}

        <Handle type="target" position={Position.Top} className="opacity-0" />
        <Handle type="source" position={Position.Bottom} className="opacity-0" />

        <div className="flex items-center space-x-3 mb-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {data.label
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{data.label}</div>
            <div className="text-xs text-muted-foreground truncate">
              {data.isFederated ? data.sourceNetwork : data.company}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <Badge variant="outline" className={`text-xs ${getTierColor(data.tier)}`}>
              {data.tier}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {data.role}
            </Badge>
          </div>

          {data.isFederated && (
            <div className="flex items-center space-x-1 text-xs text-blue-600">
              <Network className="h-3 w-3" />
              <span>Federated</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{data.connections}</span>
            </div>
            <div>Score: {data.activityScore}</div>
          </div>

          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {data.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {data.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  +{data.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </NodeContextMenu>
  )
}

export default memo(FederatedNode)
