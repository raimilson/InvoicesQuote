import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { client: true, converted_to: { include: { client: true } } },
  });
  if (!quote || quote.deleted_at) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(quote);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const quote = await prisma.quote.update({
    where: { id },
    data: {
      client_id: body.client_id,
      company_id: body.company_id ?? null,
      date: new Date(body.date),
      valid_until: new Date(body.valid_until),
      status: body.status,
      currency: body.currency ?? "USD",
      line_items: body.line_items,
      subtotal: body.subtotal,
      tax: body.tax ?? null,
      total: body.total,
      payment_terms: body.payment_terms ?? null,
      notes: body.notes ?? null,
    },
    include: { client: true },
  });
  return NextResponse.json(quote);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.quote.update({ where: { id }, data: { deleted_at: new Date() } });
  return NextResponse.json({ success: true });
}
