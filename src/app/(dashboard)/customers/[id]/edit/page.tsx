import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CustomerForm from "@/components/CustomerForm";
import { IconChevronRight } from "@/components/Icons";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({ where: { id: params.id } });
  if (!customer) notFound();

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="crumbs">
            <Link href="/customers">Customers</Link>
            <IconChevronRight size={13} />
            <Link href={`/customers/${customer.id}`}>{customer.company || customer.name}</Link>
            <IconChevronRight size={13} />
            <span>Edit</span>
          </div>
          <h1 className="page-title">Edit customer</h1>
          <p className="page-subtitle">{customer.name}</p>
        </div>
      </div>
      <CustomerForm initial={customer as any} />
    </div>
  );
}
