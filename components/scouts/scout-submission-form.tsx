"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, X, ExternalLink } from "lucide-react"
import { submitCompany } from "@/app/actions/scouts"

interface TractionLink {
  type: string
  url: string
  description: string
}

const SECTORS = [
  "AI/ML",
  "FinTech",
  "HealthTech",
  "EdTech",
  "CleanTech",
  "SaaS",
  "E-commerce",
  "Marketplace",
  "Developer Tools",
  "Cybersecurity",
  "Blockchain",
  "IoT",
  "Other",
]

const STAGES = ["Idea", "Pre-Seed", "Seed", "Series A", "Series B", "Series C+", "Growth", "Public"]

const TRACTION_TYPES = [
  "Revenue Dashboard",
  "User Growth",
  "Product Demo",
  "Customer Testimonials",
  "Press Coverage",
  "Partnerships",
  "Team Updates",
  "Other",
]

export function ScoutSubmissionForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    description: "",
    sector: "",
    stage: "",
    raiseAmount: "",
    notes: "",
  })
  const [tractionLinks, setTractionLinks] = useState<TractionLink[]>([])
  const [newLink, setNewLink] = useState({ type: "", url: "", description: "" })

  const addTractionLink = () => {
    if (newLink.url && newLink.type) {
      setTractionLinks([...tractionLinks, newLink])
      setNewLink({ type: "", url: "", description: "" })
    }
  }

  const removeTractionLink = (index: number) => {
    setTractionLinks(tractionLinks.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await submitCompany({
        name: formData.companyName,
        website_url: formData.website,
        description: formData.description,
        sector: formData.sector,
        stage: formData.stage,
        raise_amount: formData.raiseAmount ? Number.parseInt(formData.raiseAmount) * 100 : null, // Convert to cents
        traction_links: tractionLinks,
        notes: formData.notes,
      })

      // Reset form
      setFormData({
        companyName: "",
        website: "",
        description: "",
        sector: "",
        stage: "",
        raiseAmount: "",
        notes: "",
      })
      setTractionLinks([])

      router.refresh()
    } catch (error) {
      console.error("Failed to submit company:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Basics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder="e.g., NeuralFlow AI"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://company.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of what the company does..."
          rows={3}
          required
        />
      </div>

      {/* Sector & Stage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Sector *</Label>
          <Select value={formData.sector} onValueChange={(value) => setFormData({ ...formData, sector: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Stage *</Label>
          <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {STAGES.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="raiseAmount">Raise Amount ($)</Label>
          <Input
            id="raiseAmount"
            type="number"
            value={formData.raiseAmount}
            onChange={(e) => setFormData({ ...formData, raiseAmount: e.target.value })}
            placeholder="e.g., 2000000"
          />
        </div>
      </div>

      {/* Traction Links */}
      <div className="space-y-4">
        <div>
          <Label>Traction Links</Label>
          <p className="text-sm text-muted-foreground">
            Add links that demonstrate company traction (dashboards, demos, press, etc.)
          </p>
        </div>

        {/* Existing Links */}
        {tractionLinks.length > 0 && (
          <div className="space-y-2">
            {tractionLinks.map((link, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{link.type}</Badge>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center"
                    >
                      {link.description || link.url}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeTractionLink(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add New Link */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select value={newLink.type} onValueChange={(value) => setNewLink({ ...newLink, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Link type" />
              </SelectTrigger>
              <SelectContent>
                {TRACTION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="URL"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            />
            <Input
              placeholder="Description (optional)"
              value={newLink.description}
              onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
            />
            <Button type="button" onClick={addTractionLink} disabled={!newLink.url || !newLink.type}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </Card>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any additional context, connections, or insights..."
          rows={3}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={
            isSubmitting || !formData.companyName || !formData.description || !formData.sector || !formData.stage
          }
        >
          {isSubmitting ? "Submitting..." : "Submit Company"}
        </Button>
      </div>
    </form>
  )
}
