import OrderForm from "@/components/OrderForm";
import { prisma } from "@/lib/db";

export default async function NewOrderPage({ searchParams }: { searchParams: Promise<{ from_quote?: string; from_invoice?: string }> }) {
  const sp = await searchParams;

  const all = await prisma.orderConfirmation.findMany({ select: { order_number: true } });
  const nums = all.map((o) => parseInt(o.order_number.replace(/^O-/i, ""), 10)).filter((n) => !isNaN(n));
  const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
  const nextNumber = `O-${maxNum + 1}`;

  let initialData: any = undefined;

  if (sp.from_quote) {
    const quote = await prisma.quote.findUnique({
      where: { id: sp.from_quote },
      select: { id: true, client_id: true, company_id: true, currency: true, payment_terms: true, notes: true, line_items: true },
    });
    if (quote) {
      initialData = {
        quote_id: quote.id,
        client_id: quote.client_id,
        company_id: quote.company_id,
        currency: quote.currency,
        payment_terms: quote.payment_terms,
        notes: quote.notes,
        line_items: quote.line_items,
      };
    }
  } else if (sp.from_invoice) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: sp.from_invoice },
      select: { id: true, client_id: true, company_id: true, payment_terms: true, notes: true, line_items: true },
    });
    if (invoice) {
      initialData = {
        invoice_id: invoice.id,
        client_id: invoice.client_id,
        company_id: invoice.company_id,
        payment_terms: invoice.payment_terms,
        notes: invoice.notes,
        line_items: invoice.line_items,
      };
    }
  }

  return <OrderForm mode="create" defaultOrderNumber={nextNumber} initialData={initialData} />;
}
