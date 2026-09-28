"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Avatar } from "@/components/ui";
import {
  IconDashboard,
  IconInvoice,
  IconLogout,
  IconPlus,
  IconSettings,
  IconShip,
  IconUsers,
} from "@/components/Icons";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { href: "/invoices", label: "Invoices", icon: IconInvoice },
  { href: "/customers", label: "Customers", icon: IconUsers },
];

const adminLinks = [{ href: "/settings", label: "Company Settings", icon: IconSettings }];

export default function Sidebar({ userName, role }: { userName: string; role: string }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (pathname.startsWith(href + "/") && !pathname.startsWith("/invoices/new"));

  return (
    <aside className="sidebar no-print">
      <Link href="/dashboard" className="brand">
        <span className="brand-mark">
          <IconShip size={18} />
        </span>
        <span>
          Invoicing
          <small>Freight &amp; Logistics</small>
        </span>
      </Link>

      <Link href="/invoices/new" className="cta">
        <IconPlus size={16} /> New Invoice
      </Link>

      <div className="nav-label">Workspace</div>
      <nav>
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={isActive(href) ? "active" : ""}>
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="nav-label">Configuration</div>
      <nav>
        {adminLinks.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={isActive(href) ? "active" : ""}>
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="footer">
        <Avatar name={userName} size="sm" />
        <div className="who">
          <b>{userName}</b>
          <span>{role === "ADMIN" ? "Administrator" : "Staff"}</span>
        </div>
        <button
          className="signout"
          title="Sign out"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <IconLogout size={17} />
        </button>
      </div>
    </aside>
  );
}
