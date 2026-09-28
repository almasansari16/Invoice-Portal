import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import { calculateTotals } from "@/lib/utils";
import { z } from "zod";

const itemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
});

const invoiceSchema = z.object({
  customerId: z.string().min(1),
  invoiceDate: z.string(),
  dueDate: z.string().optional().nullable(),
  currency: z.enum(["USD", "PKR"]),
  exchangeRate: z.number().optional().nullable(),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]).optional(),
  originPort: z.string().optional().nullable(),
  destinationPort: z.string().optional().nullable(),
  shipmentMode: z.string().optional().nullable(),
  containerNo: z.string().optional().nullable(),
  trackingNo: z.string().optional().nullable(),
  weight: z.string().optional().nullable(),
  shippingDate: z.string().optional().nullable(),
  discount: z.number().min(0).optional(),
  taxPercent: z.number().min(0).optional(),
  amountPaid: z.number().min(0).optional(),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1, "Add at least one line item"),
});

// GET /api/invoices?q=&status=&customerId=&from=&to=&page=&pageSize=
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");
  const customerId = searchParams.get("customerId");
  const currency = searchParams.get("currency");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  const where: any = { AND: [] as any[] };

  if (q) {
    where.AND.push({
      OR: [
        { invoiceNumber: { contains: q, mode: "insensitive" } },
        { customer: { name: { contains: q, mode: "insensitive" } } },
        { customer: { company: { contains: q, mode: "insensitive" } } },
        { trackingNo: { contains: q, mode: "insensitive" } },
        { containerNo: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (status) where.AND.push({ status });
  if (customerId) where.AND.push({ customerId });
  if (currency) where.AND.push({ currency });
  if (from || to) {
    where.AND.push({
      invoiceDate: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    });
  }
  if (where.AND.length === 0) delete where.AND;

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { invoiceDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: { select: { id: true, name: true, company: true } } },
    }),
    prisma.invoice.count({ where }),
  ]);

  return NextResponse.json({ invoices, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const { subtotal, taxAmount, total } = calculateTotals(
    data.items as any,
    data.discount || 0,
    data.taxPercent || 0
  );

  const invoiceNumber = await generateInvoiceNumber();

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      invoiceDate: new Date(data.invoiceDate),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      customerId: data.customerId,
      createdById: (session.user as any).id,
      currency: data.currency,
      exchangeRate: data.exchangeRate ?? null,
      status: data.status || "DRAFT",
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
        create: data.items.map((item, idx) => ({
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

  return NextResponse.json(invoice, { status: 201 });
}
