import { formatCurrency, formatDate, numberToWordsRupees } from "@/lib/utils";
import { StatusBadge } from "@/components/ui";

export default function InvoiceView({ invoice, company }: { invoice: any; company: any }) {
  const isAir = (invoice.shipmentMode || "").toLowerCase().includes("air");
  const foreignCurrency = invoice.foreignCurrency || "USD";
  const exRate = Number(invoice.exchangeRate) || 0;
  const inWords = numberToWordsRupees(invoice.total);

  return (
    <div
      className="card"
      style={{
        maxWidth: 900,
        margin: "0 auto",
        backgroundColor: "#fff",
        color: "#000",
        fontFamily: "Arial, sans-serif",
        padding: "36px 42px",
        borderRadius: 4,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      {/* 1. Header (Company Branding) */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        {company?.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={company.logoUrl}
            alt={company?.companyName || "Logo"}
            style={{
              maxHeight: 65,
              maxWidth: 220,
              objectFit: "contain",
              margin: "0 auto 10px auto",
              display: "block",
            }}
          />
        )}
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            margin: 0,
            color: "#0f172a",
          }}
        >
          {company?.companyName || "SKY LOGISTICS SOLUTIONS"}
        </h1>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b", marginTop: 6, lineHeight: 1.5 }}>
          {company?.address ||
            "Office No, G-1,Ground Floor,Plot NoA1-120 BLK-B,\nCHS BLK-13/A GULSHAN IQBAL, KARACHI - 75400 PAKISTAN"}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b", marginTop: 2 }}>
          Cell: {company?.phone || "0335-1909080"}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#2563eb", marginTop: 2 }}>
          Email: <a href={`mailto:${company?.email || "info@skylogisticssolutions.com"}`} style={{ color: "#2563eb", textDecoration: "underline" }}>
            {company?.email || "info@skylogisticssolutions.com"}
          </a>
        </div>
      </div>

      {/* 2. Main Parties & Shipment Specs Box (Table Layout) */}
      <div style={{ border: "1.5px solid #000", marginBottom: -1.5 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr" }}>
          {/* Left Block: MESSERS, SHIPPER, CONSIGNEE */}
          <div style={{ borderRight: "1.5px solid #000", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
            {/* MESSERS */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>MESSERS</div>
              <div style={{ paddingLeft: 16, marginTop: 3 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>
                  {invoice.customer?.company || invoice.customer?.name}
                </div>
                <div style={{ fontSize: 11.5, color: "#1e293b", whiteSpace: "pre-line", lineHeight: 1.45 }}>
                  {[
                    invoice.customer?.address,
                    [invoice.customer?.city, invoice.customer?.country].filter(Boolean).join(" "),
                    invoice.customer?.taxNumber ? `NTN: ${invoice.customer.taxNumber}` : null,
                  ]
                    .filter(Boolean)
                    .join("\n")}
                </div>
              </div>
            </div>

            {/* SHIPPER */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>SHIPPER</div>
              <div style={{ paddingLeft: 16, marginTop: 3, fontSize: 11.5, fontWeight: 600, whiteSpace: "pre-line" }}>
                {invoice.shipper || "—"}
              </div>
            </div>

            {/* CONSIGNEE */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>CONSIGNEE</div>
              <div style={{ paddingLeft: 16, marginTop: 3, fontSize: 11.5, fontWeight: 600, whiteSpace: "pre-line", lineHeight: 1.45 }}>
                {invoice.consignee || invoice.customer?.company || invoice.customer?.name || "—"}
              </div>
            </div>
          </div>

          {/* Right Block: BILL META & CARGO SPECS */}
          <div style={{ padding: "10px 14px", fontSize: 11.5 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <SpecRow label="BILL NO:" value={invoice.invoiceNumber} boldValue />
                <SpecRow label="DATE:" value={formatDate(invoice.invoiceDate)} />
                <SpecRow label="TYPE:" value={invoice.shipmentMode ? `BY ${invoice.shipmentMode.toUpperCase()}` : "BY AIR"} />

                {isAir ? (
                  <>
                    <SpecRow label="MASTER AWB:" value={invoice.masterAwb} />
                    <SpecRow label="HOUSE AWB:" value={invoice.houseAwb} />
                  </>
                ) : (
                  <>
                    <SpecRow label="HBL NO:" value={invoice.hblNo || invoice.trackingNo || "—"} />
                    <SpecRow label="CONTAINER NO:" value={invoice.containerNo || invoice.mblNo || "—"} />
                    {invoice.vesselName && <SpecRow label="VESSEL:" value={invoice.vesselName} />}
                  </>
                )}

                <SpecRow label="PACKAGES:" value={invoice.packages} />
                <SpecRow label="ORIGIN:" value={invoice.originPort} />
                <SpecRow label="FINAL DESTINATION:" value={invoice.destinationPort} />
                <SpecRow label="CHARGEABLE WEIGHT:" value={invoice.chargeableWeight} alignRight />
                <SpecRow label="GROSS WEIGHT:" value={invoice.grossWeight} alignRight />
                <SpecRow
                  label="CBM:"
                  value={invoice.cbm}
                  secondLabel="EX. RATE:"
                  secondValue={exRate > 0 ? exRate.toFixed(2) : "—"}
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Line Items Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1.5px solid #000",
          fontSize: 12,
        }}
      >
        <thead>
          <tr style={{ borderBottom: "1.5px solid #000" }}>
            <th style={{ width: 44, padding: "7px 8px", borderRight: "1px solid #000", textAlign: "center" }}>S. No</th>
            <th style={{ padding: "7px 10px", borderRight: "1px solid #000", textAlign: "left" }}>DESCRIPTION</th>
            <th style={{ width: 110, padding: "7px 8px", borderRight: "1px solid #000", textAlign: "right" }}>Rate</th>
            <th style={{ width: 130, padding: "7px 8px", borderRight: "1px solid #000", textAlign: "right" }}>
              Amount({foreignCurrency})
            </th>
            <th style={{ width: 150, padding: "7px 10px", textAlign: "right" }}>Amount ({invoice.currency || "PKR"})</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items?.map((item: any, idx: number) => {
            const hasForeign = item.foreignAmount !== null && item.foreignAmount !== undefined && Number(item.foreignAmount) > 0;
            const rateVal = item.rate !== null && item.rate !== undefined && Number(item.rate) > 0 ? Number(item.rate) : null;
            const curPrefix = invoice.currency === "USD" ? "$ " : invoice.currency === "EUR" ? "€ " : "Rs. ";

            return (
              <tr key={item.id || idx} style={{ borderBottom: "1px solid #cbd5e1", minHeight: 28 }}>
                <td style={{ padding: "7px 8px", borderRight: "1px solid #000", textAlign: "center", fontWeight: 700 }}>
                  {idx + 1}
                </td>
                <td style={{ padding: "7px 10px", borderRight: "1px solid #000", fontWeight: 700 }}>
                  {item.description}
                </td>
                <td style={{ padding: "7px 8px", borderRight: "1px solid #000", textAlign: "right", fontWeight: 600 }}>
                  {rateVal !== null
                    ? new Intl.NumberFormat("en-US", { minimumFractionDigits: rateVal % 1 === 0 ? 2 : 2 }).format(rateVal)
                    : ""}
                </td>
                <td style={{ padding: "7px 8px", borderRight: "1px solid #000", textAlign: "right", fontWeight: 700 }}>
                  {hasForeign
                    ? new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
                        Number(item.foreignAmount)
                      )
                    : ""}
                </td>
                <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 700 }}>
                  {curPrefix}{new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(item.amount) || 0)}
                </td>
              </tr>
            );
          })}

          {/* Fill blank rows for exact invoice print balance */}
          {Array.from({ length: Math.max(0, 7 - (invoice.items?.length || 0)) }).map((_, i) => (
            <tr key={`blank-${i}`} style={{ height: 26, borderBottom: "1px solid #e2e8f0" }}>
              <td style={{ borderRight: "1px solid #000" }}></td>
              <td style={{ borderRight: "1px solid #000" }}></td>
              <td style={{ borderRight: "1px solid #000" }}></td>
              <td style={{ borderRight: "1px solid #000" }}></td>
              <td></td>
            </tr>
          ))}

          {/* Grand Total Row */}
          <tr style={{ borderTop: "1.5px solid #000" }}>
            <td colSpan={4} style={{ padding: "9px 12px", fontWeight: 800, fontSize: 13, borderRight: "1px solid #000" }}>
              Total
            </td>
            <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 800, fontSize: 13.5 }}>
              {(invoice.currency === "USD" ? "$ " : invoice.currency === "EUR" ? "€ " : "Rs. ")}{new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(invoice.total) || 0)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 4. IN WORDS Block */}
      <div
        style={{
          border: "1.5px solid #000",
          borderTop: "none",
          padding: "8px 12px",
          fontSize: 11.5,
          fontWeight: 700,
        }}
      >
        <div>IN WORDS:-</div>
        <div style={{ marginTop: 2, color: "#1e293b", fontWeight: 600 }}>{inWords}</div>
      </div>

      {/* 5. Terms & Conditions */}
      <div
        style={{
          border: "1.5px solid #000",
          borderTop: "none",
          padding: "10px 14px",
          fontSize: 11,
          lineHeight: 1.55,
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 4 }}>Terms &amp; Conditions:-</div>
        <div style={{ whiteSpace: "pre-line", color: "#1e293b" }}>
          {invoice.terms ||
            "1. If any Discrepancy in this invoice must be notified within 7 days to us, from the date of receipt, after that no claim shall be entertained.\n2. Kindly clear your payments within approved credit days to avoid finical charges.\n3. Cheque, Pay order or Demand Draft must in Favor of \"Sky logistics Solutions\"."}
        </div>
      </div>

      {/* 6. Signature & Stamp */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 48, paddingRight: 10 }}>
        <div style={{ textAlign: "center", width: 240 }}>
          <div style={{ borderTop: "1.5px solid #000", paddingTop: 6, fontWeight: 700, fontSize: 12 }}>
            Authorized Signature &amp; Stamp
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecRow({
  label,
  value,
  boldValue = false,
  alignRight = false,
  secondLabel,
  secondValue,
}: {
  label: string;
  value?: string | number | null;
  boldValue?: boolean;
  alignRight?: boolean;
  secondLabel?: string;
  secondValue?: string | number | null;
}) {
  return (
    <tr style={{ height: 20 }}>
      <td style={{ fontWeight: 800, width: "42%", padding: "2px 0" }}>{label}</td>
      <td
        style={{
          fontWeight: boldValue ? 800 : 600,
          textAlign: alignRight ? "right" : "left",
          padding: "2px 0",
        }}
      >
        {value || "—"}
      </td>
      {secondLabel && (
        <>
          <td style={{ fontWeight: 800, textAlign: "right", paddingRight: 6 }}>{secondLabel}</td>
          <td style={{ fontWeight: 800, textAlign: "right" }}>{secondValue}</td>
        </>
      )}
    </tr>
  );
}
