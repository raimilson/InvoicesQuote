import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const p = req.nextUrl.searchParams;
  const status = p.get("status");
  const search = p.get("search");
  const clientId = p.get("clientId");
  const from = p.get("from");
  const to = p.get("to");

  const invoices = await prisma.invoice.findMany({
    where: {
      deleted_at: null,
      ...(status ? { status: status as any } : {}),
      ...(clientId ? { client_id: clientId } : {}),
      ...(search
        ? {
            OR: [
              { invoice_number: { contains: search, mode: "insensitive" } },
              { client: { name: { contains: search, mode: "insensitive" } } },
              { client: { company: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: {
      client: true,
      bank_template: true,
      payments: true,
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Auto-generate invoice number
  if (!body.invoice_number) {
    const last = await prisma.invoice.findFirst({
      orderBy: { invoice_number: "desc" },
      select: { invoice_number: true },
    });
    const lastNum = last ? parseInt(last.invoice_number, 10) : 1265;
    body.invoice_number = isNaN(lastNum) ? "1266" : String(lastNum + 1);
  }

  const invoice = await prisma.invoice.create({
    data: {
      invoice_number: body.invoice_number,
      client_id: body.client_id,
      company_id: body.company_id ?? null,
      date: new Date(body.date),
      due_date: new Date(body.due_date),
      status: body.status ?? "DRAFT",
      bank_template_id: body.bank_template_id,
      line_items: body.line_items,
      subtotal: body.subtotal,
      tax: body.tax ?? null,
      total: body.total,
      payment_terms: body.payment_terms ?? null,
      notes: body.notes ?? null,
    },
    include: { client: true, bank_template: true },
  });

  return NextResponse.json(invoice, { status: 201 });
}
