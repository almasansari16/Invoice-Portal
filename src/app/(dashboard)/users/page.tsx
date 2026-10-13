import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UserManagement from "@/components/UserManagement";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  if ((session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
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
    orderBy: { createdAt: "desc" },
  });

  return (
    <UserManagement
      initialUsers={JSON.parse(JSON.stringify(users))}
      currentUserId={(session.user as any).id}
    />
  );
}
