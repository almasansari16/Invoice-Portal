import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateInvoiceNumber } from "@/lib/invoice-number";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") || "Air";

  try {
    const invoiceNumber = await generateInvoiceNumber(mode);
    return NextResponse.json({ invoiceNumber });
  } catch (err: any) {
    console.error("Error generating invoice number:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to generate invoice number" },
      { status: 500 }
    );
  }
}
