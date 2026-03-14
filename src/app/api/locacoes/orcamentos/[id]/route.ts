import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const quote = await prisma.rentalQuote.findUnique({
    where: { id },
    include: {
      client: true,
      items: { include: { product: true } },
    },
  });
  if (!quote || quote.deleted_at) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(quote);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const quote = await prisma.$transaction(async (tx) => {
    await tx.rentalQuote.update({
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
        subtotal: body.subtotal,
        desconto: body.desconto ?? null,
        total: body.total,
        horas_contratadas: body.horas_contratadas ?? 4,
        status: body.status,
        notes: body.notes ?? null,
      },
    });

    // Delete old items and create new ones
    await tx.rentalQuoteItem.deleteMany({ where: { quote_id: id } });

    if (body.items && body.items.length > 0) {
      await tx.rentalQuoteItem.createMany({
        data: body.items.map((item: any) => ({
          quote_id: id,
          product_id: item.product_id,
          quantidade: item.quantidade,
          preco_unit: item.preco_unit,
          total: item.total,
        })),
      });
    }

    return tx.rentalQuote.findUnique({
      where: { id },
      include: { client: true, items: { include: { product: true } } },
    });
  });

  return NextResponse.json(quote);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.rentalQuote.update({ where: { id }, data: { deleted_at: new Date() } });
  return NextResponse.json({ success: true });
}
