import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const p = req.nextUrl.searchParams;
  const search = p.get("search");

  const clients = await prisma.rentalClient.findMany({
    where: {
      deleted_at: null,
      ...(search
        ? {
            OR: [
              { nome_completo: { contains: search, mode: "insensitive" } },
              { cpf_cnpj: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { telefone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const client = await prisma.rentalClient.create({
    data: {
      nome_completo: body.nome_completo,
      cpf_cnpj: body.cpf_cnpj ?? null,
      email: body.email ?? null,
      telefone: body.telefone ?? null,
      endereco: body.endereco ?? null,
    },
  });

  return NextResponse.json(client, { status: 201 });
}
