"use client"

import type React from "react"

import { useCallback, useEffect, useState } from "react"
import ReactFlow, {
  type Node,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  type Connection,
  ConnectionMode,
  Panel,
} from "reactflow"
import "reactflow/dist/style.css"

import { PersonNode } from "./person-node"
import { StartupNode } from "./startup-node"
import FederatedNode from "./federated-node"
import { ConnectionEdge } from "./connection-edge"
import FederatedEdge from "./federated-edge"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Network, Eye, EyeOff, Keyboard } from "lucide-react"
import { PeopleDrawer } from "./people-drawer"
import { GraphKeyboardHandler } from "./graph-keyboard-handler"

const nodeTypes = {
  person: PersonNode,
  startup: StartupNode,
  federated: FederatedNode,
}

const edgeTypes = {
  connection: ConnectionEdge,
  affiliation: ConnectionEdge,
  federated: FederatedEdge,
}

interface NetworkGraphProps {
  nodes: any[]
  edges: any[]
  showFederated?: boolean
  onShowFederatedChange?: (show: boolean) => void
}

export function NetworkGraph({
  nodes: initialNodes,
  edges: initialEdges,
  showFederated = true,
  onShowFederatedChange,
}: NetworkGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [federatedVisible, setFederatedVisible] = useState(showFederated)
  const [drawerNode, setDrawerNode] = useState<Node | null>(null)
  const [hiddenNodes, setHiddenNodes] = useState<Set<string>>(new Set())
  const [pinnedNodes, setPinnedNodes] = useState<Set<string>>(new Set())
  const [privateNodes, setPrivateNodes] = useState<Set<string>>(new Set())

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: "connection" }, eds)),
    [setEdges],
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setDrawerNode(node)
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const filteredNodes = (federatedVisible ? nodes : nodes.filter((node) => !node.data?.isFederated))
    .filter((node) => !hiddenNodes.has(node.id))
    .map((node) => ({
      ...node,
      className: `${node.className || ""} ${pinnedNodes.has(node.id) ? "pinned-node" : ""} ${privateNodes.has(node.id) ? "private-node" : ""}`,
      style: {
        ...node.style,
        ...(pinnedNodes.has(node.id) && { border: "2px solid hsl(var(--primary))" }),
        ...(privateNodes.has(node.id) && { opacity: 0.7 }),
      },
    }))

  const filteredEdges = federatedVisible ? edges : edges.filter((edge) => !edge.data?.isCrossTenant)

  useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes, setNodes])

  useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  const handleFederatedToggle = (checked: boolean) => {
    setFederatedVisible(checked)
    onShowFederatedChange?.(checked)
  }

  const federatedStats = {
    nodes: nodes.filter((n) => n.data?.isFederated).length,
    edges: edges.filter((e) => e.data?.isCrossTenant).length,
    networks: new Set(nodes.filter((n) => n.data?.isFederated).map((n) => n.data?.sourceNetwork)).size,
  }

  const handleContextAction = useCallback(
    (action: string, nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      switch (action) {
        case "hide":
          setHiddenNodes((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(nodeId)) {
              newSet.delete(nodeId)
            } else {
              newSet.add(nodeId)
            }
            return newSet
          })
          break
        case "pin":
          setPinnedNodes((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(nodeId)) {
              newSet.delete(nodeId)
            } else {
              newSet.add(nodeId)
            }
            return newSet
          })
          break
        case "private":
          setPrivateNodes((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(nodeId)) {
              newSet.delete(nodeId)
            } else {
              newSet.add(nodeId)
            }
            return newSet
          })
          break
        case "open-people":
          setDrawerNode(node)
          break
        case "invite":
        case "nudge":
        case "email":
        case "sms":
        case "propose-times":
          console.log(`[v0] Performing ${action} on node:`, nodeId)
          if (action === "email" && node.data?.email) {
            window.open(`mailto:${node.data.email}`)
          } else if (action === "sms" && node.data?.phone) {
            window.open(`sms:${node.data.phone}`)
          }
          break
      }
    },
    [nodes],
  )

  const enhancedNodeTypes = {
    person: (props: any) => <PersonNode {...props} onContextAction={handleContextAction} />,
    startup: StartupNode,
    federated: (props: any) => <FederatedNode {...props} onContextAction={handleContextAction} />,
  }

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={enhancedNodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-background"
      >
        <Controls className="bg-card border border-border rounded-lg" />
        <MiniMap
          className="bg-card border border-border rounded-lg"
          nodeColor={(node) => {
            if (node.data?.isFederated) return "#3b82f6" // Blue for federated
            if (node.type === "person") {
              const score = node.data?.activityScore || 0
              if (score >= 80) return "hsl(var(--primary))"
              if (score >= 50) return "hsl(var(--secondary))"
              return "hsl(var(--muted))"
            }
            return "hsl(var(--accent))"
          }}
        />
        <Background color="hsl(var(--border))" gap={20} />

        {/* Federation Controls Panel */}
        <Panel
          position="top-left"
          className="bg-card border border-border rounded-lg p-4 space-y-3"
          data-tour="federation-panel"
        >
          <div className="flex items-center space-x-2">
            <Network className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-sm">Federation</span>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="show-federated" checked={federatedVisible} onCheckedChange={handleFederatedToggle} />
            <Label htmlFor="show-federated" className="text-sm">
              {federatedVisible ? (
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>Show Federated</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <EyeOff className="h-3 w-3" />
                  <span>Hide Federated</span>
                </div>
              )}
            </Label>
          </div>

          {federatedVisible && (
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>
                <Badge>{federatedStats.nodes}</Badge> federated nodes
              </div>
              <div>
                <Badge>{federatedStats.edges}</Badge> cross-network edges
              </div>
              <div>
                <Badge>{federatedStats.networks}</Badge> external networks
              </div>
            </div>
          )}
        </Panel>

        {/* Legend Panel */}
        <Panel position="bottom-right" className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs space-y-2">
            <div className="font-medium">Legend</div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-green-500"></div>
                <span>Introduction</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-amber-500"></div>
                <span>Meeting</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-purple-500" style={{ borderTop: "1px dashed" }}></div>
                <span>Message</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-blue-500" style={{ borderTop: "2px dashed" }}></div>
                <span>Cross-Network</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* Keyboard Shortcuts Panel */}
        {selectedNode && (
          <Panel
            position="bottom-left"
            className="bg-card border border-border rounded-lg p-3"
            data-tour="shortcuts-panel"
          >
            <div className="text-xs space-y-1">
              <div className="font-medium flex items-center gap-1">
                <Keyboard className="h-3 w-3" />
                Shortcuts
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                <div>
                  <kbd>H</kbd> Hide
                </div>
                <div>
                  <kbd>P</kbd> Pin
                </div>
                <div>
                  <kbd>L</kbd> Lock
                </div>
                <div>
                  <kbd>I</kbd> Invite
                </div>
                <div>
                  <kbd>N</kbd> Nudge
                </div>
                <div>
                  <kbd>E</kbd> Email
                </div>
                <div>
                  <kbd>S</kbd> SMS
                </div>
                <div>
                  <kbd>T</kbd> Times
                </div>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>

      {/* People Drawer */}
      <PeopleDrawer node={drawerNode} onClose={() => setDrawerNode(null)} tenantId="current-tenant-id" />

      {/* Keyboard Handler */}
      <GraphKeyboardHandler selectedNode={selectedNode} onAction={handleContextAction} />
    </div>
  )
}
