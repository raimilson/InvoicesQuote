import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Bank Templates
  const wiseTemplate = await prisma.bankTemplate.upsert({
    where: { id: "bt-wise-usd" },
    update: {},
    create: {
      id: "bt-wise-usd",
      name: "USD - Wise Canada",
      currency: "USD",
      account_number: "200110250929",
      institution_no: "621",
      transit_no: "16001",
      swift_bic: "TRWICAW1XXX",
      bank_name: "Wise Payments Canada Inc.",
      bank_address: "99 Bank Street, Suite 1420, Ottawa, ON, K1P 1H4, Canada",
      is_default: true,
    },
  });

  await prisma.bankTemplate.upsert({
    where: { id: "bt-cad-placeholder" },
    update: {},
    create: {
      id: "bt-cad-placeholder",
      name: "CAD - [Bank Name]",
      currency: "CAD",
      account_number: "[To be configured]",
      institution_no: "[To be configured]",
      transit_no: "[To be configured]",
      swift_bic: "[To be configured]",
      bank_name: "[To be configured]",
      bank_address: "[To be configured]",
      is_default: false,
    },
  });

  // 2. Client
  const client = await prisma.client.upsert({
    where: { id: "client-plastinove" },
    update: {},
    create: {
      id: "client-plastinove",
      name: "JT",
      company: "Plastinove Inc",
      address: "660 NW Peacock Blvd, Ste 105 Port St Lucie, 34986 Florida U.S.A",
      phone: "(+1) 561 646 1935",
    },
  });

  // 3. Invoice 1265
  await prisma.invoice.upsert({
    where: { invoice_number: "1265" },
    update: {},
    create: {
      invoice_number: "1265",
      client_id: client.id,
      date: new Date("2026-01-30"),
      due_date: new Date("2026-01-30"),
      status: "SENT",
      bank_template_id: wiseTemplate.id,
      line_items: [
        {
          item_number: 1,
          product_service: "PET 3IN1 DRYWER",
          description: "48 CAV AND 26 GR",
          quantity: 1,
          rate: 18500.0,
          amount: 18500.0,
        },
      ],
      subtotal: 18500.0,
      total: 18500.0,
      payment_terms: "30% Due today, 70% when product is ready to ship",
    },
  });

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
