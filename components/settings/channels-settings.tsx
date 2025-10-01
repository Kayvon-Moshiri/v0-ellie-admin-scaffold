"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, Send, AlertCircle, CheckCircle, Clock, X } from "lucide-react"
import { ProviderSetupDialog } from "./provider-setup-dialog"
import { getCommsProviders, testProvider, deleteProvider } from "@/app/actions/comms-providers"
import { useToast } from "@/hooks/use-toast"

interface CommsProvider {
  id: string
  provider_type: string
  provider_name: string
  status: "pending" | "verified" | "failed" | "disabled"
  is_default: boolean
  is_enabled: boolean
  last_test_at?: string
  last_test_status?: "success" | "failed"
  last_test_error?: string
  created_at: string
}

const PROVIDER_CONFIGS = {
  email_supabase: {
    name: "Supabase SMTP",
    description: "Built-in email service (MVP)",
    icon: "📧",
    fields: [
      { key: "from_email", label: "From Email", type: "email", required: true },
      { key: "from_name", label: "From Name", type: "text", required: true },
    ],
  },
  email_sendgrid: {
    name: "SendGrid",
    description: "Professional email delivery service",
    icon: "📨",
    fields: [
      { key: "api_key", label: "API Key", type: "password", required: true },
      { key: "from_email", label: "From Email", type: "email", required: true },
      { key: "from_name", label: "From Name", type: "text", required: true },
    ],
  },
  sms_twilio: {
    name: "Twilio SMS",
    description: "SMS messaging service",
    icon: "💬",
    fields: [
      { key: "account_sid", label: "Account SID", type: "text", required: true },
      { key: "auth_token", label: "Auth Token", type: "password", required: true },
      { key: "phone_number", label: "Phone Number", type: "tel", required: true },
    ],
  },
  voice_twilio: {
    name: "Twilio Voice",
    description: "Voice calling service",
    icon: "📞",
    fields: [
      { key: "account_sid", label: "Account SID", type: "text", required: true },
      { key: "auth_token", label: "Auth Token", type: "password", required: true },
      { key: "phone_number", label: "Phone Number", type: "tel", required: true },
    ],
  },
  imessage_apple: {
    name: "Apple Messages for Business",
    description: "iMessage business messaging (requires Apple approval)",
    icon: "💙",
    disabled: true,
    tooltip: "Requires Apple Messages for Business approval and BSP certification. Contact Apple for setup.",
    fields: [
      { key: "business_id", label: "Business ID", type: "text", required: true },
      { key: "certificate", label: "Certificate", type: "file", required: true },
    ],
  },
  whatsapp_twilio: {
    name: "WhatsApp Business (Twilio)",
    description: "WhatsApp business messaging via Twilio",
    icon: "💚",
    fields: [
      { key: "account_sid", label: "Account SID", type: "text", required: true },
      { key: "auth_token", label: "Auth Token", type: "password", required: true },
      { key: "phone_number", label: "WhatsApp Number", type: "tel", required: true },
    ],
  },
}

export function ChannelsSettings() {
  const [providers, setProviders] = useState<CommsProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [setupDialogOpen, setSetupDialogOpen] = useState(false)
  const [selectedProviderType, setSelectedProviderType] = useState<string>("")
  const [testingProvider, setTestingProvider] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    try {
      const data = await getCommsProviders()
      setProviders(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load communication providers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddProvider = (providerType: string) => {
    setSelectedProviderType(providerType)
    setSetupDialogOpen(true)
  }

  const handleTestProvider = async (providerId: string) => {
    setTestingProvider(providerId)
    try {
      await testProvider(providerId)
      toast({
        title: "Test Successful",
        description: "Provider test completed successfully",
      })
      loadProviders() // Refresh to show updated test status
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Provider test failed. Check your configuration.",
        variant: "destructive",
      })
    } finally {
      setTestingProvider("")
    }
  }

  const handleDeleteProvider = async (providerId: string) => {
    try {
      await deleteProvider(providerId)
      toast({
        title: "Provider Deleted",
        description: "Communication provider has been removed",
      })
      loadProviders()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete provider",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      verified: "default",
      failed: "destructive",
      pending: "secondary",
      disabled: "outline",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Communication Channels</CardTitle>
          <CardDescription>
            Configure your communication providers for white-label messaging. Each tenant can use their own SMTP, SMS,
            and messaging credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Object.entries(PROVIDER_CONFIGS).map(([type, config]) => {
              const existingProvider = providers.find((p) => p.provider_type === type)

              return (
                <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{config.name}</h3>
                        {config.disabled && (
                          <Badge variant="outline" className="text-xs">
                            Disabled
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                      {config.tooltip && <p className="text-xs text-amber-600 mt-1">{config.tooltip}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {existingProvider ? (
                      <>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(existingProvider.status)}
                          {getStatusBadge(existingProvider.status)}
                          {existingProvider.is_default && <Badge variant="secondary">Default</Badge>}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestProvider(existingProvider.id)}
                          disabled={testingProvider === existingProvider.id}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          {testingProvider === existingProvider.id ? "Testing..." : "Test"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleAddProvider(type)}>
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteProvider(existingProvider.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddProvider(type)}
                        disabled={config.disabled}
                        title={config.tooltip}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <ProviderSetupDialog
        open={setupDialogOpen}
        onOpenChange={setSetupDialogOpen}
        providerType={selectedProviderType}
        providerConfig={PROVIDER_CONFIGS[selectedProviderType as keyof typeof PROVIDER_CONFIGS]}
        existingProvider={providers.find((p) => p.provider_type === selectedProviderType)}
        onSuccess={() => {
          setSetupDialogOpen(false)
          loadProviders()
        }}
      />
    </div>
  )
}
