"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import InvoiceForm from "@/components/InvoiceForm";

export default function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/invoices/${id}`).then((r) => r.json()).then(setInvoice);
  }, [id]);

  if (!invoice) return <div className="animate-pulse h-96 bg-white rounded-xl border" />;
  return <InvoiceForm mode="edit" initialData={invoice} />;
}
