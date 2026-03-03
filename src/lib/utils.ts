import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number | string, currency = "USD"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateForInput(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

export function isOverdue(dueDate: Date | string, status: string): boolean {
  if (status === "PAID" || status === "DRAFT") return false;
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  return due < new Date();
}

export function getNextInvoiceNumber(current: string): string {
  const num = parseInt(current, 10);
  return isNaN(num) ? "1266" : String(num + 1);
}

export function getNextQuoteNumber(current: string): string {
  const num = parseInt(current.replace("Q-", ""), 10);
  return isNaN(num) ? "Q-1001" : `Q-${num + 1}`;
}
