import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const p = req.nextUrl.searchParams;
  const search = p.get("search");
  const status = p.get("status");

  const quotes = await prisma.rentalQuote.findMany({
    where: {
      deleted_at: null,
      ...(status ? { status: status as any } : {}),
      ...(search
        ? {
            OR: [
              { quote_number: { contains: search, mode: "insensitive" } },
              { client: { nome_completo: { contains: search, mode: "insensitive" } } },
              { endereco_entrega: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      client: true,
      items: { include: { product: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(quotes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Auto-generate quote number using numeric max pattern
  if (!body.quote_number) {
    const all = await prisma.rentalQuote.findMany({ select: { quote_number: true } });
    const nums = all.map(q => parseInt(q.quote_number.replace(/^ORC-/i, ""), 10)).filter(n => !isNaN(n));
    const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
    body.quote_number = `ORC-${maxNum + 1}`;
  }

  const quote = await prisma.$transaction(async (tx) => {
    const created = await tx.rentalQuote.create({
      data: {
        quote_number: body.quote_number,
        client_id: body.client_id,
        data_evento: new Date(body.data_evento),
        endereco_entrega: body.endereco_entrega,
        horario_inicio: body.horario_inicio,
        horario_fim: body.horario_fim,
        responsavel_nome: body.responsavel_nome ?? null,
        responsavel_telefone: body.responsavel_telefone ?? null,
        uso_monitor: body.uso_monitor ?? false,
        qtd_monitores: body.qtd_monitores ?? 0,
        subtotal: body.subtotal,
        desconto: body.desconto ?? null,
        total: body.total,
        horas_contratadas: body.horas_contratadas ?? 4,
        status: body.status ?? "RASCUNHO",
        notes: body.notes ?? null,
      },
    });

    if (body.items && body.items.length > 0) {
      await tx.rentalQuoteItem.createMany({
        data: body.items.map((item: any) => ({
          quote_id: created.id,
          product_id: item.product_id,
          quantidade: item.quantidade,
          preco_unit: item.preco_unit,
          total: item.total,
        })),
      });
    }

    return tx.rentalQuote.findUnique({
      where: { id: created.id },
      include: { client: true, items: { include: { product: true } } },
    });
  });

  return NextResponse.json(quote, { status: 201 });
}
