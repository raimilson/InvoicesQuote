"use client";

import { Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";

export interface LineItem {
  item_number: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export default function LineItemsEditor({
  items,
  onChange,
}: {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}) {
  const update = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const next = { ...item, [field]: value };
      if (field === "quantity" || field === "rate") {
        next.amount = Number(next.quantity) * Number(next.rate);
      }
      return next;
    });
    onChange(updated);
  };

  const addRow = () =>
    onChange([
      ...items,
      { item_number: items.length + 1, description: "", quantity: 1, rate: 0, amount: 0 },
    ]);

  const remove = (index: number) =>
    onChange(
      items
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, item_number: i + 1 }))
    );

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#2AABE2] text-white">
              <th className="px-3 py-2 text-left w-8 font-semibold">#</th>
              <th className="px-3 py-2 text-left font-semibold">Item &amp; Description</th>
              <th className="px-3 py-2 text-right w-20 font-semibold">Qty</th>
              <th className="px-3 py-2 text-right w-28 font-semibold">Rate</th>
              <th className="px-3 py-2 text-right w-28 font-semibold">Amount</th>
              <th className="px-3 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-3 py-2 text-gray-400 text-sm">{item.item_number}</td>
                <td className="px-1 py-1">
                  <input
                    className="w-full border-0 border-b border-gray-200 focus:border-[#2AABE2] outline-none px-1 py-1 text-sm"
                    value={item.description}
                    onChange={(e) => update(i, "description", e.target.value)}
                    placeholder="Item name / description..."
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    type="number"
                    className="w-full border-0 border-b border-gray-200 focus:border-[#2AABE2] outline-none px-1 py-1 text-sm text-right"
                    value={item.quantity}
                    onChange={(e) => update(i, "quantity", parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    type="number"
                    className="w-full border-0 border-b border-gray-200 focus:border-[#2AABE2] outline-none px-1 py-1 text-sm text-right"
                    value={item.rate}
                    onChange={(e) => update(i, "rate", parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium text-sm">
                  {item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-1 py-1">
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={addRow}>
        <Plus className="h-4 w-4" /> Add Line Item
      </Button>
    </div>
  );
}
