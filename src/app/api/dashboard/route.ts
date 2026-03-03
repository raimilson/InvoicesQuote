import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();

  // Auto-mark overdue invoices
  await prisma.invoice.updateMany({
    where: {
      deleted_at: null,
      due_date: { lt: now },
      status: { in: ["SENT", "PARTIALLY_PAID"] },
    },
    data: { status: "OVERDUE" },
  });

  const [invoices, quotes] = await Promise.all([
    prisma.invoice.findMany({
      where: { deleted_at: null },
      include: { payments: true, client: true },
    }),
    prisma.quote.findMany({
      where: { deleted_at: null },
      include: { client: true },
      orderBy: { created_at: "desc" },
      take: 5,
    }),
  ]);

  const totalRevenue = invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + parseFloat(i.total.toString()), 0);

  const outstanding = invoices
    .filter((i) => ["SENT", "PARTIALLY_PAID"].includes(i.status))
    .reduce((sum, i) => {
      const paid = i.payments.reduce((s, p) => s + parseFloat(p.amount.toString()), 0);
      return sum + parseFloat(i.total.toString()) - paid;
    }, 0);

  const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length;
  const quotesPending = await prisma.quote.count({
    where: { deleted_at: null, status: { in: ["DRAFT", "SENT"] } },
  });

  // Monthly revenue (last 6 months)
  const months: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    const monthPaid = invoices
      .filter(
        (inv) =>
          inv.status === "PAID" &&
          inv.updated_at >= start &&
          inv.updated_at <= end
      )
      .reduce((sum, inv) => sum + parseFloat(inv.total.toString()), 0);

    months.push({ month: label, revenue: monthPaid });
  }

  const recentInvoices = invoices
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
    .slice(0, 5);

  return NextResponse.json({
    totalRevenue,
    outstanding,
    overdueCount,
    quotesPending,
    monthlyRevenue: months,
    recentInvoices,
    recentQuotes: quotes,
  });
}
