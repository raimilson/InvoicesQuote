import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const contract = await prisma.salesContract.findUnique({
    where: { id },
    include: { client: true, company: true, invoice: true, bank_template: true },
  });
  if (!contract || contract.deleted_at) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(contract);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const contract = await prisma.salesContract.update({
    where: { id },
    data: {
      client_id: body.client_id,
      company_id: body.company_id ?? null,
      invoice_id: body.invoice_id ?? null,
      bank_template_id: body.bank_template_id ?? null,
      date: new Date(body.date),
      currency: body.currency ?? "USD",
      line_items: body.line_items,
      total: body.total,
      notes: body.notes ?? null,
      client_vat_id: body.client_vat_id ?? null,
      client_bank_name: body.client_bank_name ?? null,
      client_bank_address: body.client_bank_address ?? null,
      client_account: body.client_account ?? null,
      client_swift: body.client_swift ?? null,
    },
    include: { client: true, company: true },
  });
  return NextResponse.json(contract);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.salesContract.update({ where: { id }, data: { deleted_at: new Date() } });
  return NextResponse.json({ success: true });
}
