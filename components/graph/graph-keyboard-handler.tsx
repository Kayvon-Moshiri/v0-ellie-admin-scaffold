"use client"

import { useEffect } from "react"
import type { Node } from "reactflow"

interface GraphKeyboardHandlerProps {
  selectedNode: Node | null
  onAction: (action: string, nodeId: string) => void
}

export function GraphKeyboardHandler({ selectedNode, onAction }: GraphKeyboardHandlerProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedNode) return

      // Prevent default browser behavior for our shortcuts
      const shortcuts = ["h", "p", "l", "i", "n", "e", "s", "t"]
      if (shortcuts.includes(event.key.toLowerCase()) && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // Only handle if not typing in an input
        const activeElement = document.activeElement
        if (activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA") {
          return
        }

        event.preventDefault()

        switch (event.key.toLowerCase()) {
          case "h":
            onAction("hide", selectedNode.id)
            break
          case "p":
            onAction("pin", selectedNode.id)
            break
          case "l":
            onAction("private", selectedNode.id)
            break
          case "i":
            onAction("invite", selectedNode.id)
            break
          case "n":
            onAction("nudge", selectedNode.id)
            break
          case "e":
            onAction("email", selectedNode.id)
            break
          case "s":
            onAction("sms", selectedNode.id)
            break
          case "t":
            onAction("propose-times", selectedNode.id)
            break
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedNode, onAction])

  return null
}
