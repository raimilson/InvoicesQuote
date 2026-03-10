import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const p = req.nextUrl.searchParams;
  const search = p.get("search") ?? "";
  const clientId = p.get("clientId") ?? "";

  const orders = await prisma.orderConfirmation.findMany({
    where: {
      deleted_at: null,
      ...(clientId ? { client_id: clientId } : {}),
      ...(search
        ? {
            OR: [
              { order_number: { contains: search, mode: "insensitive" } },
              { purchase_order: { contains: search, mode: "insensitive" } },
              { client: { name: { contains: search, mode: "insensitive" } } },
              { client: { company: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: { client: true, company: true },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (!body.order_number) {
    const all = await prisma.orderConfirmation.findMany({ select: { order_number: true } });
    const nums = all.map(o => parseInt(o.order_number.replace(/^O-/i, ""), 10)).filter(n => !isNaN(n));
    const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
    body.order_number = `O-${maxNum + 1}`;
  }

  const order = await prisma.orderConfirmation.create({
    data: {
      order_number: body.order_number,
      client_id: body.client_id,
      company_id: body.company_id ?? null,
      invoice_id: body.invoice_id ?? null,
      quote_id: body.quote_id ?? null,
      date: new Date(body.date),
      delivery_date: body.delivery_date ? new Date(body.delivery_date) : null,
      payment_terms: body.payment_terms ?? null,
      currency: body.currency ?? "USD",
      purchase_order: body.purchase_order ?? null,
      line_items: body.line_items,
      notes: body.notes ?? null,
    },
    include: { client: true, company: true },
  });

  return NextResponse.json(order, { status: 201 });
}
