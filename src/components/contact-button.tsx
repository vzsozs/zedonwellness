"use client";

import { useContactModal } from "@/lib/contact-modal-context";

/** Drop-in replacement for a `<Link href="/kapcsolat">` — opens the shared
 * contact modal instead of navigating to a page. */
export function ContactButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open } = useContactModal();
  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  );
}
