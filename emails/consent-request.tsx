import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"

interface ConsentRequestEmailProps {
  requesterName: string
  targetName: string
  context: string
  acceptUrl: string
  declineUrl: string
}

export default function ConsentRequestEmail({
  requesterName,
  targetName,
  context,
  acceptUrl,
  declineUrl,
}: ConsentRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Quick intro request from {requesterName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Hi {targetName},</Heading>

          <Text style={text}>
            {requesterName} would like a brief introduction regarding {context}.
          </Text>

          <Text style={text}>Would you be open to a 15-minute conversation?</Text>

          <Section style={buttonContainer}>
            <Button style={acceptButton} href={acceptUrl}>
              Yes, I'm interested
            </Button>
            <Button style={declineButton} href={declineUrl}>
              Not right now
            </Button>
          </Section>

          <Text style={footer}>
            Best regards,
            <br />
            The Ellie Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
}

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "40px",
  margin: "0 0 20px",
}

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const acceptButton = {
  backgroundColor: "#22c55e",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  margin: "0 8px",
}

const declineButton = {
  backgroundColor: "#6b7280",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  margin: "0 8px",
}

const footer = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "32px 0 0",
}
