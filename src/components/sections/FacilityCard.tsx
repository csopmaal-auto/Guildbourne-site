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
    <div className="group rounded-xl bg-cream p-6 transition-colors duration-200 hover:bg-sand">
      <span className="grid size-12 place-items-center rounded-full bg-yellow text-ink">
        <Icon className="size-5" aria-hidden />
      </span>
      <h3 className="heading-m mt-4 text-ink">{facility.title}</h3>
      <p className="text-body mt-1.5 text-ink-soft">{facility.description}</p>
    </div>
  );
}
