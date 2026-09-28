import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import InvoiceForm from "@/components/InvoiceForm";
import { IconChevronRight } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  const [invoice, customers] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id: params.id },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.customer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, company: true, email: true, city: true, country: true } }),
  ]);

  if (!invoice) notFound();

  const initial = {
    id: invoice.id,
    customerId: invoice.customerId,
    invoiceDate: invoice.invoiceDate.toISOString(),
    dueDate: invoice.dueDate?.toISOString() || null,
    currency: invoice.currency as "USD" | "PKR",
    exchangeRate: invoice.exchangeRate ? Number(invoice.exchangeRate) : null,
    status: invoice.status,
    originPort: invoice.originPort,
    destinationPort: invoice.destinationPort,
    shipmentMode: invoice.shipmentMode,
    containerNo: invoice.containerNo,
    trackingNo: invoice.trackingNo,
    weight: invoice.weight,
    shippingDate: invoice.shippingDate?.toISOString() || null,
    discount: Number(invoice.discount),
    taxPercent: Number(invoice.taxPercent),
    amountPaid: Number(invoice.amountPaid),
    notes: invoice.notes,
    terms: invoice.terms,
    items: invoice.items.map((i) => ({
      id: i.id,
      description: i.description,
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice),
    })),
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="crumbs">
            <Link href="/invoices">Invoices</Link>
            <IconChevronRight size={13} />
            <Link href={`/invoices/${invoice.id}`}>{invoice.invoiceNumber}</Link>
            <IconChevronRight size={13} />
            <span>Edit</span>
          </div>
          <h1 className="page-title">Edit invoice</h1>
          <p className="page-subtitle mono">{invoice.invoiceNumber}</p>
        </div>
      </div>
      <InvoiceForm customers={customers} initial={initial} />
    </div>
  );
}
