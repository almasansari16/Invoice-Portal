import Link from "next/link";
import { IconAlert, IconArrowLeft } from "@/components/Icons";

export default function NotFound() {
  return (
    <div style={{ minHeight: "80vh", display: "grid", placeItems: "center", padding: "40px 20px", textAlign: "center" }}>
      <div style={{ maxWidth: 440 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--brand-soft)", color: "var(--brand)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
          <IconAlert size={28} />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Page Not Found</h1>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/dashboard" className="btn btn-primary">
          <IconArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
