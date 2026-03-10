import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [order_confirmations, delivery_notices, packing_lists, sales_contracts] = await Promise.all([
    prisma.orderConfirmation.findMany({
      where: { invoice_id: id, deleted_at: null },
      select: { id: true, order_number: true },
    }),
    prisma.deliveryNotice.findMany({
      where: { invoice_id: id, deleted_at: null },
      select: { id: true, delivery_number: true },
    }),
    prisma.packingList.findMany({
      where: { invoice_id: id, deleted_at: null },
      select: { id: true, packing_number: true },
    }),
    prisma.salesContract.findMany({
      where: { invoice_id: id, deleted_at: null },
      select: { id: true, contract_number: true },
    }),
  ]);

  return NextResponse.json({ order_confirmations, delivery_notices, packing_lists, sales_contracts });
}
