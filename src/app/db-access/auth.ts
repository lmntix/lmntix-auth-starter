import { db } from "@/db";
import { users, sessions, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";

export async function createUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(users)
    .values({
      email,
      password: hashedPassword,
    })
    .returning();
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  console.log("Email: ", email);
  console.log("User: ", user);
  return user || null;
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function createSession(userId: string) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      token,
      expiresAt,
    })
    .returning();

  return session;
}

export async function getSessionByToken(token: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token));
  return session;
}

export async function deleteSession(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function isAuthenticated(token: string) {
  const session = await getSessionByToken(token);
  if (!session || new Date() > session.expiresAt) {
    return false;
  }
  return true;
}

export async function getAuthenticatedUser() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await getSessionByToken(sessionToken);
  if (!session) {
    return null;
  }

  const user = await getUserById(session.userId);
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
  };
}

export async function createVerificationToken(
  userId: string,
  type: "email_verification" | "password_reset"
) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  const [verificationToken] = await db
    .insert(verificationTokens)
    .values({
      userId,
      token,
      type,
      expiresAt,
    })
    .returning();

  return verificationToken;
}

export async function getVerificationToken(token: string) {
  const [verificationToken] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, token));
  return verificationToken;
}

export async function deleteVerificationToken(token: string) {
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.token, token));
}

export async function verifyEmail(userId: string) {
  await db
    .update(users)
    .set({ emailVerified: true })
    .where(eq(users.id, userId));
}

export async function updateUserPassword(
  userId: string,
  newPassword: string
): Promise<boolean> {
  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database using Drizzle ORM
    const result = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId))
      .execute();

    // Check if the update was successful
    return result.length > 0;
  } catch (error) {
    console.error("Error updating user password:", error);
    return false;
  }
}
