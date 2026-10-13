import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import InvoiceActions from "@/components/InvoiceActions";
import InvoiceView from "@/components/InvoiceView";
import { StatusBadge } from "@/components/ui";
import { IconChevronRight } from "@/components/Icons";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { items: { orderBy: { sortOrder: "asc" } }, customer: true },
  });
  if (!invoice) notFound();

  const isAdmin = (session.user as any).role === "ADMIN";
  const userId = (session.user as any).id;
  if (!isAdmin && invoice.createdById !== userId) {
    notFound();
  }

  const company = await prisma.companySettings.findFirst();

  const cur = invoice.currency as "USD" | "PKR" | "EUR";
  const total = Number(invoice.total);
  const paid = Number(invoice.amountPaid);
  const balance = Math.max(total - paid, 0);
  const paidPct = total > 0 ? Math.min((paid / total) * 100, 100) : 0;
  const daysToDue = invoice.dueDate
    ? Math.ceil((new Date(invoice.dueDate).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div>
      <div className="topbar no-print">
        <div>
          <div className="crumbs">
            <Link href="/invoices">Invoices</Link>
            <IconChevronRight size={13} />
            <span className="mono">{invoice.invoiceNumber}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 className="page-title mono" style={{ fontSize: 22 }}>{invoice.invoiceNumber}</h1>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="page-subtitle">
            Billed to{" "}
            <Link href={`/customers/${invoice.customerId}`} className="link">
              {invoice.customer.company || invoice.customer.name}
            </Link>{" "}
            on {formatDate(invoice.invoiceDate)}
          </p>
        </div>
        <InvoiceActions invoiceId={invoice.id} status={invoice.status} />
      </div>

      <div className="grid-3 no-print" style={{ marginBottom: 20, maxWidth: 900, marginInline: "auto" }}>
        <div className="card stat-card">
          <div className="stat-label">Invoice total</div>
          <div className="stat-value" style={{ fontSize: 21 }}>{formatCurrency(total, cur)}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Paid</div>
          <div className="stat-value" style={{ fontSize: 21, color: "var(--success)" }}>{formatCurrency(paid, cur)}</div>
          <div className="bar" style={{ height: 5, marginTop: 10 }}>
            <span style={{ width: `${paidPct}%`, background: "var(--success)" }} />
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Balance due</div>
          <div className="stat-value" style={{ fontSize: 21 }}>{formatCurrency(balance, cur)}</div>
          <div className="stat-foot">
            {invoice.status === "PAID" || balance === 0
              ? "Settled"
              : daysToDue === null
              ? "No due date set"
              : daysToDue < 0
              ? <b style={{ color: "var(--danger)" }}>{-daysToDue} days overdue</b>
              : daysToDue === 0
              ? <b style={{ color: "var(--warn)" }}>Due today</b>
              : `Due in ${daysToDue} days`}
          </div>
        </div>
      </div>

      <InvoiceView invoice={JSON.parse(JSON.stringify(invoice))} company={JSON.parse(JSON.stringify(company))} />
    </div>
  );
}
