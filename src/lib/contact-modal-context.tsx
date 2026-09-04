"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { ContactModal } from "@/components/contact-modal";

const ContactModalContext = createContext<{ open: () => void } | null>(null);

/** Wraps the whole app; owns the single shared contact modal instance so
 * any "Kapcsolat" trigger, anywhere on the site, opens the same dialog. */
export function ContactModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <ContactModalContext.Provider value={{ open }}>
      {children}
      <ContactModal open={isOpen} onClose={close} />
    </ContactModalContext.Provider>
  );
}

export function useContactModal() {
  const ctx = useContext(ContactModalContext);
  if (!ctx) throw new Error("useContactModal must be used within ContactModalProvider");
  return ctx;
}
