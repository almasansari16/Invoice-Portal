import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// Optional: register a clean sans font if you add font files under /public/fonts
// Font.register({ family: "Inter", fonts: [...] });

const INK = "#0f172a";
const MUTED = "#64748b";
const ACCENT = "#3b5bdb"; // brand blue — matches the web UI
const LINE = "#e4e8f0";
const BG_SOFT = "#f1f4f9";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9.5,
    color: INK,
    fontFamily: "Helvetica",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  logo: { width: 120, height: 60, objectFit: "contain", marginBottom: 8 },
  companyName: { fontSize: 15, fontWeight: 700, marginBottom: 2 },
  companyLine: { fontSize: 8.5, color: MUTED, lineHeight: 1.5 },
  invoiceTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: ACCENT,
    letterSpacing: 1,
    textAlign: "right",
  },
  invoiceMetaBox: { alignItems: "flex-end", marginTop: 6 },
  metaRow: { flexDirection: "row", marginBottom: 2 },
  metaLabel: { color: MUTED, width: 90, textAlign: "right", marginRight: 6 },
  metaValue: { fontWeight: 700, textAlign: "right" },

  divider: { borderBottomWidth: 1, borderBottomColor: LINE, marginVertical: 16 },

  twoCol: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  colBlock: { width: "48%" },
  blockLabel: {
    fontSize: 8,
    color: ACCENT,
    letterSpacing: 0.5,
    marginBottom: 4,
    fontWeight: 700,
  },
  blockText: { fontSize: 9.5, lineHeight: 1.5 },
  blockTextMuted: { fontSize: 9, color: MUTED, lineHeight: 1.5 },

  shipmentBox: {
    backgroundColor: BG_SOFT,
    padding: 10,
    borderRadius: 3,
    marginBottom: 18,
  },
  shipmentGrid: { flexDirection: "row", flexWrap: "wrap" },
  shipmentItem: { width: "33%", marginBottom: 6 },
  shipmentLabel: { fontSize: 7.5, color: MUTED, textTransform: "uppercase" },
  shipmentValue: { fontSize: 9, fontWeight: 700, marginTop: 1 },

  table: { marginTop: 6 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1.2,
    borderBottomColor: INK,
    paddingBottom: 6,
    marginBottom: 6,
  },
  th: { fontSize: 8, color: MUTED, fontWeight: 700, textTransform: "uppercase" },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    paddingVertical: 7,
  },
  td: { fontSize: 9.5 },

  colDesc: { width: "46%" },
  colQty: { width: "14%", textAlign: "right" },
  colRate: { width: "20%", textAlign: "right" },
  colAmt: { width: "20%", textAlign: "right" },

  totalsWrap: { flexDirection: "row", justifyContent: "flex-end", marginTop: 14 },
  totalsBox: { width: 220 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: { color: MUTED },
  totalValue: { fontWeight: 700 },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1.2,
    borderTopColor: INK,
    marginTop: 4,
    paddingTop: 8,
  },
  grandTotalLabel: { fontSize: 11, fontWeight: 700 },
  grandTotalValue: { fontSize: 13, fontWeight: 700, color: ACCENT },

  footerCols: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
  },
  footerBlock: { width: "48%" },

  statusBadge: {
    alignSelf: "flex-end",
    marginTop: 6,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 2,
    color: "#fff",
  },

  pageFooter: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopColor: LINE,
    paddingTop: 8,
    fontSize: 7.5,
    color: MUTED,
    textAlign: "center",
  },
});

function money(amount: number | string, currency: string) {
  const v = typeof amount === "string" ? parseFloat(amount) : amount;
  const symbol = currency === "USD" ? "$" : "Rs";
  return `${symbol} ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v || 0)}`;
}

function fmtDate(d: string | Date | null | undefined) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "#64748b",
  SENT: "#2563eb",
  PAID: "#059669",
  OVERDUE: "#dc2626",
  CANCELLED: "#94a3b8",
};

export type InvoicePdfProps = {
  invoice: any;
  company: any;
};

export function InvoiceDocument({ invoice, company }: InvoicePdfProps) {
  const currency = invoice.currency;

  return (
    <Document title={invoice.invoiceNumber}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            {company?.logoUrl ? (
              <Image src={company.logoUrl} style={styles.logo} />
            ) : (
              <Text style={styles.companyName}>{company?.companyName || "Your Company"}</Text>
            )}
            {company?.logoUrl && (
              <Text style={styles.companyName}>{company?.companyName}</Text>
            )}
            <Text style={styles.companyLine}>{company?.address}</Text>
            <Text style={styles.companyLine}>
              {[company?.phone, company?.email, company?.website].filter(Boolean).join("  •  ")}
            </Text>
            {company?.taxNumber && (
              <Text style={styles.companyLine}>Tax No: {company.taxNumber}</Text>
            )}
          </View>

          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <View style={styles.invoiceMetaBox}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Invoice No</Text>
                <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaValue}>{fmtDate(invoice.invoiceDate)}</Text>
              </View>
              {invoice.dueDate && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Due Date</Text>
                  <Text style={styles.metaValue}>{fmtDate(invoice.dueDate)}</Text>
                </View>
              )}
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: STATUS_COLOR[invoice.status] || "#64748b" },
                ]}
              >
                <Text>{invoice.status}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bill To / Currency */}
        <View style={styles.twoCol}>
          <View style={styles.colBlock}>
            <Text style={styles.blockLabel}>BILL TO</Text>
            <Text style={styles.blockText}>{invoice.customer?.name}</Text>
            {invoice.customer?.company && (
              <Text style={styles.blockTextMuted}>{invoice.customer.company}</Text>
            )}
            {invoice.customer?.address && (
              <Text style={styles.blockTextMuted}>{invoice.customer.address}</Text>
            )}
            <Text style={styles.blockTextMuted}>
              {[invoice.customer?.city, invoice.customer?.country].filter(Boolean).join(", ")}
            </Text>
            {invoice.customer?.phone && (
              <Text style={styles.blockTextMuted}>{invoice.customer.phone}</Text>
            )}
            {invoice.customer?.email && (
              <Text style={styles.blockTextMuted}>{invoice.customer.email}</Text>
            )}
          </View>

          <View style={[styles.colBlock, { alignItems: "flex-end" }]}>
            <Text style={styles.blockLabel}>CURRENCY</Text>
            <Text style={styles.blockText}>{currency}</Text>
            {invoice.exchangeRate && (
              <Text style={styles.blockTextMuted}>
                Rate: 1 USD = {Number(invoice.exchangeRate)} PKR
              </Text>
            )}
          </View>
        </View>

        {/* Shipment details */}
        {(invoice.originPort ||
          invoice.destinationPort ||
          invoice.shipmentMode ||
          invoice.containerNo ||
          invoice.trackingNo ||
          invoice.weight ||
          invoice.shippingDate) && (
          <View style={styles.shipmentBox}>
            <Text style={styles.blockLabel}>SHIPMENT DETAILS</Text>
            <View style={styles.shipmentGrid}>
              {invoice.originPort && (
                <View style={styles.shipmentItem}>
                  <Text style={styles.shipmentLabel}>Origin</Text>
                  <Text style={styles.shipmentValue}>{invoice.originPort}</Text>
                </View>
              )}
              {invoice.destinationPort && (
                <View style={styles.shipmentItem}>
                  <Text style={styles.shipmentLabel}>Destination</Text>
                  <Text style={styles.shipmentValue}>{invoice.destinationPort}</Text>
                </View>
              )}
              {invoice.shipmentMode && (
                <View style={styles.shipmentItem}>
                  <Text style={styles.shipmentLabel}>Mode</Text>
                  <Text style={styles.shipmentValue}>{invoice.shipmentMode}</Text>
                </View>
              )}
              {invoice.containerNo && (
                <View style={styles.shipmentItem}>
                  <Text style={styles.shipmentLabel}>Container No</Text>
                  <Text style={styles.shipmentValue}>{invoice.containerNo}</Text>
                </View>
              )}
              {invoice.trackingNo && (
                <View style={styles.shipmentItem}>
                  <Text style={styles.shipmentLabel}>Tracking No</Text>
                  <Text style={styles.shipmentValue}>{invoice.trackingNo}</Text>
                </View>
              )}
              {invoice.weight && (
                <View style={styles.shipmentItem}>
                  <Text style={styles.shipmentLabel}>Weight</Text>
                  <Text style={styles.shipmentValue}>{invoice.weight}</Text>
                </View>
              )}
              {invoice.shippingDate && (
                <View style={styles.shipmentItem}>
                  <Text style={styles.shipmentLabel}>Shipping Date</Text>
                  <Text style={styles.shipmentValue}>{fmtDate(invoice.shippingDate)}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Line items table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colDesc]}>Description</Text>
            <Text style={[styles.th, styles.colQty]}>Qty</Text>
            <Text style={[styles.th, styles.colRate]}>Rate</Text>
            <Text style={[styles.th, styles.colAmt]}>Amount</Text>
          </View>

          {invoice.items?.map((item: any, i: number) => (
            <View style={styles.tr} key={item.id || i} wrap={false}>
              <Text style={[styles.td, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.td, styles.colQty]}>{Number(item.quantity)}</Text>
              <Text style={[styles.td, styles.colRate]}>{money(item.unitPrice, currency)}</Text>
              <Text style={[styles.td, styles.colAmt]}>{money(item.amount, currency)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsWrap}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{money(invoice.subtotal, currency)}</Text>
            </View>
            {parseFloat(invoice.discount) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={styles.totalValue}>-{money(invoice.discount, currency)}</Text>
              </View>
            )}
            {parseFloat(invoice.taxPercent) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax ({Number(invoice.taxPercent)}%)</Text>
                <Text style={styles.totalValue}>{money(invoice.taxAmount, currency)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{money(invoice.total, currency)}</Text>
            </View>
            {parseFloat(invoice.amountPaid) > 0 && (
              <>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Amount Paid</Text>
                  <Text style={styles.totalValue}>{money(invoice.amountPaid, currency)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Balance Due</Text>
                  <Text style={styles.totalValue}>
                    {money(
                      parseFloat(invoice.total) - parseFloat(invoice.amountPaid),
                      currency
                    )}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Notes / Terms / Bank details */}
        <View style={styles.footerCols}>
          <View style={styles.footerBlock}>
            {invoice.notes && (
              <>
                <Text style={styles.blockLabel}>NOTES</Text>
                <Text style={styles.blockTextMuted}>{invoice.notes}</Text>
              </>
            )}
          </View>
          <View style={styles.footerBlock}>
            {company?.bankDetails && (
              <>
                <Text style={styles.blockLabel}>BANK DETAILS</Text>
                <Text style={styles.blockTextMuted}>{company.bankDetails}</Text>
              </>
            )}
          </View>
        </View>

        {invoice.terms && (
          <View style={{ marginTop: 12 }} wrap={false}>
            <Text style={styles.blockLabel}>TERMS &amp; CONDITIONS</Text>
            <Text style={styles.blockTextMuted}>{invoice.terms}</Text>
          </View>
        )}

        <Text style={styles.pageFooter} fixed>
          {company?.footerNote || "Thank you for your business."}
        </Text>
      </Page>
    </Document>
  );
}
