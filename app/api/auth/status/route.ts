import { NextResponse } from "next/server";
import { getConnectedAccounts, hasAnyAccounts } from "@/lib/auth/tokenStore";

export async function GET() {
  const accounts = getConnectedAccounts();

  return NextResponse.json({
    authenticated: hasAnyAccounts(),
    accounts,
  });
}
