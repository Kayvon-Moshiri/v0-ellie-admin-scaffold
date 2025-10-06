"use client"
import { memo } from "react"
import { getBezierPath, type EdgeProps } from "reactflow"

interface FederatedEdgeData {
  weight: number
  relationship_type: string
  last_event_at: string
  isCrossTenant?: boolean
  sourceNetwork?: string
  targetNetwork?: string
}

function FederatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<FederatedEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const getEdgeStyle = () => {
    const baseStyle = {
      strokeWidth: Math.max(1, (data?.weight || 1) / 5),
    }

    if (data?.isCrossTenant) {
      return {
        ...baseStyle,
        stroke: "#d1ecea",
        strokeDasharray: "8,4",
        strokeLinecap: "round" as const,
      }
    }

    // Regular edge styling based on relationship type
    switch (data?.relationship_type) {
      case "intro":
        return { ...baseStyle, stroke: "#10b981" } // Green
      case "meeting":
        return { ...baseStyle, stroke: "#f59e0b" } // Amber
      case "message":
        return { ...baseStyle, stroke: "#d1ecea", strokeDasharray: "5,5" } // Mint/teal, dashed
      default:
        return { ...baseStyle, stroke: "#6b7280" } // Gray
    }
  }

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={getEdgeStyle()}
        markerEnd="url(#react-flow__arrowclosed)"
      />

      {/* Cross-tenant indicator */}
      {data?.isCrossTenant && (
        <g>
          <circle cx={labelX} cy={labelY} r="8" fill="#d1ecea" stroke="#ffffff" strokeWidth="2" />
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs fill-primary-foreground font-medium"
          >
            ⚡
          </text>
        </g>
      )}

      {selected && (
        <g>
          <rect x={labelX - 30} y={labelY - 10} width="60" height="20" rx="10" fill="rgba(0,0,0,0.8)" />
          <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" className="text-xs fill-white">
            {data?.isCrossTenant ? "Cross-Net" : data?.relationship_type || "connection"}
          </text>
        </g>
      )}
    </>
  )
}

export default memo(FederatedEdge)
