import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { renderToBuffer } from "@react-pdf/renderer";
import DeliveryNoticePDF from "@/lib/pdf/DeliveryNoticePDF";
import React from "react";
import path from "path";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const delivery = await prisma.deliveryNotice.findUnique({
    where: { id },
    include: { client: true, company: true },
  });
  if (!delivery || delivery.deleted_at) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const logoSrc = path.join(process.cwd(), "public", "logo.png");
  const company = delivery.company ?? { name: "Kezpo LLC", address: "1021 E Lincolnway Suite #8933, Cheyenne, Wyoming 82001, United States", ein: null };
  const lineItems = delivery.line_items as any[];

  const buffer = await renderToBuffer(
    React.createElement(DeliveryNoticePDF, {
      delivery_number: delivery.delivery_number,
      date: delivery.date.toISOString(),
      purchase_order: delivery.purchase_order,
      purchase_date: delivery.purchase_date?.toISOString() ?? null,
      commercial_invoice: delivery.commercial_invoice,
      shipment_type: delivery.shipment_type,
      tracking_number: delivery.tracking_number,
      incoterms: delivery.incoterms,
      country_of_origin: delivery.country_of_origin,
      company,
      logoSrc,
      client: delivery.client,
      lineItems,
      notes: delivery.notes,
    }) as any
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="delivery-${delivery.delivery_number}.pdf"`,
    },
  });
}
