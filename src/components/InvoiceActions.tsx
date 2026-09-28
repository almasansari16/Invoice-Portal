"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconDownload, IconEdit, IconPrinter, IconTrash } from "@/components/Icons";

export default function InvoiceActions({ invoiceId, status }: { invoiceId: string; status: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this invoice permanently? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      router.push("/invoices");
      router.refresh();
    } else {
      alert("Could not delete invoice.");
    }
  }

  return (
    <div className="no-print actions">
      <button className="btn btn-secondary" onClick={() => window.print()}>
        <IconPrinter size={15} /> Print
      </button>
      <a className="btn btn-secondary" href={`/api/invoices/${invoiceId}/pdf`} target="_blank" rel="noreferrer">
        <IconDownload size={15} /> PDF
      </a>
      <button className="btn btn-danger btn-icon" onClick={handleDelete} disabled={deleting} title="Delete invoice">
        <IconTrash size={16} />
      </button>
      <Link href={`/invoices/${invoiceId}/edit`} className="btn btn-primary">
        <IconEdit size={15} /> {status === "DRAFT" ? "Continue editing" : "Edit"}
      </Link>
    </div>
  );
}
