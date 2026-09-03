import { redirect } from "next/navigation";

// The overview page was removed — /admin now goes straight to the products
// list, which is what's used day to day.
export default function AdminRoot() {
  redirect("/admin/products");
}
