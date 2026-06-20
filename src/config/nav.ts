import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Boxes,
  FileBox,
  Upload,
  UserCog,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Sidebar navigation. Keep route metadata here (not hardcoded in the sidebar
 * component) so menus, breadcrumbs, and permissions can all read one list.
 */
export const mainNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/shipments", label: "Shipments", icon: Package },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/products", label: "Products", icon: Boxes },
  { href: "/templates", label: "Templates", icon: FileBox },
  { href: "/imports", label: "Imports", icon: Upload },
  { href: "/team", label: "Team", icon: UserCog },
  { href: "/settings", label: "Settings", icon: Settings },
];
