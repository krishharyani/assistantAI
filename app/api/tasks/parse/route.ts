import { NextRequest, NextResponse } from "next/server";
import { parseTasksFromText, parseTasksFromImage } from "@/lib/ai/parseTasks";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type;

      if (mimeType.startsWith("image/")) {
        const base64 = buffer.toString("base64");
        const tasks = await parseTasksFromImage(base64, mimeType);
        return NextResponse.json({ tasks });
      }

      // Text-based files (txt, etc.) — extract text and parse
      const textContent = buffer.toString("utf-8").slice(0, 4000);
      const tasks = await parseTasksFromText(textContent);
      return NextResponse.json({ tasks });
    }

    // JSON text input
    const body = await req.json();
    const message = body.message as string;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const tasks = await parseTasksFromText(message.trim());
    return NextResponse.json({ tasks });
  } catch (err) {
    console.error("Task parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse tasks" },
      { status: 500 },
    );
  }
}
