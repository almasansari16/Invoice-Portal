import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let settings = await prisma.companySettings.findFirst();
  if (!settings) {
    settings = await prisma.companySettings.create({ data: { companyName: "Your Company" } });
  }
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can update company settings" }, { status: 403 });
  }

  const body = await req.json();
  let settings = await prisma.companySettings.findFirst();
  if (!settings) {
    settings = await prisma.companySettings.create({ data: { companyName: "Your Company" } });
  }

  const updated = await prisma.companySettings.update({
    where: { id: settings.id },
    data: {
      companyName: body.companyName,
      address: body.address,
      phone: body.phone,
      email: body.email,
      website: body.website,
      taxNumber: body.taxNumber,
      logoUrl: body.logoUrl,
      invoicePrefix: body.invoicePrefix,
      defaultCurrency: body.defaultCurrency,
      bankDetails: body.bankDetails,
      footerNote: body.footerNote,
    },
  });

  return NextResponse.json(updated);
}
