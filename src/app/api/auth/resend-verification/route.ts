import { NextRequest, NextResponse } from "next/server";
import { sendEmailVerification } from "@/actions/auth";
import { getUserByEmail } from "@/db/queries/user";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await sendEmailVerification(user.id, user.email);
    return NextResponse.json({
      message: "Verification code sent successfully",
    });
  } catch (error) {
    console.error("Failed to resend verification code:", error);
    if ((error as Error).message === "Email is already verified") {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
