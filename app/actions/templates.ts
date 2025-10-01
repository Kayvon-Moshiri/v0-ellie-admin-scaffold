"use server"
import { revalidatePath } from "next/cache"

interface Template {
  id: string
  name: string
  type: "email" | "sms"
  subject?: string
  content: string
  variables: string[]
}

export async function getTemplates(): Promise<Template[]> {
  // For now, return default templates
  // In a real implementation, these would be stored in the database
  return [
    {
      id: "email-member-invite",
      name: "Member Email Invite",
      type: "email",
      subject: "Welcome to {{tenant}} - Your {{role}} invitation",
      content: `Hi there!

You've been invited to join {{tenant}} as a {{tier}} {{role}}.

{{custom_message}}

Click the link below to accept your invitation and create your account:
{{magic_link}}

This link will expire in 7 days.

Welcome to the network!

Best regards,
The {{tenant}} Team`,
      variables: ["tenant", "role", "tier", "custom_message", "magic_link"],
    },
    {
      id: "sms-member-invite",
      name: "Member SMS Invite",
      type: "sms",
      content: `You're invited to join {{tenant}} as a {{role}}! {{custom_message}} Accept: {{magic_link}}`,
      variables: ["tenant", "role", "custom_message", "magic_link"],
    },
    {
      id: "email-scout-invite",
      name: "Scout Email Invite",
      type: "email",
      subject: "Join {{tenant}} as a Scout - Help us discover great startups",
      content: `Hi there!

We'd love to have you join {{tenant}} as a Scout. As a scout, you'll help us discover and evaluate promising startups in your network.

{{custom_message}}

Click here to accept your scout invitation:
{{magic_link}}

This link expires in 7 days.

Thanks for helping us build a stronger network!

Best,
The {{tenant}} Team`,
      variables: ["tenant", "custom_message", "magic_link"],
    },
    {
      id: "sms-scout-invite",
      name: "Scout SMS Invite",
      type: "sms",
      content: `Join {{tenant}} as a Scout! Help us discover great startups. {{custom_message}} Accept: {{magic_link}}`,
      variables: ["tenant", "custom_message", "magic_link"],
    },
  ]
}

export async function saveTemplate(template: Template) {
  // In a real implementation, this would save to the database
  // For now, we'll just simulate success
  await new Promise((resolve) => setTimeout(resolve, 500))
  revalidatePath("/dashboard/invites")
}
