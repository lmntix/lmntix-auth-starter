import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logRequest } from "./utils/logger";

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  let body = "";

  if (
    request.body &&
    request.headers.get("content-type")?.includes("application/json")
  ) {
    try {
      const clonedReq = request.clone();
      body = await clonedReq.text();
    } catch (error) {
      console.error("Failed to read request body in middleware:", error);
    }
  }

  const response = NextResponse.next();
  await logRequest(request, response, startTime, body);
  return response;
}

export const config = {
  matcher: "/:path*",
};
