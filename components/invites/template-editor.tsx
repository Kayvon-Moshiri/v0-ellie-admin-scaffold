"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Eye, Code, Mail, MessageSquare } from "lucide-react"
import { getTemplates, saveTemplate } from "@/app/actions/templates"
import { useToast } from "@/hooks/use-toast"

interface Template {
  id: string
  name: string
  type: "email" | "sms"
  subject?: string
  content: string
  variables: string[]
}

export function TemplateEditor() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [previewData, setPreviewData] = useState({
    role: "member",
    tier: "member",
    tenant: "Acme Network",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const data = await getTemplates()
      setTemplates(data)
      if (data.length > 0) {
        setSelectedTemplate(data[0])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    if (!selectedTemplate) return

    try {
      await saveTemplate(selectedTemplate)
      toast({
        title: "Success",
        description: "Template saved successfully",
      })
      setIsEditing(false)
      loadTemplates()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      })
    }
  }

  const renderPreview = (content: string) => {
    let preview = content
    preview = preview.replace(/\{\{role\}\}/g, previewData.role)
    preview = preview.replace(/\{\{tier\}\}/g, previewData.tier)
    preview = preview.replace(/\{\{tenant\}\}/g, previewData.tenant)
    return preview
  }

  const availableVariables = [
    { key: "{{role}}", description: "User role (admin, member, guest, scout)" },
    { key: "{{tier}}", description: "User tier (member, vip, guest, startup)" },
    { key: "{{tenant}}", description: "Tenant/organization name" },
    { key: "{{magic_link}}", description: "One-time magic link for signup" },
    { key: "{{custom_message}}", description: "Custom message from sender" },
  ]

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Template Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Select
              value={selectedTemplate?.id || ""}
              onValueChange={(value) => {
                const template = templates.find((t) => t.id === value)
                setSelectedTemplate(template || null)
                setIsEditing(false)
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      {template.type === "email" ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                      {template.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(!isEditing)}>
              <Code className="h-4 w-4 mr-2" />
              {isEditing ? "Stop Editing" : "Edit"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedTemplate && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {selectedTemplate.type === "email" ? (
                  <Mail className="h-5 w-5" />
                ) : (
                  <MessageSquare className="h-5 w-5" />
                )}
                {selectedTemplate.name}
                <Badge variant="outline">{selectedTemplate.type}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={selectedTemplate.name}
                      onChange={(e) => setSelectedTemplate((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                    />
                  </div>

                  {selectedTemplate.type === "email" && (
                    <div className="space-y-2">
                      <Label htmlFor="template-subject">Subject Line</Label>
                      <Input
                        id="template-subject"
                        value={selectedTemplate.subject || ""}
                        onChange={(e) =>
                          setSelectedTemplate((prev) => (prev ? { ...prev, subject: e.target.value } : null))
                        }
                      />
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="template-content">
                  {selectedTemplate.type === "email" ? "Email Content" : "SMS Message"}
                </Label>
                <Textarea
                  id="template-content"
                  value={selectedTemplate.content}
                  onChange={(e) => setSelectedTemplate((prev) => (prev ? { ...prev, content: e.target.value } : null))}
                  rows={selectedTemplate.type === "email" ? 12 : 6}
                  readOnly={!isEditing}
                />
              </div>

              {isEditing && (
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Preview & Variables */}
          <div className="space-y-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="mt-4">
                    <div className="space-y-4">
                      {selectedTemplate.type === "email" && selectedTemplate.subject && (
                        <div>
                          <Label className="text-sm font-medium">Subject:</Label>
                          <p className="text-sm bg-muted p-2 rounded mt-1">{renderPreview(selectedTemplate.subject)}</p>
                        </div>
                      )}

                      <div>
                        <Label className="text-sm font-medium">Content:</Label>
                        <div className="text-sm bg-muted p-4 rounded mt-1 whitespace-pre-wrap">
                          {renderPreview(selectedTemplate.content)}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="mt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="preview-role">Role</Label>
                        <Select
                          value={previewData.role}
                          onValueChange={(value) => setPreviewData((prev) => ({ ...prev, role: value }))}
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
                        <Label htmlFor="preview-tier">Tier</Label>
                        <Select
                          value={previewData.tier}
                          onValueChange={(value) => setPreviewData((prev) => ({ ...prev, tier: value }))}
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

                      <div className="space-y-2">
                        <Label htmlFor="preview-tenant">Tenant Name</Label>
                        <Input
                          id="preview-tenant"
                          value={previewData.tenant}
                          onChange={(e) => setPreviewData((prev) => ({ ...prev, tenant: e.target.value }))}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Available Variables */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Variables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableVariables.map((variable) => (
                    <div key={variable.key} className="flex items-start justify-between">
                      <div>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{variable.key}</code>
                        <p className="text-xs text-muted-foreground mt-1">{variable.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
