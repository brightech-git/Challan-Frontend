"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Box, IconButton, Stack, Text, chakra } from "@chakra-ui/react";

const NavLink = chakra(NextLink);
import {
  LuBuilding2,
  LuChevronLeft,
  LuChevronRight,
  LuFileText,
  LuGem,
  LuLayoutDashboard,
  LuPrinter,
  LuReceipt,
  LuUsers,
} from "react-icons/lu";
import { IconType } from "react-icons";

interface NavItem {
  label: string;
  href: string;
  icon: IconType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LuLayoutDashboard },
  { label: "Users", href: "/dashboard/users", icon: LuUsers },
  { label: "Company", href: "/dashboard/company", icon: LuBuilding2 },
  { label: "Metal Master", href: "/dashboard/metal-master", icon: LuGem },
  // { label: "Challan Format", href: "/dashboard/challan-format", icon: LuFileText },
  { label: "Transactions", href: "/dashboard/tranwt", icon: LuReceipt },
  { label: "Generate Receipt", href: "/dashboard/generate-receipt", icon: LuPrinter },
  
];

const COLLAPSE_STORAGE_KEY = "sidebar-collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(
    () => window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "true"
  );

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <Box
      as="nav"
      w={collapsed ? "72px" : "240px"}
      transition="width 0.2s ease"
      flexShrink={0}
      borderRightWidth="1px"
      bg="bg.panel"
      py={4}
      px={collapsed ? 2 : 3}
      display={{ base: "none", md: "block" }}
      overflow="hidden"
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent={collapsed ? "center" : "space-between"}
        px={collapsed ? 0 : 2}
        mb={6}
      >
        {!collapsed && (
          <Text fontWeight="bold" fontSize="lg">
            Challan
          </Text>
        )}

        <IconButton
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          size="sm"
          variant="ghost"
          onClick={toggleCollapsed}
        >
          {collapsed ? <LuChevronRight size={16} /> : <LuChevronLeft size={16} />}
        </IconButton>
      </Box>

      <Stack gap={1}>
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <NavLink
              key={item.href}
              href={item.href}
              display="flex"
              alignItems="center"
              gap={3}
              justifyContent={collapsed ? "center" : "flex-start"}
              px={3}
              py={2}
              borderRadius="md"
              fontSize="sm"
              fontWeight="medium"
              bg={active ? "colorPalette.subtle" : "transparent"}
              color={active ? "colorPalette.fg" : "fg.default"}
              colorPalette={active ? "brand" : undefined}
              _hover={{ bg: active ? "colorPalette.subtle" : "bg.muted" }}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} />
              {!collapsed && item.label}
            </NavLink>
          );
        })}
      </Stack>
    </Box>
  );
}
