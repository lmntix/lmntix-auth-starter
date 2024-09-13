import { Html } from "@react-email/html";
import { Text } from "@react-email/text";
import { Section } from "@react-email/section";
import { Container } from "@react-email/container";
import { Button } from "@react-email/button";

export default function VerificationEmail({
  verificationLink,
}: {
  verificationLink: string;
}) {
  return (
    <Html>
      <Section style={{ backgroundColor: "#f3f4f6" }}>
        <Container style={{ padding: "20px", backgroundColor: "#ffffff" }}>
          <Text
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              textAlign: "center",
              color: "#000000",
            }}
          >
            Verify Your Email
          </Text>
          <Text
            style={{ fontSize: "16px", color: "#4b5563", textAlign: "center" }}
          >
            Click the button below to verify your email address:
          </Text>
          <Button
            href={verificationLink}
            style={{
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              padding: "12px 20px",
              borderRadius: "5px",
              textDecoration: "none",
              textAlign: "center",
              display: "block",
              margin: "20px auto",
            }}
          >
            Verify Email
          </Button>
          <Text
            style={{ fontSize: "14px", color: "#6b7280", textAlign: "center" }}
          >
            If the button doesn't work, you can also copy and paste this link
            into your browser:
          </Text>
          <Text
            style={{
              fontSize: "14px",
              color: "#3b82f6",
              textAlign: "center",
              wordBreak: "break-all",
            }}
          >
            {verificationLink}
          </Text>
        </Container>
      </Section>
    </Html>
  );
}
