import {
  Accessibility,
  Baby,
  Building2,
  BusFront,
  Car,
  Clock,
  Coffee,
  Dog,
  Gift,
  Heart,
  KeyRound,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Smile,
  Sparkles,
  TrainFront,
  Umbrella,
  Users,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import type { Facility } from "@/types/content";

/** Maps the CMS icon allow-list (kebab-case lucide names) to components. */
const ICON_MAP: Record<string, LucideIcon> = {
  umbrella: Umbrella,
  "map-pin": MapPin,
  clock: Clock,
  smile: Smile,
  "building-2": Building2,
  "key-round": KeyRound,
  car: Car,
  accessibility: Accessibility,
  wifi: Wifi,
  coffee: Coffee,
  "shield-check": ShieldCheck,
  heart: Heart,
  sparkles: Sparkles,
  users: Users,
  baby: Baby,
  dog: Dog,
  "train-front": TrainFront,
  "bus-front": BusFront,
  gift: Gift,
  "shopping-bag": ShoppingBag,
};

export function FacilityCard({ facility }: { facility: Facility }) {
  const Icon = ICON_MAP[facility.icon] ?? Sparkles;
  return (
    <div className="group border border-charcoal/8 bg-white p-7 transition-all duration-500 hover:-translate-y-1 hover:border-gold/70 hover:shadow-[0_18px_40px_-18px_rgba(28,27,24,0.25)]">
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-stone text-bronze transition-all duration-500 group-hover:bg-gold group-hover:text-charcoal">
        <Icon className="size-5" aria-hidden />
      </span>
      <h3 className="mt-5 text-lg font-bold tracking-tight text-charcoal">
        {facility.title}
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        {facility.description}
      </p>
    </div>
  );
}
