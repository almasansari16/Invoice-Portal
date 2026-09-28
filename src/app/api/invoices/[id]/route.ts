import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateTotals } from "@/lib/utils";

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
      createdBy: { select: { name: true } },
    },
  });

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  const { subtotal, taxAmount, total } = calculateTotals(
    data.items,
    data.discount || 0,
    data.taxPercent || 0
  );

  // Replace line items wholesale (simplest, safest approach for an edit form)
  await prisma.invoiceItem.deleteMany({ where: { invoiceId: params.id } });

  const invoice = await prisma.invoice.update({
    where: { id: params.id },
    data: {
      customerId: data.customerId,
      invoiceDate: new Date(data.invoiceDate),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      currency: data.currency,
      exchangeRate: data.exchangeRate ?? null,
      status: data.status,
      originPort: data.originPort,
      destinationPort: data.destinationPort,
      shipmentMode: data.shipmentMode,
      containerNo: data.containerNo,
      trackingNo: data.trackingNo,
      weight: data.weight,
      shippingDate: data.shippingDate ? new Date(data.shippingDate) : null,
      subtotal,
      discount: data.discount || 0,
      taxPercent: data.taxPercent || 0,
      taxAmount,
      total,
      amountPaid: data.amountPaid || 0,
      notes: data.notes,
      terms: data.terms,
      items: {
        create: data.items.map((item: any, idx: number) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: Math.round(item.quantity * item.unitPrice * 100) / 100,
          sortOrder: idx,
        })),
      },
    },
    include: { items: true, customer: true },
  });

  return NextResponse.json(invoice);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.invoice.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
