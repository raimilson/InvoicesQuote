import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { renderToBuffer } from "@react-pdf/renderer";
import OrderConfirmationPDF from "@/lib/pdf/OrderConfirmationPDF";
import React from "react";
import path from "path";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.orderConfirmation.findUnique({
    where: { id },
    include: { client: true, company: true },
  });
  if (!order || order.deleted_at) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const logoSrc = path.join(process.cwd(), "public", "logo.png");
  const company = order.company ?? { name: "Kezpo LLC", address: "1021 E Lincolnway Suite #8933, Cheyenne, Wyoming 82001, United States", ein: null };
  const lineItems = order.line_items as any[];

  const subtotal = lineItems.reduce((s: number, i: any) => s + (i.amount ?? 0), 0);

  const buffer = await renderToBuffer(
    React.createElement(OrderConfirmationPDF, {
      order_number: order.order_number,
      date: order.date.toISOString(),
      delivery_date: order.delivery_date?.toISOString() ?? null,
      purchase_order: order.purchase_order,
      currency: order.currency,
      company,
      logoSrc,
      payment_terms: order.payment_terms,
      client: order.client,
      lineItems,
      subtotal,
      tax: null,
      total: subtotal,
      notes: order.notes,
    }) as any
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="order-${order.order_number}.pdf"`,
    },
  });
}
