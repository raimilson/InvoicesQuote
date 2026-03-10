import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const packingList = await prisma.packingList.findUnique({
    where: { id },
    include: { client: true, company: true, invoice: true, delivery: true },
  });
  if (!packingList || packingList.deleted_at) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(packingList);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const packingList = await prisma.packingList.update({
    where: { id },
    data: {
      client_id: body.client_id,
      company_id: body.company_id ?? null,
      invoice_id: body.invoice_id ?? null,
      delivery_id: body.delivery_id ?? null,
      date: new Date(body.date),
      line_items: body.line_items,
      cartons: body.cartons,
      notes: body.notes ?? null,
    },
    include: { client: true, company: true },
  });
  return NextResponse.json(packingList);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.packingList.update({ where: { id }, data: { deleted_at: new Date() } });
  return NextResponse.json({ success: true });
}
