import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, STATUS_LABELS } from "@/lib/utils";
import Link from "next/link";
import { Avatar, EmptyState, StatusBadge } from "@/components/ui";
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconFilter,
  IconInvoice,
  IconPlane,
  IconPlus,
  IconSearch,
  IconShip,
  IconTruck,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; currency?: string; from?: string; to?: string; page?: string; pageSize?: string };
}) {
  const { q, status, currency, from, to } = searchParams;
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.pageSize || "25", 10) || 25));

  // filters shared by the list and the status tab counts (status itself excluded)
  const base: any[] = [];
  if (q) {
    base.push({
      OR: [
        { invoiceNumber: { contains: q, mode: "insensitive" } },
        { customer: { name: { contains: q, mode: "insensitive" } } },
        { customer: { company: { contains: q, mode: "insensitive" } } },
        { trackingNo: { contains: q, mode: "insensitive" } },
        { containerNo: { contains: q, mode: "insensitive" } },
        { masterAwb: { contains: q, mode: "insensitive" } },
        { houseAwb: { contains: q, mode: "insensitive" } },
        { hblNo: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (currency) base.push({ currency });
  if (from || to) {
    base.push({
      invoiceDate: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    });
  }

  const where: any = { AND: status ? [...base, { status }] : base };
  if (where.AND.length === 0) delete where.AND;

  const [invoices, totalCount, statusCounts] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: [{ invoiceDate: "desc" }, { createdAt: "desc" }],
      include: { customer: { select: { name: true, company: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.invoice.count({ where }),
    prisma.invoice.groupBy({
      by: ["status"],
      where: base.length ? { AND: base } : {},
      _count: { _all: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const allCount = statusCounts.reduce((a, s) => a + s._count._all, 0);
  const countFor = (s: string) => statusCounts.find((x) => x.status === s)?._count._all || 0;

  const qs = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => v) as any
  ).toString();

  const tabHref = (s?: string) => {
    const p = new URLSearchParams(Object.entries(searchParams).filter(([k, v]) => v && k !== "status" && k !== "page") as any);
    if (s) p.set("status", s);
    const str = p.toString();
    return `/invoices${str ? `?${str}` : ""}`;
  };

  const pageHref = (p: number) => {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([k, v]) => v && k !== "page") as any
    );
    if (p > 1) params.set("page", String(p));
    const str = params.toString();
    return `/invoices${str ? `?${str}` : ""}`;
  };

  const hasFilters = Boolean(q || currency || from || to);
  const today = new Date();

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">Create, track and export all of your customer invoices.</p>
        </div>
        <div className="actions">
          <a className="btn btn-secondary" href={`/api/invoices/export?format=xlsx&${qs}`}>
            <IconDownload size={15} /> Excel
          </a>
          <a className="btn btn-secondary" href={`/api/invoices/export?format=csv&${qs}`}>
            <IconDownload size={15} /> CSV
          </a>
          <Link href="/invoices/new" className="btn btn-primary">
            <IconPlus size={16} /> New Invoice
          </Link>
        </div>
      </div>

      <div style={{ marginBottom: 14, overflowX: "auto" }}>
        <div className="segmented">
          <Link href={tabHref()} className={!status ? "on" : ""}>
            All <span className="count">{allCount}</span>
          </Link>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <Link key={k} href={tabHref(k)} className={status === k ? "on" : ""}>
              {v} <span className="count">{countFor(k)}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="card">
        <form method="GET" className="card-head" style={{ flexWrap: "wrap", justifyContent: "flex-start" }}>
          {status && <input type="hidden" name="status" value={status} />}
          <div className="input-group" style={{ flex: "1 1 260px" }}>
            <span className="adorn"><IconSearch size={16} /></span>
            <input className="input" name="q" defaultValue={q} placeholder="Search invoice #, customer, tracking or container…" />
          </div>
          <select className="input" name="currency" defaultValue={currency || ""} style={{ width: 140 }}>
            <option value="">All currencies</option>
            <option value="PKR">PKR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          <input className="input" type="date" name="from" defaultValue={from} style={{ width: 150 }} title="From date" />
          <input className="input" type="date" name="to" defaultValue={to} style={{ width: 150 }} title="To date" />
          <button className="btn btn-secondary">
            <IconFilter size={14} /> Apply
          </button>
          {hasFilters && (
            <Link href={tabHref(status)} className="btn btn-ghost" style={{ padding: "8px 6px" }}>
              Clear
            </Link>
          )}
        </form>

        {invoices.length === 0 ? (
          <EmptyState icon={<IconInvoice size={22} />} title={hasFilters || status ? "No matching invoices" : "No invoices yet"}>
            <p style={{ marginBottom: 14 }}>
              {hasFilters || status ? "Try adjusting your search or filters." : "Create your first invoice to get started."}
            </p>
            <Link href="/invoices/new" className="btn btn-primary btn-sm">
              <IconPlus size={14} /> New Invoice
            </Link>
          </EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Shipment</th>
                  <th>Issued</th>
                  <th>Due</th>
                  <th className="right">Total</th>
                  <th className="right">Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const balance = Number(inv.total) - Number(inv.amountPaid);
                  const late =
                    inv.dueDate && new Date(inv.dueDate) < today && ["SENT", "OVERDUE"].includes(inv.status);
                  return (
                    <tr key={inv.id}>
                      <td>
                        <Link href={`/invoices/${inv.id}`} className="link mono">
                          {inv.invoiceNumber}
                        </Link>
                        <div className="sub">
                          <span className="tag" style={{ fontSize: 10, padding: "0 5px" }}>{inv.currency}</span>
                        </div>
                      </td>
                      <td>
                        <div className="cell-person">
                          <Avatar name={inv.customer?.name || "?"} size="sm" />
                          <div style={{ minWidth: 0 }}>
                            <b>{inv.customer?.name}</b>
                            {inv.customer?.company && <div className="sub">{inv.customer.company}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        {inv.originPort || inv.destinationPort ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <ModeIcon mode={inv.shipmentMode} />
                            <div>
                              <div style={{ fontSize: 13 }}>
                                {inv.originPort || "—"} → {inv.destinationPort || "—"}
                              </div>
                              {inv.trackingNo && <div className="sub mono" style={{ fontSize: 11 }}>{inv.trackingNo}</div>}
                            </div>
                          </div>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td className="muted" style={{ whiteSpace: "nowrap" }}>{formatDate(inv.invoiceDate)}</td>
                      <td style={{ whiteSpace: "nowrap", color: late ? "var(--danger)" : "var(--muted)", fontWeight: late ? 600 : 400 }}>
                        {formatDate(inv.dueDate)}
                      </td>
                      <td className="right num" style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                        {formatCurrency(inv.total as any, inv.currency as any)}
                      </td>
                      <td className="right num" style={{ whiteSpace: "nowrap", color: balance > 0 && inv.status !== "CANCELLED" ? "var(--ink)" : "var(--subtle)" }}>
                        {inv.status === "CANCELLED" ? "—" : formatCurrency(balance, inv.currency as any)}
                      </td>
                      <td>
                        <StatusBadge status={inv.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {totalCount > 0 && (
          <div
            style={{
              padding: "14px 22px",
              borderTop: "1px solid var(--line-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              fontSize: 13,
            }}
          >
            <div className="muted">
              Showing{" "}
              <b style={{ color: "var(--ink)" }}>
                {Math.min((page - 1) * pageSize + 1, totalCount)}–
                {Math.min(page * pageSize, totalCount)}
              </b>{" "}
              of <b style={{ color: "var(--ink)" }}>{totalCount}</b> invoice{totalCount === 1 ? "" : "s"}
            </div>

            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {page > 1 ? (
                  <Link href={pageHref(page - 1)} className="btn btn-secondary btn-sm" style={{ padding: "6px 11px", display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <IconChevronLeft size={14} /> Previous
                  </Link>
                ) : (
                  <button disabled className="btn btn-secondary btn-sm" style={{ padding: "6px 11px", display: "inline-flex", alignItems: "center", gap: 5, opacity: 0.45, cursor: "not-allowed" }}>
                    <IconChevronLeft size={14} /> Previous
                  </button>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc: (number | string)[], p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                        acc.push(`dots-${p}`);
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item) => {
                      if (typeof item === "string") {
                        return (
                          <span key={item} style={{ padding: "0 5px", color: "var(--muted)", fontWeight: 700 }}>
                            …
                          </span>
                        );
                      }
                      const isCurrent = item === page;
                      return (
                        <Link
                          key={item}
                          href={pageHref(item)}
                          className={isCurrent ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
                          style={{
                            minWidth: 32,
                            height: 32,
                            padding: 0,
                            display: "grid",
                            placeItems: "center",
                            fontWeight: isCurrent ? 700 : 500,
                          }}
                        >
                          {item}
                        </Link>
                      );
                    })}
                </div>

                {page < totalPages ? (
                  <Link href={pageHref(page + 1)} className="btn btn-secondary btn-sm" style={{ padding: "6px 11px", display: "inline-flex", alignItems: "center", gap: 5 }}>
                    Next <IconChevronRight size={14} />
                  </Link>
                ) : (
                  <button disabled className="btn btn-secondary btn-sm" style={{ padding: "6px 11px", display: "inline-flex", alignItems: "center", gap: 5, opacity: 0.45, cursor: "not-allowed" }}>
                    Next <IconChevronRight size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ModeIcon({ mode }: { mode: string | null }) {
  const style = { width: 28, height: 28, borderRadius: 7, display: "grid", placeItems: "center", flexShrink: 0 } as const;
  if (mode === "Air") return <span style={{ ...style, background: "#f0f9ff", color: "#0369a1" }} title="Air"><IconPlane size={15} /></span>;
  if (mode === "Road") return <span style={{ ...style, background: "#fff7ed", color: "#c2410c" }} title="Road"><IconTruck size={15} /></span>;
  return <span style={{ ...style, background: "#eef2ff", color: "#3b5bdb" }} title={mode || "Sea"}><IconShip size={15} /></span>;
}
