import { NextRequest, NextResponse } from "next/server";
import { resetPassword } from "@/actions/auth";

export async function POST(request: NextRequest) {
  const { token, newPassword } = await request.json();

  if (!token || !newPassword) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    await resetPassword(token, newPassword);
    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Password reset failed:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
