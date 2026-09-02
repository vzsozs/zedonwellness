"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Puzzle,
  Truck,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Áttekintés", icon: LayoutDashboard },
  { href: "/admin/products", label: "Termékek", icon: Package },
  { href: "/admin/categories", label: "Kategóriák", icon: FolderTree },
  { href: "/admin/extras", label: "Extrák", icon: Puzzle },
  { href: "/admin/shipping", label: "Szállítási díjak", icon: Truck },
  { href: "/admin/orders", label: "Rendelések", icon: ClipboardList },
  { href: "/admin/settings", label: "Beállítások", icon: Settings },
];

export function AdminSidebar({
  userEmail,
  onSignOut,
}: {
  userEmail?: string | null;
  onSignOut: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  const links = (onNavigate?: () => void) => (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium ${
            isActive(href) ? "bg-paper-muted text-ink" : "text-ink hover:bg-paper-muted"
          }`}
        >
          <Icon className="size-4.5" strokeWidth={1.8} />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
        <img
          src="/brand/zedonwellness-logo.png"
          alt="Zedonwellness"
          className="h-6 w-auto"
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Menü bezárása" : "Menü megnyitása"}
          aria-expanded={open}
          className="flex size-9 items-center justify-center"
        >
          {open ? (
            <X className="size-5.5" strokeWidth={1.8} />
          ) : (
            <Menu className="size-5.5" strokeWidth={1.8} />
          )}
        </button>
      </div>

      {/* Mobile dropdown panel */}
      {open ? (
        <div className="border-b border-line bg-white lg:hidden">
          {links(() => setOpen(false))}
          <div className="border-t border-line p-3">
            <div className="px-3 py-2 text-xs text-muted">{userEmail}</div>
            <form action={onSignOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-ink hover:bg-paper-muted"
              >
                <LogOut className="size-4.5" strokeWidth={1.8} />
                Kijelentkezés
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-white lg:flex">
        <div className="border-b border-line px-6 py-5">
          <img
            src="/brand/zedonwellness-logo.png"
            alt="Zedonwellness"
            className="h-6 w-auto"
          />
          <div className="mt-1 text-[11px] font-semibold tracking-wide text-muted uppercase">
            Admin
          </div>
        </div>
        {links()}
        <div className="mt-auto border-t border-line p-3">
          <div className="px-3 py-2 text-xs text-muted">{userEmail}</div>
          <form action={onSignOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-ink hover:bg-paper-muted"
            >
              <LogOut className="size-4.5" strokeWidth={1.8} />
              Kijelentkezés
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
