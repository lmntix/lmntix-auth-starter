import { render } from "@react-email/render";
import VerificationEmail from "@/emails/VerificationEmail";
import PasswordResetEmail from "@/emails/PasswordResetEmail";
import { sendMail } from "@/lib/mailer";
import { createVerificationToken, getUserById } from "./auth";

export async function sendVerificationEmail(userId: string) {
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  const verificationToken = await createVerificationToken(
    userId,
    "email_verification"
  );
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken.token}`;

  const emailHtml = await render(VerificationEmail({ verificationLink }));

  await sendMail({
    to: user.email,
    subject: "Verify your email",
    html: emailHtml,
  });

  return verificationToken;
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const emailHtml = await render(PasswordResetEmail({ resetLink }));

  await sendMail({
    to: email,
    subject: "Reset your password",
    html: emailHtml,
  });
}
