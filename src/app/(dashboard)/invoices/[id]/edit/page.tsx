import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import InvoiceForm from "@/components/InvoiceForm";
import { IconChevronRight } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [invoice, customers] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id: params.id },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.customer.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  if (!invoice) notFound();

  const isAdmin = (session.user as any).role === "ADMIN";
  const userId = (session.user as any).id;
  if (!isAdmin && invoice.createdById !== userId) {
    notFound();
  }

  const initial = {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    customerId: invoice.customerId,
    invoiceDate: invoice.invoiceDate.toISOString(),
    dueDate: invoice.dueDate?.toISOString() || null,
    currency: invoice.currency as "USD" | "PKR" | "EUR",
    foreignCurrency: (invoice as any).foreignCurrency || "USD",
    exchangeRate: invoice.exchangeRate ? Number(invoice.exchangeRate) : null,
    status: invoice.status,

    // freight parties & routing
    shipper: (invoice as any).shipper || "",
    consignee: (invoice as any).consignee || "",
    originPort: invoice.originPort,
    destinationPort: invoice.destinationPort,
    shipmentMode: invoice.shipmentMode || "Air",

    // air freight docs
    masterAwb: (invoice as any).masterAwb || "",
    houseAwb: (invoice as any).houseAwb || "",

    // sea freight docs
    hblNo: (invoice as any).hblNo || "",
    mblNo: (invoice as any).mblNo || "",
    containerNo: invoice.containerNo,
    vesselName: (invoice as any).vesselName || "",

    // cargo specs
    packages: (invoice as any).packages || "",
    chargeableWeight: (invoice as any).chargeableWeight || "",
    grossWeight: (invoice as any).grossWeight || "",
    cbm: (invoice as any).cbm || "",
    trackingNo: invoice.trackingNo,
    weight: invoice.weight,
    shippingDate: invoice.shippingDate?.toISOString() || null,

    discount: Number(invoice.discount),
    taxPercent: Number(invoice.taxPercent),
    amountPaid: Number(invoice.amountPaid),
    notes: invoice.notes,
    terms: invoice.terms,
    items: invoice.items.map((i: any) => ({
      id: i.id,
      description: i.description,
      rate: i.rate !== null && i.rate !== undefined ? Number(i.rate) : undefined,
      foreignAmount: i.foreignAmount !== null && i.foreignAmount !== undefined ? Number(i.foreignAmount) : undefined,
      quantity: Number(i.quantity) || 1,
      unitPrice: Number(i.unitPrice) || 0,
      amount: Number(i.amount) || 0,
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
