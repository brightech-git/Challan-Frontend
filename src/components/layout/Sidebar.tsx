"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Box, Stack, Text, chakra } from "@chakra-ui/react";

const NavLink = chakra(NextLink);
import {
  LuBuilding2,
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
  { label: "Company", href: "/dashboard/company", icon: LuBuilding2 },
  { label: "Metal Master", href: "/dashboard/metal-master", icon: LuGem },
  { label: "Challan Format", href: "/dashboard/challan-format", icon: LuFileText },
  { label: "Transactions", href: "/dashboard/tranwt", icon: LuReceipt },
  { label: "Generate Receipt", href: "/dashboard/generate-receipt", icon: LuPrinter },
  { label: "Users", href: "/dashboard/users", icon: LuUsers },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <Box
      as="nav"
      w="240px"
      flexShrink={0}
      borderRightWidth="1px"
      bg="bg.panel"
      py={4}
      px={3}
      display={{ base: "none", md: "block" }}
    >
      <Text fontWeight="bold" fontSize="lg" px={2} mb={6}>
        Challan
      </Text>

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
              px={3}
              py={2}
              borderRadius="md"
              fontSize="sm"
              fontWeight="medium"
              bg={active ? "colorPalette.subtle" : "transparent"}
              color={active ? "colorPalette.fg" : "fg.default"}
              colorPalette={active ? "brand" : undefined}
              _hover={{ bg: active ? "colorPalette.subtle" : "bg.muted" }}
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </Stack>
    </Box>
  );
}
