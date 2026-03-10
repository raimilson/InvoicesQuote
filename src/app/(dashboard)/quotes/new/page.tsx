import QuoteForm from "@/components/QuoteForm";
import { prisma } from "@/lib/db";

export default async function NewQuotePage() {
  const all = await prisma.quote.findMany({ select: { quote_number: true } });
  const nums = all.map((q) => parseInt(q.quote_number.replace(/^Q-/i, ""), 10)).filter((n) => !isNaN(n));
  const maxNum = nums.length > 0 ? Math.max(...nums) : 1000;
  const nextNumber = `Q-${maxNum + 1}`;
  return <QuoteForm mode="create" defaultQuoteNumber={nextNumber} />;
}
