import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { renderToBuffer } from "@react-pdf/renderer";
import SalesContractPDF from "@/lib/pdf/SalesContractPDF";
import React from "react";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const contract = await prisma.salesContract.findUnique({
    where: { id },
  });
  if (!contract || contract.deleted_at) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const lineItems = contract.line_items as any[];

  const buffer = await renderToBuffer(
    React.createElement(SalesContractPDF, {
      contract_number: contract.contract_number,
      date: contract.date.toISOString(),
      lineItems,
      total: parseFloat(contract.total.toString()),
    }) as any
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="contract-${contract.contract_number}.pdf"`,
    },
  });
}
