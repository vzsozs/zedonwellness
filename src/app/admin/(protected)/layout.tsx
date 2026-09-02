import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { AdminSidebar } from "./admin-sidebar";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar userEmail={session.user?.email} onSignOut={handleSignOut} />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">{children}</main>
    </div>
  );
}
