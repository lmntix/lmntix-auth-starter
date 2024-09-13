import { NextRequest, NextResponse } from "next/server";
import {
  createUser,
  getUserByEmail,
  createSession,
  getVerificationToken,
  deleteVerificationToken,
  verifyEmail,
  createVerificationToken,
  updateUserPassword,
  getUserById,
} from "@/app/db-access/auth";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "@/app/db-access/emailVerification";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { type, email, password, token } = await req.json();

  switch (type) {
    case "register":
      return handleRegister(email, password);
    case "login":
      return handleLogin(email, password);
    case "forgot-password":
      return handleForgotPassword(email);
    case "reset-password":
      return handleResetPassword(token, password);
    case "verify-email":
      return handleVerifyEmail(token);
    default:
      return NextResponse.json(
        { error: "Invalid request type" },
        { status: 400 }
      );
  }
}

// ---------------------------handleRegister-----------------------------------

async function handleRegister(email: string, password: string) {
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 409 }
    );
  }

  const user = await createUser(email, password);
  await sendVerificationEmail(user.id);

  return NextResponse.json({
    success: true,
    message: "User registered. Please check your email for verification.",
  });
}

// ---------------------------handleLogin-----------------------------------

async function handleLogin(email: string, password: string) {
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const user = await getUserByEmail(email);

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { error: "Email not verified", emailVerificationRequired: true },
      { status: 403 }
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const session = await createSession(user.id);

  const response = NextResponse.json({ success: true });
  response.cookies.set("session_token", session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });

  return response;
}

// ---------------------------handleForgotPassword-----------------------------------

async function handleForgotPassword(email: string) {
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await getUserByEmail(email);

  if (user) {
    const token = await createVerificationToken(user.id, "password_reset");
    await sendPasswordResetEmail(user.email, token.token);
  }

  return NextResponse.json({
    success: true,
    message:
      "If an account exists for that email, we have sent password reset instructions.",
  });
}

// ---------------------------handleResetPassword-----------------------------------

async function handleResetPassword(token: string, password: string) {
  if (!token || !password) {
    return NextResponse.json(
      { error: "Token and password are required" },
      { status: 400 }
    );
  }

  const verificationToken = await getVerificationToken(token);

  if (
    !verificationToken ||
    new Date() > verificationToken.expiresAt ||
    verificationToken.type !== "password_reset"
  ) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }

  const user = await getUserById(verificationToken.userId);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await updateUserPassword(user.id, hashedPassword);
  await deleteVerificationToken(token);

  return NextResponse.json({
    success: true,
    message: "Password reset successful",
  });
}

// ---------------------------handleVerifyEmail-----------------------------------

async function handleVerifyEmail(token: string) {
  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const verificationToken = await getVerificationToken(token);

  if (!verificationToken || new Date() > verificationToken.expiresAt) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }

  await verifyEmail(verificationToken.userId);
  await deleteVerificationToken(token);

  return NextResponse.json({ success: true });
}
