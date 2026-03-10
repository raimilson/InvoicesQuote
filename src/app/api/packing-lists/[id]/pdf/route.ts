import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { renderToBuffer } from "@react-pdf/renderer";
import PackingListPDF from "@/lib/pdf/PackingListPDF";
import React from "react";
import path from "path";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const packingList = await prisma.packingList.findUnique({
    where: { id },
    include: { client: true, company: true },
  });
  if (!packingList || packingList.deleted_at) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const logoSrc = path.join(process.cwd(), "public", "logo.png");
  const company = packingList.company ?? { name: "Kezpo LLC", address: "1021 E Lincolnway Suite #8933, Cheyenne, Wyoming 82001, United States", ein: null };
  const lineItems = packingList.line_items as any[];
  const cartons = packingList.cartons as any[];

  const buffer = await renderToBuffer(
    React.createElement(PackingListPDF, {
      packing_number: packingList.packing_number,
      date: packingList.date.toISOString(),
      logoSrc,
      company,
      client: packingList.client,
      lineItems,
      cartons,
      notes: packingList.notes,
    }) as any
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="packing-list-${packingList.packing_number}.pdf"`,
    },
  });
}
