import { NextResponse } from "next/server";
import { buildGoogleAuthUrl } from "@/lib/google/oauth";

export async function GET() {
  // TODO: Generate a state param, store in cookie/session for CSRF protection
  const url = buildGoogleAuthUrl();
  return NextResponse.redirect(url);
}
