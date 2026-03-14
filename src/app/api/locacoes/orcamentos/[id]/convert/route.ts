import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const quote = await prisma.rentalQuote.findUnique({
    where: { id },
    include: { client: true, items: { include: { product: true } } },
  });

  if (!quote || quote.deleted_at) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (quote.status !== "APROVADO") {
    return NextResponse.json({ error: "Only approved quotes can be converted" }, { status: 400 });
  }

  if (quote.converted_to_id) {
    return NextResponse.json({ error: "Quote already converted" }, { status: 400 });
  }

  // Auto-generate order number using numeric max pattern
  const all = await prisma.rentalOrder.findMany({ select: { order_number: true } });
  const nums = all.map(o => parseInt(o.order_number.replace(/^PED-/i, ""), 10)).filter(n => !isNaN(n));
  const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
  const orderNumber = `PED-${maxNum + 1}`;

  // Snapshot items as JSON
  const itemsSnapshot = quote.items.map(item => ({
    product_id: item.product_id,
    product_name: item.product.name,
    quantidade: item.quantidade,
    preco_unit: parseFloat(item.preco_unit.toString()),
    total: parseFloat(item.total.toString()),
  }));

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.rentalOrder.create({
      data: {
        order_number: orderNumber,
        client_id: quote.client_id,
        from_quote_id: quote.id,
        data_evento: quote.data_evento,
        endereco_entrega: quote.endereco_entrega,
        horario_inicio: quote.horario_inicio,
        horario_fim: quote.horario_fim,
        responsavel_nome: quote.responsavel_nome,
        responsavel_telefone: quote.responsavel_telefone,
        uso_monitor: quote.uso_monitor,
        qtd_monitores: quote.qtd_monitores,
        items: itemsSnapshot,
        subtotal: quote.subtotal,
        desconto: quote.desconto,
        total: quote.total,
        horas_contratadas: quote.horas_contratadas,
        status: "CONFIRMADO",
        notes: quote.notes,
      },
    });

    await tx.rentalQuote.update({
      where: { id: quote.id },
      data: {
        status: "CONVERTIDO",
        converted_to_id: created.id,
      },
    });

    return tx.rentalOrder.findUnique({
      where: { id: created.id },
      include: { client: true, from_quote: true },
    });
  });

  return NextResponse.json(order, { status: 201 });
}
