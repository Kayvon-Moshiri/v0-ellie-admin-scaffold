export interface Tenant {
  id: string
  name: string
  slug: string
  domain?: string
  logo_url?: string
  theme_config: Record<string, any>
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  tenant_id: string
  email: string
  full_name?: string
  display_name?: string
  bio?: string
  avatar_url?: string
  role: "admin" | "member" | "guest" | "scout"
  membership_tier: "free" | "premium" | "member"
  location?: string
  timezone?: string
  linkedin_url?: string
  twitter_url?: string
  company?: string
  job_title?: string
  interests?: string[]
  skills?: string[]
  preferences: Record<string, any>
  activity_score: number
  last_active_at?: string
  created_at: string
  updated_at: string
  tenant?: Tenant
}

export interface Startup {
  id: string
  tenant_id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  website_url?: string
  industry?: string
  stage: "idea" | "pre-seed" | "seed" | "series-a" | "series-b" | "series-c" | "growth" | "ipo" | "acquired"
  funding_amount?: number
  employee_count?: number
  location?: string
  founded_year?: number
  tags?: string[]
  momentum_score: number
  created_at: string
  updated_at: string
}

export interface Connection {
  id: string
  tenant_id: string
  from_user_id: string
  to_user_id: string
  connection_type: "mutual" | "following" | "pending"
  strength: number
  context?: string
  created_at: string
  updated_at: string
}

export interface Introduction {
  id: string
  tenant_id: string
  requester_id: string
  person_a_id: string
  person_b_id: string
  status: "pending" | "consent_requested" | "approved" | "declined" | "completed" | "cancelled"
  reason?: string
  context?: string
  ellie_notes?: string
  priority: number
  scheduled_for?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface NetworkNode {
  id: string
  display_name?: string
  full_name?: string
  avatar_url?: string
  company?: string
  job_title?: string
  activity_score: number
  role: string
}

export interface NetworkEdge {
  source: string
  target: string
  strength: number
  connection_type: string
  context?: string
}

export interface NetworkGraph {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
}
