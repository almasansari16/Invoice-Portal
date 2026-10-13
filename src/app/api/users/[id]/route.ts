import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  role: z.enum(["ADMIN", "STAFF"]).optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const userId = params.id;
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentAdminId = (session.user as any).id;
    // Don't allow admin to demote themselves if they are the only admin
    if (existingUser.id === currentAdminId && parsed.data.role === "STAFF") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot change your role: you are the only Administrator" },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (parsed.data.name) updateData.name = parsed.data.name.trim();
    if (parsed.data.role) updateData.role = parsed.data.role;
    if (parsed.data.password && parsed.data.password.trim().length >= 6) {
      updateData.password = await bcrypt.hash(parsed.data.password.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { invoices: true },
        },
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const userId = params.id;
    const currentAdminId = (session.user as any).id;

    if (userId === currentAdminId) {
      return NextResponse.json({ error: "You cannot delete your own admin account" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Unlink invoices created by this user so foreign key constraint doesn't fail
    await prisma.invoice.updateMany({
      where: { createdById: userId },
      data: { createdById: null },
    });

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
