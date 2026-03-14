import InvoiceForm from "@/components/InvoiceForm";
import { prisma } from "@/lib/db";

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ from_order?: string }> }) {
  const sp = await searchParams;

  // Numeric max to avoid lexicographic sort bug
  const all = await prisma.invoice.findMany({ select: { invoice_number: true } });
  const nums = all.map((i) => parseInt(i.invoice_number, 10)).filter((n) => !isNaN(n));
  const maxNum = nums.length > 0 ? Math.max(...nums) : 1265;
  const nextNumber = String(maxNum + 1);

  let initialData: any = undefined;

  if (sp.from_order) {
    const oc = await prisma.orderConfirmation.findUnique({
      where: { id: sp.from_order },
      include: {
        invoices: { where: { deleted_at: null }, select: { total: true } },
      },
    });
    if (oc) {
      const orderTotal = (oc.line_items as any[]).reduce(
        (sum: number, item: any) => sum + (Number(item.amount) || 0),
        0
      );
      const invoicedTotal = oc.invoices.reduce(
        (sum: number, inv: any) => sum + (Number(inv.total) || 0),
        0
      );
      const remainingBalance = Math.max(0, orderTotal - invoicedTotal);

      initialData = {
        client_id: oc.client_id,
        company_id: oc.company_id,
        payment_terms: oc.payment_terms,
        notes: oc.notes,
        line_items: oc.line_items,
        order_confirmation_id: oc.id,
        order_number: oc.order_number,
        remaining_balance: remainingBalance,
        ...(oc.quote_id ? { from_quote_id: oc.quote_id } : {}),
      };
    }
  }

  return <InvoiceForm mode="create" defaultInvoiceNumber={nextNumber} initialData={initialData} />;
}
