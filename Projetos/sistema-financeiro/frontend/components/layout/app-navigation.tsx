"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
  },
  {
    href: "/transactions",
    label: "Transações",
  },
  {
    href: "/recurring",
    label: "Recorrentes",
  },
  {
    href: "/categories",
    label: "Categorias",
  },
  {
    href: "/goals",
    label: "Metas",
  },
  {
    href: "/budget",
    label: "Orçamento",
  },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 sm:flex-row">
      {navigationItems.map((item) => {
        const isActive = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "rounded-xl px-4 py-2 text-sm font-semibold transition",
              "border",
              isActive
                ? "border-emerald-500 bg-emerald-500 text-white dark:border-emerald-400 dark:bg-emerald-400 dark:text-slate-950"
                : "border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
