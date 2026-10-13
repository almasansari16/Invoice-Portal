import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      customer: true,
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = (session.user as any).role === "ADMIN";
  const userId = (session.user as any).id;
  if (!isAdmin && invoice.createdById !== userId) {
    return NextResponse.json(
      { error: "Forbidden: You can only view your own invoices" },
      { status: 403 }
    );
  }

  return NextResponse.json(invoice);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.invoice.findUnique({
    where: { id: params.id },
    select: { createdById: true },
  });

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = (session.user as any).role === "ADMIN";
  const userId = (session.user as any).id;
  if (!isAdmin && existing.createdById !== userId) {
    return NextResponse.json(
      { error: "Forbidden: You can only edit your own invoices" },
      { status: 403 }
    );
  }

  try {
    const data = await req.json();

    const targetInvoiceNumber = data.invoiceNumber?.trim();
    if (targetInvoiceNumber) {
      const duplicate = await prisma.invoice.findFirst({
        where: {
          invoiceNumber: targetInvoiceNumber,
          id: { not: params.id },
        },
      });
      if (duplicate) {
        return NextResponse.json(
          {
            error: `Bill No "${targetInvoiceNumber}" is already in use by another invoice. Please choose a different number or click Auto.`,
          },
          { status: 400 }
        );
      }
    }

    const subtotal = data.items.reduce(
      (s: number, i: any) =>
        s + (Number(i.amount) || Number(i.quantity) * Number(i.unitPrice) || 0),
      0
    );
    const afterDiscount = Math.max(subtotal - (data.discount || 0), 0);
    const taxAmount = (afterDiscount * (data.taxPercent || 0)) / 100;
    const total = afterDiscount + taxAmount;

    // Use transaction to ensure deleteMany and update succeed or fail together safely
    const invoice = await prisma.$transaction(async (tx) => {
      await tx.invoiceItem.deleteMany({ where: { invoiceId: params.id } });

      return await tx.invoice.update({
        where: { id: params.id },
        data: {
          createdById: isAdmin && data.createdById !== undefined ? data.createdById : undefined,
          invoiceNumber: targetInvoiceNumber ? targetInvoiceNumber : undefined,
          customerId: data.customerId,
          invoiceDate: new Date(data.invoiceDate),
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          currency: data.currency,
          foreignCurrency: data.foreignCurrency || null,
          exchangeRate: data.exchangeRate ?? null,
          status: data.status,

          // freight parties & routing
          shipper: data.shipper || null,
          consignee: data.consignee || null,
          originPort: data.originPort || null,
          destinationPort: data.destinationPort || null,
          shipmentMode: data.shipmentMode || null,

          // air freight docs
          masterAwb: data.masterAwb || null,
          houseAwb: data.houseAwb || null,

          // sea freight docs
          hblNo: data.hblNo || null,
          mblNo: data.mblNo || null,
          containerNo: data.containerNo || null,
          vesselName: data.vesselName || null,

          // cargo specs
          packages: data.packages || null,
          chargeableWeight: data.chargeableWeight || null,
          grossWeight: data.grossWeight || null,
          cbm: data.cbm || null,
          trackingNo: data.trackingNo || null,
          weight: data.weight || null,
          shippingDate: data.shippingDate ? new Date(data.shippingDate) : null,

          subtotal: Math.round(subtotal * 100) / 100,
          discount: data.discount || 0,
          taxPercent: data.taxPercent || 0,
          taxAmount: Math.round(taxAmount * 100) / 100,
          total: Math.round(total * 100) / 100,
          amountPaid: data.amountPaid || 0,
          notes: data.notes,
          terms: data.terms,
          items: {
            create: data.items.map((item: any, idx: number) => ({
              description: item.description,
              rate: item.rate !== undefined && item.rate !== null ? Number(item.rate) : null,
              foreignAmount:
                item.foreignAmount !== undefined && item.foreignAmount !== null
                  ? Number(item.foreignAmount)
                  : null,
              quantity: item.quantity ?? 1,
              unitPrice: item.unitPrice ?? 0,
              amount:
                Math.round(
                  (Number(item.amount) || Number(item.quantity) * Number(item.unitPrice) || 0) * 100
                ) / 100,
              sortOrder: idx,
            })),
          },
        },
        include: { items: true, customer: true },
      });
    });

    return NextResponse.json(invoice);
  } catch (err: any) {
    console.error("Error updating invoice:", err);
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "A unique constraint error occurred. This bill number already exists." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: err?.message || "Failed to update invoice." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.invoice.findUnique({
    where: { id: params.id },
    select: { createdById: true },
  });

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = (session.user as any).role === "ADMIN";
  const userId = (session.user as any).id;
  if (!isAdmin && existing.createdById !== userId) {
    return NextResponse.json(
      { error: "Forbidden: You can only delete your own invoices" },
      { status: 403 }
    );
  }

  await prisma.invoice.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
