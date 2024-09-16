import { Html } from "@react-email/html";
import { Text } from "@react-email/text";
import { Section } from "@react-email/section";
import { Container } from "@react-email/container";

export default function VerificationEmail({ code }: { code: string }) {
  return (
    <Html>
      <Section style={{ backgroundColor: "#f9f9f9" }}>
        <Container>
          <Text>Hello,</Text>
          <Text>
            Please use the following code to verify your email address:
          </Text>
          <Text style={{ fontSize: "24px", fontWeight: "bold" }}>{code}</Text>
          <Text>
            If you didn't request this, you can safely ignore this email.
          </Text>
        </Container>
      </Section>
    </Html>
  );
}
