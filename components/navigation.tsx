"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  CreditCard,
  Users,
} from "lucide-react";
import { signOut } from "next-auth/react";

export interface userProps {
  name: string;
  email: string;
  image: string;
  id: string;
}

export function Navigation({ user }: { user: userProps }) {
  const pathname = usePathname();

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/transactions",
      label: "Transaksi",
      icon: ShoppingCart,
    },
    {
      href: "/dashboard/products",
      label: "Produk",
      icon: Package,
    },
    {
      href: "/dashboard/customers",
      label: "Pelanggan",
      icon: Users,
    },
    {
      href: "/dashboard/debts",
      label: "Piutang",
      icon: CreditCard,
    },
  ];

  return (
    <nav className="w-full">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center gap-6">
          <Link href="/" className="font-bold text-lg">
            Warung
          </Link>
          <div className="flex gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground md:inline">
              {user.name || user.email}
            </span>
            <button
              onClick={() => signOut()}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
