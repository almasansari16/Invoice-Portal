"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { QUICK_CHARGES, SAMPLE_TEMPLATES, SampleTemplate } from "@/lib/sample-invoices";
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
  email?: string | null;
  city?: string | null;
  country?: string | null;
};

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

type InvoiceInitial = {
  id?: string;
  customerId?: string;
  invoiceDate?: string;
  dueDate?: string | null;
  currency?: "USD" | "PKR";
  exchangeRate?: number | null;
  status?: string;
  originPort?: string | null;
  destinationPort?: string | null;
  shipmentMode?: string | null;
  containerNo?: string | null;
  trackingNo?: string | null;
  weight?: string | null;
  shippingDate?: string | null;
  discount?: number;
  taxPercent?: number;
  amountPaid?: number;
  notes?: string | null;
  terms?: string | null;
  items?: LineItem[];
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
];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "CANCELLED", label: "Cancelled" },
];

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

  const [customerId, setCustomerId] = useState(initial?.customerId || "");
  const [invoiceDate, setInvoiceDate] = useState(
    initial?.invoiceDate?.slice(0, 10) || isoDay(new Date())
  );
  const [dueDate, setDueDate] = useState(initial?.dueDate?.slice(0, 10) || "");
  const [currency, setCurrency] = useState<"USD" | "PKR">(initial?.currency || defaultCurrency);
  const [exchangeRate, setExchangeRate] = useState(initial?.exchangeRate?.toString() || "");
  const [status, setStatus] = useState(initial?.status || "DRAFT");

  const [originPort, setOriginPort] = useState(initial?.originPort || "");
  const [destinationPort, setDestinationPort] = useState(initial?.destinationPort || "");
  const [shipmentMode, setShipmentMode] = useState(initial?.shipmentMode || "");
  const [containerNo, setContainerNo] = useState(initial?.containerNo || "");
  const [trackingNo, setTrackingNo] = useState(initial?.trackingNo || "");
  const [weight, setWeight] = useState(initial?.weight || "");
  const [shippingDate, setShippingDate] = useState(initial?.shippingDate?.slice(0, 10) || "");

  const [items, setItems] = useState<LineItem[]>(
    initial?.items && initial.items.length > 0
      ? initial.items.map((i) => ({ ...i, id: i.id || newId() }))
      : [{ id: newId(), description: "", quantity: 1, unitPrice: 0 }]
  );

  const [discount, setDiscount] = useState(initial?.discount || 0);
  const [taxPercent, setTaxPercent] = useState(initial?.taxPercent || 0);
  const [amountPaid, setAmountPaid] = useState(initial?.amountPaid || 0);
  const [notes, setNotes] = useState(initial?.notes || "");
  const [terms, setTerms] = useState(initial?.terms || "");

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
    const subtotal = items.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || 0), 0);
    const afterDiscount = Math.max(subtotal - (Number(discount) || 0), 0);
    const taxAmount = (afterDiscount * (Number(taxPercent) || 0)) / 100;
    const total = afterDiscount + taxAmount;
    const balance = total - (Number(amountPaid) || 0);
    return { subtotal, afterDiscount, taxAmount, total, balance };
  }, [items, discount, taxPercent, amountPaid]);

  const selectedTerm = dueDate
    ? PAYMENT_TERMS.find((t) => addDays(invoiceDate, t.days) === dueDate)
    : undefined;

  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  function addItem(item?: Omit<LineItem, "id">) {
    const row = { id: newId(), description: "", quantity: 1, unitPrice: 0, ...item };
    setItems((prev) => {
      // replace a single blank starter row instead of appending below it
      if (item && prev.length === 1 && !prev[0].description.trim() && !prev[0].unitPrice) return [row];
      return [...prev, row];
    });
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

    setInvoiceDate(today);
    setDueDate(addDays(today, t.dueInDays));
    setCurrency(t.currency);
    setExchangeRate(t.exchangeRate ? String(t.exchangeRate) : "");
    setStatus(t.status);
    setShipmentMode(t.mode);
    setOriginPort(t.originPort);
    setDestinationPort(t.destinationPort);
    setContainerNo(t.containerNo);
    setTrackingNo(t.trackingNo);
    setWeight(t.weight);
    setShippingDate(addDays(today, -t.shippedDaysAgo));
    setItems(t.items.map((i) => ({ ...i, id: newId() })));
    setDiscount(t.discount);
    setTaxPercent(t.taxPercent);
    setAmountPaid(t.amountPaid);
    setNotes(t.notes);
    setTerms(t.terms);
    setError("");
    setToast(
      pick
        ? `Loaded "${t.title}" for ${pick.company || pick.name}`
        : `Loaded "${t.title}" — add a customer before saving`
    );
  }

  function resetForm() {
    setCustomerId("");
    setInvoiceDate(isoDay(new Date()));
    setDueDate("");
    setCurrency(defaultCurrency);
    setExchangeRate("");
    setStatus("DRAFT");
    setShipmentMode("");
    setOriginPort("");
    setDestinationPort("");
    setContainerNo("");
    setTrackingNo("");
    setWeight("");
    setShippingDate("");
    setItems([{ id: newId(), description: "", quantity: 1, unitPrice: 0 }]);
    setDiscount(0);
    setTaxPercent(0);
    setAmountPaid(0);
    setNotes("");
    setTerms("");
    setError("");
    setToast("Form cleared");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }
    const cleanItems = items
      .filter((i) => i.description.trim())
      .map((i) => ({
        description: i.description,
        quantity: Number(i.quantity) || 0,
        unitPrice: Number(i.unitPrice) || 0,
      }));
    if (cleanItems.length === 0) {
      setError("Add at least one line item.");
      return;
    }
    if (cleanItems.some((i) => i.quantity <= 0)) {
      setError("Every line item needs a quantity greater than zero.");
      return;
    }

    setSaving(true);

    const payload = {
      customerId,
      invoiceDate,
      dueDate: dueDate || null,
      currency,
      exchangeRate: exchangeRate ? Number(exchangeRate) : null,
      status,
      originPort: originPort || null,
      destinationPort: destinationPort || null,
      shipmentMode: shipmentMode || null,
      containerNo: containerNo || null,
      trackingNo: trackingNo || null,
      weight: weight || null,
      shippingDate: shippingDate || null,
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

    setSaving(false);

    if (!res.ok) {
      setError("Could not save invoice. Check the fields and try again.");
      return;
    }

    const data = await res.json();
    router.push(`/invoices/${data.id}`);
    router.refresh();
  }

  const modes = [
    { value: "Sea", icon: <IconShip size={15} /> },
    { value: "Air", icon: <IconPlane size={15} /> },
    { value: "Road", icon: <IconTruck size={15} /> },
  ];

  return (
    <form onSubmit={handleSubmit}>
      {/* toolbar */}
      <div className="card" style={{ padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span className="stat-icon" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>
          <IconSparkles size={17} />
        </span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontWeight: 600, fontSize: 13.5 }}>Start from a sample</div>
          <div className="muted" style={{ fontSize: 12.5 }}>
            Pre-fill realistic freight data to try the flow, then tweak anything you like.
          </div>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={resetForm}>
          <IconRefresh size={14} /> Clear
        </button>
        <div className="menu-wrap" ref={menuRef}>
          <button type="button" className="btn btn-soft btn-sm" onClick={() => setMenuOpen((o) => !o)}>
            <IconSparkles size={14} /> Fill sample data
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
                        : t.mode === "Road"
                        ? { background: "#fff7ed", color: "#c2410c" }
                        : t.key === "customs"
                        ? { background: "#ecfdf5", color: "#047857" }
                        : { background: "#eef2ff", color: "#3b5bdb" }
                    }
                  >
                    {t.mode === "Air" ? <IconPlane size={15} /> : t.mode === "Road" ? <IconTruck size={15} /> : t.key === "customs" ? <IconFileText size={15} /> : <IconShip size={15} />}
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
          {/* bill to + dates */}
          <div className="card card-pad">
            <div className="section-title">
              <span className="icon-chip"><IconInvoice size={16} /></span>
              <div>
                <h3>Invoice details</h3>
                <p>Who you&apos;re billing and when payment is due</p>
              </div>
            </div>

            <div className="field">
              <label>Bill to<span className="req">*</span></label>
              <select className="input" required value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Select a customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.company ? ` — ${c.company}` : ""}
                  </option>
                ))}
              </select>
              {customers.length === 0 && (
                <span className="hint">
                  No customers yet. <Link href="/customers/new" className="link">Add a customer</Link> first.
                </span>
              )}
            </div>

            {customer && (
              <div className="customer-peek">
                <Avatar name={customer.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b>{customer.company || customer.name}</b>
                  <span>
                    {[customer.company ? customer.name : null, customer.email, [customer.city, customer.country].filter(Boolean).join(", ")]
                      .filter(Boolean)
                      .join(" · ") || "No contact details"}
                  </span>
                </div>
                <Link href={`/customers/${customer.id}`} className="btn btn-ghost btn-sm" target="_blank">
                  View
                </Link>
              </div>
            )}

            <div className="grid-2">
              <div className="field">
                <label>Invoice date<span className="req">*</span></label>
                <input className="input" type="date" required value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
              </div>
              <div className="field">
                <label>Due date</label>
                <input className="input" type="date" value={dueDate} min={invoiceDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            <div className="field" style={{ marginTop: -4 }}>
              <div className="chips">
                {PAYMENT_TERMS.map((t) => (
                  <button
                    type="button"
                    key={t.label}
                    className="chip"
                    style={selectedTerm?.label === t.label ? { borderStyle: "solid", borderColor: "var(--brand)", color: "var(--brand)", background: "var(--brand-soft)" } : undefined}
                    onClick={() => setDueDate(addDays(invoiceDate, t.days))}
                  >
                    {selectedTerm?.label === t.label && <IconCheck size={12} />}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Currency<span className="req">*</span></label>
                <div className="segmented" style={{ display: "flex" }}>
                  {(["PKR", "USD"] as const).map((c) => (
                    <button type="button" key={c} className={currency === c ? "on" : ""} style={{ flex: 1, justifyContent: "center" }} onClick={() => setCurrency(c)}>
                      {c === "PKR" ? "Rs  PKR" : "$  USD"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Exchange rate</label>
                <div className="input-group">
                  <input
                    className="input"
                    type="number"
                    step="0.0001"
                    min={0}
                    placeholder="e.g. 278.50"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    style={{ paddingRight: 90 }}
                  />
                  <span className="suffix">PKR / USD</span>
                </div>
              </div>
            </div>
          </div>

          {/* shipment */}
          <div className="card card-pad">
            <div className="section-title">
              <span className="icon-chip"><IconPackage size={16} /></span>
              <div>
                <h3>Shipment details</h3>
                <p>Optional — printed on the invoice when filled in</p>
              </div>
            </div>

            <div className="field">
              <label>Mode of transport</label>
              <div className="segmented" style={{ alignSelf: "flex-start" }}>
                {modes.map((m) => (
                  <button
                    type="button"
                    key={m.value}
                    className={shipmentMode === m.value ? "on" : ""}
                    onClick={() => setShipmentMode(shipmentMode === m.value ? "" : m.value)}
                  >
                    {m.icon} {m.value}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Origin</label>
                <input className="input" placeholder="e.g. Karachi (PKKHI)" value={originPort} onChange={(e) => setOriginPort(e.target.value)} />
              </div>
              <div className="field">
                <label>Destination</label>
                <input className="input" placeholder="e.g. Jebel Ali (AEJEA)" value={destinationPort} onChange={(e) => setDestinationPort(e.target.value)} />
              </div>
              <div className="field">
                <label>Container no.</label>
                <input className="input" placeholder="e.g. MSCU 482913-7" value={containerNo} onChange={(e) => setContainerNo(e.target.value)} />
              </div>
              <div className="field">
                <label>Tracking / AWB / B/L no.</label>
                <input className="input" placeholder="e.g. MEDUKH2409183" value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)} />
              </div>
              <div className="field">
                <label>Weight</label>
                <input className="input" placeholder="e.g. 240 kg" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
              <div className="field">
                <label>Shipping date</label>
                <input className="input" type="date" value={shippingDate} onChange={(e) => setShippingDate(e.target.value)} />
              </div>
            </div>
          </div>

          {/* line items */}
          <div className="card">
            <div className="card-pad" style={{ paddingBottom: 12 }}>
              <div className="section-title" style={{ marginBottom: 12 }}>
                <span className="icon-chip"><IconFileText size={16} /></span>
                <div>
                  <h3>Line items</h3>
                  <p>Click a common charge to add it, or add a blank line</p>
                </div>
              </div>
              <div className="chips">
                {QUICK_CHARGES.map((c) => (
                  <button
                    type="button"
                    key={c.label}
                    className="chip"
                    onClick={() => addItem({ description: c.label, quantity: 1, unitPrice: currency === "USD" ? c.usd : c.pkr })}
                  >
                    <IconPlus size={12} /> {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-wrap">
              <table className="data-table items-table">
                <thead>
                  <tr>
                    <th style={{ width: 28 }}>#</th>
                    <th>Description</th>
                    <th style={{ width: 110 }}>Qty</th>
                    <th style={{ width: 150 }}>Rate ({currency})</th>
                    <th className="right" style={{ width: 150 }}>Amount</th>
                    <th style={{ width: 44 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="rownum">{idx + 1}</td>
                      <td>
                        <input
                          className="input bare"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                          placeholder="Freight charges, handling, etc."
                        />
                      </td>
                      <td>
                        <input
                          className="input num"
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                        />
                      </td>
                      <td>
                        <input
                          className="input num"
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                        />
                      </td>
                      <td className="right num" style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                        {formatCurrency(item.quantity * item.unitPrice, currency)}
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
            <div style={{ padding: "12px 22px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line-soft)" }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => addItem()}>
                <IconPlus size={14} /> Add line
              </button>
              <span className="muted" style={{ fontSize: 13 }}>
                {items.length} line{items.length === 1 ? "" : "s"} · Subtotal{" "}
                <b className="num" style={{ color: "var(--ink)" }}>{formatCurrency(totals.subtotal, currency)}</b>
              </span>
            </div>
          </div>

          {/* notes */}
          <div className="card card-pad">
            <div className="section-title">
              <span className="icon-chip"><IconFileText size={16} /></span>
              <div>
                <h3>Notes &amp; terms</h3>
                <p>Shown at the bottom of the invoice</p>
              </div>
            </div>
            <div className="field">
              <label>Notes to customer</label>
              <textarea className="input" rows={3} placeholder="Cargo description, vessel/flight details, thank-you note…" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Terms &amp; conditions</label>
              <textarea className="input" rows={3} placeholder="Payment terms, late fees, liability…" value={terms} onChange={(e) => setTerms(e.target.value)} />
            </div>
          </div>
        </div>

        {/* summary sidebar */}
        <aside className="sticky" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card card-pad">
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Summary</h3>

            <div className="field">
              <label>Status</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Discount</label>
                <div className="input-group">
                  <input className="input num" type="number" min={0} step="0.01" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} style={{ paddingRight: 38 }} />
                  <span className="suffix">{currency === "USD" ? "$" : "Rs"}</span>
                </div>
              </div>
              <div className="field">
                <label>Tax</label>
                <div className="input-group">
                  <input className="input num" type="number" min={0} step="0.01" value={taxPercent} onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)} style={{ paddingRight: 30 }} />
                  <span className="suffix">%</span>
                </div>
              </div>
            </div>

            <div className="divider" style={{ marginTop: 2 }} />
            <div className="kv"><span>Subtotal</span><span>{formatCurrency(totals.subtotal, currency)}</span></div>
            {Number(discount) > 0 && (
              <div className="kv"><span>Discount</span><span style={{ color: "var(--success)" }}>− {formatCurrency(Number(discount), currency)}</span></div>
            )}
            <div className="kv"><span>Tax ({Number(taxPercent) || 0}%)</span><span>{formatCurrency(totals.taxAmount, currency)}</span></div>

            <div className="summary-total">
              <div className="lbl">Invoice total · {currency}</div>
              <div className="amt">{formatCurrency(totals.total, currency)}</div>
              {currency === "USD" && Number(exchangeRate) > 0 && (
                <div className="lbl" style={{ marginTop: 2 }}>
                  ≈ {formatCurrency(totals.total * Number(exchangeRate), "PKR")}
                </div>
              )}
            </div>

            <div className="field" style={{ marginTop: 16 }}>
              <label>Amount paid</label>
              <div className="input-group">
                <input className="input num" type="number" min={0} step="0.01" value={amountPaid} onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)} style={{ paddingRight: 90 }} />
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
            <div className="kv" style={{ fontSize: 14 }}>
              <span>Balance due</span>
              <span style={{ color: totals.balance > 0.004 ? "var(--ink)" : "var(--success)" }}>
                {formatCurrency(Math.max(totals.balance, 0), currency)}
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
            {!isEdit && (
              <p className="muted" style={{ fontSize: 11.5, textAlign: "center", marginTop: 8 }}>
                The invoice number is generated automatically when you save.
              </p>
            )}
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
