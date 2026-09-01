import { useTranslations } from "next-intl";
import { ShieldCheck, Truck, Wrench, Users } from "lucide-react";

export function TrustStrip() {
  const t = useTranslations("home.trust");

  const items = [
    { icon: ShieldCheck, label: t("warranty") },
    { icon: Truck, label: t("shipping") },
    { icon: Wrench, label: t("service") },
    { icon: Users, label: t("consulting") },
  ];

  return (
    <div className="flex flex-wrap justify-between gap-6 border-b border-line bg-white px-16 py-8 max-lg:px-6">
      {items.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-3">
          <Icon className="size-5 text-accent" strokeWidth={1.8} />
          <span className="text-sm font-semibold">{label}</span>
        </div>
      ))}
    </div>
  );
}
