import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"

interface IntroductionEmailProps {
  requesterName: string
  targetName: string
  context: string
  timeSlot1: string
  timeSlot2: string
  calendarUrl: string
}

export default function IntroductionEmail({
  requesterName,
  targetName,
  context,
  timeSlot1,
  timeSlot2,
  calendarUrl,
}: IntroductionEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Introduction: {requesterName} ↔ {targetName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            Hi {targetName} and {requesterName},
          </Heading>

          <Text style={text}>I'm delighted to introduce you both.</Text>

          <Text style={text}>
            {requesterName}, meet {targetName}. {context}
          </Text>

          <Text style={text}>I've suggested two time windows that might work for both of you:</Text>

          <Section style={timeSlots}>
            <Text style={timeSlot}>• {timeSlot1}</Text>
            <Text style={timeSlot}>• {timeSlot2}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={scheduleButton} href={calendarUrl}>
              Schedule with {targetName}
            </Button>
          </Section>

          <Text style={text}>Looking forward to hearing how this goes.</Text>

          <Text style={footer}>
            Best,
            <br />
            The Ellie Team
          </Text>

          <Text style={disclaimer}>
            This introduction was facilitated through our network. Reply to connect directly.
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

const timeSlots = {
  margin: "16px 0",
  paddingLeft: "16px",
}

const timeSlot = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 8px",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const scheduleButton = {
  backgroundColor: "#3b82f6",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
}

const footer = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "32px 0 16px",
}

const disclaimer = {
  color: "#666",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "16px 0 0",
  borderTop: "1px solid #eee",
  paddingTop: "16px",
}
