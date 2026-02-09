import { NextRequest, NextResponse } from "next/server";
import {
  getAction,
  updateActionStatus,
  updateSuggestedReply,
  deleteAction,
} from "@/lib/store/actions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const action = getAction(id);
  if (!action) {
    return NextResponse.json({ error: "Action not found" }, { status: 404 });
  }
  return NextResponse.json({ action });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const action = getAction(id);
  if (!action) {
    return NextResponse.json({ error: "Action not found" }, { status: 404 });
  }

  if (body.status) {
    updateActionStatus(id, body.status);
  }
  if (body.suggestedReply) {
    updateSuggestedReply(id, body.suggestedReply);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  deleteAction(id);
  return NextResponse.json({ ok: true });
}
