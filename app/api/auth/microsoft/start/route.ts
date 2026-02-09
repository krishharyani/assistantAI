import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Implement Microsoft OAuth flow (MS Graph / MSAL)
  return NextResponse.json(
    { error: "Microsoft OAuth not yet implemented" },
    { status: 501 },
  );
}
