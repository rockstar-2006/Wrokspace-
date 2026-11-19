import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const { admin, error } = await requireAdmin();
  if (error) return error;
  return NextResponse.json({ admin });
}
