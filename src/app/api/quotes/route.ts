import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const search = req.nextUrl.searchParams.get("search") ?? "";
  const status = req.nextUrl.searchParams.get("status") ?? "";

  const quotes = await prisma.quote.findMany({
    where: {
      deleted_at: null,
      ...(status ? { status: status as any } : {}),
      ...(search
        ? {
            OR: [
              { quote_number: { contains: search, mode: "insensitive" } },
              { client: { name: { contains: search, mode: "insensitive" } } },
              { client: { company: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: { client: true, converted_to: true },
    orderBy: { created_at: "desc" },
  });
  return NextResponse.json(quotes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Auto-generate quote number
  if (!body.quote_number) {
    const last = await prisma.quote.findFirst({
      orderBy: { quote_number: "desc" },
      select: { quote_number: true },
    });
    const lastNum = last ? parseInt(last.quote_number.replace("Q-", ""), 10) : 1000;
    body.quote_number = isNaN(lastNum) ? "Q-1001" : `Q-${lastNum + 1}`;
  }

  const quote = await prisma.quote.create({
    data: {
      quote_number: body.quote_number,
      client_id: body.client_id,
      date: new Date(body.date),
      valid_until: new Date(body.valid_until),
      status: body.status ?? "DRAFT",
      line_items: body.line_items,
      subtotal: body.subtotal,
      tax: body.tax ?? null,
      total: body.total,
      payment_terms: body.payment_terms ?? null,
      notes: body.notes ?? null,
    },
    include: { client: true },
  });

  return NextResponse.json(quote, { status: 201 });
}
