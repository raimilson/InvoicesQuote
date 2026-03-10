import PackingListForm from "@/components/PackingListForm";
import { prisma } from "@/lib/db";

export default async function NewPackingListPage({ searchParams }: { searchParams: Promise<{ from_invoice?: string }> }) {
  const sp = await searchParams;

  const all = await prisma.packingList.findMany({ select: { packing_number: true } });
  const nums = all.map((p) => parseInt(p.packing_number.replace(/^PL-/i, ""), 10)).filter((n) => !isNaN(n));
  const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
  const nextNumber = `PL-${maxNum + 1}`;

  let initialData: any = undefined;

  if (sp.from_invoice) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: sp.from_invoice },
      select: { id: true, client_id: true, company_id: true, line_items: true },
    });
    if (invoice) {
      const items = invoice.line_items as any[];
      initialData = {
        invoice_id: invoice.id,
        client_id: invoice.client_id,
        company_id: invoice.company_id,
        line_items: items.map((item: any) => ({
          product: item.description ?? item.product_service ?? "",
          carton_number: "",
          qty_per_carton: item.quantity ?? item.qty ?? 1,
          total_pcs: item.quantity ?? item.qty ?? 1,
        })),
        cartons: [],
      };
    }
  }

  return <PackingListForm mode="create" defaultPackingNumber={nextNumber} initialData={initialData} />;
}
