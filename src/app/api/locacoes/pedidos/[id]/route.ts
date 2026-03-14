import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.rentalOrder.findUnique({
    where: { id },
    include: { client: true, from_quote: true },
  });
  if (!order || order.deleted_at) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const order = await prisma.rentalOrder.update({
    where: { id },
    data: {
      client_id: body.client_id,
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
      status: body.status,
      notes: body.notes ?? null,
      contract_generated: body.contract_generated ?? false,
    },
    include: { client: true, from_quote: true },
  });

  return NextResponse.json(order);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.rentalOrder.update({ where: { id }, data: { deleted_at: new Date() } });
  return NextResponse.json({ success: true });
}
