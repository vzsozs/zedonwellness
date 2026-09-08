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
      {/* On phones the four items share one white panel instead of being
          four floating cards — at that width separate cards read as
          clutter rather than as a trust signal. */}
      <div className="rounded-card grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-lg:gap-0 max-lg:border max-lg:border-line max-lg:bg-white max-lg:p-1.5">
        {items.map(({ key, icon: Icon }) => (
          <div
            key={key}
            className="flex items-start gap-[18px] px-6 py-[26px] max-lg:items-center max-lg:gap-3 max-lg:px-3 max-lg:py-3.5 lg:rounded-card lg:border lg:border-line lg:bg-white lg:shadow-[0_8px_24px_-4px_rgba(15,45,80,0.08)] lg:transition-all lg:duration-300 lg:hover:-translate-y-[3px] lg:hover:border-accent lg:hover:shadow-[0_16px_40px_-6px_rgba(15,45,80,0.14)]"
          >
            <div className="rounded-card flex size-[50px] shrink-0 items-center justify-center border border-accent/15 bg-accent-soft text-accent max-lg:size-9">
              <Icon className="size-6 max-lg:size-[18px]" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15.5px] leading-snug font-semibold tracking-[-0.01em] text-ink max-lg:text-[12.5px]">
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
