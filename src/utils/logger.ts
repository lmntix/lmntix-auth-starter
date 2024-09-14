import { NextRequest, NextResponse } from "next/server";

export interface LogEntry {
  method: string;
  url: string;
  status: number;
  content_length: string;
  response_time: string;
  body: string;
  level: string;
  timestamp: string;
}

// In-memory storage for logs
const logs: LogEntry[] = [];
const MAX_LOGS = 1000;

function addLog(logEntry: LogEntry) {
  logs.push(logEntry);
  if (logs.length > MAX_LOGS) {
    logs.shift(); // Remove oldest log if we exceed the limit
  }

  // Send log to API for file writing
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  fetch(`${apiUrl}/api/writelog`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(logEntry),
  }).catch((err) => console.error("Failed to send log to API:", err));
}

export async function logRequest(
  req: NextRequest,
  res: NextResponse,
  startTime: number,
  body?: string
) {
  const endTime = Date.now();
  const responseTime = endTime - startTime;

  // Extract only the path from the URL
  const url = new URL(req.url);
  const path = url.pathname;

  // Skip logging for specific paths
  if (
    path === "/api/writelog" ||
    path === "/api/logs" ||
    path === "/favicon.ico" ||
    path === "/logs" ||
    path.startsWith("/_next/")
  ) {
    return;
  }

  const logEntry: LogEntry = {
    method: req.method,
    url: path,
    status: res.status,
    content_length: res.headers.get("content-length") || "-",
    response_time: `${responseTime}ms`,
    body: body ? body.substring(0, 1000) : "", // Limit body length to 1000 characters if body exists
    level: "http",
    timestamp: new Date().toISOString(),
  };

  addLog(logEntry);
  console.log(JSON.stringify(logEntry)); // Still log to console for development
}

export function createAPIHandler(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const startTime = Date.now();
    let body = "";
    if (
      req.body &&
      req.headers.get("content-type")?.includes("application/json")
    ) {
      try {
        const clonedReq = req.clone();
        body = await clonedReq.text();
      } catch (error) {
        console.error("Failed to read request body:", error);
        body = "(unable to read body)";
      }
    }
    const res = await handler(req);
    await logRequest(req, res, startTime, body);
    return res;
  };
}

export function getLogs() {
  return logs;
}

export function log(level: string, message: string) {
  const logEntry: LogEntry = {
    method: "-",
    url: "-",
    status: 0,
    content_length: "-",
    response_time: "-",
    body: message,
    level,
    timestamp: new Date().toISOString(),
  };
  addLog(logEntry);
  console.log(JSON.stringify(logEntry)); // Log to console for development
}
