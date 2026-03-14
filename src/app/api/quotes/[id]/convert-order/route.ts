import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id, deleted_at: null },
    include: { client: true },
  });

  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

  if (quote.status !== "ACCEPTED") {
    return NextResponse.json(
      { error: "Only ACCEPTED quotes can be converted to orders" },
      { status: 400 }
    );
  }

  // Auto-generate order_number using numeric max pattern
  const all = await prisma.orderConfirmation.findMany({ select: { order_number: true } });
  const nums = all
    .map((o) => parseInt(o.order_number.replace(/^O-/i, ""), 10))
    .filter((n) => !isNaN(n));
  const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
  const orderNumber = `O-${maxNum + 1}`;

  // Create order and update quote in a transaction
  const [order] = await prisma.$transaction([
    prisma.orderConfirmation.create({
      data: {
        order_number: orderNumber,
        client_id: quote.client_id,
        company_id: quote.company_id,
        quote_id: quote.id,
        date: new Date(),
        line_items: (quote.line_items ?? []) as any,
        payment_terms: quote.payment_terms,
        notes: quote.notes,
        currency: quote.currency,
      },
      include: { client: true, company: true },
    }),
    prisma.quote.update({
      where: { id },
      data: { status: "CONVERTED" },
    }),
  ]);

  return NextResponse.json(order, { status: 201 });
}
