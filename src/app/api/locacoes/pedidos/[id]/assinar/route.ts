import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { renderToBuffer } from "@react-pdf/renderer";
import RentalContractPDF from "@/lib/pdf/RentalContractPDF";
import { numberToWordsPT } from "@/lib/numberToWordsPT";
import { createDocumentForSignature, getDocumentStatus } from "@/lib/autentique";
import React from "react";

// POST — Send contract to Autentique for digital signature
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  // Get email from request body or fall back to client email
  let signerEmail = order.client.email;
  try {
    const body = await req.json();
    if (body.email) signerEmail = body.email;
  } catch {
    // No body sent, use client email
  }

  if (!signerEmail) {
    return NextResponse.json({ error: "E-mail não informado" }, { status: 400 });
  }

  if (order.autentique_doc_id) {
    return NextResponse.json({ error: "Contrato já foi enviado para assinatura" }, { status: 400 });
  }

  // Generate the PDF
  const items = order.items as any[];
  const total = parseFloat(order.total.toString());
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

  // Send to Autentique
  let doc;
  try {
    doc = await createDocumentForSignature(
      Buffer.from(buffer),
      `Contrato-${order.order_number}`,
      order.client.nome_completo,
      signerEmail,
      `Prezado(a) ${order.client.nome_completo}, segue o contrato de locação de brinquedos infláveis (${order.order_number}) para assinatura digital. Kezpo Locações.`
    );
  } catch (err: any) {
    console.error("Autentique error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }

  // Get signer link
  const signerLink = doc.signatures?.[0]?.link?.short_link || null;

  // Update order with Autentique data
  await prisma.rentalOrder.update({
    where: { id },
    data: {
      contract_generated: true,
      autentique_doc_id: doc.id,
      autentique_status: "PENDING",
      autentique_sign_url: signerLink,
    },
  });

  return NextResponse.json({
    success: true,
    autentique_doc_id: doc.id,
    sign_url: signerLink,
    message: `Contrato enviado para ${signerEmail}`,
  });
}

// GET — Check signature status
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.rentalOrder.findUnique({ where: { id } });

  if (!order || order.deleted_at) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!order.autentique_doc_id) {
    return NextResponse.json({ error: "Contrato não enviado para assinatura" }, { status: 400 });
  }

  const doc = await getDocumentStatus(order.autentique_doc_id);

  // Determine status from signatures
  const signature = doc.signatures?.[0];
  let newStatus = "PENDING";
  if (signature?.signed) {
    newStatus = "SIGNED";
  } else if (signature?.rejected) {
    newStatus = "REFUSED";
  }

  // Update local status if changed
  if (newStatus !== order.autentique_status) {
    await prisma.rentalOrder.update({
      where: { id },
      data: { autentique_status: newStatus },
    });
  }

  return NextResponse.json({
    status: newStatus,
    signatures: doc.signatures,
    signed_file: doc.files?.signed || null,
  });
}
