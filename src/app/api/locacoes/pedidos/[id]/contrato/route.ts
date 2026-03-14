import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { renderToBuffer } from "@react-pdf/renderer";
import RentalContractPDF from "@/lib/pdf/RentalContractPDF";
import { numberToWordsPT } from "@/lib/numberToWordsPT";
import React from "react";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.rentalOrder.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!order || order.deleted_at) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const items = order.items as any[];
  const total = parseFloat(order.total.toString());

  // Build brinquedos string from items
  const brinquedos = items.map((i: any) => i.product_name || i.name || "Brinquedo").join(", ");

  const buffer = await renderToBuffer(
    React.createElement(RentalContractPDF, {
      nome_completo: order.client.nome_completo,
      cpf_cnpj: order.client.cpf_cnpj || "-",
      email: order.client.email || "-",
      telefone: order.client.telefone || "-",
      endereco: order.client.endereco || "-",
      data_evento: order.data_evento.toISOString(),
      endereco_entrega: order.endereco_entrega,
      horario_inicio: order.horario_inicio,
      horario_fim: order.horario_fim,
      responsavel_nome: order.responsavel_nome || "-",
      responsavel_telefone: order.responsavel_telefone || "-",
      brinquedos,
      uso_monitor: order.uso_monitor,
      qtd_monitores: order.qtd_monitores,
      valor: total,
      valor_extenso: numberToWordsPT(total),
      horas_contratadas: order.horas_contratadas,
      contract_date: new Date().toISOString(),
    }) as any
  );

  // Mark contract as generated
  await prisma.rentalOrder.update({
    where: { id },
    data: { contract_generated: true },
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Contrato-${order.order_number}.pdf"`,
    },
  });
}
