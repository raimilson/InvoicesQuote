import QuoteForm from "@/components/QuoteForm";
import { prisma } from "@/lib/db";

export default async function NewQuotePage() {
  const last = await prisma.quote.findFirst({
    orderBy: { quote_number: "desc" },
    select: { quote_number: true },
  });
  const lastNum = last ? parseInt(last.quote_number.replace("Q-", ""), 10) : 1000;
  const nextNumber = isNaN(lastNum) ? "Q-1001" : `Q-${lastNum + 1}`;
  return <QuoteForm mode="create" defaultQuoteNumber={nextNumber} />;
}
