"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Mail, CheckCircle, ArrowRight } from "lucide-react"
import { toast } from "sonner"

interface Profile {
  id: string
  full_name: string
  email: string
  phone?: string
  tier: string
  scarcity_score: number
}

interface Introduction {
  id: string
  requester: Profile
  target: Profile
  context: string
  status: string
}

interface DoubleOptinGeneratorProps {
  intro: Introduction
  onComplete?: () => void
}

export function DoubleOptinGenerator({ intro, onComplete }: DoubleOptinGeneratorProps) {
  const [step, setStep] = useState<"consent" | "intro">("consent")
  const [consentSent, setConsentSent] = useState(false)
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [sendViaSms, setSendViaSms] = useState(false)
  const [customContext, setCustomContext] = useState("")
  const [timeSlots, setTimeSlots] = useState({
    slot1: "",
    slot2: "",
  })
  const [loading, setLoading] = useState(false)

  // Generate pre-consent message
  const generateConsentMessage = () => {
    const requesterName = intro.requester.full_name.split(" ")[0]
    const targetName = intro.target.full_name.split(" ")[0]

    return {
      subject: `Quick intro request from ${requesterName}`,
      message: `Hi ${targetName},

${requesterName} would like a brief introduction regarding ${intro.context}.

Would you be open to a 15-minute conversation?

[Yes, I'm interested] [Not right now]

Best regards,
The Ellie Team`,
    }
  }

  // Generate full introduction email
  const generateIntroEmail = () => {
    const requesterName = intro.requester.full_name
    const targetName = intro.target.full_name
    const context = customContext || intro.context

    return {
      subject: `Introduction: ${requesterName} ↔ ${targetName}`,
      message: `Hi ${targetName} and ${requesterName},

I'm delighted to introduce you both.

${requesterName}, meet ${targetName}. ${context}

I've suggested two time windows that might work for both of you:
• ${timeSlots.slot1}
• ${timeSlots.slot2}

[Schedule with ${targetName}] - Calendar link

Looking forward to hearing how this goes.

Best,
The Ellie Team

---
This introduction was facilitated through our network. Reply to connect directly.`,
    }
  }

  const handleSendConsent = async () => {
    setLoading(true)
    try {
      const consentMessage = generateConsentMessage()

      // Call the intro actions to send consent request
      const response = await fetch("/api/intro/send-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          introId: intro.id,
          targetId: intro.target.id,
          message: consentMessage.message,
          subject: consentMessage.subject,
          sendViaSms,
          phone: intro.target.phone,
        }),
      })

      if (!response.ok) throw new Error("Failed to send consent request")

      setConsentSent(true)
      toast.success(`Consent request sent to ${intro.target.full_name}`)
    } catch (error) {
      console.error("Error sending consent:", error)
      toast.error("Failed to send consent request")
    } finally {
      setLoading(false)
    }
  }

  const handleSendIntro = async () => {
    setLoading(true)
    try {
      const introEmail = generateIntroEmail()

      // Call the intro actions to send full introduction
      const response = await fetch("/api/intro/send-introduction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          introId: intro.id,
          requesterId: intro.requester.id,
          targetId: intro.target.id,
          message: introEmail.message,
          subject: introEmail.subject,
          context: customContext || intro.context,
          timeSlots: [timeSlots.slot1, timeSlots.slot2],
        }),
      })

      if (!response.ok) throw new Error("Failed to send introduction")

      toast.success("Introduction email sent successfully")
      onComplete?.()
    } catch (error) {
      console.error("Error sending introduction:", error)
      toast.error("Failed to send introduction")
    } finally {
      setLoading(false)
    }
  }

  const getScarcityColor = (score: number) => {
    if (score > 0.7) return "text-red-500 bg-red-50"
    if (score > 0.4) return "text-yellow-500 bg-yellow-50"
    return "text-green-500 bg-green-50"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Double Opt-in Introduction</h2>
          <p className="text-muted-foreground">Generate compliant, respectful intro messages</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={step === "consent" ? "default" : "secondary"}>1. Consent</Badge>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Badge variant={step === "intro" ? "default" : "secondary"}>2. Introduction</Badge>
        </div>
      </div>

      {/* People involved */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Introduction Request</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>
                  {intro.requester.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{intro.requester.full_name}</div>
                <div className="text-sm text-muted-foreground">{intro.requester.email}</div>
                <Badge variant="outline" className="text-xs mt-1">
                  {intro.requester.tier}
                </Badge>
              </div>
            </div>

            <ArrowRight className="h-6 w-6 text-muted-foreground" />

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-medium">{intro.target.full_name}</div>
                <div className="text-sm text-muted-foreground">{intro.target.email}</div>
                <div className="flex items-center justify-end space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {intro.target.tier}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getScarcityColor(intro.target.scarcity_score)}`}>
                    Scarcity: {(intro.target.scarcity_score * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
              <Avatar>
                <AvatarFallback>
                  {intro.target.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <Label className="text-sm font-medium">Context</Label>
            <p className="text-sm text-muted-foreground mt-1">{intro.context}</p>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Pre-consent */}
      {step === "consent" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Step 1: Pre-consent Ping</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Send a respectful, low-friction message to {intro.target.full_name} requesting consent
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* SMS Option */}
            {intro.target.phone && (
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-toggle">Send via SMS</Label>
                  <p className="text-xs text-muted-foreground">Higher response rate for busy executives</p>
                </div>
                <Switch id="sms-toggle" checked={sendViaSms} onCheckedChange={setSendViaSms} />
              </div>
            )}

            {/* Preview */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="text-sm font-medium mb-2">Preview:</div>
              <div className="text-sm space-y-2">
                <div>
                  <strong>Subject:</strong> {generateConsentMessage().subject}
                </div>
                <div className="whitespace-pre-line">{generateConsentMessage().message}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSendConsent}
                disabled={loading || consentSent}
                className="flex items-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : consentSent ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
                <span>{consentSent ? "Consent Sent" : "Send Consent Request"}</span>
              </Button>

              {consentSent && !consentAccepted && (
                <Button
                  variant="outline"
                  onClick={() => setConsentAccepted(true)}
                  className="flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Mark as Accepted</span>
                </Button>
              )}

              {consentAccepted && (
                <Button onClick={() => setStep("intro")} className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Generate Introduction</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Full Introduction */}
      {step === "intro" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Step 2: Full Introduction</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Generate a polished introduction email with context and scheduling
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Custom context */}
            <div>
              <Label htmlFor="custom-context">Enhanced Context (Optional)</Label>
              <Textarea
                id="custom-context"
                placeholder="Add additional context or customize the introduction..."
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Time slots */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="slot1">Time Window 1</Label>
                <Textarea
                  id="slot1"
                  placeholder="e.g., Tuesday 2-4pm PT or Wednesday morning"
                  value={timeSlots.slot1}
                  onChange={(e) => setTimeSlots((prev) => ({ ...prev, slot1: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="slot2">Time Window 2</Label>
                <Textarea
                  id="slot2"
                  placeholder="e.g., Thursday afternoon or Friday 10am-12pm"
                  value={timeSlots.slot2}
                  onChange={(e) => setTimeSlots((prev) => ({ ...prev, slot2: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="text-sm font-medium mb-2">Preview:</div>
              <div className="text-sm space-y-2">
                <div>
                  <strong>Subject:</strong> {generateIntroEmail().subject}
                </div>
                <div className="whitespace-pre-line">{generateIntroEmail().message}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSendIntro}
                disabled={loading || !timeSlots.slot1 || !timeSlots.slot2}
                className="flex items-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                <span>Send Introduction</span>
              </Button>

              <Button variant="outline" onClick={() => setStep("consent")} className="flex items-center space-x-2">
                <ArrowRight className="h-4 w-4 rotate-180" />
                <span>Back to Consent</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
