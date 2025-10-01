"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

interface GraphFiltersProps {
  filters: {
    role: string
    tier: string
    tags: string
    timeWindow: number
    onlyHot: boolean
    hideGuests: boolean
    showFederated: boolean
  }
  onFiltersChange: (filters: any) => void
}

export function GraphFilters({ filters, onFiltersChange }: GraphFiltersProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <Card className="p-4 bg-card/90 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-4">
        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <Label className="text-xs">Role:</Label>
          <Select value={filters.role} onValueChange={(value) => updateFilter("role", value)}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="founder">Founder</SelectItem>
              <SelectItem value="investor">Investor</SelectItem>
              <SelectItem value="advisor">Advisor</SelectItem>
              <SelectItem value="scout">Scout</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tier Filter */}
        <div className="flex items-center gap-2">
          <Label className="text-xs">Tier:</Label>
          <Select value={filters.tier} onValueChange={(value) => updateFilter("tier", value)}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="guest">Guest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags Filter */}
        <div className="flex items-center gap-2">
          <Label className="text-xs">Tags:</Label>
          <Input
            placeholder="ai, fintech, b2b..."
            value={filters.tags}
            onChange={(e) => updateFilter("tags", e.target.value)}
            className="w-40 h-8"
          />
        </div>

        {/* Time Window */}
        <div className="flex items-center gap-2">
          <Label className="text-xs">Days:</Label>
          <Select
            value={filters.timeWindow.toString()}
            onValueChange={(value) => updateFilter("timeWindow", Number.parseInt(value))}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="90">90</SelectItem>
              <SelectItem value="365">365</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Toggle Switches */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={filters.onlyHot} onCheckedChange={(checked) => updateFilter("onlyHot", checked)} />
            <Label className="text-xs">Only Hot</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={filters.hideGuests} onCheckedChange={(checked) => updateFilter("hideGuests", checked)} />
            <Label className="text-xs">Hide Guests</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={filters.showFederated}
              onCheckedChange={(checked) => updateFilter("showFederated", checked)}
            />
            <Label className="text-xs">Show Federated</Label>
          </div>
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onFiltersChange({
              role: "all",
              tier: "all",
              tags: "",
              timeWindow: 30,
              onlyHot: false,
              hideGuests: false,
              showFederated: false,
            })
          }
        >
          Reset
        </Button>
      </div>
    </Card>
  )
}
