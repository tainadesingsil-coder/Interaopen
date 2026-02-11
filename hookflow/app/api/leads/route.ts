import { NextResponse } from "next/server";
import { listRecentLeads } from "@/lib/hookflow/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit") ?? "50");
  const limit = Number.isNaN(limitParam) ? 50 : Math.max(1, Math.min(limitParam, 200));

  const leads = await listRecentLeads(limit);
  return NextResponse.json({ leads });
}
