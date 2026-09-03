import { redirect } from "next/navigation";

// Extrák moved under Termék hozzávalók (as the "Jakuzzi extrák" tab) — kept
// as a redirect so old links/bookmarks still land somewhere useful.
export default function ExtrasPage() {
  redirect("/admin/hozzavalok");
}
