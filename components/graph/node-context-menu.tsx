"use client"

import type React from "react"

import { useState } from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu"
import {
  Eye,
  EyeOff,
  Pin,
  PinOff,
  Lock,
  Unlock,
  ExternalLink,
  UserPlus,
  Zap,
  Mail,
  Phone,
  Calendar,
  Network,
} from "lucide-react"
import type { Node } from "reactflow"

interface NodeContextMenuProps {
  children: React.ReactNode
  node: Node
  onAction: (action: string, nodeId: string) => void
}

export function NodeContextMenu({ children, node, onAction }: NodeContextMenuProps) {
  const [isHidden, setIsHidden] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)

  const handleAction = (action: string) => {
    console.log(`[v0] Context menu action: ${action} for node:`, node.id)

    switch (action) {
      case "hide":
        setIsHidden(!isHidden)
        onAction("hide", node.id)
        break
      case "pin":
        setIsPinned(!isPinned)
        onAction("pin", node.id)
        break
      case "private":
        setIsPrivate(!isPrivate)
        onAction("private", node.id)
        break
      case "open-people":
        onAction("open-people", node.id)
        break
      case "invite":
      case "nudge":
      case "email":
      case "sms":
      case "propose-times":
        onAction(action, node.id)
        break
    }
  }

  const isGuest = node.data?.tier === "guest"
  const isFederated = node.data?.isFederated

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {/* Quick Actions */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Zap className="mr-2 h-4 w-4" />
            Quick Actions
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem onClick={() => handleAction("invite")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite to Connect
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleAction("nudge")}>
              <Zap className="mr-2 h-4 w-4" />
              Send Nudge
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => handleAction("email")}>
              <Mail className="mr-2 h-4 w-4" />
              Open as Email
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleAction("sms")}>
              <Phone className="mr-2 h-4 w-4" />
              Open as SMS
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleAction("propose-times")}>
              <Calendar className="mr-2 h-4 w-4" />
              Propose Times
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        {/* View Controls */}
        {isGuest && (
          <ContextMenuItem onClick={() => handleAction("hide")}>
            {isHidden ? (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show Guest
              </>
            ) : (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Guest
              </>
            )}
          </ContextMenuItem>
        )}

        <ContextMenuItem onClick={() => handleAction("pin")}>
          {isPinned ? (
            <>
              <PinOff className="mr-2 h-4 w-4" />
              Unpin Node
            </>
          ) : (
            <>
              <Pin className="mr-2 h-4 w-4" />
              Pin Node
            </>
          )}
        </ContextMenuItem>

        <ContextMenuItem onClick={() => handleAction("private")}>
          {isPrivate ? (
            <>
              <Unlock className="mr-2 h-4 w-4" />
              Mark as Public
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Mark as Private
            </>
          )}
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Navigation */}
        <ContextMenuItem onClick={() => handleAction("open-people")}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in People
        </ContextMenuItem>

        {isFederated && (
          <ContextMenuItem onClick={() => handleAction("view-network")}>
            <Network className="mr-2 h-4 w-4" />
            View Source Network
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
