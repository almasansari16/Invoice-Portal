"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Avatar } from "@/components/ui";
import {
  IconDashboard,
  IconInvoice,
  IconKey,
  IconLogout,
  IconPlus,
  IconSettings,
  IconShield,
  IconShip,
  IconUsers,
} from "@/components/Icons";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { href: "/invoices", label: "Invoices", icon: IconInvoice },
  { href: "/customers", label: "Customers", icon: IconUsers },
];

const adminLinks = [
  { href: "/users", label: "User Management", icon: IconShield },
  { href: "/settings", label: "Company Settings", icon: IconSettings },
];

const accountLinks = [
  { href: "/profile", label: "Account & Password", icon: IconKey },
];

export default function Sidebar({ userName, role }: { userName: string; role: string }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (pathname.startsWith(href + "/") && !pathname.startsWith("/invoices/new"));

  const isAdmin = role === "ADMIN";

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

      <div className="nav-label">Settings &amp; Access</div>
      <nav>
        {isAdmin &&
          adminLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={isActive(href) ? "active" : ""}>
              <Icon size={17} />
              {label}
            </Link>
          ))}
        {accountLinks.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={isActive(href) ? "active" : ""}>
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="footer">
        <Link href="/profile" title="View profile & change password" style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, textDecoration: "none" }}>
          <Avatar name={userName} size="sm" />
          <div className="who">
            <b>{userName}</b>
            <span>{isAdmin ? "Administrator" : "Staff"}</span>
          </div>
        </Link>
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
