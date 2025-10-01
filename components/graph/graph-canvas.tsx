"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Building2, Network, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"

interface GraphCanvasProps {
  tenantId: string
}

function GraphCanvasPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-muted/10 rounded-lg border-2 border-dashed border-muted-foreground/20">
      <div className="text-center space-y-6 p-12">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <Network className="w-10 h-10 text-primary/50" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-muted-foreground">Advanced Network Graph</h3>
          <p className="text-sm text-muted-foreground/70 mt-2">
            Interactive force-directed graph with real-time updates will be available soon
          </p>
        </div>

        {/* Mock Legend */}
        <Card className="bg-card/90 border border-border rounded-lg p-4 max-w-xs mx-auto">
          <div className="text-xs space-y-3">
            <h4 className="font-semibold">Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span>VIP Members</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span>Members</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted"></div>
                <span>Guests</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                <span>Startups</span>
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground">Size = Activity • Glow = Scarcity</div>
            </div>
          </div>
        </Card>

        {/* Mock Controls */}
        <div className="flex items-center justify-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" disabled>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-center space-x-4">
          <Badge variant="outline" className="text-xs">
            <Users className="w-3 h-3 mr-1" />
            24 People
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Building2 className="w-3 h-3 mr-1" />8 Startups
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Network className="w-3 h-3 mr-1" />
            42 Connections
          </Badge>
        </div>
      </div>
    </div>
  )
}

export function GraphCanvas({ tenantId }: GraphCanvasProps) {
  return (
    <div className="h-full w-full relative">
      <GraphCanvasPlaceholder />
    </div>
  )
}
