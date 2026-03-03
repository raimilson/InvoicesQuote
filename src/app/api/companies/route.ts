import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companies = await prisma.company.findMany({
    orderBy: { is_default: "desc" },
  });
  return NextResponse.json(companies);
}
