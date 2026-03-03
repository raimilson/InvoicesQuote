import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await prisma.bankTemplate.findMany({ orderBy: { created_at: "asc" } });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // If setting as default, unset others first
  if (body.is_default) {
    await prisma.bankTemplate.updateMany({ data: { is_default: false } });
  }

  const template = await prisma.bankTemplate.create({ data: body });
  return NextResponse.json(template, { status: 201 });
}
