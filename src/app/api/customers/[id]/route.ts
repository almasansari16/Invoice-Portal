import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      invoices: {
        orderBy: { invoiceDate: "desc" },
        select: {
          id: true,
          invoiceNumber: true,
          invoiceDate: true,
          currency: true,
          total: true,
          status: true,
        },
      },
    },
  });

  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(customer);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, createdAt, updatedAt, invoices, _count, ...updateData } = body;
  const customer = await prisma.customer.update({
    where: { id: params.id },
    data: updateData,
  });
  return NextResponse.json(customer);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoiceCount = await prisma.invoice.count({ where: { customerId: params.id } });
  if (invoiceCount > 0) {
    return NextResponse.json(
      { error: "Cannot delete a customer with existing invoices" },
      { status: 400 }
    );
  }

  await prisma.customer.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
