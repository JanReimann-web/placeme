import type { LucideIcon } from "lucide-react";
import {
  FolderHeart,
  GalleryVerticalEnd,
  Home,
  Sparkles,
  WandSparkles,
} from "lucide-react";

export interface AppNavigationItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const appNavigationItems: AppNavigationItem[] = [
  {
    href: "/app",
    label: "Home",
    description: "Overview of your private travel studio.",
    icon: Home,
  },
  {
    href: "/app/profiles",
    label: "Profiles",
    description: "Build private self and companion reference libraries.",
    icon: FolderHeart,
  },
  {
    href: "/app/generate",
    label: "Generate",
    description: "Create a guided destination photo set.",
    icon: WandSparkles,
  },
  {
    href: "/app/jobs",
    label: "Jobs",
    description: "Monitor pending, processing, and completed generations.",
    icon: Sparkles,
  },
  {
    href: "/app/gallery",
    label: "Gallery",
    description: "Review finished outputs across destinations and styles.",
    icon: GalleryVerticalEnd,
  },
];
