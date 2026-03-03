import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { renderToBuffer } from "@react-pdf/renderer";
import InvoicePDF from "@/lib/pdf/InvoicePDF";
import React from "react";
import path from "path";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { client: true, company: true },
  });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const currency = (quote as any).currency ?? "USD";

  // Find a bank template matching the quote currency, else use default
  const bankTemplate =
    await prisma.bankTemplate.findFirst({ where: { currency } }) ??
    await prisma.bankTemplate.findFirst({ where: { is_default: true } }) ??
    await prisma.bankTemplate.findFirst();

  if (!bankTemplate) return NextResponse.json({ error: "No bank template" }, { status: 400 });

  const lineItems = quote.line_items as any[];
  const logoSrc = path.join(process.cwd(), "public", "logo.png");

  const company = quote.company ?? { name: "Kezpo LLC", address: "1021 E Lincolnway Suite #8933, Cheyenne, Wyoming 82001, United States", ein: null };

  const buffer = await renderToBuffer(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.createElement(InvoicePDF, {
      type: "QUOTE",
      number: quote.quote_number,
      date: quote.date.toISOString(),
      validUntil: quote.valid_until.toISOString(),
      currency,
      company,
      logoSrc,
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
