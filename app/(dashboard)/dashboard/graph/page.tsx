import { NetworkGraphView } from "@/components/dashboard/network-graph-view"

export default function GraphPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Network Graph</h1>
        <p className="text-muted-foreground">
          Visualize and explore your entire network connections and relationships.
        </p>
      </div>

      <NetworkGraphView className="min-h-[600px]" />
    </div>
  )
}
