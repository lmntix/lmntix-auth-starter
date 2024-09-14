import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");

export async function GET() {
  try {
    const files = fs.readdirSync(LOG_DIR);
    const latestLogFile = files
      .filter(
        (file) => file.startsWith("application-") && file.endsWith(".log")
      )
      .sort()
      .reverse()[0];

    if (latestLogFile) {
      const logContent = fs.readFileSync(
        path.join(LOG_DIR, latestLogFile),
        "utf-8"
      );
      const logs = logContent
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line));
      return NextResponse.json(logs);
    } else {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error reading logs:", error);
    return NextResponse.json({ error: "Failed to read logs" }, { status: 500 });
  }
}
