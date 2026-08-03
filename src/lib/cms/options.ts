/**
 * Allow-list options shared by validators and editor pickers.
 * Editors choose from these; anything else fails validation — so the site
 * can always render what the CMS stores.
 */
export const SOCIAL_PLATFORMS = [
  "website",
  "facebook",
  "instagram",
  "twitter",
  "tiktok",
] as const;

/** Lucide icon names the Facilities section knows how to render. */
export const FACILITY_ICONS = [
  "umbrella",
  "map-pin",
  "clock",
  "smile",
  "building-2",
  "key-round",
  "car",
  "accessibility",
  "wifi",
  "coffee",
  "shield-check",
  "heart",
  "sparkles",
  "users",
  "baby",
  "dog",
  "train-front",
  "bus-front",
  "gift",
  "shopping-bag",
] as const;

export const TRAVEL_MODES = ["walk", "car", "bus", "train"] as const;

export const HERO_MEDIA_TYPES = ["image", "video"] as const;

/** Homepage masonry tile variants. */
export const TILE_TYPES = ["image", "color"] as const;

/** Colour palettes a colour tile can use (background + matching deep text). */
export const TILE_PALETTES = ["yellow", "red", "blue", "green", "sand"] as const;

export const OFFER_BADGES = [
  "In store",
  "Service",
  "Bookable",
  "Seasonal",
  "Limited time",
  "New",
] as const;
