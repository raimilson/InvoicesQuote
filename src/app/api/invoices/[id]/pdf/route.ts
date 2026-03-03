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
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true, bank_template: true, payments: true },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const lineItems = invoice.line_items as any[];

  const buffer = await renderToBuffer(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.createElement(InvoicePDF, {
      type: "INVOICE",
      number: invoice.invoice_number,
      date: invoice.date.toISOString(),
      dueDate: invoice.due_date.toISOString(),
      client: invoice.client,
      lineItems,
      subtotal: parseFloat(invoice.subtotal.toString()),
      tax: invoice.tax ? parseFloat(invoice.tax.toString()) : null,
      total: parseFloat(invoice.total.toString()),
      paymentTerms: invoice.payment_terms,
      notes: invoice.notes,
      bankTemplate: invoice.bank_template,
    }) as any
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${invoice.invoice_number}.pdf"`,
    },
  });
}
