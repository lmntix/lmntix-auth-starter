import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import VerificationEmail from "@/emails/VerificationEmail";
import PasswordResetEmail from "@/emails/PasswordResetEmail";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendVerificationEmail(to: string, code: string) {
  const emailHtml = await render(VerificationEmail({ code }));

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Verify your email address",
    html: emailHtml,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const emailHtml = await render(PasswordResetEmail({ token }));

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Reset your password",
    html: emailHtml,
  });
}
