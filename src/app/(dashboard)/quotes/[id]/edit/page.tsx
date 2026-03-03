"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QuoteForm from "@/components/QuoteForm";

export default function EditQuotePage() {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/quotes/${id}`).then((r) => r.json()).then(setQuote);
  }, [id]);

  if (!quote) return <div className="animate-pulse h-96 bg-white rounded-xl border" />;
  return <QuoteForm mode="edit" initialData={quote} />;
}
