"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IconAlert, IconArrowRight, IconLock, IconMail, IconShip } from "@/components/Icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="auth">
      <div className="auth-art">
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, color: "#fff" }}>
          <span className="brand-mark">
            <IconShip size={18} />
          </span>
          Invoicing
        </div>

        <div>
          <h2>Bill every shipment in minutes, not hours.</h2>
          <p>
            Create professional freight invoices in PKR or USD, track what&apos;s outstanding and
            export everything for your accountant.
          </p>

          <div className="mock-invoice">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>INV-2026-000148</span>
              <span className="badge" style={{ background: "#05966922", color: "#6ee7b7" }}>
                <span className="dot" /> Paid
              </span>
            </div>
            <div className="row"><span>Ocean Freight 40&apos; HC · KHI → JEA</span><span>$ 2,450.00</span></div>
            <div className="row"><span>Terminal Handling Charges</span><span>$ 310.00</span></div>
            <div className="row"><span>Customs Clearance</span><span>$ 185.00</span></div>
            <div className="row" style={{ color: "#fff", fontWeight: 700 }}><span>Total</span><span>$ 2,945.00</span></div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: "#64748b" }}>© {new Date().getFullYear()} Invoicing System</div>
      </div>

      <div className="auth-form">
        <div className="inner">
          <h1 style={{ fontSize: 26 }}>Welcome back</h1>
          <p className="muted" style={{ marginTop: 6, marginBottom: 28 }}>
            Sign in to manage customers and invoices.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email address</label>
              <div className="input-group">
                <span className="adorn"><IconMail size={16} /></span>
                <input
                  className="input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoFocus
                  style={{ padding: "11px 12px 11px 36px" }}
                />
              </div>
            </div>
            <div className="field" style={{ marginBottom: 20 }}>
              <label>Password</label>
              <div className="input-group">
                <span className="adorn"><IconLock size={16} /></span>
                <input
                  className="input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ padding: "11px 12px 11px 36px" }}
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-danger" style={{ marginBottom: 16 }}>
                <IconAlert size={16} /> {error}
              </div>
            )}

            <button className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? "Signing in…" : <>Sign in <IconArrowRight size={16} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
