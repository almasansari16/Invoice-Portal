import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  formatCompact,
  formatCurrency,
  formatDate,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/utils";
import Link from "next/link";
import { Avatar, EmptyState, StatusBadge } from "@/components/ui";
import {
  IconAlert,
  IconArrowRight,
  IconCheckCircle,
  IconClock,
  IconInvoice,
  IconPlus,
  IconTrend,
  IconUsers,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

type Cur = "USD" | "PKR";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { cur?: string };
}) {
  const session = await getServerSession(authOptions);
  const settings = await prisma.companySettings.findFirst();
  const cur: Cur =
    searchParams.cur === "USD" || searchParams.cur === "PKR"
      ? searchParams.cur
      : ((settings?.defaultCurrency as Cur) || "PKR");

  const now = new Date();
  const chartStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [totalCustomers, byStatus, recentInvoices, periodInvoices, topGroups] = await Promise.all([
    prisma.customer.count(),
    prisma.invoice.groupBy({
      by: ["status"],
      where: { currency: cur },
      _sum: { total: true, amountPaid: true },
      _count: { _all: true },
    }),
    prisma.invoice.findMany({
      orderBy: [{ invoiceDate: "desc" }, { createdAt: "desc" }],
      take: 6,
      include: { customer: { select: { name: true, company: true } } },
    }),
    prisma.invoice.findMany({
      where: { currency: cur, invoiceDate: { gte: chartStart }, status: { not: "CANCELLED" } },
      select: { invoiceDate: true, total: true, amountPaid: true },
    }),
    prisma.invoice.groupBy({
      by: ["customerId"],
      where: { currency: cur, status: { not: "CANCELLED" } },
      _sum: { total: true },
      _count: { _all: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
  ]);

  const topCustomers = await prisma.customer.findMany({
    where: { id: { in: topGroups.map((g) => g.customerId) } },
    select: { id: true, name: true, company: true },
  });

  // ---- KPIs
  const stat = (s: string) => byStatus.find((b) => b.status === s);
  const sum = (s: string, k: "total" | "amountPaid") => Number(stat(s)?._sum[k] || 0);
  const count = (s: string) => stat(s)?._count._all || 0;

  const activeStatuses = ["DRAFT", "SENT", "PAID", "OVERDUE"];
  const totalBilled = ["SENT", "PAID", "OVERDUE"].reduce((a, s) => a + sum(s, "total"), 0);
  const collected = ["SENT", "PAID", "OVERDUE"].reduce((a, s) => a + sum(s, "amountPaid"), 0);
  const outstanding =
    sum("SENT", "total") + sum("OVERDUE", "total") - sum("SENT", "amountPaid") - sum("OVERDUE", "amountPaid");
  const overdueAmount = sum("OVERDUE", "total") - sum("OVERDUE", "amountPaid");
  const totalCount = byStatus.reduce((a, b) => a + b._count._all, 0);
  const collectionRate = totalBilled > 0 ? Math.round((collected / totalBilled) * 100) : 0;

  // ---- chart: last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString("en-US", { month: "short" }), billed: 0, paid: 0 };
  });
  for (const inv of periodInvoices) {
    const d = new Date(inv.invoiceDate);
    const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (m) {
      m.billed += Number(inv.total);
      m.paid += Number(inv.amountPaid);
    }
  }
  const maxBilled = Math.max(...months.map((m) => m.billed), 1);
  const periodBilled = months.reduce((a, m) => a + m.billed, 0);

  const firstName = (session?.user?.name || "there").split(" ")[0];
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">
            {greeting}, {firstName}
          </h1>
          <p className="page-subtitle">
            Here&apos;s what&apos;s happening with your invoicing today ·{" "}
            {now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="actions">
          <div className="segmented">
            {(["PKR", "USD"] as const).map((c) => (
              <Link key={c} href={`/dashboard?cur=${c}`} className={cur === c ? "on" : ""}>
                {c}
              </Link>
            ))}
          </div>
          <Link href="/invoices/new" className="btn btn-primary">
            <IconPlus size={16} /> New Invoice
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <Kpi
          label="Total Billed"
          value={formatCurrency(totalBilled, cur)}
          foot={<><b>{totalCount}</b> invoices in {cur}</>}
          icon={<IconTrend size={18} />}
          tone={["#eef2ff", "#3b5bdb"]}
        />
        <Kpi
          label="Collected"
          value={formatCurrency(collected, cur)}
          foot={<><b style={{ color: "var(--success)" }}>{collectionRate}%</b> collection rate</>}
          icon={<IconCheckCircle size={18} />}
          tone={["#ecfdf5", "#059669"]}
        />
        <Kpi
          label="Outstanding"
          value={formatCurrency(outstanding, cur)}
          foot={<><b>{count("SENT") + count("OVERDUE")}</b> awaiting payment</>}
          icon={<IconClock size={18} />}
          tone={["#fffbeb", "#d97706"]}
        />
        <Kpi
          label="Overdue"
          value={formatCurrency(overdueAmount, cur)}
          foot={
            count("OVERDUE") > 0 ? (
              <Link href="/invoices?status=OVERDUE" className="link">
                Review {count("OVERDUE")} overdue →
              </Link>
            ) : (
              "Nothing overdue 🎉"
            )
          }
          icon={<IconAlert size={18} />}
          tone={["#fef2f2", "#dc2626"]}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.75fr) minmax(0, 1fr)", gap: 20, marginBottom: 20 }} className="dash-grid">
        {/* chart */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Revenue overview</h3>
              <p>
                {formatCurrency(periodBilled, cur)} billed in the last 6 months
              </p>
            </div>
            <div className="legend">
              <span><i style={{ background: "#dbe3ff" }} />Billed</span>
              <span><i style={{ background: "var(--brand)" }} />Collected</span>
            </div>
          </div>
          <div className="card-pad">
            <div className="chart">
              {months.map((m) => {
                const h = (m.billed / maxBilled) * 100;
                const paidShare = m.billed > 0 ? Math.min(m.paid / m.billed, 1) * 100 : 0;
                return (
                  <div className="col" key={m.key}>
                    <div className="stack">
                      <div className="seg-billed" style={{ height: `${Math.max(h, 1.5)}%` }}>
                        <span className="tip">
                          {formatCompact(m.billed, cur)} billed · {formatCompact(m.paid, cur)} paid
                        </span>
                        <div className="seg-paid" style={{ height: `${paidShare}%` }} />
                      </div>
                    </div>
                    <div className="x">{m.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* status breakdown */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Invoice status</h3>
              <p>{totalCount} invoices · {cur}</p>
            </div>
          </div>
          <div className="card-pad">
            <div className="bar" style={{ height: 10, marginBottom: 18 }}>
              {activeStatuses.concat("CANCELLED").map((s) =>
                count(s) > 0 ? (
                  <span key={s} style={{ width: `${(count(s) / Math.max(totalCount, 1)) * 100}%`, background: STATUS_COLORS[s] }} />
                ) : null
              )}
            </div>
            {activeStatuses.concat("CANCELLED").map((s) => (
              <Link
                href={`/invoices?status=${s}&currency=${cur}`}
                key={s}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line-soft)" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: STATUS_COLORS[s] }} />
                  {STATUS_LABELS[s]}
                  <span className="muted" style={{ fontSize: 12 }}>{count(s)}</span>
                </span>
                <span className="num" style={{ fontWeight: 600, fontSize: 13 }}>
                  {formatCompact(sum(s, "total"), cur)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.75fr) minmax(0, 1fr)", gap: 20 }} className="dash-grid">
        {/* recent invoices */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Recent invoices</h3>
              <p>Latest activity across all currencies</p>
            </div>
            <Link href="/invoices" className="btn btn-ghost btn-sm">
              View all <IconArrowRight size={14} />
            </Link>
          </div>
          {recentInvoices.length === 0 ? (
            <EmptyState icon={<IconInvoice size={22} />} title="No invoices yet">
              <p style={{ marginBottom: 14 }}>Create your first invoice to see it here.</p>
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
                    <th>Date</th>
                    <th className="right">Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <Link href={`/invoices/${inv.id}`} className="link mono">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td>
                        <div className="cell-person">
                          <Avatar name={inv.customer?.name || "?"} size="sm" />
                          <div>
                            <b>{inv.customer?.name}</b>
                            {inv.customer?.company && <div className="sub">{inv.customer.company}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="muted">{formatDate(inv.invoiceDate)}</td>
                      <td className="right num" style={{ fontWeight: 600 }}>
                        {formatCurrency(inv.total as any, inv.currency as any)}
                      </td>
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

        {/* top customers */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Top customers</h3>
              <p>By amount billed in {cur}</p>
            </div>
            <span className="tag">
              <IconUsers size={12} style={{ marginRight: 4 }} />
              {totalCustomers}
            </span>
          </div>
          <div className="card-pad" style={{ paddingTop: 8 }}>
            {topGroups.length === 0 && <p className="muted" style={{ padding: "20px 0" }}>No billing data yet.</p>}
            {topGroups.map((g) => {
              const c = topCustomers.find((x) => x.id === g.customerId);
              const amt = Number(g._sum.total || 0);
              const max = Number(topGroups[0]._sum.total || 1);
              return (
                <Link key={g.customerId} href={`/customers/${g.customerId}`} style={{ display: "block", padding: "10px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                    <Avatar name={c?.name || "?"} size="sm" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {c?.company || c?.name}
                      </div>
                      <div className="muted" style={{ fontSize: 12 }}>{g._count._all} invoices</div>
                    </div>
                    <div className="num" style={{ fontWeight: 600, fontSize: 13 }}>{formatCompact(amt, cur)}</div>
                  </div>
                  <div className="bar" style={{ height: 5 }}>
                    <span style={{ width: `${(amt / max) * 100}%`, background: "var(--brand)", borderRadius: 100 }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  foot,
  icon,
  tone,
}: {
  label: string;
  value: string;
  foot: React.ReactNode;
  icon: React.ReactNode;
  tone: [string, string];
}) {
  return (
    <div className="card stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className="stat-icon" style={{ background: tone[0], color: tone[1] }}>
          {icon}
        </span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">{foot}</div>
    </div>
  );
}
