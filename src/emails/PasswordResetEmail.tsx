import { Html } from "@react-email/html";
import { Text } from "@react-email/text";
import { Section } from "@react-email/section";
import { Container } from "@react-email/container";
import { Button } from "@react-email/button";

export default function PasswordResetEmail({
  resetLink,
}: {
  resetLink: string;
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
            Reset Your Password
          </Text>
          <Text
            style={{ fontSize: "16px", color: "#4b5563", textAlign: "center" }}
          >
            Click the button below to reset your password:
          </Text>
          <Button
            href={resetLink}
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
            Reset Password
          </Button>
          <Text
            style={{ fontSize: "14px", color: "#6b7280", textAlign: "center" }}
          >
            If you didn&apos;t request a password reset, you can safely ignore
            this email.
          </Text>
          <Text
            style={{ fontSize: "14px", color: "#6b7280", textAlign: "center" }}
          >
            This link will expire in 1 hour.
          </Text>
        </Container>
      </Section>
    </Html>
  );
}
