"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Badge } from "@/components/ui/badge"
import { Building2 } from "lucide-react"

interface StartupNodeData {
  label: string
  industry: string
  stage: string
  employees: number
  momentum: number
  tier: string
}

export const StartupNode = memo(({ data, selected }: NodeProps<StartupNodeData>) => {
  const getTierColor = () => "hsl(var(--accent))"

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case "series-a":
      case "series-b":
      case "series-c":
        return "bg-primary text-primary-foreground"
      case "seed":
        return "bg-secondary text-secondary-foreground"
      case "pre-seed":
      case "idea":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-accent text-accent-foreground"
    }
  }

  return (
    <div
      className={`relative bg-card border-2 rounded-lg p-2 shadow-sm transition-all ${
        selected ? "border-primary shadow-lg scale-110" : "border-border hover:border-border/80"
      }`}
      style={{
        borderColor: selected ? "hsl(var(--primary))" : getTierColor(),
      }}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-accent opacity-0" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-accent opacity-0" />

      <div className="flex flex-col items-center justify-center h-full">
        <div className="flex-shrink-0 mb-1">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-accent" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="font-semibold text-xs truncate max-w-[70px]" title={data.label}>
            {data.label}
          </h3>
          <p className="text-[10px] text-muted-foreground truncate max-w-[70px]" title={data.industry}>
            {data.industry}
          </p>
        </div>
      </div>

      <div className="absolute -top-1 -right-1">
        <div
          className="w-3 h-3 rounded-full border-2 border-background"
          style={{
            backgroundColor: data.momentum >= 80 ? "#22c55e" : data.momentum >= 60 ? "#eab308" : "#6b7280",
          }}
        />
      </div>

      {/* Stage badge */}
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
        <Badge variant="outline" className={`text-[8px] px-1 py-0 ${getStageColor(data.stage)}`}>
          {data.stage}
        </Badge>
      </div>
    </div>
  )
})

StartupNode.displayName = "StartupNode"
