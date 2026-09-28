import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui";

export default function InvoiceView({ invoice, company }: { invoice: any; company: any }) {
  const currency = invoice.currency;
  const balance = Number(invoice.total) - Number(invoice.amountPaid);
  const hasShipment =
    invoice.originPort || invoice.destinationPort || invoice.shipmentMode || invoice.containerNo || invoice.trackingNo || invoice.weight;

  return (
    <div className="card" style={{ maxWidth: 900, margin: "0 auto", overflow: "hidden" }}>
      <div className="doc-band" />
      <div className="doc">
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 380 }}>
            {company?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logoUrl} alt="Company logo" style={{ maxWidth: 150, maxHeight: 64, objectFit: "contain", marginBottom: 10 }} />
            ) : null}
            <h2 style={{ fontSize: 18 }}>{company?.companyName}</h2>
            <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.65, marginTop: 4, whiteSpace: "pre-line" }}>
              {company?.address}
              {company?.address && "\n"}
              {[company?.phone, company?.email, company?.website].filter(Boolean).join("  ·  ")}
              {company?.taxNumber && `\nNTN: ${company.taxNumber}`}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "0.12em", color: "var(--ink)" }}>INVOICE</div>
            <div className="mono" style={{ color: "var(--brand)", marginTop: 2, fontSize: 13.5 }}>{invoice.invoiceNumber}</div>
            <div style={{ marginTop: 10 }}>
              <StatusBadge status={invoice.status} />
            </div>
          </div>
        </div>

        {/* parties & meta */}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 24, marginTop: 32, padding: "20px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div>
            <div className="doc-label">Bill to</div>
            <p style={{ fontWeight: 700, fontSize: 15 }}>{invoice.customer?.company || invoice.customer?.name}</p>
            {invoice.customer?.company && <p style={{ fontSize: 13 }}>Attn: {invoice.customer.name}</p>}
            <p style={{ color: "var(--muted)", fontSize: 12.5, lineHeight: 1.6, marginTop: 2, whiteSpace: "pre-line" }}>
              {[
                invoice.customer?.address,
                [invoice.customer?.city, invoice.customer?.country].filter(Boolean).join(", "),
                invoice.customer?.email,
                invoice.customer?.phone,
                invoice.customer?.taxNumber ? `NTN: ${invoice.customer.taxNumber}` : null,
              ]
                .filter(Boolean)
                .join("\n")}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 18px", alignContent: "start" }}>
            <Meta label="Issue date" value={formatDate(invoice.invoiceDate)} />
            <Meta label="Due date" value={invoice.dueDate ? formatDate(invoice.dueDate) : "On receipt"} />
            <Meta label="Currency" value={currency} />
            {invoice.exchangeRate ? <Meta label="Exchange rate" value={`1 USD = ${Number(invoice.exchangeRate)} PKR`} /> : null}
          </div>
        </div>

        {hasShipment && (
          <div style={{ background: "var(--paper-sunken)", border: "1px solid var(--line-soft)", borderRadius: 10, padding: "14px 18px", marginTop: 20 }}>
            <div className="doc-label">Shipment details</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px 24px", marginTop: 6 }}>
              <ShipField label="Origin" value={invoice.originPort} />
              <ShipField label="Destination" value={invoice.destinationPort} />
              <ShipField label="Mode" value={invoice.shipmentMode} />
              <ShipField label="Shipping date" value={invoice.shippingDate ? formatDate(invoice.shippingDate) : null} />
              <ShipField label="Container no." value={invoice.containerNo} />
              <ShipField label="Tracking no." value={invoice.trackingNo} />
              <ShipField label="Weight" value={invoice.weight} />
            </div>
          </div>
        )}

        {/* items */}
        <table className="data-table" style={{ marginTop: 24 }}>
          <thead>
            <tr>
              <th style={{ width: 36 }}>#</th>
              <th>Description</th>
              <th className="right">Qty</th>
              <th className="right">Rate</th>
              <th className="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item: any, idx: number) => (
              <tr key={item.id}>
                <td className="muted">{idx + 1}</td>
                <td style={{ fontWeight: 500 }}>{item.description}</td>
                <td className="right num">{Number(item.quantity)}</td>
                <td className="right num">{formatCurrency(item.unitPrice, currency)}</td>
                <td className="right num" style={{ fontWeight: 600 }}>{formatCurrency(item.amount, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <div style={{ width: 300 }}>
            <div className="kv"><span>Subtotal</span><span>{formatCurrency(invoice.subtotal, currency)}</span></div>
            {Number(invoice.discount) > 0 && (
              <div className="kv"><span>Discount</span><span>− {formatCurrency(invoice.discount, currency)}</span></div>
            )}
            {Number(invoice.taxPercent) > 0 && (
              <div className="kv"><span>Tax ({Number(invoice.taxPercent)}%)</span><span>{formatCurrency(invoice.taxAmount, currency)}</span></div>
            )}
            <div className="kv" style={{ borderTop: "1px solid var(--line)", marginTop: 6, paddingTop: 10, fontSize: 15 }}>
              <span style={{ color: "var(--ink)", fontWeight: 700 }}>Total</span>
              <span style={{ fontWeight: 800 }}>{formatCurrency(invoice.total, currency)}</span>
            </div>
            {Number(invoice.amountPaid) > 0 && (
              <div className="kv"><span>Amount paid</span><span style={{ color: "var(--success)" }}>− {formatCurrency(invoice.amountPaid, currency)}</span></div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 10,
                padding: "12px 14px",
                borderRadius: 10,
                background: balance > 0.004 ? "var(--ink)" : "var(--success-soft)",
                color: balance > 0.004 ? "#fff" : "#065f46",
              }}
            >
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{balance > 0.004 ? "Balance due" : "Paid in full"}</span>
              <span className="num" style={{ fontSize: 18, fontWeight: 800 }}>{formatCurrency(Math.max(balance, 0), currency)}</span>
            </div>
          </div>
        </div>

        {(invoice.notes || company?.bankDetails) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: 32, gap: 24 }}>
            {invoice.notes ? (
              <div>
                <div className="doc-label">Notes</div>
                <p style={{ fontSize: 12.5, color: "var(--ink-soft)", whiteSpace: "pre-line" }}>{invoice.notes}</p>
              </div>
            ) : <div />}
            {company?.bankDetails && (
              <div>
                <div className="doc-label">Payment details</div>
                <p style={{ fontSize: 12.5, color: "var(--ink-soft)", whiteSpace: "pre-line" }}>{company.bankDetails}</p>
              </div>
            )}
          </div>
        )}

        {invoice.terms && (
          <div style={{ marginTop: 20 }}>
            <div className="doc-label">Terms &amp; conditions</div>
            <p style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "pre-line" }}>{invoice.terms}</p>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", marginTop: 36, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
          {company?.footerNote || "Thank you for your business."}
        </p>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="doc-label" style={{ marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{value}</div>
    </div>
  );
}

function ShipField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <div style={{ fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 1 }}>{value}</div>
    </div>
  );
}
