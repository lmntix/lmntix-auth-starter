import { NextRequest, NextResponse } from "next/server";
import { sendPasswordReset } from "@/actions/auth";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    await sendPasswordReset(email);
    return NextResponse.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return NextResponse.json(
      { error: "Failed to send password reset email" },
      { status: 500 }
    );
  }
}
