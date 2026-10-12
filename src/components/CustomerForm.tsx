"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconAlert,
  IconBuilding,
  IconFileText,
  IconMapPin,
  IconSparkles,
  IconWallet,
} from "@/components/Icons";

export type CustomerData = {
  id?: string;
  name?: string;
  company?: string | null;
  customerType?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  shippingAddress?: string | null;
  taxNumber?: string | null; // NTN
  strn?: string | null;      // STRN (Sales Tax)
  cnic?: string | null;      // CNIC
  defaultPaymentTerms?: string | null;
  preferredCurrency?: "PKR" | "USD";
  notes?: string | null;
};

const SAMPLE_CUSTOMERS: CustomerData[] = [
  {
    name: "Omar Siddiqui",
    company: "Siddiqui Surgical Exports (Pvt) Ltd",
    customerType: "Corporate (Pvt Ltd / Ltd)",
    email: "omar@siddiquisurgical.pk",
    phone: "+92 52 3551 208",
    address: "Plot 14, Small Industrial Estate, Ugoki Road",
    city: "Sialkot",
    state: "Punjab",
    postalCode: "51310",
    country: "Pakistan",
    shippingAddress: "Cargo Warehouse 3, Sialkot International Airport (SKT), Sialkot",
    taxNumber: "4471902-3",
    strn: "24-00-4471-902-19",
    cnic: "34502-1234567-3",
    defaultPaymentTerms: "Net 30",
    preferredCurrency: "PKR",
    notes: "Top exporter of surgical instruments. Ships monthly air freight consignments.",
  },
  {
    name: "Laura Becker",
    company: "Becker Import GmbH",
    customerType: "Corporate (Pvt Ltd / Ltd)",
    email: "l.becker@becker-import.de",
    phone: "+49 40 3890 1144",
    address: "Grosse Elbstrasse 212",
    city: "Hamburg",
    state: "Hamburg",
    postalCode: "22767",
    country: "Germany",
    shippingAddress: "Terminal Altenwerder, Am Ballinkai 1, 21129 Hamburg, Germany",
    taxNumber: "DE 298 114 553",
    strn: "",
    cnic: "",
    defaultPaymentTerms: "Net 15",
    preferredCurrency: "USD",
    notes: "Consignee for sea freight FCL shipments. Invoices billed in USD.",
  },
  {
    name: "Hina Qureshi",
    company: "Qureshi Rice Mills",
    customerType: "Partnership / AOP",
    email: "accounts@qureshirice.com",
    phone: "+92 42 3578 9910",
    address: "22-km Sheikhupura Road",
    city: "Lahore",
    state: "Punjab",
    postalCode: "54000",
    country: "Pakistan",
    shippingAddress: "Qureshi Mill Storage Complex, Faisalabad Bypass, Sheikhupura",
    taxNumber: "3320145-8",
    strn: "03-02-3320-145-11",
    cnic: "35201-9876543-2",
    defaultPaymentTerms: "Net 30",
    preferredCurrency: "PKR",
    notes: "Basmati rice exporter. Approved 30-day corporate credit limit.",
  },
  {
    name: "Tariq Mahmood",
    company: "Mahmood & Sons Trading Co.",
    customerType: "Sole Proprietor / Individual",
    email: "tariq@mahmoodtrading.com",
    phone: "+92 21 3241 8890",
    address: "Shop 12, Cloth Market, M.A. Jinnah Road",
    city: "Karachi",
    state: "Sindh",
    postalCode: "74000",
    country: "Pakistan",
    shippingAddress: "",
    taxNumber: "1894520-1",
    strn: "11-00-1894-520-22",
    cnic: "42101-5678912-1",
    defaultPaymentTerms: "On receipt",
    preferredCurrency: "PKR",
    notes: "Local textiles buyer and wholesale distributor.",
  },
];

const CUSTOMER_TYPES = [
  "Corporate (Pvt Ltd / Ltd)",
  "Sole Proprietor / Individual",
  "Partnership / AOP",
  "Exporter / Importer",
  "Government / Semi-Govt",
  "Unregistered / Walk-in",
];

const PAYMENT_TERMS = [
  "On receipt",
  "Net 7",
  "Net 15",
  "Net 30",
  "Net 45",
  "Net 60",
];

export default function CustomerForm({ initial }: { initial?: CustomerData }) {
  const router = useRouter();
  const [form, setForm] = useState<CustomerData>(
    initial || {
      name: "",
      company: "",
      customerType: "Corporate (Pvt Ltd / Ltd)",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "Pakistan",
      postalCode: "",
      shippingAddress: "",
      taxNumber: "",
      strn: "",
      cnic: "",
      defaultPaymentTerms: "Net 30",
      preferredCurrency: "PKR",
      notes: "",
    }
  );

  const [sameAsBilling, setSameAsBilling] = useState<boolean>(
    !initial?.shippingAddress || initial.shippingAddress.trim() === ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof CustomerData>(key: K, value: CustomerData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      shippingAddress: sameAsBilling ? null : form.shippingAddress,
    };

    const url = initial?.id ? `/api/customers/${initial.id}` : "/api/customers";
    const method = initial?.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      setError("Could not save customer. Check the fields and try again.");
      return;
    }

    const data = await res.json();
    router.push(`/customers/${data.id}`);
    router.refresh();
  }

  function fillSample() {
    const pick = SAMPLE_CUSTOMERS[Math.floor(Math.random() * SAMPLE_CUSTOMERS.length)];
    setForm({ ...pick });
    setSameAsBilling(!pick.shippingAddress);
    setError("");
  }

  const text = (
    key: keyof CustomerData,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {}
  ) => (
    <div className="field">
      <label>
        {label}
        {props.required && <span className="req">*</span>}
      </label>
      <input
        className="input"
        value={(form[key] as string) || ""}
        onChange={(e) => set(key, e.target.value as any)}
        {...props}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 860 }}>
      {/* 1. Basic & Company Information */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="icon-chip"><IconBuilding size={16} /></span>
            <div>
              <h3>Customer &amp; Company Info</h3>
              <p>Primary business identity and contact details</p>
            </div>
          </div>
          {!initial?.id && (
            <button type="button" className="btn btn-soft btn-sm" onClick={fillSample}>
              <IconSparkles size={14} /> Fill sample
            </button>
          )}
        </div>

        <div className="grid-2">
          {text("company", "Company / Business name", { placeholder: "e.g. Indus Goods (Pvt) Ltd" })}
          {text("name", "Contact person name", { required: true, placeholder: "e.g. Muhammad Bilal" })}

          <div className="field">
            <label>Customer / Business type</label>
            <select
              className="input"
              value={form.customerType || ""}
              onChange={(e) => set("customerType", e.target.value)}
            >
              <option value="">Select type…</option>
              {CUSTOMER_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {text("email", "Email address", { type: "email", placeholder: "accounts@company.com" })}
          {text("phone", "Phone / Mobile / WhatsApp", { placeholder: "+92 300 1234567" })}
        </div>
      </div>

      {/* 2. Tax & Legal Registration Details */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="section-title">
          <span className="icon-chip" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>
            <IconFileText size={16} />
          </span>
          <div>
            <h3>Tax &amp; Legal Registration</h3>
            <p>Printed on tax invoices, sales tax reports &amp; FBR compliance</p>
          </div>
        </div>

        <div className="grid-3">
          {text("taxNumber", "NTN (National Tax No)", { placeholder: "e.g. 1234567-8" })}
          {text("strn", "STRN / Sales Tax No", { placeholder: "e.g. 12-34-5678-901-23" })}
          {text("cnic", "CNIC (For Sole Prop / Indv)", { placeholder: "e.g. 42101-1234567-1" })}
        </div>
      </div>

      {/* 3. Addresses: Billing & Shipping */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="section-title">
          <span className="icon-chip"><IconMapPin size={16} /></span>
          <div>
            <h3>Billing &amp; Shipping Addresses</h3>
            <p>Appears in the &quot;Bill To&quot; and delivery section of invoices</p>
          </div>
        </div>

        <div className="grid-2">
          <div className="field span-2">
            <label>Billing street address</label>
            <textarea
              className="input"
              rows={2}
              placeholder="e.g. Office #402, 4th Floor, Business Avenue, Shahrah-e-Faisal"
              value={form.address || ""}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>

          {text("city", "City", { placeholder: "e.g. Karachi, Lahore, Sialkot" })}
          {text("state", "State / Province", { placeholder: "e.g. Sindh, Punjab, Federal" })}
          {text("postalCode", "Postal / ZIP code", { placeholder: "e.g. 74200" })}
          {text("country", "Country", { placeholder: "e.g. Pakistan" })}

          <div className="span-2" style={{ marginTop: 8, marginBottom: 8, padding: "12px 14px", background: "var(--paper-sunken)", borderRadius: 8, border: "1px solid var(--line-soft)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 600, fontSize: 13.5, margin: 0 }}>
              <input
                type="checkbox"
                checked={sameAsBilling}
                onChange={(e) => setSameAsBilling(e.target.checked)}
                style={{ width: 16, height: 16, cursor: "pointer" }}
              />
              Shipping address is the same as billing address
            </label>
          </div>

          {!sameAsBilling && (
            <div className="field span-2">
              <label>Shipping / Delivery address</label>
              <textarea
                className="input"
                rows={2}
                placeholder="e.g. Factory gate 2, Port Qasim Industrial Zone, Karachi"
                value={form.shippingAddress || ""}
                onChange={(e) => set("shippingAddress", e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. Invoicing Defaults & Financial Preferences */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="section-title">
          <span className="icon-chip"><IconWallet size={16} /></span>
          <div>
            <h3>Invoicing Preferences</h3>
            <p>Default terms applied automatically when creating new invoices for this customer</p>
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Default payment terms</label>
            <select
              className="input"
              value={form.defaultPaymentTerms || "Net 30"}
              onChange={(e) => set("defaultPaymentTerms", e.target.value)}
            >
              {PAYMENT_TERMS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Preferred currency</label>
            <select
              className="input"
              value={form.preferredCurrency || "PKR"}
              onChange={(e) => set("preferredCurrency", e.target.value as "PKR" | "USD")}
            >
              <option value="PKR">PKR — Pakistani Rupee (Rs)</option>
              <option value="USD">USD — US Dollar ($)</option>
            </select>
          </div>

          <div className="field span-2" style={{ marginBottom: 0 }}>
            <label>Internal notes</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Internal business comments or credit notes (Not shown on invoice PDF)"
              value={form.notes || ""}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          <IconAlert size={16} /> {error}
        </div>
      )}

      <div className="actions">
        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : initial?.id ? "Save changes" : "Add customer"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}

