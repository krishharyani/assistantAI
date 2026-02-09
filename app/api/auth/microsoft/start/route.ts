import { NextResponse } from "next/server";
import { buildMicrosoftAuthUrl } from "@/lib/microsoft/oauth";

export async function GET() {
  const url = buildMicrosoftAuthUrl();
  return NextResponse.redirect(url);
}
