import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Avatar, EmptyState } from "@/components/ui";
import { IconMail, IconMapPin, IconPhone, IconPlus, IconSearch, IconUsers } from "@/components/Icons";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim();

  const customers = await prisma.customer.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { company: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { taxNumber: { contains: q, mode: "insensitive" } },
            { strn: { contains: q, mode: "insensitive" } },
            { cnic: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { name: "asc" },
    include: {
      _count: { select: { invoices: true } },
      invoices: { select: { invoiceDate: true }, orderBy: { invoiceDate: "desc" }, take: 1 },
    },
  });

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">
            {customers.length} {q ? "matching" : "total"} customer{customers.length === 1 ? "" : "s"} and agents
          </p>
        </div>
        <Link href="/customers/new" className="btn btn-primary">
          <IconPlus size={16} /> Add customer
        </Link>
      </div>

      <div className="card">
        <form method="GET" className="card-head" style={{ justifyContent: "flex-start" }}>
          <div className="input-group" style={{ flex: "1 1 280px", maxWidth: 480 }}>
            <span className="adorn"><IconSearch size={16} /></span>
            <input className="input" type="text" name="q" defaultValue={q} placeholder="Search by name, company, email or phone…" />
          </div>
          <button className="btn btn-secondary">Search</button>
          {q && <Link href="/customers" className="btn btn-ghost">Clear</Link>}
        </form>

        {customers.length === 0 ? (
          <EmptyState icon={<IconUsers size={22} />} title={q ? "No matching customers" : "No customers yet"}>
            <p style={{ marginBottom: 14 }}>{q ? "Try a different search." : "Add your first customer to start invoicing."}</p>
            <Link href="/customers/new" className="btn btn-primary btn-sm">
              <IconPlus size={14} /> Add customer
            </Link>
          </EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Location</th>
                  <th className="right">Invoices</th>
                  <th>Last invoice</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/customers/${c.id}`} className="cell-person">
                        <Avatar name={c.company || c.name} />
                        <div>
                          <b>{c.company || c.name}</b>
                          <div className="sub">
                            {[c.company ? c.name : c.customerType || "Individual", c.taxNumber ? `NTN: ${c.taxNumber}` : null]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td>
                      {c.email && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                          <IconMail size={13} style={{ color: "var(--subtle)" }} /> {c.email}
                        </div>
                      )}
                      {c.phone && (
                        <div className="sub" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <IconPhone size={12} style={{ color: "var(--subtle)" }} /> {c.phone}
                        </div>
                      )}
                      {!c.email && !c.phone && <span className="muted">—</span>}
                    </td>
                    <td>
                      {c.city || c.country ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <IconMapPin size={13} style={{ color: "var(--subtle)" }} />
                          {[c.city, c.country].filter(Boolean).join(", ")}
                        </span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td className="right num" style={{ fontWeight: 600 }}>{c._count.invoices}</td>
                    <td className="muted">{c.invoices[0] ? formatDate(c.invoices[0].invoiceDate) : "—"}</td>
                    <td className="right">
                      <Link href={`/invoices/new?customerId=${c.id}`} className="btn btn-ghost btn-sm">
                        <IconPlus size={13} /> Invoice
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
