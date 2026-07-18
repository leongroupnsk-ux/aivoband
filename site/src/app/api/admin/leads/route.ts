import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { updateLead, type LeadStatus } from "@/lib/leads";

const STATUSES: LeadStatus[] = ["new", "in_progress", "closed"];

export async function PATCH(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const id = String(body?.id ?? "");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const patch: { status?: LeadStatus; note?: string } = {};
  if (body.status && STATUSES.includes(body.status)) patch.status = body.status;
  if (typeof body.note === "string") patch.note = body.note;

  const ok = updateLead(id, patch);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
