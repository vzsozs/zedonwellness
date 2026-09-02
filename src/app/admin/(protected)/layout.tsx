import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Puzzle,
  Truck,
  ClipboardList,
  Settings,
  LogOut,
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

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-white">
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
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-ink hover:bg-paper-muted"
            >
              <Icon className="size-4.5" strokeWidth={1.8} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-line p-3">
          <div className="px-3 py-2 text-xs text-muted">
            {session.user?.email}
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
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
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
