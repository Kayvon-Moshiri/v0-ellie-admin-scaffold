"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ZoomIn, ZoomOut, Maximize2, Filter, Search, Users, Building2, Sparkles } from "lucide-react"

// Mock data for the network graph
const mockNodes = [
  {
    id: "1",
    type: "person",
    position: { x: 250, y: 100 },
    data: {
      label: "Sarah Chen",
      role: "Founder",
      company: "NeuralFlow AI",
      avatar: "/professional-woman.png",
      activityScore: 95,
      connections: 24,
    },
  },
  {
    id: "2",
    type: "person",
    position: { x: 100, y: 200 },
    data: {
      label: "Alex Kim",
      role: "CTO",
      company: "FinanceFlow",
      avatar: "/man-tech.png",
      activityScore: 87,
      connections: 18,
    },
  },
  {
    id: "3",
    type: "person",
    position: { x: 400, y: 200 },
    data: {
      label: "Jordan Smith",
      role: "Investor",
      company: "Venture Capital",
      avatar: "/person-business.jpg",
      activityScore: 92,
      connections: 31,
    },
  },
  {
    id: "4",
    type: "person",
    position: { x: 250, y: 300 },
    data: {
      label: "Maria Rodriguez",
      role: "CEO",
      company: "GreenTech Solutions",
      avatar: "/woman-ceo.png",
      activityScore: 78,
      connections: 15,
    },
  },
  {
    id: "5",
    type: "startup",
    position: { x: 550, y: 150 },
    data: {
      label: "NeuralFlow AI",
      industry: "AI/ML",
      stage: "Series A",
      employees: 25,
      momentum: 85,
    },
  },
  {
    id: "6",
    type: "startup",
    position: { x: 50, y: 350 },
    data: {
      label: "FinanceFlow",
      industry: "FinTech",
      stage: "Series B",
      employees: 45,
      momentum: 91,
    },
  },
]

const mockEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "connection",
    data: { strength: 8, type: "mutual", context: "Co-founded previous startup" },
  },
  {
    id: "e1-3",
    source: "1",
    target: "3",
    type: "connection",
    data: { strength: 6, type: "mutual", context: "Investor relationship" },
  },
  {
    id: "e2-4",
    source: "2",
    target: "4",
    type: "connection",
    data: { strength: 5, type: "mutual", context: "Industry peers" },
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    type: "connection",
    data: { strength: 7, type: "mutual", context: "Investment discussions" },
  },
  {
    id: "e1-5",
    source: "1",
    target: "5",
    type: "affiliation",
    data: { strength: 10, type: "founder", context: "Company founder" },
  },
  {
    id: "e2-6",
    source: "2",
    target: "6",
    type: "affiliation",
    data: { strength: 10, type: "employee", context: "CTO role" },
  },
]

// Placeholder component for NetworkGraph
function NetworkGraphPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20">
      <div className="text-center space-y-4 p-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="w-8 h-8 text-primary/50" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-muted-foreground">Network Graph</h3>
          <p className="text-sm text-muted-foreground/70">Interactive graph visualization will be available soon</p>
        </div>
        <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground/60">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-primary/40"></div>
            <span>People</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-accent/40"></div>
            <span>Startups</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-secondary/40"></div>
            <span>Connections</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface NetworkGraphViewProps {
  className?: string
}

export function NetworkGraphView({ className }: NetworkGraphViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [activityThreshold, setActivityThreshold] = useState([50])
  const [isFullscreen, setIsFullscreen] = useState(false)

  const filteredNodes = mockNodes.filter((node) => {
    const matchesSearch = node.data.label.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "people" && node.type === "person") ||
      (selectedFilter === "startups" && node.type === "startup") ||
      (selectedFilter === "high-activity" &&
        node.type === "person" &&
        (node.data.activityScore || 0) >= activityThreshold[0])

    return matchesSearch && matchesFilter
  })

  const filteredEdges = mockEdges.filter((edge) => {
    const sourceExists = filteredNodes.some((node) => node.id === edge.source)
    const targetExists = filteredNodes.some((node) => node.id === edge.target)
    return sourceExists && targetExists
  })

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  const nodeCount = 24
  const edgeCount = 18

  return (
    <Card className={`bg-card/50 border-border/50 ${isFullscreen ? "fixed inset-4 z-50" : ""} ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Network Graph</CardTitle>
          <p className="text-sm text-muted-foreground">Interactive visualization of your network connections</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {nodeCount} nodes
          </Badge>
          <Badge variant="outline" className="text-xs">
            {edgeCount} connections
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Graph Controls */}
        <div className="flex items-center justify-between mb-4 space-x-4">
          <div className="flex items-center space-x-2 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search network..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>

            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedFilter("all")}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  All Nodes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("people")}>
                  <Users className="mr-2 h-4 w-4" />
                  People Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("startups")}>
                  <Building2 className="mr-2 h-4 w-4" />
                  Startups Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("high-activity")}>
                  <ZoomIn className="mr-2 h-4 w-4" />
                  High Activity
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Label className="text-xs">Activity Threshold</Label>
                  <Slider
                    value={activityThreshold}
                    onValueChange={setActivityThreshold}
                    max={100}
                    min={0}
                    step={10}
                    className="mt-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">Min: {activityThreshold[0]}%</div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Network Graph */}
        <div
          className={`relative bg-background/50 rounded-lg border border-border/50 ${isFullscreen ? "h-[calc(100vh-200px)]" : "h-96"}`}
        >
          <NetworkGraphPlaceholder />
        </div>

        {/* Graph Legend */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-primary"></div>
              <span>High Activity (80+)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-secondary"></div>
              <span>Medium Activity (50-79)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-muted"></div>
              <span>Low Activity (&lt;50)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded bg-accent"></div>
              <span>Startups</span>
            </div>
          </div>
          <div>Last updated: 2 minutes ago</div>
        </div>
      </CardContent>
    </Card>
  )
}
