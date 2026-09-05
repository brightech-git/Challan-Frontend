import { IconType } from "react-icons";
import {
  LuBuilding2,
  LuFileText,
  LuGem,
  LuLayoutDashboard,
  LuPrinter,
  LuReceipt,
  LuUsers,
} from "react-icons/lu";

export interface NavItem {
  label: string;
  href: string;
  icon: IconType;
}

// Sidebar links, in display order. Topbar reuses these labels (plus
// EXTRA_PAGE_TITLES below, for routes not linked from the sidebar) to show
// the current page's title, so a route's name is only ever written once.
export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LuLayoutDashboard },
  { label: "User Master", href: "/dashboard/users", icon: LuUsers },
  { label: "Company Master", href: "/dashboard/company", icon: LuBuilding2 },
  { label: "Metal Master", href: "/dashboard/metal-master", icon: LuGem },
  { label: "Transactions", href: "/dashboard/tranwt", icon: LuReceipt },
  { label: "Receipt Generation", href: "/dashboard/generate-receipt", icon: LuPrinter },
  { label: "Transactions Reports", href: "/dashboard/report", icon: LuFileText },
];

// Reachable by URL but intentionally not linked from the sidebar.
const EXTRA_PAGE_TITLES: { href: string; label: string }[] = [
  { href: "/dashboard/challan-format", label: "Challan Formats" },
];

const pageTitles = [...navItems, ...EXTRA_PAGE_TITLES];

export function isNavItemActive(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
}

export function getPageTitle(pathname: string): string | null {
  return pageTitles.find((item) => isNavItemActive(pathname, item.href))?.label ?? null;
}
