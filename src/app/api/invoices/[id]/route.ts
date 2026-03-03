import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true, bank_template: true, payments: { orderBy: { date: "desc" } }, from_quote: true },
  });
  if (!invoice || invoice.deleted_at) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      client_id: body.client_id,
      company_id: body.company_id ?? null,
      date: new Date(body.date),
      due_date: new Date(body.due_date),
      status: body.status,
      bank_template_id: body.bank_template_id,
      line_items: body.line_items,
      subtotal: body.subtotal,
      tax: body.tax ?? null,
      total: body.total,
      payment_terms: body.payment_terms ?? null,
      notes: body.notes ?? null,
    },
    include: { client: true, bank_template: true },
  });
  return NextResponse.json(invoice);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.invoice.update({ where: { id }, data: { deleted_at: new Date() } });
  return NextResponse.json({ success: true });
}
