import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const p = req.nextUrl.searchParams;
  const search = p.get("search");
  const status = p.get("status");

  const orders = await prisma.rentalOrder.findMany({
    where: {
      deleted_at: null,
      ...(status ? { status: status as any } : {}),
      ...(search
        ? {
            OR: [
              { order_number: { contains: search, mode: "insensitive" } },
              { client: { nome_completo: { contains: search, mode: "insensitive" } } },
              { endereco_entrega: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      client: true,
      from_quote: true,
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Auto-generate order number using numeric max pattern
  if (!body.order_number) {
    const all = await prisma.rentalOrder.findMany({ select: { order_number: true } });
    const nums = all.map(o => parseInt(o.order_number.replace(/^PED-/i, ""), 10)).filter(n => !isNaN(n));
    const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
    body.order_number = `PED-${maxNum + 1}`;
  }

  const order = await prisma.rentalOrder.create({
    data: {
      order_number: body.order_number,
      client_id: body.client_id,
      from_quote_id: body.from_quote_id ?? null,
      data_evento: new Date(body.data_evento),
      endereco_entrega: body.endereco_entrega,
      horario_inicio: body.horario_inicio,
      horario_fim: body.horario_fim,
      responsavel_nome: body.responsavel_nome ?? null,
      responsavel_telefone: body.responsavel_telefone ?? null,
      uso_monitor: body.uso_monitor ?? false,
      qtd_monitores: body.qtd_monitores ?? 0,
      items: body.items,
      subtotal: body.subtotal,
      desconto: body.desconto ?? null,
      total: body.total,
      horas_contratadas: body.horas_contratadas ?? 4,
      pagamento_sinal: body.pagamento_sinal ?? null,
      pagamento_metodo: body.pagamento_metodo ?? null,
      status: body.status ?? "CONFIRMADO",
      notes: body.notes ?? null,
    },
    include: { client: true, from_quote: true },
  });

  return NextResponse.json(order, { status: 201 });
}
