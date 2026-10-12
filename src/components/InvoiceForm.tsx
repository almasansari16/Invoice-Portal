"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency, numberToWordsRupees } from "@/lib/utils";
import { SAMPLE_TEMPLATES, SampleTemplate } from "@/lib/sample-invoices";
import { Avatar } from "@/components/ui";
import {
  IconAlert,
  IconCheck,
  IconFileText,
  IconInvoice,
  IconPackage,
  IconPlane,
  IconPlus,
  IconRefresh,
  IconShip,
  IconSparkles,
  IconTruck,
  IconX,
} from "@/components/Icons";

type Customer = {
  id: string;
  name: string;
  company: string | null;
  customerType?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  shippingAddress?: string | null;
  taxNumber?: string | null;
  strn?: string | null;
  cnic?: string | null;
  defaultPaymentTerms?: string | null;
  preferredCurrency?: "PKR" | "USD";
};

export type FreightLineItem = {
  id: string;
  description: string;
  rate?: number | string;
  foreignAmount?: number | string;
  quantity: number;
  unitPrice: number;
  amount: number; // in PKR
};

export type InvoiceInitial = {
  id?: string;
  invoiceNumber?: string;
  customerId?: string;
  invoiceDate?: string;
  dueDate?: string | null;
  currency?: "USD" | "PKR";
  foreignCurrency?: string | null;
  exchangeRate?: number | null;
  status?: string;

  // freight parties & routing
  shipper?: string | null;
  consignee?: string | null;
  originPort?: string | null;
  destinationPort?: string | null;
  shipmentMode?: string | null; // "Air" | "Sea" | "Road"

  // air freight docs
  masterAwb?: string | null;
  houseAwb?: string | null;

  // sea freight docs
  hblNo?: string | null;
  mblNo?: string | null;
  containerNo?: string | null;
  vesselName?: string | null;

  // cargo specs
  packages?: string | null;
  chargeableWeight?: string | null;
  grossWeight?: string | null;
  cbm?: string | null;
  trackingNo?: string | null;
  weight?: string | null;
  shippingDate?: string | null;

  discount?: number;
  taxPercent?: number;
  amountPaid?: number;
  notes?: string | null;
  terms?: string | null;
  items?: any[];
};

let idCounter = 0;
function newId() {
  idCounter += 1;
  return `tmp-${Date.now()}-${idCounter}`;
}

function isoDay(d: Date) {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}
function addDays(day: string, n: number) {
  const d = new Date(day + "T00:00:00");
  d.setDate(d.getDate() + n);
  return isoDay(d);
}

const PAYMENT_TERMS = [
  { label: "On receipt", days: 0 },
  { label: "Net 7", days: 7 },
  { label: "Net 15", days: 15 },
  { label: "Net 30", days: 30 },
  { label: "Net 45", days: 45 },
  { label: "Net 60", days: 60 },
];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "CANCELLED", label: "Cancelled" },
];

const DEFAULT_TERMS = `1. If any Discrepancy in this invoice must be notified within 7 days to us, from the date of receipt, after that no claim shall be entertained.
2. Kindly clear your payments within approved credit days to avoid finical charges.
3. Cheque, Pay order or Demand Draft must in Favor of "Sky logistics Solutions".`;

export default function InvoiceForm({
  customers,
  initial,
  defaultCurrency = "PKR",
}: {
  customers: Customer[];
  initial?: InvoiceInitial;
  defaultCurrency?: "USD" | "PKR";
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [invoiceNumber, setInvoiceNumber] = useState(initial?.invoiceNumber || "");
  const [customerId, setCustomerId] = useState(initial?.customerId || "");
  const [invoiceDate, setInvoiceDate] = useState(
    initial?.invoiceDate?.slice(0, 10) || isoDay(new Date())
  );
  const [dueDate, setDueDate] = useState(initial?.dueDate?.slice(0, 10) || "");
  const [currency, setCurrency] = useState<"USD" | "PKR">(initial?.currency || defaultCurrency);
  const [foreignCurrency, setForeignCurrency] = useState<string>(initial?.foreignCurrency || "USD");
  const [exchangeRate, setExchangeRate] = useState(initial?.exchangeRate?.toString() || "326.00");
  const [status, setStatus] = useState(initial?.status || "DRAFT");

  // Freight parties
  const [shipper, setShipper] = useState(initial?.shipper || "");
  const [consignee, setConsignee] = useState(initial?.consignee || "");

  // Routing & Mode
  const [shipmentMode, setShipmentMode] = useState(initial?.shipmentMode || "Air");
  const [originPort, setOriginPort] = useState(initial?.originPort || "");
  const [destinationPort, setDestinationPort] = useState(initial?.destinationPort || "KARACHI (KHI)");

  // Air Docs
  const [masterAwb, setMasterAwb] = useState(initial?.masterAwb || "");
  const [houseAwb, setHouseAwb] = useState(initial?.houseAwb || "");

  // Sea Docs
  const [hblNo, setHblNo] = useState(initial?.hblNo || "");
  const [mblNo, setMblNo] = useState(initial?.mblNo || "");
  const [containerNo, setContainerNo] = useState(initial?.containerNo || "");
  const [vesselName, setVesselName] = useState(initial?.vesselName || "");

  // Cargo Specs
  const [packages, setPackages] = useState(initial?.packages || "");
  const [chargeableWeight, setChargeableWeight] = useState(initial?.chargeableWeight || "");
  const [grossWeight, setGrossWeight] = useState(initial?.grossWeight || "");
  const [cbm, setCbm] = useState(initial?.cbm || "");

  const [items, setItems] = useState<FreightLineItem[]>(
    initial?.items && initial.items.length > 0
      ? initial.items.map((i) => ({
          id: i.id || newId(),
          description: i.description,
          rate: i.rate ?? "",
          foreignAmount: i.foreignAmount ?? "",
          quantity: Number(i.quantity) || 1,
          unitPrice: Number(i.unitPrice) || 0,
          amount: Number(i.amount) || Number(i.unitPrice) || 0,
        }))
      : [
          {
            id: newId(),
            description: "AIR FREIGHT",
            rate: 3.75,
            foreignAmount: 2351.25,
            quantity: 1,
            unitPrice: 766507.5,
            amount: 766507.5,
          },
          {
            id: newId(),
            description: "DO FEE",
            rate: 10500.0,
            foreignAmount: "",
            quantity: 1,
            unitPrice: 10500.0,
            amount: 10500.0,
          },
        ]
  );

  const [discount, setDiscount] = useState(initial?.discount || 0);
  const [taxPercent, setTaxPercent] = useState(initial?.taxPercent || 0);
  const [amountPaid, setAmountPaid] = useState(initial?.amountPaid || 0);
  const [notes, setNotes] = useState(initial?.notes || "");
  const [terms, setTerms] = useState(initial?.terms || DEFAULT_TERMS);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const customer = customers.find((c) => c.id === customerId);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const afterDiscount = Math.max(subtotal - (Number(discount) || 0), 0);
    const taxAmount = (afterDiscount * (Number(taxPercent) || 0)) / 100;
    const total = afterDiscount + taxAmount;
    const balance = total - (Number(amountPaid) || 0);
    const words = numberToWordsRupees(total);
    return { subtotal, afterDiscount, taxAmount, total, balance, words };
  }, [items, discount, taxPercent, amountPaid]);

  function updateItem(id: string, patch: Partial<FreightLineItem>) {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const updated = { ...i, ...patch };

        // Auto calculation if foreignAmount is edited and exchange rate exists
        if ("foreignAmount" in patch && patch.foreignAmount !== "" && patch.foreignAmount !== undefined) {
          const ex = parseFloat(exchangeRate) || 0;
          const fa = parseFloat(String(patch.foreignAmount)) || 0;
          if (ex > 0 && fa > 0) {
            updated.amount = Math.round(fa * ex * 100) / 100;
          }
        }
        return updated;
      })
    );
  }

  function addItem(item?: Partial<FreightLineItem>) {
    const row: FreightLineItem = {
      id: newId(),
      description: "",
      rate: "",
      foreignAmount: "",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      ...item,
    };
    setItems((prev) => [...prev, row]);
  }

  function removeItem(id: string) {
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));
  }

  function applyTemplate(t: SampleTemplate) {
    setMenuOpen(false);
    const today = isoDay(new Date());

    const hinted = customers.find((c) =>
      t.customerHints.some((h) =>
        `${c.name} ${c.company || ""} ${c.city || ""} ${c.country || ""}`.toLowerCase().includes(h.toLowerCase())
      )
    );
    const pick = hinted || customers.find((c) => c.id === customerId) || customers[0];
    if (pick) setCustomerId(pick.id);

    if (t.billNo && !isEdit) setInvoiceNumber(t.billNo);
    setInvoiceDate(today);
    setDueDate(addDays(today, t.dueInDays));
    setCurrency(t.currency);
    setForeignCurrency(t.foreignCurrency || "USD");
    setExchangeRate(t.exchangeRate ? String(t.exchangeRate) : "");
    setStatus(t.status);
    setShipmentMode(t.mode);
    setShipper(t.shipper || "");
    setConsignee(t.consignee || "");
    setOriginPort(t.originPort || "");
    setDestinationPort(t.destinationPort || "");
    setMasterAwb(t.masterAwb || "");
    setHouseAwb(t.houseAwb || "");
    setHblNo(t.hblNo || "");
    setMblNo(t.mblNo || "");
    setContainerNo(t.containerNo || "");
    setVesselName(t.vesselName || "");
    setPackages(t.packages || "");
    setChargeableWeight(t.chargeableWeight || "");
    setGrossWeight(t.grossWeight || "");
    setCbm(t.cbm || "");
    setItems(
      t.items.map((i) => ({
        id: newId(),
        description: i.description,
        rate: i.rate ?? "",
        foreignAmount: i.foreignAmount ?? "",
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        amount: i.amount ?? (Number(i.quantity) * Number(i.unitPrice)),
      }))
    );
    setDiscount(t.discount);
    setTaxPercent(t.taxPercent);
    setAmountPaid(t.amountPaid);
    setNotes(t.notes);
    setTerms(t.terms);
    setError("");
    setToast(`Loaded "${t.title}"`);
  }

  function resetForm() {
    setInvoiceNumber("");
    setCustomerId("");
    setInvoiceDate(isoDay(new Date()));
    setDueDate("");
    setCurrency(defaultCurrency);
    setForeignCurrency("USD");
    setExchangeRate("326.00");
    setStatus("DRAFT");
    setShipmentMode("Air");
    setShipper("");
    setConsignee("");
    setOriginPort("");
    setDestinationPort("KARACHI (KHI)");
    setMasterAwb("");
    setHouseAwb("");
    setHblNo("");
    setMblNo("");
    setContainerNo("");
    setVesselName("");
    setPackages("");
    setChargeableWeight("");
    setGrossWeight("");
    setCbm("");
    setItems([{ id: newId(), description: "", rate: "", foreignAmount: "", quantity: 1, unitPrice: 0, amount: 0 }]);
    setDiscount(0);
    setTaxPercent(0);
    setAmountPaid(0);
    setNotes("");
    setTerms(DEFAULT_TERMS);
    setError("");
    setToast("Form cleared");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!customerId) {
      setError("Please select a customer (Messers).");
      return;
    }
    const cleanItems = items
      .filter((i) => i.description.trim())
      .map((i) => ({
        description: i.description,
        rate: i.rate !== "" && i.rate !== undefined ? Number(i.rate) : null,
        foreignAmount: i.foreignAmount !== "" && i.foreignAmount !== undefined ? Number(i.foreignAmount) : null,
        quantity: Number(i.quantity) || 1,
        unitPrice: Number(i.amount) || Number(i.unitPrice) || 0,
        amount: Number(i.amount) || 0,
      }));

    if (cleanItems.length === 0) {
      setError("Add at least one line item.");
      return;
    }

    setSaving(true);

    const payload = {
      invoiceNumber: invoiceNumber.trim() || null,
      customerId,
      invoiceDate,
      dueDate: dueDate || null,
      currency,
      foreignCurrency,
      exchangeRate: exchangeRate ? Number(exchangeRate) : null,
      status,

      shipper: shipper || null,
      consignee: consignee || null,
      originPort: originPort || null,
      destinationPort: destinationPort || null,
      shipmentMode: shipmentMode || null,

      masterAwb: masterAwb || null,
      houseAwb: houseAwb || null,

      hblNo: hblNo || null,
      mblNo: mblNo || null,
      containerNo: containerNo || null,
      vesselName: vesselName || null,

      packages: packages || null,
      chargeableWeight: chargeableWeight || null,
      grossWeight: grossWeight || null,
      cbm: cbm || null,

      discount: Number(discount) || 0,
      taxPercent: Number(taxPercent) || 0,
      amountPaid: Number(amountPaid) || 0,
      notes: notes || null,
      terms: terms || null,
      items: cleanItems,
    };

    const url = isEdit ? `/api/invoices/${initial!.id}` : "/api/invoices";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      const msg = typeof errData?.error === "string" ? errData.error : (errData?.error ? JSON.stringify(errData.error) : "Could not save invoice. Check the fields and try again.");
      setError(msg);
      return;
    }

    const data = await res.json();
    router.push(`/invoices/${data.id}`);
    router.refresh();
  }

  function handleCustomerSelect(id: string) {
    setCustomerId(id);
    const selected = customers.find((c) => c.id === id);
    if (selected) {
      if (selected.preferredCurrency) {
        setCurrency(selected.preferredCurrency as "PKR" | "USD");
      }
      if (selected.defaultPaymentTerms) {
        const match = PAYMENT_TERMS.find(
          (t) => t.label.toLowerCase() === selected.defaultPaymentTerms?.toLowerCase()
        );
        if (match) {
          setDueDate(addDays(invoiceDate, match.days));
        }
      }
      // auto set Consignee to customer company + address if consignee is empty
      if (!consignee.trim()) {
        const autoConsignee = [
          selected.company || selected.name,
          selected.address,
          [selected.city, selected.country].filter(Boolean).join(" "),
        ]
          .filter(Boolean)
          .join("\n");
        setConsignee(autoConsignee);
      }
    }
  }

  const modes = [
    { value: "Air", label: "By Air", icon: <IconPlane size={15} /> },
    { value: "Sea", label: "By Sea", icon: <IconShip size={15} /> },
    { value: "Road", label: "By Road", icon: <IconTruck size={15} /> },
  ];

  return (
    <form onSubmit={handleSubmit}>
      {/* Sample presets toolbar */}
      <div className="card" style={{ padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span className="stat-icon" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>
          <IconSparkles size={17} />
        </span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontWeight: 600, fontSize: 13.5 }}>Sky Logistics Sample Invoices</div>
          <div className="muted" style={{ fontSize: 12.5 }}>
            Load actual freight data from your samples (AF-7860256 By Air / SF-7860259 By Sea).
          </div>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={resetForm}>
          <IconRefresh size={14} /> Clear
        </button>
        <div className="menu-wrap" ref={menuRef}>
          <button type="button" className="btn btn-soft btn-sm" onClick={() => setMenuOpen((o) => !o)}>
            <IconSparkles size={14} /> Load sample invoice
          </button>
          {menuOpen && (
            <div className="menu">
              {SAMPLE_TEMPLATES.map((t) => (
                <button type="button" key={t.key} onClick={() => applyTemplate(t)}>
                  <span
                    className="menu-icon"
                    style={
                      t.mode === "Air"
                        ? { background: "#f0f9ff", color: "#0369a1" }
                        : { background: "#eef2ff", color: "#3b5bdb" }
                    }
                  >
                    {t.mode === "Air" ? <IconPlane size={15} /> : <IconShip size={15} />}
                  </span>
                  <span>
                    <b>{t.title}</b>
                    <span>{t.subtitle}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="form-layout">
        <div className="stack">
          {/* SECTION 1: HEADER & BILL INFO */}
          <div className="card card-pad">
            <div className="section-title">
              <span className="icon-chip"><IconInvoice size={16} /></span>
              <div>
                <h3>Bill &amp; Shipment Info</h3>
                <p>Bill No, date, transport type &amp; exchange rate</p>
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Bill No / Invoice No</label>
                <input
                  className="input mono"
                  placeholder={shipmentMode === "Sea" ? "e.g. SF-7860259" : "e.g. AF-7860256"}
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Type / Mode of transport<span className="req">*</span></label>
                <div className="segmented" style={{ alignSelf: "flex-start", width: "100%" }}>
                  {modes.map((m) => (
                    <button
                      type="button"
                      key={m.value}
                      style={{ flex: 1 }}
                      className={shipmentMode.toLowerCase() === m.value.toLowerCase() ? "on" : ""}
                      onClick={() => {
                        setShipmentMode(m.value);
                        if (!invoiceNumber || invoiceNumber.startsWith("AF-") || invoiceNumber.startsWith("SF-")) {
                          setInvoiceNumber(m.value === "Sea" ? "SF-" : "AF-");
                        }
                      }}
                    >
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Date<span className="req">*</span></label>
                <input className="input" type="date" required value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
              </div>

              <div className="field">
                <label>Due date</label>
                <input className="input" type="date" value={dueDate} min={invoiceDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>

            <div className="grid-2" style={{ marginTop: 10 }}>
              <div className="field">
                <label>Foreign Currency</label>
                <select className="input" value={foreignCurrency} onChange={(e) => setForeignCurrency(e.target.value)}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED</option>
                  <option value="CNY">CNY (¥)</option>
                </select>
              </div>

              <div className="field">
                <label>Ex. Rate (PKR per {foreignCurrency})</label>
                <input
                  className="input num"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 326.00"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: MESSERS, SHIPPER & CONSIGNEE */}
          <div className="card card-pad">
            <div className="section-title">
              <span className="icon-chip"><IconPackage size={16} /></span>
              <div>
                <h3>Messers, Shipper &amp; Consignee</h3>
                <p>Parties printed in the left block of the invoice</p>
              </div>
            </div>

            <div className="field">
              <label>Messers (Client / Billing Customer)<span className="req">*</span></label>
              <select className="input" required value={customerId} onChange={(e) => handleCustomerSelect(e.target.value)}>
                <option value="">Select client (Messers)…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company ? `${c.company} (${c.name})` : c.name}
                    {c.taxNumber ? ` · NTN: ${c.taxNumber}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {customer && (
              <div className="customer-peek" style={{ flexDirection: "column", alignItems: "stretch", gap: 10, padding: "12px 16px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={customer.company || customer.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: 14 }}>{customer.company || customer.name}</b>
                    <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
                      {[customer.address, [customer.city, customer.country].filter(Boolean).join(", ")]
                        .filter(Boolean)
                        .join(" — ")}
                    </span>
                  </div>
                  <Link href={`/customers/${customer.id}`} className="btn btn-ghost btn-sm" target="_blank">
                    View
                  </Link>
                </div>
              </div>
            )}

            <div className="grid-2">
              <div className="field">
                <label>Shipper</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="e.g. HELSA KONFEKCIOIPARI KFT"
                  value={shipper}
                  onChange={(e) => setShipper(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Consignee</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="e.g. NOVA LEATHERS (PVT) LTD.\nPLOT 30, SECTOR 15, KORANGI INDUSTRIAL AREA, KARACHI"
                  value={consignee}
                  onChange={(e) => setConsignee(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: FREIGHT DOCS & CARGO SPECS */}
          <div className="card card-pad">
            <div className="section-title">
              <span className="icon-chip">
                {shipmentMode.toLowerCase() === "sea" ? <IconShip size={16} /> : <IconPlane size={16} />}
              </span>
              <div>
                <h3>{shipmentMode.toLowerCase() === "sea" ? "Sea Freight Details" : "Air Freight Details"}</h3>
                <p>Routing, AWB / B/L documentation and cargo measurements</p>
              </div>
            </div>

            {/* Air specific vs Sea specific docs */}
            {shipmentMode.toLowerCase() === "air" ? (
              <div className="grid-2">
                <div className="field">
                  <label>Master AWB</label>
                  <input
                    className="input mono"
                    placeholder="e.g. 176-61185283"
                    value={masterAwb}
                    onChange={(e) => setMasterAwb(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>House AWB</label>
                  <input
                    className="input mono"
                    placeholder="e.g. SAE26080119"
                    value={houseAwb}
                    onChange={(e) => setHouseAwb(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="grid-2">
                <div className="field">
                  <label>HBL No</label>
                  <input
                    className="input mono"
                    placeholder="e.g. 4/PKAR26082050"
                    value={hblNo}
                    onChange={(e) => setHblNo(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Container No</label>
                  <input
                    className="input mono"
                    placeholder="e.g. MSCU 482913-7"
                    value={containerNo}
                    onChange={(e) => setContainerNo(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>MBL No (optional)</label>
                  <input
                    className="input mono"
                    placeholder="e.g. MEDU1234567"
                    value={mblNo}
                    onChange={(e) => setMblNo(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Vessel Name (optional)</label>
                  <input
                    className="input"
                    placeholder="e.g. MSC RENEE"
                    value={vesselName}
                    onChange={(e) => setVesselName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Routing */}
            <div className="grid-2">
              <div className="field">
                <label>Origin</label>
                <input
                  className="input"
                  placeholder="e.g. FERIHEGY (BUD) / SHANGHAI (CNSHA)"
                  value={originPort}
                  onChange={(e) => setOriginPort(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Final Destination</label>
                <input
                  className="input"
                  placeholder="e.g. KARACHI (KHI)"
                  value={destinationPort}
                  onChange={(e) => setDestinationPort(e.target.value)}
                />
              </div>
            </div>

            {/* Cargo Specs */}
            <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
              <div className="field">
                <label>Packages</label>
                <input
                  className="input num"
                  placeholder="e.g. 32 / 4"
                  value={packages}
                  onChange={(e) => setPackages(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Chargeable Weight</label>
                <input
                  className="input num"
                  placeholder="e.g. 627"
                  value={chargeableWeight}
                  onChange={(e) => setChargeableWeight(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Gross Weight</label>
                <input
                  className="input num"
                  placeholder="e.g. 160 / 596"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                />
              </div>

              <div className="field">
                <label>CBM</label>
                <input
                  className="input num"
                  placeholder="e.g. 4.22"
                  value={cbm}
                  onChange={(e) => setCbm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: FREIGHT LINE ITEMS */}
          <div className="card">
            <div className="card-pad" style={{ paddingBottom: 12 }}>
              <div className="section-title" style={{ marginBottom: 8 }}>
                <span className="icon-chip"><IconFileText size={16} /></span>
                <div>
                  <h3>Description &amp; Charges Table</h3>
                  <p>Line items with Foreign Currency (Rate &amp; Amount) and PKR conversion</p>
                </div>
              </div>
            </div>

            <div className="table-wrap">
              <table className="data-table items-table">
                <thead>
                  <tr>
                    <th style={{ width: 32 }}>S.No</th>
                    <th>Description</th>
                    <th style={{ width: 110 }}>Rate</th>
                    <th style={{ width: 140 }}>Amount ({foreignCurrency})</th>
                    <th className="right" style={{ width: 160 }}>Amount (PKR)</th>
                    <th style={{ width: 36 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="rownum" style={{ fontWeight: 600 }}>{idx + 1}</td>
                      <td>
                        <input
                          className="input bare"
                          style={{ fontWeight: 600 }}
                          value={item.description}
                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                          placeholder="e.g. AIR FREIGHT / DO FEE / ALL IN CHARGES"
                        />
                      </td>
                      <td>
                        <input
                          className="input num"
                          type="number"
                          step="0.01"
                          placeholder="Rate"
                          value={item.rate ?? ""}
                          onChange={(e) => updateItem(item.id, { rate: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className="input num"
                          type="number"
                          step="0.01"
                          placeholder={`${foreignCurrency} Amount`}
                          value={item.foreignAmount ?? ""}
                          onChange={(e) => updateItem(item.id, { foreignAmount: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className="input num right"
                          style={{ fontWeight: 700 }}
                          type="number"
                          step="0.01"
                          placeholder="PKR Amount"
                          value={item.amount ?? ""}
                          onChange={(e) => updateItem(item.id, { amount: parseFloat(e.target.value) || 0 })}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          title="Remove line"
                        >
                          <IconX size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: "12px 20px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line-soft)" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => addItem({ description: "", rate: "", foreignAmount: "", quantity: 1, unitPrice: 0, amount: 0 })}
              >
                <IconPlus size={14} /> Add charge line
              </button>
              <span className="muted" style={{ fontSize: 13 }}>
                Total (PKR): <b className="num" style={{ color: "var(--ink)", fontSize: 15 }}>{formatCurrency(totals.total, "PKR")}</b>
              </span>
            </div>
          </div>

          {/* SECTION 5: TERMS & CONDITIONS */}
          <div className="card card-pad">
            <div className="section-title">
              <span className="icon-chip"><IconFileText size={16} /></span>
              <div>
                <h3>Terms &amp; Conditions</h3>
                <p>Printed verbatim at the bottom of the invoice</p>
              </div>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <textarea
                className="input"
                rows={4}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SUMMARY SIDEBAR */}
        <aside className="sticky" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card card-pad">
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Invoice Summary</h3>

            <div className="field">
              <label>Status</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="summary-total" style={{ margin: "14px 0" }}>
              <div className="lbl">Total (PKR)</div>
              <div className="amt" style={{ fontSize: 24, fontWeight: 800 }}>{formatCurrency(totals.total, "PKR")}</div>
            </div>

            {/* IN WORDS DISPLAY */}
            <div style={{ background: "var(--paper-sunken)", border: "1px solid var(--line-soft)", borderRadius: 8, padding: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>IN WORDS</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", marginTop: 4, lineHeight: 1.4 }}>
                {totals.words}
              </div>
            </div>

            <div className="field">
              <label>Amount paid (PKR)</label>
              <div className="input-group">
                <input
                  className="input num"
                  type="number"
                  min={0}
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  style={{ paddingRight: 90 }}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ position: "absolute", right: 4, padding: "4px 8px" }}
                  onClick={() => {
                    setAmountPaid(Math.round(totals.total * 100) / 100);
                    setStatus("PAID");
                  }}
                >
                  Paid in full
                </button>
              </div>
            </div>

            <div className="kv" style={{ fontSize: 14, marginTop: 10 }}>
              <span>Balance due</span>
              <span style={{ fontWeight: 700, color: totals.balance > 0.004 ? "var(--ink)" : "var(--success)" }}>
                {formatCurrency(Math.max(totals.balance, 0), "PKR")}
              </span>
            </div>

            {error && (
              <div className="alert alert-danger" style={{ marginTop: 14 }}>
                <IconAlert size={16} /> {error}
              </div>
            )}

            <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 16 }} disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create invoice"}
            </button>
            <button type="button" className="btn btn-ghost btn-block" style={{ marginTop: 6 }} onClick={() => router.back()}>
              Cancel
            </button>
          </div>
        </aside>
      </div>

      {toast && (
        <div className="toast">
          <IconCheck size={15} /> {toast}
        </div>
      )}
    </form>
  );
}
