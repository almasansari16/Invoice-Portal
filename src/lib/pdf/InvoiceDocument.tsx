import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { formatDate, numberToWordsRupees } from "../utils";

const BORDER_COLOR = "#000000";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 8.5,
    color: "#000000",
    fontFamily: "Helvetica",
  },
  // Header
  header: {
    alignItems: "center",
    textAlign: "center",
    marginBottom: 14,
  },
  logo: {
    maxHeight: 48,
    maxWidth: 180,
    marginBottom: 5,
    objectFit: "contain",
  },
  companyName: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  companyLine: {
    fontSize: 8,
    lineHeight: 1.35,
    color: "#000000",
  },
  companyEmail: {
    fontSize: 8,
    fontWeight: 700,
    color: "#1d4ed8",
    marginTop: 1,
  },

  // Main meta box
  metaBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: -1,
  },
  partiesCol: {
    width: "53%",
    borderRightWidth: 1,
    borderRightColor: BORDER_COLOR,
    padding: 8,
  },
  partySection: {
    marginBottom: 8,
  },
  partyHeading: {
    fontSize: 8.5,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  partyContent: {
    paddingLeft: 12,
    marginTop: 2,
    fontSize: 7.8,
    lineHeight: 1.35,
  },
  partyContentBold: {
    fontWeight: 700,
    fontSize: 8.2,
  },

  specsCol: {
    width: "47%",
    padding: 8,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2.5,
  },
  specLabel: {
    fontSize: 7.8,
    fontWeight: 700,
    width: "45%",
  },
  specValue: {
    fontSize: 7.8,
    width: "55%",
  },
  specValueBold: {
    fontWeight: 700,
  },

  // Items table
  table: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  thRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    alignItems: "stretch",
  },
  thCell: {
    paddingVertical: 5,
    paddingHorizontal: 4,
    justifyContent: "center",
  },
  th: {
    fontSize: 7.8,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#cbd5e1",
    alignItems: "stretch",
    minHeight: 18,
  },
  tdCell: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    justifyContent: "center",
  },
  td: {
    fontSize: 7.8,
  },

  colSno: { width: "8%", borderRightWidth: 1, borderRightColor: BORDER_COLOR },
  colDesc: { width: "47%", borderRightWidth: 1, borderRightColor: BORDER_COLOR, paddingHorizontal: 6 },
  colRate: { width: "13%", borderRightWidth: 1, borderRightColor: BORDER_COLOR },
  colForeign: { width: "15%", borderRightWidth: 1, borderRightColor: BORDER_COLOR },
  colPkr: { width: "17%", paddingHorizontal: 6 },

  trBlank: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    height: 18,
    alignItems: "stretch",
  },

  // Grand total row
  totalRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    alignItems: "stretch",
  },
  totalLabelCell: {
    width: "83%",
    paddingLeft: 10,
    paddingVertical: 5,
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: BORDER_COLOR,
  },
  totalLabel: {
    fontWeight: 700,
    fontSize: 8.5,
  },
  totalValCell: {
    width: "17%",
    paddingVertical: 5,
    paddingRight: 6,
    justifyContent: "center",
  },
  totalVal: {
    textAlign: "right",
    fontWeight: 700,
    fontSize: 8.5,
  },

  // Words Box
  wordsBox: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: BORDER_COLOR,
    padding: 6,
  },
  wordsHeading: {
    fontSize: 7.8,
    fontWeight: 700,
  },
  wordsText: {
    fontSize: 7.5,
    marginTop: 2,
    fontWeight: 600,
  },

  // Terms Box
  termsBox: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: BORDER_COLOR,
    padding: 7,
    fontSize: 7,
    lineHeight: 1.45,
  },
  termsHeading: {
    fontWeight: 700,
    marginBottom: 2,
  },

  // Signatures
  signRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 36,
  },
  signBox: {
    width: 170,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    paddingTop: 4,
    textAlign: "center",
  },
  signText: {
    fontSize: 7.5,
    fontWeight: 700,
    textAlign: "center",
  },
});

function fmtMoney(amount: number | string | null | undefined) {
  if (amount === null || amount === undefined || amount === "") return "";
  const v = Number(amount);
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}

export type InvoicePdfProps = {
  invoice: any;
  company: any;
};

export function InvoiceDocument({ invoice, company }: InvoicePdfProps) {
  const isAir = (invoice.shipmentMode || "").toLowerCase().includes("air");
  const foreignCurrency = invoice.foreignCurrency || "USD";
  const baseCurrency = invoice.currency || "PKR";
  const curSymbol = baseCurrency === "USD" ? "$ " : baseCurrency === "EUR" ? "€ " : "Rs. ";
  const exRate = Number(invoice.exchangeRate) || 0;
  const inWords = numberToWordsRupees(invoice.total);

  const blankRowsCount = Math.max(0, 7 - (invoice.items?.length || 0));

  return (
    <Document title={invoice.invoiceNumber}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {company?.logoUrl ? (
            <Image src={company.logoUrl} style={styles.logo} />
          ) : null}
          <Text style={styles.companyName}>
            {company?.companyName || "SKY LOGISTICS SOLUTIONS"}
          </Text>
          <Text style={styles.companyLine}>
            {company?.address ||
              "Office No, G-1,Ground Floor,Plot NoA1-120 BLK-B, CHS BLK-13/A GULSHAN IQBAL, KARACHI - 75400 PAKISTAN"}
          </Text>
          <Text style={styles.companyLine}>
            Cell: {company?.phone || "0335-1909080"}
          </Text>
          <Text style={styles.companyEmail}>
            Email: {company?.email || "info@skylogisticssolutions.com"}
          </Text>
        </View>

        {/* Parties & Specs Box */}
        <View style={styles.metaBox}>
          {/* Left Block */}
          <View style={styles.partiesCol}>
            {/* MESSERS */}
            <View style={styles.partySection}>
              <Text style={styles.partyHeading}>MESSERS</Text>
              <View style={styles.partyContent}>
                <Text style={styles.partyContentBold}>
                  {invoice.customer?.company || invoice.customer?.name}
                </Text>
                {invoice.customer?.address && (
                  <Text>{invoice.customer.address}</Text>
                )}
                <Text>
                  {[invoice.customer?.city, invoice.customer?.country].filter(Boolean).join(" ")}
                </Text>
                {invoice.customer?.taxNumber && (
                  <Text>NTN: {invoice.customer.taxNumber}</Text>
                )}
              </View>
            </View>

            {/* SHIPPER */}
            <View style={styles.partySection}>
              <Text style={styles.partyHeading}>SHIPPER</Text>
              <View style={styles.partyContent}>
                <Text>{invoice.shipper || "—"}</Text>
              </View>
            </View>

            {/* CONSIGNEE */}
            <View style={[styles.partySection, { marginBottom: 0 }]}>
              <Text style={styles.partyHeading}>CONSIGNEE</Text>
              <View style={styles.partyContent}>
                <Text>
                  {invoice.consignee || invoice.customer?.company || invoice.customer?.name || "—"}
                </Text>
              </View>
            </View>
          </View>

          {/* Right Block */}
          <View style={styles.specsCol}>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>BILL NO:</Text>
              <Text style={[styles.specValue, styles.specValueBold]}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>DATE:</Text>
              <Text style={styles.specValue}>{formatDate(invoice.invoiceDate)}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>TYPE</Text>
              <Text style={styles.specValue}>
                {invoice.shipmentMode ? `BY ${invoice.shipmentMode.toUpperCase()}` : "BY AIR"}
              </Text>
            </View>

            {isAir ? (
              <>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>MASTER AWB:</Text>
                  <Text style={styles.specValue}>{invoice.masterAwb || "—"}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>HOUSE AWB:</Text>
                  <Text style={styles.specValue}>{invoice.houseAwb || "—"}</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>HBL NO:</Text>
                  <Text style={styles.specValue}>{invoice.hblNo || invoice.trackingNo || "—"}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>CONTAINER NO:</Text>
                  <Text style={styles.specValue}>{invoice.containerNo || invoice.mblNo || "—"}</Text>
                </View>
                {invoice.vesselName && (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>VESSEL:</Text>
                    <Text style={styles.specValue}>{invoice.vesselName}</Text>
                  </View>
                )}
              </>
            )}

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>PACKAGES:</Text>
              <Text style={styles.specValue}>{invoice.packages || "—"}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>ORIGIN:</Text>
              <Text style={styles.specValue}>{invoice.originPort || "—"}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>FINAL DESTINATION:</Text>
              <Text style={styles.specValue}>{invoice.destinationPort || "—"}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>CHARGEABLE WEIGHT:</Text>
              <Text style={[styles.specValue, { textAlign: "right" }]}>{invoice.chargeableWeight || "—"}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>GROSS WEIGHT:</Text>
              <Text style={[styles.specValue, { textAlign: "right" }]}>{invoice.grossWeight || "—"}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>CBM:</Text>
              <Text style={{ width: "25%", fontSize: 7.8 }}>{invoice.cbm || "—"}</Text>
              <Text style={{ width: "20%", fontSize: 7.8, fontWeight: 700, textAlign: "right" }}>EX. RATE:</Text>
              <Text style={{ width: "10%", fontSize: 7.8, fontWeight: 700, textAlign: "right" }}>
                {exRate > 0 ? exRate.toFixed(2) : "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* Table of items */}
        <View style={styles.table}>
          <View style={styles.thRow}>
            <View style={[styles.colSno, styles.thCell]}>
              <Text style={[styles.th, { textAlign: "center" }]}>S. No</Text>
            </View>
            <View style={[styles.colDesc, styles.thCell]}>
              <Text style={styles.th}>DESCRIPTION</Text>
            </View>
            <View style={[styles.colRate, styles.thCell]}>
              <Text style={[styles.th, { textAlign: "right" }]}>Rate</Text>
            </View>
            <View style={[styles.colForeign, styles.thCell]}>
              <Text style={[styles.th, { textAlign: "right" }]}>Amount({foreignCurrency})</Text>
            </View>
            <View style={[styles.colPkr, styles.thCell]}>
              <Text style={[styles.th, { textAlign: "right" }]}>Amount ({baseCurrency})</Text>
            </View>
          </View>

          {invoice.items?.map((item: any, idx: number) => {
            const hasForeign =
              item.foreignAmount !== null && item.foreignAmount !== undefined && Number(item.foreignAmount) > 0;
            const rateVal =
              item.rate !== null && item.rate !== undefined && Number(item.rate) > 0 ? Number(item.rate) : null;

            return (
              <View style={styles.tr} key={item.id || idx} wrap={false}>
                <View style={[styles.colSno, styles.tdCell]}>
                  <Text style={[styles.td, { textAlign: "center", fontWeight: 700 }]}>{idx + 1}</Text>
                </View>
                <View style={[styles.colDesc, styles.tdCell]}>
                  <Text style={[styles.td, { fontWeight: 700 }]}>{item.description}</Text>
                </View>
                <View style={[styles.colRate, styles.tdCell]}>
                  <Text style={[styles.td, { textAlign: "right" }]}>
                    {rateVal !== null ? fmtMoney(rateVal) : ""}
                  </Text>
                </View>
                <View style={[styles.colForeign, styles.tdCell]}>
                  <Text style={[styles.td, { textAlign: "right", fontWeight: 700 }]}>
                    {hasForeign ? fmtMoney(item.foreignAmount) : ""}
                  </Text>
                </View>
                <View style={[styles.colPkr, styles.tdCell]}>
                  <Text style={[styles.td, { textAlign: "right", fontWeight: 700 }]}>
                    {curSymbol}{fmtMoney(item.amount)}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Blank spacer rows to match exact physical invoice proportions */}
          {Array.from({ length: blankRowsCount }).map((_, i) => (
            <View style={styles.trBlank} key={`blank-${i}`} wrap={false}>
              <View style={styles.colSno} />
              <View style={styles.colDesc} />
              <View style={styles.colRate} />
              <View style={styles.colForeign} />
              <View style={styles.colPkr} />
            </View>
          ))}

          {/* Grand total row */}
          <View style={styles.totalRow} wrap={false}>
            <View style={styles.totalLabelCell}>
              <Text style={styles.totalLabel}>Total</Text>
            </View>
            <View style={styles.totalValCell}>
              <Text style={styles.totalVal}>
                {curSymbol}{new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(invoice.total) || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* IN WORDS Box */}
        <View style={styles.wordsBox} wrap={false}>
          <Text style={styles.wordsHeading}>IN WORDS:-</Text>
          <Text style={styles.wordsText}>{inWords}</Text>
        </View>

        {/* Terms Box */}
        <View style={styles.termsBox} wrap={false}>
          <Text style={styles.termsHeading}>Terms &amp; Conditions:-</Text>
          <Text>
            {invoice.terms ||
              "1. If any Discrepancy in this invoice must be notified within 7 days to us, from the date of receipt, after that no claim shall be entertained.\n2. Kindly clear your payments within approved credit days to avoid finical charges.\n3. Cheque, Pay order or Demand Draft must in Favor of \"Sky logistics Solutions\"."}
          </Text>
        </View>

        {/* Authorized Signature */}
        <View style={styles.signRow} wrap={false}>
          <View style={styles.signBox}>
            <Text style={styles.signText}>Authorized Signature &amp; Stamp</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
