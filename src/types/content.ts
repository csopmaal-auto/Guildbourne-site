/** Shared content types — the shapes of the JSON collections in `src/content`. */

export type SocialPlatform =
  | "website"
  | "facebook"
  | "instagram"
  | "twitter"
  | "tiktok";

export type SocialLink = {
  platform: SocialPlatform;
  url: string;
};

export type Cta = {
  label: string;
  href: string;
};

export type NavLink = {
  label: string;
  href: string;
};

export type DayHours = {
  open: string;
  close: string;
  closed: boolean;
};

export type WeekHours = {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
};

export type Settings = {
  siteName: string;
  tagline: string;
  operator: string;
  contact: {
    phone: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    postcode: string;
    postalAddress: string;
    mapLink: string;
  };
  hours: WeekHours;
  hoursDisplay: { label: string; value: string }[];
  hoursNote: string;
  socials: SocialLink[];
  announcement: {
    enabled: boolean;
    text: string;
    link: string;
    linkLabel: string;
  };
  newsletter: {
    endpoint: string;
  };
};

export type Navigation = {
  header: NavLink[];
  footerColumns: { title: string; links: NavLink[] }[];
  legal: NavLink[];
};

export type HeroSlide = {
  image: string;
  headline: string;
  subheadline: string;
  cta: Cta;
};

export type TilePalette = "yellow" | "red" | "blue" | "green" | "sand";

export type HomeTile = {
  type: "image" | "color";
  title: string;
  subtitle: string;
  href: string;
  image: string;
  palette: TilePalette;
  pattern: boolean;
};

export type Homepage = {
  hero: {
    slides: HeroSlide[];
  };
  tiles: HomeTile[];
  newsletter: {
    heading: string;
    body: string;
    disclaimer: string;
  };
};

export type PageHeader = {
  eyebrow: string;
  heading: string;
  intro: string;
};

export type Pages = {
  stores: PageHeader;
  offers: PageHeader;
  events: PageHeader;
  news: PageHeader;
};

export type ContactContent = {
  header: PageHeader;
  form: {
    heading: string;
    intro: string;
    subjects: string[];
    successHeading: string;
    successBody: string;
  };
  gettingHere: {
    mode: "walk" | "car" | "bus" | "train";
    title: string;
    body: string;
  }[];
  map: {
    query: string;
    linkLabel: string;
  };
  floorplan: {
    heading: string;
    body: string;
    image: string;
    caption: string;
  };
  faqs: { question: string; answer: string }[];
  letting: {
    heading: string;
    body: string;
    agent: string;
    phone: string;
  };
};

export type Store = {
  slug: string;
  name: string;
  category: string;
  unit: string;
  excerpt: string;
  description: string[];
  phone: string;
  email: string;
  website: string;
  socials: SocialLink[];
  logo: string;
  image: string;
  featured: boolean;
  hoursNote: string;
};

export type CentreEvent = {
  slug: string;
  title: string;
  startDate: string;
  endDate: string;
  timeLabel: string;
  location: string;
  excerpt: string;
  body: string[];
  image: string;
  featured: boolean;
};

export type NewsArticle = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  body: string[];
  image: string;
  featured: boolean;
};

export type Offer = {
  slug: string;
  title: string;
  store: string;
  badge: string;
  validUntil: string;
  excerpt: string;
  body: string[];
  image: string;
  cta: Cta;
};

export type Facility = {
  slug: string;
  title: string;
  icon: string;
  description: string;
};

export type LegalPage = {
  slug: string;
  title: string;
  updated: string;
  body: string[];
};

export type SeoRouteEntry = {
  title: string;
  description: string;
};

export type SeoContent = {
  global: {
    siteName: string;
    titleTemplate: string;
    defaultTitle: string;
    defaultDescription: string;
    ogImage: string;
    twitterHandle: string;
  };
  routes: Record<string, SeoRouteEntry>;
};
