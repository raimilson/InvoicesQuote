import InvoiceForm from "@/components/InvoiceForm";
import { prisma } from "@/lib/db";

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ from_order?: string }> }) {
  const sp = await searchParams;

  const last = await prisma.invoice.findFirst({
    orderBy: { invoice_number: "desc" },
    select: { invoice_number: true },
  });
  const lastNum = last ? parseInt(last.invoice_number, 10) : 1265;
  const nextNumber = isNaN(lastNum) ? "1266" : String(lastNum + 1);

  let initialData: any = undefined;

  if (sp.from_order) {
    const oc = await prisma.orderConfirmation.findUnique({
      where: { id: sp.from_order },
      select: { client_id: true, company_id: true, payment_terms: true, notes: true, line_items: true, quote_id: true },
    });
    if (oc) {
      initialData = {
        client_id: oc.client_id,
        company_id: oc.company_id,
        payment_terms: oc.payment_terms,
        notes: oc.notes,
        line_items: oc.line_items,
        ...(oc.quote_id ? { from_quote_id: oc.quote_id } : {}),
      };
    }
  }

  return <InvoiceForm mode="create" defaultInvoiceNumber={nextNumber} initialData={initialData} />;
}
