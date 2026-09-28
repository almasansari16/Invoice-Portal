import Link from "next/link";
import CustomerForm from "@/components/CustomerForm";
import { IconChevronRight } from "@/components/Icons";

export default function NewCustomerPage() {
  return (
    <div>
      <div className="topbar">
        <div>
          <div className="crumbs">
            <Link href="/customers">Customers</Link>
            <IconChevronRight size={13} />
            <span>New</span>
          </div>
          <h1 className="page-title">Add customer</h1>
          <p className="page-subtitle">Create a new customer or agent record</p>
        </div>
      </div>
      <CustomerForm />
    </div>
  );
}
