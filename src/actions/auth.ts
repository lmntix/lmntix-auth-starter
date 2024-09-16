import {
  createUser,
  createSession,
  getSessionByToken,
  deleteSession,
  deleteUserSessions,
  verifyPassword,
  createVerificationCode,
  getVerificationCodeByUserIdAndCode,
  markEmailAsVerified,
  createPasswordResetToken,
  getPasswordResetTokenByToken,
  deletePasswordResetToken,
  deleteVerificationCode,
} from "@/db/queries/auth";
import {
  getUserByEmail,
  getUserById,
  updateUserPassword,
} from "@/db/queries/user";
import { User, Session } from "@/db/schema";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import { generateVerificationCode } from "@/lib/utils";

export async function signUp(
  email: string,
  password: string
): Promise<{ user: User; session: Session }> {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const user = await createUser(email, password);
  await sendEmailVerification(user.id, user.email);
  const session = await createSession(user.id);
  return { user, session };
}

export async function signIn(
  email: string,
  password: string
): Promise<{
  user: User;
  session: Session | null;
  needsVerification: boolean;
}> {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValidPassword = await verifyPassword(user, password);
  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  if (!user.isEmailVerified) {
    return { user, session: null, needsVerification: true };
  }

  await deleteUserSessions(user.id);
  const session = await createSession(user.id);

  return { user, session, needsVerification: false };
}

export async function signOut(token: string): Promise<void> {
  await deleteSession(token);
}

export async function sendEmailVerification(userId: string, email: string) {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.isEmailVerified) {
    throw new Error("Email is already verified");
  }

  const code = generateVerificationCode();
  const verificationCode = await createVerificationCode(userId, code);
  await sendVerificationEmail(email, code);
}

export async function verifyEmail(email: string, code: string): Promise<void> {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  const verificationCode = await getVerificationCodeByUserIdAndCode(
    user.id,
    code
  );
  if (!verificationCode) {
    throw new Error("Invalid verification code");
  }

  if (verificationCode.expiresAt < new Date()) {
    throw new Error("Expired verification code");
  }

  if (user.isEmailVerified) {
    throw new Error("Email is already verified");
  }

  await markEmailAsVerified(user.id);
  await deleteVerificationCode(verificationCode.id);
}

export async function sendPasswordReset(email: string) {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  const resetToken = await createPasswordResetToken(user.id);
  await sendPasswordResetEmail(email, resetToken.token);
}

export async function resetPassword(token: string, newPassword: string) {
  const resetToken = await getPasswordResetTokenByToken(token);
  if (!resetToken) {
    throw new Error("Invalid reset token");
  }

  if (resetToken.expiresAt < new Date()) {
    await deletePasswordResetToken(resetToken.id);
    throw new Error("Expired reset token");
  }

  await updateUserPassword(resetToken.userId, newPassword);
  await deletePasswordResetToken(resetToken.id);
}

export { getSessionByToken };

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
