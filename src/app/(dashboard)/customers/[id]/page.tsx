import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, EmptyState, StatusBadge } from "@/components/ui";
import {
  IconBuilding,
  IconChevronRight,
  IconEdit,
  IconFileText,
  IconInvoice,
  IconMail,
  IconMapPin,
  IconPhone,
  IconPlus,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      invoices: {
        orderBy: { invoiceDate: "desc" },
      },
    },
  });

  if (!customer) notFound();

  // totals are kept per currency so PKR and USD are never mixed
  const byCurrency = (["PKR", "USD"] as const)
    .map((cur) => {
      const list = customer.invoices.filter((i) => i.currency === cur && i.status !== "CANCELLED");
      const billed = list.reduce((s, i) => s + Number(i.total), 0);
      const paid = list.reduce((s, i) => s + Number(i.amountPaid), 0);
      return { cur, count: list.length, billed, paid, outstanding: billed - paid };
    })
    .filter((x) => x.count > 0);

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="crumbs">
            <Link href="/customers">Customers</Link>
            <IconChevronRight size={13} />
            <span>{customer.company || customer.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar name={customer.company || customer.name} size="lg" />
            <div>
              <h1 className="page-title">{customer.company || customer.name}</h1>
              <p className="page-subtitle">
                {customer.company ? customer.name : "Individual customer"} · Customer since {formatDate(customer.createdAt)}
              </p>
            </div>
          </div>
        </div>
        <div className="actions">
          <Link href={`/customers/${customer.id}/edit`} className="btn btn-secondary">
            <IconEdit size={15} /> Edit
          </Link>
          <Link href={`/invoices/new?customerId=${customer.id}`} className="btn btn-primary">
            <IconPlus size={16} /> New invoice
          </Link>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="card stat-card">
          <div className="stat-label">Invoices</div>
          <div className="stat-value">{customer.invoices.length}</div>
          <div className="stat-foot">
            Last: {customer.invoices[0] ? formatDate(customer.invoices[0].invoiceDate) : "never"}
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Total billed</div>
          {byCurrency.length === 0 && <div className="stat-value">—</div>}
          {byCurrency.map((x) => (
            <div key={x.cur} className="stat-value" style={{ fontSize: byCurrency.length > 1 ? 19 : 25, marginTop: byCurrency.length > 1 ? 6 : 10 }}>
              {formatCurrency(x.billed, x.cur)}
            </div>
          ))}
        </div>
        <div className="card stat-card">
          <div className="stat-label">Outstanding</div>
          {byCurrency.length === 0 && <div className="stat-value">—</div>}
          {byCurrency.map((x) => (
            <div
              key={x.cur}
              className="stat-value"
              style={{ fontSize: byCurrency.length > 1 ? 19 : 25, marginTop: byCurrency.length > 1 ? 6 : 10, color: x.outstanding > 0 ? "var(--warn)" : "var(--success)" }}
            >
              {formatCurrency(x.outstanding, x.cur)}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px minmax(0, 1fr)", gap: 20, alignItems: "start" }} className="dash-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Tax & Legal Profile */}
          <div className="card card-pad">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 14.5, margin: 0 }}>Tax &amp; Legal Info</h3>
              {customer.customerType && (
                <span className="badge" style={{ background: "var(--brand-soft)", color: "var(--brand)", fontSize: 11 }}>
                  {customer.customerType}
                </span>
              )}
            </div>
            <DetailRow icon={<IconBuilding size={15} />} label="NTN (Tax No)" value={customer.taxNumber} highlight />
            <DetailRow icon={<IconFileText size={15} />} label="STRN (Sales Tax)" value={customer.strn} />
            <DetailRow icon={<IconBuilding size={15} />} label="CNIC No" value={customer.cnic} />
          </div>

          {/* Contact Details */}
          <div className="card card-pad">
            <h3 style={{ fontSize: 14.5, marginBottom: 14 }}>Contact Details</h3>
            <DetailRow icon={<IconMail size={15} />} label="Email" value={customer.email} />
            <DetailRow icon={<IconPhone size={15} />} label="Phone / WhatsApp" value={customer.phone} />
            <DetailRow
              icon={<IconMapPin size={15} />}
              label="Billing Address"
              value={[
                customer.address,
                [customer.city, customer.state, customer.postalCode].filter(Boolean).join(", "),
                customer.country,
              ]
                .filter(Boolean)
                .join("\n")}
            />
            {customer.shippingAddress && (
              <DetailRow
                icon={<IconMapPin size={15} />}
                label="Shipping / Delivery Address"
                value={customer.shippingAddress}
              />
            )}
          </div>

          {/* Invoicing Preferences */}
          <div className="card card-pad">
            <h3 style={{ fontSize: 14.5, marginBottom: 14 }}>Invoicing Preferences</h3>
            <DetailRow icon={<IconBuilding size={15} />} label="Default Payment Terms" value={customer.defaultPaymentTerms || "Net 30"} />
            <DetailRow icon={<IconBuilding size={15} />} label="Preferred Currency" value={customer.preferredCurrency || "PKR"} />
            {customer.notes && <DetailRow icon={<IconFileText size={15} />} label="Internal Notes" value={customer.notes} />}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h3>Invoice history</h3>
              <p>{customer.invoices.length} invoices</p>
            </div>
          </div>
          {customer.invoices.length === 0 ? (
            <EmptyState icon={<IconInvoice size={22} />} title="No invoices yet">
              <p style={{ marginBottom: 14 }}>Create the first invoice for this customer.</p>
              <Link href={`/invoices/new?customerId=${customer.id}`} className="btn btn-primary btn-sm">
                <IconPlus size={14} /> New invoice
              </Link>
            </EmptyState>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Date</th>
                    <th>Route</th>
                    <th className="right">Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <Link href={`/invoices/${inv.id}`} className="link mono">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="muted">{formatDate(inv.invoiceDate)}</td>
                      <td style={{ fontSize: 13 }}>
                        {inv.originPort || inv.destinationPort ? `${inv.originPort || "—"} → ${inv.destinationPort || "—"}` : <span className="muted">—</span>}
                      </td>
                      <td className="right num" style={{ fontWeight: 600 }}>{formatCurrency(inv.total as any, inv.currency as any)}</td>
                      <td>
                        <StatusBadge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  highlight?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: highlight ? "var(--brand-soft)" : "var(--paper-sunken)",
          color: highlight ? "var(--brand)" : "var(--muted)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>{label}</div>
        <div
          style={{
            fontSize: 13.5,
            whiteSpace: "pre-line",
            wordBreak: "break-word",
            fontWeight: highlight && value ? 600 : 400,
            color: highlight && value ? "var(--ink)" : undefined,
          }}
        >
          {value || <span style={{ color: "var(--muted)" }}>—</span>}
        </div>
      </div>
    </div>
  );
}
