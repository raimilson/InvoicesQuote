import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const p = req.nextUrl.searchParams;
  const search = p.get("search") ?? "";
  const clientId = p.get("clientId") ?? "";

  const contracts = await prisma.salesContract.findMany({
    where: {
      deleted_at: null,
      ...(clientId ? { client_id: clientId } : {}),
      ...(search
        ? {
            OR: [
              { contract_number: { contains: search, mode: "insensitive" } },
              { client: { name: { contains: search, mode: "insensitive" } } },
              { client: { company: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: { client: true, company: true },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(contracts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (!body.contract_number) {
    const all = await prisma.salesContract.findMany({ select: { contract_number: true } });
    const nums = all.map(c => parseInt(c.contract_number.replace(/^SC-/i, ""), 10)).filter(n => !isNaN(n));
    const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
    body.contract_number = `SC-${maxNum + 1}`;
  }

  const contract = await prisma.salesContract.create({
    data: {
      contract_number: body.contract_number,
      client_id: body.client_id,
      company_id: body.company_id ?? null,
      invoice_id: body.invoice_id ?? null,
      bank_template_id: body.bank_template_id ?? null,
      date: new Date(body.date),
      currency: body.currency ?? "USD",
      line_items: body.line_items,
      total: body.total,
      notes: body.notes ?? null,
      client_vat_id: body.client_vat_id ?? null,
      client_bank_name: body.client_bank_name ?? null,
      client_bank_address: body.client_bank_address ?? null,
      client_account: body.client_account ?? null,
      client_swift: body.client_swift ?? null,
    },
    include: { client: true, company: true },
  });

  return NextResponse.json(contract, { status: 201 });
}
