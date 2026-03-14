type InvoiceStatus = "DRAFT" | "SENT" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "CONVERTED";
type RentalQuoteStatus = "RASCUNHO" | "ENVIADO" | "APROVADO" | "REJEITADO" | "CONVERTIDO";
type RentalOrderStatus = "CONFIRMADO" | "PAGO_PARCIAL" | "PAGO" | "ENTREGUE" | "CONCLUIDO" | "CANCELADO";
type Status = InvoiceStatus | QuoteStatus | RentalQuoteStatus | RentalOrderStatus;

const statusConfig: Record<Status, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  SENT: { label: "Sent", className: "bg-blue-100 text-blue-700" },
  PARTIALLY_PAID: { label: "Partially Paid", className: "bg-orange-100 text-orange-700" },
  PAID: { label: "Paid", className: "bg-green-100 text-green-700" },
  OVERDUE: { label: "Overdue", className: "bg-red-100 text-red-700" },
  ACCEPTED: { label: "Accepted", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700" },
  CONVERTED: { label: "Converted", className: "bg-purple-100 text-purple-700" },
  // Rental quote statuses
  RASCUNHO: { label: "Rascunho", className: "bg-gray-100 text-gray-600" },
  ENVIADO: { label: "Enviado", className: "bg-blue-100 text-blue-700" },
  APROVADO: { label: "Aprovado", className: "bg-green-100 text-green-700" },
  REJEITADO: { label: "Rejeitado", className: "bg-red-100 text-red-700" },
  CONVERTIDO: { label: "Convertido", className: "bg-purple-100 text-purple-700" },
  // Rental order statuses
  CONFIRMADO: { label: "Confirmado", className: "bg-blue-100 text-blue-700" },
  PAGO_PARCIAL: { label: "Pago Parcial", className: "bg-yellow-100 text-yellow-700" },
  PAGO: { label: "Pago", className: "bg-green-100 text-green-700" },
  ENTREGUE: { label: "Entregue", className: "bg-indigo-100 text-indigo-700" },
  CONCLUIDO: { label: "Concluido", className: "bg-green-100 text-green-700" },
  CANCELADO: { label: "Cancelado", className: "bg-red-100 text-red-700" },
};

export default function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
