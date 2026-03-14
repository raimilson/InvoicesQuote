import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const client = await prisma.rentalClient.findUnique({ where: { id } });
  if (!client || client.deleted_at) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(client);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const client = await prisma.rentalClient.update({
    where: { id },
    data: {
      nome_completo: body.nome_completo,
      cpf_cnpj: body.cpf_cnpj ?? null,
      email: body.email ?? null,
      telefone: body.telefone ?? null,
      endereco: body.endereco ?? null,
    },
  });

  return NextResponse.json(client);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.rentalClient.update({ where: { id }, data: { deleted_at: new Date() } });
  return NextResponse.json({ success: true });
}
