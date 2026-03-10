import DeliveryNoticeForm from "@/components/DeliveryNoticeForm";
import { prisma } from "@/lib/db";

export default async function NewDeliveryPage({ searchParams }: { searchParams: Promise<{ from_invoice?: string }> }) {
  const sp = await searchParams;

  const all = await prisma.deliveryNotice.findMany({ select: { delivery_number: true } });
  const nums = all.map((d) => parseInt(d.delivery_number.replace(/^DN-/i, ""), 10)).filter((n) => !isNaN(n));
  const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
  const nextNumber = `DN-${maxNum + 1}`;

  let initialData: any = undefined;

  if (sp.from_invoice) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: sp.from_invoice },
      select: { id: true, client_id: true, company_id: true, invoice_number: true, line_items: true },
    });
    if (invoice) {
      const items = invoice.line_items as any[];
      initialData = {
        invoice_id: invoice.id,
        client_id: invoice.client_id,
        company_id: invoice.company_id,
        commercial_invoice: invoice.invoice_number,
        line_items: items.map((item: any, i: number) => ({
          item_number: item.item_number ?? i + 1,
          product: item.description ?? item.product_service ?? "",
          description: "",
          quantity: item.quantity ?? item.qty ?? 1,
          unit: "PCS",
        })),
      };
    }
  }

  return <DeliveryNoticeForm mode="create" defaultDeliveryNumber={nextNumber} initialData={initialData} />;
}
