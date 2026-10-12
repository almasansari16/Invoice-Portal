"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconAlert, IconBuilding, IconCheckCircle, IconInvoice, IconWallet } from "@/components/Icons";

export default function SettingsForm({ initial }: { initial: any }) {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: initial.companyName || "",
    address: initial.address || "",
    phone: initial.phone || "",
    email: initial.email || "",
    website: initial.website || "",
    taxNumber: initial.taxNumber || "",
    logoUrl: initial.logoUrl || "",
    invoicePrefix: initial.invoicePrefix || "INV",
    defaultCurrency: initial.defaultCurrency || "PKR",
    bankDetails: initial.bankDetails || "",
    footerNote: initial.footerNote || "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      setMessage("Logo should be under 1.5MB. Please choose a smaller file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set("logoUrl", reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (res.ok) {
      setMessage("Settings saved.");
      router.refresh();
    } else {
      setMessage("Could not save settings. You may need admin access.");
    }
  }

  const ok = message === "Settings saved.";
  const year = new Date().getFullYear();

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 860 }}>
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="section-title">
          <span className="icon-chip"><IconBuilding size={16} /></span>
          <div>
            <h3>Company profile</h3>
            <p>Shown in the header of every invoice</p>
          </div>
        </div>

        <div className="field">
          <label>Logo</label>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 120, height: 64, borderRadius: 10, border: "1px dashed var(--line)", background: "var(--paper-sunken)", display: "grid", placeItems: "center", overflow: "hidden", flexShrink: 0 }}>
              {form.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logoUrl} alt="Logo preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              ) : (
                <span className="muted" style={{ fontSize: 11.5 }}>No logo</span>
              )}
            </div>
            <div>
              <input className="input" type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoChange} />
              <span className="hint">PNG, JPG or SVG under 1.5MB.</span>
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Company name<span className="req">*</span></label>
            <input className="input" required value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
          </div>
          <div className="field">
            <label>Tax / NTN number</label>
            <input className="input" value={form.taxNumber} onChange={(e) => set("taxNumber", e.target.value)} />
          </div>
          <div className="field">
            <label>Phone</label>
            <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className="field">
            <label>Website</label>
            <input className="input" value={form.website} onChange={(e) => set("website", e.target.value)} />
          </div>
          <div />
          <div className="field span-2" style={{ marginBottom: 0 }}>
            <label>Address</label>
            <textarea className="input" rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="section-title">
          <span className="icon-chip"><IconInvoice size={16} /></span>
          <div>
            <h3>Invoice preferences</h3>
            <p>Numbering and defaults for new invoices</p>
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Invoice prefix</label>
            <input className="input mono" value={form.invoicePrefix} onChange={(e) => set("invoicePrefix", e.target.value)} />
            <span className="hint">
              Next numbers look like <b className="mono">{form.invoicePrefix || "INV"}-{year}-000123</b>
            </span>
          </div>
          <div className="field">
            <label>Default currency</label>
            <select className="input" value={form.defaultCurrency} onChange={(e) => set("defaultCurrency", e.target.value)}>
              <option value="PKR">PKR — Pakistani Rupee</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </div>
          <div className="field span-2" style={{ marginBottom: 0 }}>
            <label>Footer note</label>
            <input className="input" value={form.footerNote} onChange={(e) => set("footerNote", e.target.value)} placeholder="Thank you for your business." />
          </div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="section-title">
          <span className="icon-chip"><IconWallet size={16} /></span>
          <div>
            <h3>Payment details</h3>
            <p>Bank account info printed on invoices</p>
          </div>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <textarea className="input mono" rows={4} value={form.bankDetails} onChange={(e) => set("bankDetails", e.target.value)} placeholder={"Bank: Meezan Bank\nTitle: Your Company (Pvt) Ltd\nIBAN: PK00 MEZN 0000 0000 0000 0000"} />
        </div>
      </div>

      {message && (
        <div className={`alert ${ok ? "alert-success" : "alert-danger"}`} style={{ marginBottom: 16 }}>
          {ok ? <IconCheckCircle size={16} /> : <IconAlert size={16} />} {message}
        </div>
      )}

      <button className="btn btn-primary" disabled={saving}>
        {saving ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
