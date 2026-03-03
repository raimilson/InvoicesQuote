type InvoiceStatus = "DRAFT" | "SENT" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "CONVERTED";
type Status = InvoiceStatus | QuoteStatus;

const statusConfig: Record<Status, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  SENT: { label: "Sent", className: "bg-blue-100 text-blue-700" },
  PARTIALLY_PAID: { label: "Partially Paid", className: "bg-orange-100 text-orange-700" },
  PAID: { label: "Paid", className: "bg-green-100 text-green-700" },
  OVERDUE: { label: "Overdue", className: "bg-red-100 text-red-700" },
  ACCEPTED: { label: "Accepted", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700" },
  CONVERTED: { label: "Converted", className: "bg-purple-100 text-purple-700" },
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
