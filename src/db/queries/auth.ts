import { db } from "@/db";
import {
  users,
  sessions,
  passwordResetTokens,
  verificationCodes,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import { generateToken } from "@/lib/utils";

export async function createUser(email: string, password: string) {
  const hashedPassword = await hash(password, 10);
  const [user] = await db
    .insert(users)
    .values({ email, password: hashedPassword })
    .returning();
  return user;
}

export async function createSession(userId: string) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const [session] = await db
    .insert(sessions)
    .values({ userId, token, expiresAt })
    .returning();
  return session;
}

export async function getSessionByToken(token: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);
  return session;
}

export async function deleteSession(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function deleteUserSessions(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

export async function verifyPassword(
  user: { password: string },
  inputPassword: string
) {
  return compare(inputPassword, user.password);
}

export async function markEmailAsVerified(userId: string) {
  await db
    .update(users)
    .set({ isEmailVerified: true })
    .where(eq(users.id, userId));
}

export async function createPasswordResetToken(userId: string) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
  const [passwordResetToken] = await db
    .insert(passwordResetTokens)
    .values({ userId, token, expiresAt })
    .returning();
  return passwordResetToken;
}

export async function getPasswordResetTokenByToken(token: string) {
  const [passwordResetToken] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);
  return passwordResetToken;
}

export async function deletePasswordResetToken(id: string) {
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, id));
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const hashedPassword = await hash(newPassword, 10);
  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, userId));
}

// Add this function if it's not already present
export async function createVerificationCode(userId: string, code: string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  const [verificationCode] = await db
    .insert(verificationCodes)
    .values({ userId, code, expiresAt })
    .returning();
  return verificationCode;
}

// Add this function if it's not already present
export async function getVerificationCodeByUserIdAndCode(
  userId: string,
  code: string
) {
  const [verificationCode] = await db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.userId, userId),
        eq(verificationCodes.code, code)
      )
    )
    .limit(1);
  return verificationCode;
}

// Add this new function
export async function deleteVerificationCode(id: string) {
  await db.delete(verificationCodes).where(eq(verificationCodes.id, id));
}
