"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

export function useGraphData(tenantId: string, filters: any) {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    const loadGraphData = async () => {
      setLoading(true)
      try {
        // Load local tenant data
        const { data: peopleData } = await supabase
          .from("vw_people_heat")
          .select(`
            profile_id,
            degree,
            weighted_degree,
            last_active,
            profiles!inner(
              id,
              full_name,
              role,
              tier,
              tags,
              offers,
              asks,
              scarcity_score,
              company:companies(name)
            )
          `)
          .eq("tenant_id", tenantId)

        const { data: startupData } = await supabase
          .from("vw_startup_heat")
          .select(`
            company_id,
            interest_score,
            companies!inner(
              id,
              name,
              industry,
              stage,
              employee_count
            )
          `)
          .eq("tenant_id", tenantId)

        const { data: edgeData } = await supabase.from("edges").select("*").eq("tenant_id", tenantId)

        // Load federated data if enabled
        let federatedPeople = []
        const federatedEdges = []

        if (filters?.showFederated) {
          try {
            const federatedResponse = await fetch("/api/federation/discovery?type=people&limit=100")
            if (federatedResponse.ok) {
              const federatedResult = await federatedResponse.json()
              federatedPeople = federatedResult.data || []
            }
          } catch (error) {
            console.warn("Failed to load federated data:", error)
          }
        }

        // Process local nodes
        const personNodes = (peopleData || []).map((item) => ({
          id: item.profile_id,
          type: "person",
          position: { x: Math.random() * 800, y: Math.random() * 600 },
          data: {
            label: item.profiles.full_name,
            role: item.profiles.role,
            tier: item.profiles.tier,
            tags: item.profiles.tags,
            offers: item.profiles.offers,
            asks: item.profiles.asks,
            company: item.profiles.company?.name,
            activityScore: Math.round(item.weighted_degree),
            connections: item.degree,
            scarcityScore: item.profiles.scarcity_score,
            avatar: `/placeholder.svg?height=40&width=40&query=${encodeURIComponent(item.profiles.full_name)}`,
            isFederated: false,
          },
          style: {
            width: Math.max(40, Math.min(80, item.weighted_degree * 2)),
            height: Math.max(40, Math.min(80, item.weighted_degree * 2)),
          },
        }))

        // Process federated nodes
        const federatedNodes = federatedPeople.map((person) => ({
          id: `federated-${person.id}`,
          type: "federated",
          position: {
            x: Math.random() * 200 + 600, // Position federated nodes to the right
            y: Math.random() * 600,
          },
          data: {
            label: person.full_name,
            role: person.role,
            tier: person.tier,
            tags: person.tags || [],
            activityScore: Math.round(person.scarcity_score * 100),
            connections: 0, // We don't have connection data for federated nodes
            scarcityScore: person.scarcity_score,
            avatar: `/placeholder.svg?height=40&width=40&query=${encodeURIComponent(person.full_name)}`,
            isFederated: true,
            sourceNetwork: person.source_network,
          },
          style: {
            width: 60,
            height: 60,
          },
        }))

        const startupNodes = (startupData || []).map((item) => ({
          id: `startup-${item.company_id}`,
          type: "startup",
          position: { x: Math.random() * 800, y: Math.random() * 600 },
          data: {
            label: item.companies.name,
            industry: item.companies.industry,
            stage: item.companies.stage,
            employees: item.companies.employee_count,
            momentum: Math.round(item.interest_score),
            tier: "startup",
            isFederated: false,
          },
          style: {
            width: Math.max(50, Math.min(90, item.interest_score * 3)),
            height: Math.max(50, Math.min(90, item.interest_score * 3)),
          },
        }))

        // Process local edges
        const flowEdges = (edgeData || []).map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: "connection",
          data: {
            weight: edge.weight,
            relationship_type: edge.kind,
            last_event_at: edge.last_event_at,
            isCrossTenant: false,
          },
          style: {
            strokeWidth: Math.max(1, edge.weight / 10),
            strokeDasharray: edge.kind === "message" ? "5,5" : undefined,
          },
        }))

        // Add some sample cross-tenant edges for demonstration
        // In a real implementation, these would come from the federation system
        const crossTenantEdges = federatedNodes
          .slice(0, 3)
          .map((federatedNode, index) => {
            const localNode = personNodes[index % personNodes.length]
            if (!localNode) return null

            return {
              id: `cross-tenant-${federatedNode.id}-${localNode.id}`,
              source: localNode.id,
              target: federatedNode.id,
              type: "federated",
              data: {
                weight: 5,
                relationship_type: "intro",
                isCrossTenant: true,
                sourceNetwork: "Local Network",
                targetNetwork: federatedNode.data.sourceNetwork,
              },
              style: {
                strokeWidth: 2,
                strokeDasharray: "8,4",
              },
            }
          })
          .filter(Boolean)

        setNodes([...personNodes, ...federatedNodes, ...startupNodes])
        setEdges([...flowEdges, ...crossTenantEdges])
      } catch (error) {
        console.error("Failed to load graph data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadGraphData()
  }, [tenantId, filters, supabase])

  return { nodes, edges, loading }
}
