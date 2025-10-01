"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageSquare, Send, Save, Eye } from "lucide-react"
import { sendInvite, saveDraftInvite } from "@/app/actions/invites"
import { useToast } from "@/hooks/use-toast"

export function InviteComposer() {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    role: "member",
    tier: "member",
    sendVia: [] as string[],
    customMessage: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSendViaChange = (channel: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      sendVia: checked ? [...prev.sendVia, channel] : prev.sendVia.filter((c) => c !== channel),
    }))
  }

  const handleSend = async () => {
    if (!formData.email && !formData.phone) {
      toast({
        title: "Error",
        description: "Please provide either email or phone number",
        variant: "destructive",
      })
      return
    }

    if (formData.sendVia.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one delivery method",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await sendInvite(formData)
      toast({
        title: "Success",
        description: "Invite sent successfully",
      })
      // Reset form
      setFormData({
        email: "",
        phone: "",
        role: "member",
        tier: "member",
        sendVia: [],
        customMessage: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invite",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    setIsLoading(true)
    try {
      await saveDraftInvite(formData)
      toast({
        title: "Success",
        description: "Draft saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="person@company.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Role & Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Role & Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                  <SelectItem value="scout">Scout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tier">Tier</Label>
              <Select
                value={formData.tier}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, tier: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Method */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Delivery Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="email-delivery"
                checked={formData.sendVia.includes("email")}
                onCheckedChange={(checked) => handleSendViaChange("email", checked as boolean)}
                disabled={!formData.email}
              />
              <Label htmlFor="email-delivery" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sms-delivery"
                checked={formData.sendVia.includes("sms")}
                onCheckedChange={(checked) => handleSendViaChange("sms", checked as boolean)}
                disabled={!formData.phone}
              />
              <Label htmlFor="sms-delivery" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                SMS
              </Label>
              <Badge variant="secondary" className="text-xs">
                Beta
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Message */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custom Message (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add a personal note to the invitation..."
            value={formData.customMessage}
            onChange={(e) => setFormData((prev) => ({ ...prev, customMessage: e.target.value }))}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleSaveDraft} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>

        <div className="flex items-center space-x-2">
          <Button variant="outline" disabled={isLoading}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSend} disabled={isLoading}>
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? "Sending..." : "Send Invite"}
          </Button>
        </div>
      </div>
    </div>
  )
}
