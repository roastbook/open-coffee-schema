import type { NavLink } from "@roastbook/ui/sites";
import { familyNames } from "./data.ts";

export const FAMILY_TITLES: Record<string, string> = {
  "coffee-places": "Coffee places",
  "brew-methods": "Brew methods",
  "pour-patterns": "Pour patterns",
  equipment: "Equipment",
  common: "Common definitions",
};

/** The site's sections for the shared header; `current` is "home", "playground" or a family name. */
export const siteNav = (current: string): NavLink[] => [
  { href: "/", label: "Overview", current: current === "home" },
  ...familyNames.map((f) => ({ href: `/${f}/latest/`, label: FAMILY_TITLES[f] ?? f, current: current === f })),
  { href: "/playground/", label: "Playground", current: current === "playground" },
];
