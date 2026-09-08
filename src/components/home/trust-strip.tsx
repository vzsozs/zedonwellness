import { useTranslations } from "next-intl";
import { ShieldCheck, Truck, Wrench, Users } from "lucide-react";
import { Container } from "@/components/layout/container";

export function TrustStrip() {
  const t = useTranslations("home.trust");

  const items = [
    { key: "warranty", icon: ShieldCheck },
    { key: "shipping", icon: Truck },
    { key: "service", icon: Wrench },
    { key: "consulting", icon: Users },
  ] as const;

  return (
    // Lifted to overlap the hero, as in the mockup — the cards read as one
    // band bridging the two sections rather than a separate strip. Only
    // from `lg` up: on mobile the hero ends with the TÜV badge in flow,
    // and pulling the cards over it would collide.
    <Container className="relative z-10 pb-[70px] lg:-mt-10">
      <div className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-lg:gap-3">
        {items.map(({ key, icon: Icon }) => (
          <div
            key={key}
            className="rounded-card flex items-start gap-[18px] border border-line bg-white px-6 py-[26px] shadow-[0_8px_24px_-4px_rgba(15,45,80,0.08)] max-lg:items-center max-lg:gap-3 max-lg:px-4 max-lg:py-4"
          >
            <div className="rounded-card flex size-[50px] shrink-0 items-center justify-center bg-accent-soft text-accent max-lg:size-10">
              <Icon className="size-6 max-lg:size-5" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[17px] leading-snug font-semibold text-ink max-lg:text-[13.5px]">
                {t(`${key}.title`)}
              </h3>
              {/* Hidden on phones: four descriptions turn the strip into a
                  wall of text before the visitor has seen a product. */}
              <p className="mt-1.5 text-[13px] leading-[1.55] text-muted max-lg:hidden">
                {t(`${key}.description`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
