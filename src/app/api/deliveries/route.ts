import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const p = req.nextUrl.searchParams;
  const search = p.get("search") ?? "";
  const clientId = p.get("clientId") ?? "";

  const deliveries = await prisma.deliveryNotice.findMany({
    where: {
      deleted_at: null,
      ...(clientId ? { client_id: clientId } : {}),
      ...(search
        ? {
            OR: [
              { delivery_number: { contains: search, mode: "insensitive" } },
              { purchase_order: { contains: search, mode: "insensitive" } },
              { tracking_number: { contains: search, mode: "insensitive" } },
              { client: { name: { contains: search, mode: "insensitive" } } },
              { client: { company: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: { client: true, company: true },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(deliveries);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (!body.delivery_number) {
    const all = await prisma.deliveryNotice.findMany({ select: { delivery_number: true } });
    const nums = all.map(d => parseInt(d.delivery_number.replace(/^DN-/i, ""), 10)).filter(n => !isNaN(n));
    const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
    body.delivery_number = `DN-${maxNum + 1}`;
  }

  const delivery = await prisma.deliveryNotice.create({
    data: {
      delivery_number: body.delivery_number,
      client_id: body.client_id,
      company_id: body.company_id ?? null,
      invoice_id: body.invoice_id ?? null,
      date: new Date(body.date),
      purchase_order: body.purchase_order ?? null,
      purchase_date: body.purchase_date ? new Date(body.purchase_date) : null,
      commercial_invoice: body.commercial_invoice ?? null,
      shipment_type: body.shipment_type ?? null,
      tracking_number: body.tracking_number ?? null,
      incoterms: body.incoterms ?? null,
      country_of_origin: body.country_of_origin ?? null,
      line_items: body.line_items,
      notes: body.notes ?? null,
    },
    include: { client: true, company: true },
  });

  return NextResponse.json(delivery, { status: 201 });
}
