import InvoiceForm from "@/components/InvoiceForm";
import { prisma } from "@/lib/db";

export default async function NewInvoicePage() {
  const last = await prisma.invoice.findFirst({
    orderBy: { invoice_number: "desc" },
    select: { invoice_number: true },
  });
  const lastNum = last ? parseInt(last.invoice_number, 10) : 1265;
  const nextNumber = isNaN(lastNum) ? "1266" : String(lastNum + 1);
  return <InvoiceForm mode="create" defaultInvoiceNumber={nextNumber} />;
}
