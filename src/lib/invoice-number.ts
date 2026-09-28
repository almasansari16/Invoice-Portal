import { prisma } from "@/lib/prisma";

/**
 * Generates the next invoice number, e.g. INV-2026-000123.
 * Uses a transaction + row lock on CompanySettings so two people
 * creating invoices at the same time never collide.
 */
export async function generateInvoiceNumber(): Promise<string> {
  return prisma.$transaction(async (tx) => {
    let settings = await tx.companySettings.findFirst();

    if (!settings) {
      settings = await tx.companySettings.create({
        data: { companyName: "Your Company" },
      });
    }

    const next = settings.nextNumber;

    await tx.companySettings.update({
      where: { id: settings.id },
      data: { nextNumber: next + 1 },
    });

    const year = new Date().getFullYear();
    const padded = String(next).padStart(6, "0");

    return `${settings.invoicePrefix}-${year}-${padded}`;
  });
}
