"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Profile } from "@/lib/types"
import {
  Network,
  GitBranch,
  TrendingUp,
  Users,
  Building2,
  UserSearch,
  Calendar,
  Mail,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
  CheckCircle,
  Flame,
} from "lucide-react"

interface DashboardSidebarProps {
  profile: Profile
}

const navigationItems = [
  {
    title: "Graph",
    href: "/dashboard/graph",
    icon: Network,
    description: "Network radar screen",
    badge: null,
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: TrendingUp,
    description: "Overview & stats",
    badge: null,
  },
  {
    title: "Pipeline",
    href: "/dashboard/pipeline",
    icon: GitBranch,
    description: "Introduction pipeline",
    badge: "3",
  },
  {
    title: "Heatboard",
    href: "/dashboard/heatboard",
    icon: Flame,
    description: "Activity & momentum",
    badge: null,
  },
  {
    title: "People",
    href: "/dashboard/people",
    icon: Users,
    description: "Network members",
    badge: null,
  },
  {
    title: "Startups",
    href: "/dashboard/startups",
    icon: Building2,
    description: "Company directory",
    badge: null,
    comingSoon: true,
  },
  {
    title: "Federation",
    href: "/dashboard/federation",
    icon: Network,
    description: "Cross-network management",
    badge: null,
    children: [
      {
        title: "Discovery",
        href: "/dashboard/discovery",
        icon: Users,
        description: "Cross-network discovery",
      },
      {
        title: "Approvals",
        href: "/dashboard/federation/approvals",
        icon: CheckCircle,
        description: "Intro approvals",
        badge: "2",
      },
      {
        title: "Privacy",
        href: "/dashboard/federation/privacy",
        icon: Shield,
        description: "Privacy & rate limits",
      },
    ],
  },
  {
    title: "Scouts",
    href: "/dashboard/scouts",
    icon: UserSearch,
    description: "Scout network",
    badge: null,
  },
  {
    title: "Events",
    href: "/dashboard/events",
    icon: Calendar,
    description: "Networking events",
    badge: "2",
    comingSoon: true,
  },
  {
    title: "Invites",
    href: "/dashboard/invites",
    icon: Mail,
    description: "Manage invitations",
    badge: null,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Platform settings",
    badge: null,
  },
]

export function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()
  const { toast } = useToast()

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) => (prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]))
  }

  const handleComingSoonClick = (e: React.MouseEvent, title: string) => {
    e.preventDefault()
    toast({
      title: "Coming Soon",
      description: `${title} is currently under development and will be available soon.`,
    })
  }

  return (
    <div
      className={cn(
        "flex flex-col bg-card border-r border-border/50 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Ellie</h1>
              <p className="text-xs text-muted-foreground">Admin Console</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8 p-0">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Tenant Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">{profile.tenant?.name?.charAt(0) || "E"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile.tenant?.name || "Demo Network"}</p>
              <p className="text-xs text-muted-foreground capitalize">{profile.role} access</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          const isExpanded = expandedItems.includes(item.href)
          const hasChildren = item.children && item.children.length > 0
          const Icon = item.icon

          return (
            <div key={item.href}>
              {hasChildren || item.comingSoon ? (
                <button
                  onClick={
                    item.comingSoon ? (e) => handleComingSoonClick(e, item.title) : () => toggleExpanded(item.href)
                  }
                  className="w-full"
                >
                  <div
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive && !hasChildren && "bg-primary text-primary-foreground hover:bg-primary/90",
                      isCollapsed && "justify-center",
                      item.comingSoon && "opacity-50 blur-[0.5px] cursor-not-allowed",
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.title}</span>
                        {item.badge && (
                          <Badge variant={isActive ? "secondary" : "outline"} className="h-5 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        {hasChildren && (
                          <ChevronRight className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")} />
                        )}
                      </>
                    )}
                  </div>
                </button>
              ) : (
                <Link href={item.href}>
                  <div
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                      isCollapsed && "justify-center",
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <Badge variant={isActive ? "secondary" : "outline"} className="h-5 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </Link>
              )}

              {/* Children */}
              {hasChildren && isExpanded && !isCollapsed && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const childIsActive = pathname === child.href
                    const ChildIcon = child.icon

                    return (
                      <Link key={child.href} href={child.href}>
                        <div
                          className={cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            childIsActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                          )}
                        >
                          <ChildIcon className="h-4 w-4 flex-shrink-0" />
                          <span className="flex-1">{child.title}</span>
                          {child.badge && (
                            <Badge variant={childIsActive ? "secondary" : "outline"} className="h-5 text-xs">
                              {child.badge}
                            </Badge>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">
                {profile.display_name?.charAt(0) || profile.full_name?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile.display_name || profile.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
