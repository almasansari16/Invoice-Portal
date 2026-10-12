export function formatCurrency(amount: number | string, currency: "USD" | "PKR") {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  const symbol = currency === "USD" ? "$" : "Rs";
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
  return `${symbol} ${formatted}`;
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export type InvoiceItemInput = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export function calculateTotals(
  items: InvoiceItemInput[],
  discount: number,
  taxPercent: number
) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const afterDiscount = Math.max(subtotal - (discount || 0), 0);
  const taxAmount = (afterDiscount * (taxPercent || 0)) / 100;
  const total = afterDiscount + taxAmount;

  return {
    subtotal: round2(subtotal),
    taxAmount: round2(taxAmount),
    total: round2(total),
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
};

export const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#64748b",
  SENT: "#2563eb",
  PAID: "#059669",
  OVERDUE: "#dc2626",
  CANCELLED: "#94a3b8",
};

// soft background + strong foreground pairs for status pills
export const STATUS_TONES: Record<string, { bg: string; fg: string }> = {
  DRAFT: { bg: "#f1f5f9", fg: "#475569" },
  SENT: { bg: "#eff6ff", fg: "#1d4ed8" },
  PAID: { bg: "#ecfdf5", fg: "#047857" },
  OVERDUE: { bg: "#fef2f2", fg: "#b91c1c" },
  CANCELLED: { bg: "#f8fafc", fg: "#94a3b8" },
};

export function formatCompact(amount: number, currency: "USD" | "PKR") {
  const symbol = currency === "USD" ? "$" : "Rs";
  const formatted = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount || 0);
  return `${symbol} ${formatted}`;
}

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function convertLessThanThousand(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ONES[n] + " ";
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ONES[n % 10] : "") + " ";
  return ONES[Math.floor(n / 100)] + " Hundred " + (n % 100 !== 0 ? convertLessThanThousand(n % 100) : "");
}

export function numberToWordsRupees(amount: number | string): string {
  const val = Math.round(Number(amount) || 0);
  if (val === 0) return "Rupees Zero Only.";

  let n = Math.abs(val);
  let res = "";

  const billions = Math.floor(n / 1000000000);
  n %= 1000000000;
  if (billions > 0) res += convertLessThanThousand(billions).trim() + " Billion ";

  const millions = Math.floor(n / 1000000);
  n %= 1000000;
  if (millions > 0) res += convertLessThanThousand(millions).trim() + " Million ";

  const thousands = Math.floor(n / 1000);
  n %= 1000;
  if (thousands > 0) res += convertLessThanThousand(thousands).trim() + " Thousand ";

  if (n > 0) res += convertLessThanThousand(n).trim() + " ";

  return `Rupees ${res.trim().replace(/\s+/g, " ")} Only.`;
}

