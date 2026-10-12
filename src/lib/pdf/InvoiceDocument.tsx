import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
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
    textAlign: "center",
    marginBottom: 16,
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
    paddingVertical: 4,
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
    paddingVertical: 3.5,
  },
  trBlank: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    height: 16,
  },
  td: {
    fontSize: 7.8,
  },

  colSno: { width: "8%", textAlign: "center", borderRightWidth: 1, borderRightColor: BORDER_COLOR },
  colDesc: { width: "47%", paddingHorizontal: 6, borderRightWidth: 1, borderRightColor: BORDER_COLOR },
  colRate: { width: "13%", textAlign: "right", paddingRight: 4, borderRightWidth: 1, borderRightColor: BORDER_COLOR },
  colForeign: { width: "15%", textAlign: "right", paddingRight: 4, borderRightWidth: 1, borderRightColor: BORDER_COLOR },
  colPkr: { width: "17%", textAlign: "right", paddingRight: 6 },

  // Grand total row
  totalRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    paddingVertical: 5,
  },
  totalLabel: {
    width: "83%",
    paddingLeft: 10,
    fontWeight: 700,
    fontSize: 8.5,
    borderRightWidth: 1,
    borderRightColor: BORDER_COLOR,
  },
  totalVal: {
    width: "17%",
    textAlign: "right",
    paddingRight: 6,
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
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(v);
}

export type InvoicePdfProps = {
  invoice: any;
  company: any;
};

export function InvoiceDocument({ invoice, company }: InvoicePdfProps) {
  const isAir = (invoice.shipmentMode || "").toLowerCase().includes("air");
  const foreignCurrency = invoice.foreignCurrency || "USD";
  const exRate = Number(invoice.exchangeRate) || 0;
  const inWords = numberToWordsRupees(invoice.total);

  const blankRowsCount = Math.max(0, 7 - (invoice.items?.length || 0));

  return (
    <Document title={invoice.invoiceNumber}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
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
                {invoice.containerNo && (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>CONTAINER NO:</Text>
                    <Text style={styles.specValue}>{invoice.containerNo}</Text>
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
            <Text style={[styles.th, styles.colSno]}>S. No</Text>
            <Text style={[styles.th, styles.colDesc]}>DESCRIPTION</Text>
            <Text style={[styles.th, styles.colRate]}>Rate</Text>
            <Text style={[styles.th, styles.colForeign]}>Amount({foreignCurrency})</Text>
            <Text style={[styles.th, styles.colPkr]}>Amount (PKR)</Text>
          </View>

          {invoice.items?.map((item: any, idx: number) => {
            const hasForeign =
              item.foreignAmount !== null && item.foreignAmount !== undefined && Number(item.foreignAmount) > 0;
            const rateVal =
              item.rate !== null && item.rate !== undefined && Number(item.rate) > 0 ? Number(item.rate) : null;

            return (
              <View style={styles.tr} key={item.id || idx} wrap={false}>
                <Text style={[styles.td, styles.colSno, { fontWeight: 700 }]}>{idx + 1}</Text>
                <Text style={[styles.td, styles.colDesc, { fontWeight: 700 }]}>{item.description}</Text>
                <Text style={[styles.td, styles.colRate]}>{rateVal !== null ? fmtMoney(rateVal) : ""}</Text>
                <Text style={[styles.td, styles.colForeign, { fontWeight: 700 }]}>
                  {hasForeign ? fmtMoney(item.foreignAmount) : ""}
                </Text>
                <Text style={[styles.td, styles.colPkr, { fontWeight: 700 }]}>
                  Rs. {fmtMoney(item.amount)}
                </Text>
              </View>
            );
          })}

          {/* Blank spacer rows to match exact physical invoice proportions */}
          {Array.from({ length: blankRowsCount }).map((_, i) => (
            <View style={styles.trBlank} key={`blank-${i}`} wrap={false}>
              <Text style={styles.colSno}></Text>
              <Text style={styles.colDesc}></Text>
              <Text style={styles.colRate}></Text>
              <Text style={styles.colForeign}></Text>
              <Text style={styles.colPkr}></Text>
            </View>
          ))}

          {/* Grand total row */}
          <View style={styles.totalRow} wrap={false}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalVal}>
              Rs. {new Intl.NumberFormat("en-US").format(Math.round(Number(invoice.total)))}
            </Text>
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
