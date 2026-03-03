import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { amount, date, method, notes, markFullyPaid } = body;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { payments: true },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const total = parseFloat(invoice.total.toString());
  const alreadyPaid = invoice.payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  let payAmount: number;
  if (markFullyPaid) {
    payAmount = Math.max(0, total - alreadyPaid);
  } else {
    payAmount = parseFloat(amount);
  }

  await prisma.payment.create({
    data: {
      invoice_id: id,
      amount: payAmount,
      date: date ? new Date(date) : new Date(),
      method: method ?? "Wire Transfer",
      notes: notes ?? null,
    },
  });

  const newTotal = alreadyPaid + payAmount;
  const newStatus = newTotal >= total ? "PAID" : "PARTIALLY_PAID";

  const updated = await prisma.invoice.update({
    where: { id },
    data: { status: newStatus },
    include: { payments: true, client: true, bank_template: true },
  });

  return NextResponse.json(updated);
}
