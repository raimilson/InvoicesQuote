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

  // Auto-generate quote number (numeric max to avoid lexicographic sort issues)
  if (!body.quote_number) {
    const all = await prisma.quote.findMany({ select: { quote_number: true } });
    const nums = all.map(q => parseInt(q.quote_number.replace(/^Q-/i, ""), 10)).filter(n => !isNaN(n));
    const maxNum = nums.length > 0 ? Math.max(...nums) : 1000;
    body.quote_number = `Q-${maxNum + 1}`;
  }

  const quote = await prisma.quote.create({
    data: {
      quote_number: body.quote_number,
      client_id: body.client_id,
      company_id: body.company_id ?? null,
      date: new Date(body.date),
      valid_until: new Date(body.valid_until),
      status: body.status ?? "DRAFT",
      currency: body.currency ?? "USD",
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
