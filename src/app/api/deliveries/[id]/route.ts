import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const delivery = await prisma.deliveryNotice.findUnique({
    where: { id },
    include: { client: true, company: true, invoice: true, packing_lists: true },
  });
  if (!delivery || delivery.deleted_at) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(delivery);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const delivery = await prisma.deliveryNotice.update({
    where: { id },
    data: {
      client_id: body.client_id,
      company_id: body.company_id ?? null,
      invoice_id: body.invoice_id ?? null,
      date: new Date(body.date),
      purchase_order: body.purchase_order ?? null,
      purchase_date: body.purchase_date ? new Date(body.purchase_date) : null,
      commercial_invoice: body.commercial_invoice ?? null,
      shipment_type: body.shipment_type ?? null,
      tracking_number: body.tracking_number ?? null,
      incoterms: body.incoterms ?? null,
      country_of_origin: body.country_of_origin ?? null,
      line_items: body.line_items,
      notes: body.notes ?? null,
    },
    include: { client: true, company: true },
  });
  return NextResponse.json(delivery);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.deliveryNotice.update({ where: { id }, data: { deleted_at: new Date() } });
  return NextResponse.json({ success: true });
}
