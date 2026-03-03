import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { renderToBuffer } from "@react-pdf/renderer";
import InvoicePDF from "@/lib/pdf/InvoicePDF";
import React from "react";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { client: true },
  });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // For quotes we need a bank template - use the default one
  const bankTemplate = await prisma.bankTemplate.findFirst({ where: { is_default: true } })
    ?? await prisma.bankTemplate.findFirst();

  if (!bankTemplate) return NextResponse.json({ error: "No bank template" }, { status: 400 });

  const lineItems = quote.line_items as any[];

  const buffer = await renderToBuffer(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.createElement(InvoicePDF, {
      type: "QUOTE",
      number: quote.quote_number,
      date: quote.date.toISOString(),
      validUntil: quote.valid_until.toISOString(),
      client: quote.client,
      lineItems,
      subtotal: parseFloat(quote.subtotal.toString()),
      tax: quote.tax ? parseFloat(quote.tax.toString()) : null,
      total: parseFloat(quote.total.toString()),
      paymentTerms: quote.payment_terms,
      notes: quote.notes,
      bankTemplate,
    }) as any
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="quote-${quote.quote_number}.pdf"`,
    },
  });
}
