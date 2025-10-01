"use client"

import { memo } from "react"
import { type EdgeProps, getBezierPath } from "reactflow"

interface ConnectionEdgeData {
  weight: number
  relationship_type: string
  last_event_at?: string
}

export const ConnectionEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
    animated,
    className,
  }: EdgeProps<ConnectionEdgeData>) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    })

    const getStrokeWidth = (weight: number) => {
      return Math.max(1, Math.min(8, weight / 2))
    }

    const getStrokeColor = (weight: number) => {
      if (weight >= 8) return "hsl(var(--primary))"
      if (weight >= 5) return "hsl(var(--secondary))"
      return "hsl(var(--muted-foreground))"
    }

    const getStrokeDashArray = (relationshipType: string) => {
      return relationshipType === "message" ? "5,5" : undefined
    }

    return (
      <>
        <path
          id={id}
          style={{
            stroke: getStrokeColor(data?.weight || 1),
            strokeWidth: getStrokeWidth(data?.weight || 1),
            strokeDasharray: getStrokeDashArray(data?.relationship_type || "connection"),
            fill: "none",
            opacity: selected ? 1 : 0.7,
          }}
          className={`react-flow__edge-path ${className || ""} ${animated ? "pulse-edge" : ""}`}
          d={edgePath}
        />
        {selected && data?.relationship_type && (
          <foreignObject
            width={120}
            height={40}
            x={labelX - 60}
            y={labelY - 20}
            className="react-flow__edge-label"
            requiredExtensions="http://www.w3.org/1999/xhtml"
          >
            <div className="bg-card border border-border rounded px-2 py-1 text-xs text-center shadow-sm">
              {data.relationship_type}
              {data.last_event_at && (
                <div className="text-[10px] text-muted-foreground">
                  {new Date(data.last_event_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </foreignObject>
        )}
      </>
    )
  },
)

ConnectionEdge.displayName = "ConnectionEdge"
