import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  if (path.startsWith("/dashboard") || path.startsWith("/settings")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    const res = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
      headers: {
        Cookie: `token=${token}`,
      },
    });

    if (!res.ok) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    const { user } = await res.json();

    if (!user.isEmailVerified) {
      return NextResponse.redirect(new URL("/auth/verify-email", request.url));
    }
  }

  if (path.startsWith("/auth") && token) {
    const res = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
      headers: {
        Cookie: `token=${token}`,
      },
    });

    if (res.ok) {
      const { user } = await res.json();
      if (user.isEmailVerified) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } else if (path !== "/auth/verify-email") {
        return NextResponse.redirect(
          new URL("/auth/verify-email", request.url)
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/auth/:path*"],
};
