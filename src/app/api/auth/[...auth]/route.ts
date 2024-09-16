import { NextRequest, NextResponse } from "next/server";
import {
  signUp,
  signIn,
  signOut,
  verifyEmail,
  getSessionByToken,
} from "@/actions/auth";
import { getUserById } from "@/db/queries/user";

export async function POST(
  request: NextRequest,
  { params }: { params: { auth: string[] } }
) {
  const authAction = params.auth[0];

  if (authAction === "signup") {
    const { email, password } = await request.json();
    try {
      const { user, session } = await signUp(email, password);
      const response = NextResponse.json({ user, token: session.token });
      response.cookies.set("token", session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });
      return response;
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }
  }

  if (authAction === "signin") {
    const { email, password } = await request.json();
    try {
      const { user, session, needsVerification } = await signIn(
        email,
        password
      );
      if (needsVerification) {
        return NextResponse.json({ needsVerification: true });
      }
      const response = NextResponse.json({ user, token: session?.token });
      if (session) {
        response.cookies.set("token", session.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: "/",
        });
      }
      return response;
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }
  }

  if (authAction === "signout") {
    const token = request.cookies.get("token")?.value;
    if (token) {
      await signOut(token);
    }
    const response = NextResponse.json({ message: "Signed out successfully" });
    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });
    return response;
  }

  if (authAction === "verify-email") {
    const { userId, code } = await request.json();
    try {
      await verifyEmail(userId, code);
      return NextResponse.json({ message: "Email verified successfully" });
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { auth: string[] } }
) {
  const authAction = params.auth[0];

  if (authAction === "session") {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const session = await getSessionByToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
