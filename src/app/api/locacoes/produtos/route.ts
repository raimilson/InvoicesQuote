import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const p = req.nextUrl.searchParams;
  const search = p.get("search");

  const products = await prisma.rentalProduct.findMany({
    where: {
      deleted_at: null,
      active: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const product = await prisma.rentalProduct.create({
    data: {
      name: body.name,
      description: body.description ?? null,
      price: body.price,
      image_url: body.image_url ?? null,
      active: body.active ?? true,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
