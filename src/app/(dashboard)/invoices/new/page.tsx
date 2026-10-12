import { prisma } from "@/lib/prisma";
import Link from "next/link";
import InvoiceForm from "@/components/InvoiceForm";
import { IconChevronRight } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: { customerId?: string };
}) {
  const [customers, settings] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.companySettings.findFirst({ select: { defaultCurrency: true } }),
  ]);

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="crumbs">
            <Link href="/invoices">Invoices</Link>
            <IconChevronRight size={13} />
            <span>New</span>
          </div>
          <h1 className="page-title">New invoice</h1>
          <p className="page-subtitle">Fill in the details below — totals update as you type.</p>
        </div>
      </div>
      <InvoiceForm
        customers={customers}
        initial={{ customerId: searchParams.customerId }}
        defaultCurrency={(settings?.defaultCurrency as "USD" | "PKR" | "EUR") || "PKR"}
      />
    </div>
  );
}
