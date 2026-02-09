import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  // TODO: Implement Microsoft OAuth callback
  return NextResponse.json(
    { error: "Microsoft OAuth not yet implemented" },
    { status: 501 },
  );
}
