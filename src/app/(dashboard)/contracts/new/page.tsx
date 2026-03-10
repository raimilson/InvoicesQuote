import ContractForm from "@/components/ContractForm";
import { prisma } from "@/lib/db";

export default async function NewContractPage({ searchParams }: { searchParams: Promise<{ from_invoice?: string }> }) {
  const sp = await searchParams;

  const all = await prisma.salesContract.findMany({ select: { contract_number: true } });
  const nums = all.map((c) => parseInt(c.contract_number.replace(/^SC-/i, ""), 10)).filter((n) => !isNaN(n));
  const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
  const nextNumber = `SC-${maxNum + 1}`;

  let initialData: any = undefined;

  if (sp.from_invoice) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: sp.from_invoice },
      select: { id: true, client_id: true, company_id: true, line_items: true, total: true },
    });
    if (invoice) {
      const items = invoice.line_items as any[];
      initialData = {
        invoice_id: invoice.id,
        client_id: invoice.client_id,
        company_id: invoice.company_id,
        total: invoice.total,
        line_items: items.map((item: any) => ({
          service: item.description ?? item.product_service ?? "",
          description: "",
          qty: item.quantity ?? item.qty ?? 1,
          unit: "PCS",
          unit_price: item.rate ?? item.unit_price ?? 0,
          amount: item.amount ?? 0,
        })),
      };
    }
  }

  return <ContractForm mode="create" defaultContractNumber={nextNumber} initialData={initialData} />;
}
