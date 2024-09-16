import { NextRequest, NextResponse } from "next/server";
import { verifyEmail } from "@/actions/auth";

export async function POST(request: NextRequest) {
  const { email, code } = await request.json();

  if (!email || !code) {
    return NextResponse.json(
      { error: "Email and code are required" },
      { status: 400 }
    );
  }

  try {
    await verifyEmail(email, code);
    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email verification failed:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
