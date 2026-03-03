import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 0. Admin user
  const adminPassword = await bcrypt.hash("changeme", 10);
  await prisma.user.upsert({
    where: { email: "raimilson@kezpo.ca" },
    update: {},
    create: {
      id: "user-admin",
      name: "Raimilson",
      email: "raimilson@kezpo.ca",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // 1. Companies
  await prisma.company.upsert({
    where: { id: "company-kezpo-solutions" },
    update: {
      name: "Kezpo Solutions Inc",
      address: "66 Kowalsky Cres, Winnipeg, MB R3R3A8, Canada",
      is_default: false,
    },
    create: {
      id: "company-kezpo-solutions",
      name: "Kezpo Solutions Inc",
      address: "66 Kowalsky Cres, Winnipeg, MB R3R3A8, Canada",
      is_default: false,
    },
  });

  await prisma.company.upsert({
    where: { id: "company-kezpo-llc" },
    update: {
      name: "Kezpo LLC",
      address: "1021 E Lincolnway Suite #8933, Cheyenne, Wyoming 82001, United States",
      ein: "32-0823412",
      is_default: true,
    },
    create: {
      id: "company-kezpo-llc",
      name: "Kezpo LLC",
      address: "1021 E Lincolnway Suite #8933, Cheyenne, Wyoming 82001, United States",
      ein: "32-0823412",
      is_default: true,
    },
  });

  // 2. Bank Templates
  // CAD – Wise Canada (Kezpo LLC)
  await prisma.bankTemplate.upsert({
    where: { id: "bt-wise-usd" },
    update: {
      name: "CAD – Kezpo LLC (Wise Canada)",
      currency: "CAD",
      account_number: "200110250929",
      institution_no: "621",
      transit_no: "16001",
      swift_bic: "TRWICAW1XXX",
      bank_name: "Wise Payments Canada Inc.",
      bank_address: "99 Bank Street, Suite 1420, Ottawa, ON, K1P 1H4, Canada",
      is_default: false,
    },
    create: {
      id: "bt-wise-usd",
      name: "CAD – Kezpo LLC (Wise Canada)",
      currency: "CAD",
      account_number: "200110250929",
      institution_no: "621",
      transit_no: "16001",
      swift_bic: "TRWICAW1XXX",
      bank_name: "Wise Payments Canada Inc.",
      bank_address: "99 Bank Street, Suite 1420, Ottawa, ON, K1P 1H4, Canada",
      is_default: false,
    },
  });

  // USD – Wise US (Kezpo LLC)
  await prisma.bankTemplate.upsert({
    where: { id: "bt-usd-wise-us" },
    update: {
      name: "USD – Kezpo LLC (Wise US)",
      currency: "USD",
      account_number: "211224797456",
      institution_no: "101019628",
      transit_no: null,
      swift_bic: "TRWIUS35XXX",
      bank_name: "Wise US Inc",
      bank_address: "108 W 13th St, Wilmington, DE 19801, United States",
      is_default: true,
    },
    create: {
      id: "bt-usd-wise-us",
      name: "USD – Kezpo LLC (Wise US)",
      currency: "USD",
      account_number: "211224797456",
      institution_no: "101019628",
      transit_no: null,
      swift_bic: "TRWIUS35XXX",
      bank_name: "Wise US Inc",
      bank_address: "108 W 13th St, Wilmington, DE 19801, United States",
      is_default: true,
    },
  });

  // EUR – Wise Belgium (Kezpo LLC)
  await prisma.bankTemplate.upsert({
    where: { id: "bt-eur-wise-be" },
    update: {
      name: "EUR – Kezpo LLC (Wise Belgium)",
      currency: "EUR",
      account_number: "BE12 9056 7510 9192",
      institution_no: null,
      transit_no: null,
      swift_bic: "TRWIBEB1XXX",
      bank_name: "Wise",
      bank_address: "Rue du Trône 100, 3rd floor, Brussels, 1050, Belgium",
      is_default: false,
    },
    create: {
      id: "bt-eur-wise-be",
      name: "EUR – Kezpo LLC (Wise Belgium)",
      currency: "EUR",
      account_number: "BE12 9056 7510 9192",
      institution_no: null,
      transit_no: null,
      swift_bic: "TRWIBEB1XXX",
      bank_name: "Wise",
      bank_address: "Rue du Trône 100, 3rd floor, Brussels, 1050, Belgium",
      is_default: false,
    },
  });

  // Remove placeholder CAD template if still exists
  await prisma.bankTemplate.deleteMany({ where: { id: "bt-cad-placeholder" } });

  // 3. Client
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

  // 4. Invoice 1265
  await prisma.invoice.upsert({
    where: { invoice_number: "1265" },
    update: {},
    create: {
      invoice_number: "1265",
      client_id: client.id,
      company_id: "company-kezpo-llc",
      date: new Date("2026-01-30"),
      due_date: new Date("2026-01-30"),
      status: "SENT",
      bank_template_id: "bt-usd-wise-us",
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
