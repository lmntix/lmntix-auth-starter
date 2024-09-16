import { Html } from "@react-email/html";
import { Text } from "@react-email/text";
import { Section } from "@react-email/section";
import { Container } from "@react-email/container";

export default function PasswordResetEmail({ token }: { token: string }) {
  return (
    <Html>
      <Section style={{ backgroundColor: "#f9f9f9" }}>
        <Container>
          <Text>Hello,</Text>
          <Text>
            You have requested to reset your password. Click the link below to
            set a new password:
          </Text>
          <Text>
            <a
              href={`${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`}
            >
              Reset Password
            </a>
          </Text>
          <Text>
            If you didn't request this, you can safely ignore this email.
          </Text>
        </Container>
      </Section>
    </Html>
  );
}
