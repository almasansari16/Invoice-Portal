import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="app-shell">
      <Sidebar userName={session.user?.name || "User"} role={(session.user as any).role} />
      <main className="main">{children}</main>
    </div>
  );
}
