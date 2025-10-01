"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Building2, Calendar, Search, ArrowRight, Clock, Users } from "lucide-react"
import { useTenant } from "@/lib/hooks/use-tenant"

interface SearchResult {
  id: string
  type: "person" | "company" | "event"
  title: string
  subtitle?: string
  description?: string
  avatar?: string
  badges?: string[]
  metadata?: Record<string, any>
  url: string
}

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([])
  const router = useRouter()
  const { tenant } = useTenant()
  const supabase = createBrowserClient()

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("ellie-recent-searches")
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored).slice(0, 5))
      } catch (e) {
        console.warn("Failed to parse recent searches")
      }
    }
  }, [])

  // Save to recent searches
  const saveToRecent = useCallback(
    (result: SearchResult) => {
      const updated = [result, ...recentSearches.filter((r) => r.id !== result.id)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem("ellie-recent-searches", JSON.stringify(updated))
    },
    [recentSearches],
  )

  // Search function
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || !tenant) return

      setLoading(true)
      try {
        const searchResults: SearchResult[] = []

        // Search people
        const { data: people } = await supabase
          .from("profiles")
          .select(`
          id,
          full_name,
          email,
          role,
          tier,
          tags,
          offers,
          asks,
          scarcity_score,
          companies:companies(name)
        `)
          .eq("tenant_id", tenant.id)
          .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
          .limit(10)

        people?.forEach((person) => {
          searchResults.push({
            id: person.id,
            type: "person",
            title: person.full_name || person.email,
            subtitle: person.companies?.name || person.role,
            avatar: `/placeholder.svg?height=32&width=32&query=${encodeURIComponent(person.full_name || person.email)}`,
            badges: [
              person.tier,
              ...(person.tags || []).slice(0, 2),
              person.scarcity_score > 80 ? "High Demand" : null,
            ].filter(Boolean),
            metadata: {
              role: person.role,
              tier: person.tier,
              scarcityScore: person.scarcity_score,
              offers: person.offers,
              asks: person.asks,
            },
            url: `/dashboard/people/${person.id}`,
          })
        })

        // Search companies
        const { data: companies } = await supabase
          .from("companies")
          .select(`
          id,
          name,
          sector,
          stage,
          tags,
          traction
        `)
          .eq("tenant_id", tenant.id)
          .or(`name.ilike.%${searchQuery}%,sector.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
          .limit(10)

        companies?.forEach((company) => {
          searchResults.push({
            id: company.id,
            type: "company",
            title: company.name,
            subtitle: `${company.stage} • ${company.sector}`,
            avatar: `/placeholder.svg?height=32&width=32&query=${encodeURIComponent(company.name)}`,
            badges: [company.stage, company.sector, ...(company.tags || []).slice(0, 2)].filter(Boolean),
            metadata: {
              stage: company.stage,
              sector: company.sector,
              traction: company.traction,
            },
            url: `/dashboard/startups/${company.id}`,
          })
        })

        // Search events
        const { data: events } = await supabase
          .from("events")
          .select(`
          id,
          name,
          starts_at,
          ends_at,
          location,
          roster
        `)
          .eq("tenant_id", tenant.id)
          .or(`name.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
          .limit(10)

        events?.forEach((event) => {
          const attendeeCount = event.roster?.attendees?.length || 0
          const isUpcoming = new Date(event.starts_at) > new Date()

          searchResults.push({
            id: event.id,
            type: "event",
            title: event.name,
            subtitle: event.location,
            description: `${attendeeCount} attendees • ${new Date(event.starts_at).toLocaleDateString()}`,
            badges: [isUpcoming ? "Upcoming" : "Past", `${attendeeCount} attendees`],
            metadata: {
              startsAt: event.starts_at,
              endsAt: event.ends_at,
              location: event.location,
              attendeeCount,
            },
            url: `/dashboard/events/${event.id}`,
          })
        })

        setResults(searchResults)
      } catch (error) {
        console.error("Search failed:", error)
      } finally {
        setLoading(false)
      }
    },
    [tenant, supabase],
  )

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Handle selection
  const handleSelect = useCallback(
    (result: SearchResult) => {
      saveToRecent(result)
      onOpenChange(false)
      router.push(result.url)
    },
    [saveToRecent, onOpenChange, router],
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onOpenChange(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onOpenChange])

  const getIcon = (type: string) => {
    switch (type) {
      case "person":
        return User
      case "company":
        return Building2
      case "event":
        return Calendar
      default:
        return Search
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "person":
        return "People"
      case "company":
        return "Companies"
      case "event":
        return "Events"
      default:
        return "Results"
    }
  }

  // Group results by type
  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.type]) acc[result.type] = []
      acc[result.type].push(result)
      return acc
    },
    {} as Record<string, SearchResult[]>,
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Global Search"
      description="Search across people, companies, and events"
    >
      <CommandInput placeholder="Search people, companies, events..." value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>{loading ? "Searching..." : "No results found."}</CommandEmpty>

        {/* Recent searches when no query */}
        {!query && recentSearches.length > 0 && (
          <>
            <CommandGroup heading="Recent">
              {recentSearches.map((result) => {
                const Icon = getIcon(result.type)
                return (
                  <CommandItem
                    key={`recent-${result.id}`}
                    value={result.title}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3 p-3"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-shrink-0">
                        {result.avatar ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={result.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              <Icon className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <Icon className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{result.title}</div>
                        {result.subtitle && (
                          <div className="text-sm text-muted-foreground truncate">{result.subtitle}</div>
                        )}
                      </div>
                    </div>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CommandItem>
                )
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Search results grouped by type */}
        {Object.entries(groupedResults).map(([type, typeResults]) => (
          <CommandGroup key={type} heading={getTypeLabel(type)}>
            {typeResults.map((result) => {
              const Icon = getIcon(result.type)
              return (
                <CommandItem
                  key={result.id}
                  value={result.title}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center gap-3 p-3"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0">
                      {result.avatar ? (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={result.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            <Icon className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Icon className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-sm text-muted-foreground truncate">{result.subtitle}</div>
                      )}
                      {result.description && (
                        <div className="text-xs text-muted-foreground truncate mt-1">{result.description}</div>
                      )}
                      {result.badges && result.badges.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {result.badges.slice(0, 3).map((badge, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CommandItem>
              )
            })}
          </CommandGroup>
        ))}

        {/* Quick actions */}
        {query && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Quick Actions">
              <CommandItem
                onSelect={() => {
                  onOpenChange(false)
                  router.push(`/dashboard/people?search=${encodeURIComponent(query)}`)
                }}
                className="flex items-center gap-3 p-3"
              >
                <Users className="h-4 w-4" />
                <span>Search people for "{query}"</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  onOpenChange(false)
                  router.push(`/dashboard/startups?search=${encodeURIComponent(query)}`)
                }}
                className="flex items-center gap-3 p-3"
              >
                <Building2 className="h-4 w-4" />
                <span>Search companies for "{query}"</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  onOpenChange(false)
                  router.push(`/dashboard/events?search=${encodeURIComponent(query)}`)
                }}
                className="flex items-center gap-3 p-3"
              >
                <Calendar className="h-4 w-4" />
                <span>Search events for "{query}"</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
