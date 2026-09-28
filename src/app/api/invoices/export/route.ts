import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "xlsx"; // xlsx | csv
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");
  const customerId = searchParams.get("customerId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: any = { AND: [] as any[] };
  if (q) {
    where.AND.push({
      OR: [
        { invoiceNumber: { contains: q, mode: "insensitive" } },
        { customer: { name: { contains: q, mode: "insensitive" } } },
      ],
    });
  }
  if (status) where.AND.push({ status });
  if (customerId) where.AND.push({ customerId });
  if (from || to) {
    where.AND.push({
      invoiceDate: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    });
  }
  if (where.AND.length === 0) delete where.AND;

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { invoiceDate: "desc" },
    include: { customer: true },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Invoices");

  sheet.columns = [
    { header: "Invoice No", key: "invoiceNumber", width: 18 },
    { header: "Date", key: "date", width: 14 },
    { header: "Customer", key: "customer", width: 26 },
    { header: "Company", key: "company", width: 22 },
    { header: "Currency", key: "currency", width: 10 },
    { header: "Subtotal", key: "subtotal", width: 14 },
    { header: "Discount", key: "discount", width: 12 },
    { header: "Tax", key: "tax", width: 12 },
    { header: "Total", key: "total", width: 14 },
    { header: "Paid", key: "paid", width: 14 },
    { header: "Status", key: "status", width: 12 },
    { header: "Origin", key: "origin", width: 16 },
    { header: "Destination", key: "destination", width: 16 },
    { header: "Tracking No", key: "tracking", width: 18 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEFEAE0" },
  };

  invoices.forEach((inv) => {
    sheet.addRow({
      invoiceNumber: inv.invoiceNumber,
      date: inv.invoiceDate.toISOString().slice(0, 10),
      customer: inv.customer?.name,
      company: inv.customer?.company || "",
      currency: inv.currency,
      subtotal: Number(inv.subtotal),
      discount: Number(inv.discount),
      tax: Number(inv.taxAmount),
      total: Number(inv.total),
      paid: Number(inv.amountPaid),
      status: inv.status,
      origin: inv.originPort || "",
      destination: inv.destinationPort || "",
      tracking: inv.trackingNo || "",
    });
  });

  if (format === "csv") {
    const buffer = await workbook.csv.writeBuffer();
    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="invoices-export.csv"`,
      },
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer as any, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="invoices-export.xlsx"`,
    },
  });
}
