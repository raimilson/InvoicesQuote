import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.orderConfirmation.findUnique({
    where: { id },
    include: { client: true, company: true, invoice: true, quote: { select: { id: true, quote_number: true } } },
  });
  if (!order || order.deleted_at) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const order = await prisma.orderConfirmation.update({
    where: { id },
    data: {
      client_id: body.client_id,
      company_id: body.company_id ?? null,
      invoice_id: body.invoice_id ?? null,
      date: new Date(body.date),
      delivery_date: body.delivery_date ? new Date(body.delivery_date) : null,
      payment_terms: body.payment_terms ?? null,
      currency: body.currency ?? "USD",
      purchase_order: body.purchase_order ?? null,
      line_items: body.line_items,
      notes: body.notes ?? null,
    },
    include: { client: true, company: true },
  });
  return NextResponse.json(order);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.orderConfirmation.update({ where: { id }, data: { deleted_at: new Date() } });
  return NextResponse.json({ success: true });
}
