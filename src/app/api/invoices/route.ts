import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import { calculateTotals } from "@/lib/utils";
import { z } from "zod";

const itemSchema = z.object({
  description: z.string().min(1),
  rate: z.number().optional().nullable(),
  foreignAmount: z.number().optional().nullable(),
  quantity: z.number().default(1),
  unitPrice: z.number().default(0),
  amount: z.number().default(0),
});

const invoiceSchema = z.object({
  invoiceNumber: z.string().optional().nullable(),
  customerId: z.string().min(1),
  invoiceDate: z.string(),
  dueDate: z.string().optional().nullable(),
  currency: z.enum(["USD", "PKR", "EUR"]),
  foreignCurrency: z.string().optional().nullable(),
  exchangeRate: z.number().optional().nullable(),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]).optional(),

  // freight parties & routing
  shipper: z.string().optional().nullable(),
  consignee: z.string().optional().nullable(),
  originPort: z.string().optional().nullable(),
  destinationPort: z.string().optional().nullable(),
  shipmentMode: z.string().optional().nullable(), // "Air" / "Sea"

  // air freight docs
  masterAwb: z.string().optional().nullable(),
  houseAwb: z.string().optional().nullable(),

  // sea freight docs
  hblNo: z.string().optional().nullable(),
  mblNo: z.string().optional().nullable(),
  containerNo: z.string().optional().nullable(),
  vesselName: z.string().optional().nullable(),

  // cargo specs
  packages: z.string().optional().nullable(),
  chargeableWeight: z.string().optional().nullable(),
  grossWeight: z.string().optional().nullable(),
  cbm: z.string().optional().nullable(),
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
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = invoiceSchema.safeParse(body);
    if (!parsed.success) {
      console.error("Validation error:", parsed.error.flatten());
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;

    // calculate subtotal from item amounts (which are in PKR)
    const subtotal = data.items.reduce((s, i) => s + (Number(i.amount) || (Number(i.quantity) * Number(i.unitPrice)) || 0), 0);
    const afterDiscount = Math.max(subtotal - (data.discount || 0), 0);
    const taxAmount = (afterDiscount * (data.taxPercent || 0)) / 100;
    const total = afterDiscount + taxAmount;

    let invoiceNumber = data.invoiceNumber?.trim();
    if (!invoiceNumber) {
      invoiceNumber = await generateInvoiceNumber(data.shipmentMode);
    } else {
      // Check if invoiceNumber already exists to avoid unique constraint crash
      const existing = await prisma.invoice.findUnique({ where: { invoiceNumber } });
      if (existing) {
        invoiceNumber = `${invoiceNumber}-${Date.now().toString().slice(-4)}`;
      }
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        invoiceDate: new Date(data.invoiceDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        customerId: data.customerId,
        createdById: (session.user as any)?.id || null,
        currency: data.currency,
        foreignCurrency: data.foreignCurrency || null,
        exchangeRate: data.exchangeRate ?? null,
        status: data.status || "DRAFT",

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
          create: data.items.map((item, idx) => ({
            description: item.description,
            rate: item.rate !== undefined && item.rate !== null ? Number(item.rate) : null,
            foreignAmount: item.foreignAmount !== undefined && item.foreignAmount !== null ? Number(item.foreignAmount) : null,
            quantity: item.quantity ?? 1,
            unitPrice: item.unitPrice ?? 0,
            amount: Math.round((Number(item.amount) || (Number(item.quantity) * Number(item.unitPrice)) || 0) * 100) / 100,
            sortOrder: idx,
          })),
        },
      },
      include: { items: true, customer: true },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (err: any) {
    console.error("Error creating invoice:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}
