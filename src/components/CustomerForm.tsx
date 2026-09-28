"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconAlert, IconBuilding, IconMapPin, IconSparkles } from "@/components/Icons";

const SAMPLE_CUSTOMERS: Customer[] = [
  { name: "Omar Siddiqui", company: "Siddiqui Surgical Exports", email: "omar@siddiquisurgical.pk", phone: "+92 52 3551 208", address: "Plot 14, Small Industrial Estate, Ugoki Road", city: "Sialkot", country: "Pakistan", taxNumber: "4471902-3", notes: "Ships surgical instruments to Germany by air, monthly." },
  { name: "Laura Becker", company: "Becker Import GmbH", email: "l.becker@becker-import.de", phone: "+49 40 3890 1144", address: "Grosse Elbstrasse 212", city: "Hamburg", country: "Germany", taxNumber: "DE 298 114 553", notes: "Consignee for FCL sea shipments. Prefers invoices in USD." },
  { name: "Hina Qureshi", company: "Qureshi Rice Mills", email: "accounts@qureshirice.com", phone: "+92 42 3578 9910", address: "22-km Sheikhupura Road", city: "Lahore", country: "Pakistan", taxNumber: "3320145-8", notes: "Basmati rice exporter. 30-day credit approved." },
];


type Customer = {
  id?: string;
  name?: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  taxNumber?: string | null;
  notes?: string | null;
};

export default function CustomerForm({ initial }: { initial?: Customer }) {
  const router = useRouter();
  const [form, setForm] = useState<Customer>(
    initial || {
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      taxNumber: "",
      notes: "",
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof Customer>(key: K, value: Customer[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = initial?.id ? `/api/customers/${initial.id}` : "/api/customers";
    const method = initial?.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
    setError("");
  }

  const text = (key: keyof Customer, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="field">
      <label>
        {label}
        {props.required && <span className="req">*</span>}
      </label>
      <input className="input" value={(form[key] as string) || ""} onChange={(e) => set(key, e.target.value)} {...props} />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 820 }}>
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="icon-chip"><IconBuilding size={16} /></span>
            <div>
              <h3>Customer</h3>
              <p>Name, company and how to reach them</p>
            </div>
          </div>
          {!initial?.id && (
            <button type="button" className="btn btn-soft btn-sm" onClick={fillSample}>
              <IconSparkles size={14} /> Fill sample
            </button>
          )}
        </div>
        <div className="grid-2">
          {text("name", "Contact name", { required: true, placeholder: "e.g. Ahmed Raza" })}
          {text("company", "Company", { placeholder: "e.g. Raza Textiles (Pvt) Ltd" })}
          {text("email", "Email", { type: "email", placeholder: "accounts@company.com" })}
          {text("phone", "Phone", { placeholder: "+92 300 1234567" })}
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="section-title">
          <span className="icon-chip"><IconMapPin size={16} /></span>
          <div>
            <h3>Address &amp; tax</h3>
            <p>Printed in the &quot;Bill to&quot; block of invoices</p>
          </div>
        </div>
        <div className="grid-2">
          <div className="field span-2">
            <label>Street address</label>
            <textarea className="input" rows={2} value={form.address || ""} onChange={(e) => set("address", e.target.value)} />
          </div>
          {text("city", "City")}
          {text("country", "Country")}
          {text("taxNumber", "Tax / NTN number")}
          <div />
          <div className="field span-2" style={{ marginBottom: 0 }}>
            <label>Internal notes</label>
            <textarea className="input" rows={2} placeholder="Not shown on invoices" value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} />
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
