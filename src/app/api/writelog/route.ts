import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
  const logEntry = await req.json();
  const date = new Date().toISOString().split("T")[0];
  const logFile = path.join(LOG_DIR, `application-${date}.log`);

  try {
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to write log:", error);
    return NextResponse.json({ error: "Failed to write log" }, { status: 500 });
  }
}
