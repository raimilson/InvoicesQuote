import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { renderToBuffer } from "@react-pdf/renderer";
import RentalQuotePDF from "@/lib/pdf/RentalQuotePDF";
import React from "react";

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

  if (!quote || quote.deleted_at) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const items = quote.items.map((item) => ({
    product_name: item.product.name,
    quantidade: item.quantidade,
    preco_unit: parseFloat(item.preco_unit.toString()),
    total: parseFloat(item.total.toString()),
  }));

  const buffer = await renderToBuffer(
    React.createElement(RentalQuotePDF, {
      quote_number: quote.quote_number,
      date: quote.created_at.toISOString(),
      client: {
        nome_completo: quote.client.nome_completo,
        telefone: quote.client.telefone || undefined,
        email: quote.client.email || undefined,
      },
      data_evento: quote.data_evento.toISOString(),
      endereco_entrega: quote.endereco_entrega,
      horario_inicio: quote.horario_inicio,
      horario_fim: quote.horario_fim,
      items,
      subtotal: parseFloat(quote.subtotal.toString()),
      desconto: parseFloat((quote.desconto ?? 0).toString()),
      total: parseFloat(quote.total.toString()),
      notes: quote.notes || undefined,
    }) as any
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Orcamento-${quote.quote_number}.pdf"`,
    },
  });
}
