import { prisma } from "@/lib/prisma";

export function getPrefixForMode(mode?: string | null): { prefix: string; startNumber: number } {
  const m = (mode || "Air").toLowerCase().trim();
  if (m.includes("sea") || m.includes("ocean") || m.includes("ship")) {
    return { prefix: "SF-", startNumber: 7860259 };
  }
  if (m.includes("road") || m.includes("land") || m.includes("truck")) {
    return { prefix: "RF-", startNumber: 7860001 };
  }
  // Default Air Freight
  return { prefix: "AF-", startNumber: 7860256 };
}

/**
 * Generates the next invoice / bill number based on transport mode (Air: AF-xxxxxxx, Sea: SF-xxxxxxx, Road: RF-xxxxxxx).
 * Looks up existing invoices with this prefix, finds the highest sequential number, and increments it by 1.
 */
export async function generateInvoiceNumber(mode?: string | null): Promise<string> {
  const { prefix, startNumber } = getPrefixForMode(mode);

  const existingInvoices = await prisma.invoice.findMany({
    where: {
      invoiceNumber: {
        startsWith: prefix,
      },
    },
    select: { invoiceNumber: true },
  });

  let maxNum = startNumber - 1;

  for (const inv of existingInvoices) {
    const rawSuffix = inv.invoiceNumber.slice(prefix.length).trim();
    const match = rawSuffix.match(/^(\d+)/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    }
  }

  let nextCandidate = maxNum + 1;
  let candidateStr = `${prefix}${nextCandidate}`;

  while (await prisma.invoice.findUnique({ where: { invoiceNumber: candidateStr } })) {
    nextCandidate++;
    candidateStr = `${prefix}${nextCandidate}`;
  }

  return candidateStr;
}
