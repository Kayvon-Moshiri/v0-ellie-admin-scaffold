import { GraphCanvas } from "@/components/graph/graph-canvas"
import { getUserProfile } from "@/lib/auth"

export default async function GraphPage() {
  const profile = await getUserProfile()

  return (
    <div className="h-screen w-full">
      <GraphCanvas tenantId={profile.tenant_id} />
    </div>
  )
}
