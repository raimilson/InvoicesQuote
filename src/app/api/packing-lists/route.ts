import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const p = req.nextUrl.searchParams;
  const search = p.get("search") ?? "";
  const clientId = p.get("clientId") ?? "";

  const packingLists = await prisma.packingList.findMany({
    where: {
      deleted_at: null,
      ...(clientId ? { client_id: clientId } : {}),
      ...(search
        ? {
            OR: [
              { packing_number: { contains: search, mode: "insensitive" } },
              { client: { name: { contains: search, mode: "insensitive" } } },
              { client: { company: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: { client: true, company: true },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(packingLists);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (!body.packing_number) {
    const all = await prisma.packingList.findMany({ select: { packing_number: true } });
    const nums = all.map(p => parseInt(p.packing_number.replace(/^PL-/i, ""), 10)).filter(n => !isNaN(n));
    const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
    body.packing_number = `PL-${maxNum + 1}`;
  }

  const packingList = await prisma.packingList.create({
    data: {
      packing_number: body.packing_number,
      client_id: body.client_id,
      company_id: body.company_id ?? null,
      invoice_id: body.invoice_id ?? null,
      delivery_id: body.delivery_id ?? null,
      date: new Date(body.date),
      line_items: body.line_items,
      cartons: body.cartons,
      notes: body.notes ?? null,
    },
    include: { client: true, company: true },
  });

  return NextResponse.json(packingList, { status: 201 });
}
