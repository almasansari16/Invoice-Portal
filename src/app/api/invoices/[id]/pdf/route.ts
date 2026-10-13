import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoiceDocument } from "@/lib/pdf/InvoiceDocument";
import React from "react";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { items: { orderBy: { sortOrder: "asc" } }, customer: true },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = (session.user as any).role === "ADMIN";
  const userId = (session.user as any).id;
  if (!isAdmin && invoice.createdById !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const company = await prisma.companySettings.findFirst();

  // Prisma returns Decimal objects for money/qty fields; React can't render those as
  // text children, so serialize to plain strings/numbers before rendering.
  const buffer = await renderToBuffer(
    React.createElement(InvoiceDocument, {
      invoice: JSON.parse(JSON.stringify(invoice)),
      company: JSON.parse(JSON.stringify(company)),
    }) as any
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`,
    },
  });
}
