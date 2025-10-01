"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface SearchShortcutsProps {
  onOpenSearch: () => void
}

export function SearchShortcuts({ onOpenSearch }: SearchShortcutsProps) {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global search: Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onOpenSearch()
        return
      }

      // Quick navigation shortcuts
      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        switch (e.key) {
          case "P": // People
            e.preventDefault()
            router.push("/dashboard/people")
            break
          case "C": // Companies
            e.preventDefault()
            router.push("/dashboard/startups")
            break
          case "E": // Events
            e.preventDefault()
            router.push("/dashboard/events")
            break
          case "N": // Network Graph
            e.preventDefault()
            router.push("/dashboard/network")
            break
          case "H": // Heatboard
            e.preventDefault()
            router.push("/dashboard/heatboard")
            break
          case "I": // Pipeline
            e.preventDefault()
            router.push("/dashboard/pipeline")
            break
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onOpenSearch, router])

  return null
}
