import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json(); // { bank_template_id, due_date, invoice_number? }

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { client: true },
  });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (quote.status === "CONVERTED") {
    return NextResponse.json({ error: "Already converted" }, { status: 400 });
  }

  // Auto-generate invoice number if not provided
  let invoiceNumber = body.invoice_number;
  if (!invoiceNumber) {
    const last = await prisma.invoice.findFirst({
      orderBy: { invoice_number: "desc" },
      select: { invoice_number: true },
    });
    const lastNum = last ? parseInt(last.invoice_number, 10) : 1265;
    invoiceNumber = isNaN(lastNum) ? "1266" : String(lastNum + 1);
  }

  const invoice = await prisma.invoice.create({
    data: {
      invoice_number: invoiceNumber,
      client_id: quote.client_id,
      date: new Date(),
      due_date: new Date(body.due_date),
      status: "DRAFT",
      bank_template_id: body.bank_template_id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      line_items: (quote.line_items ?? []) as any,
      subtotal: quote.subtotal,
      tax: quote.tax,
      total: quote.total,
      payment_terms: quote.payment_terms,
      notes: quote.notes,
    },
    include: { client: true, bank_template: true },
  });

  // Update quote
  await prisma.quote.update({
    where: { id },
    data: { status: "CONVERTED", converted_to_id: invoice.id },
  });

  return NextResponse.json(invoice, { status: 201 });
}
