"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Box, IconButton, Stack, Text, chakra } from "@chakra-ui/react";

const NavLink = chakra(NextLink);
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { isNavItemActive, navItems } from "./nav-items";

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
      borderRightColor="sidebar.border"
      bg="sidebar.bg"
      color="sidebar.fg"
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
          <Text fontWeight="bold" fontSize="lg" color="sidebar.fg" letterSpacing="tight">
            Challan
          </Text>
        )}

        <IconButton
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          size="sm"
          variant="ghost"
          color="sidebar.fg"
          _hover={{ bg: "sidebar.hoverBg" }}
          onClick={toggleCollapsed}
        >
          {collapsed ? <LuChevronRight size={16} /> : <LuChevronLeft size={16} />}
        </IconButton>
      </Box>

      <Stack gap={1}>
        {navItems.map((item) => {
          const active = isNavItemActive(pathname, item.href);
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
              py={2.5}
              borderRadius="md"
              fontSize="sm"
              fontWeight="medium"
              bg={active ? "sidebar.activeBg" : "transparent"}
              color={active ? "sidebar.activeFg" : "sidebar.mutedFg"}
              boxShadow={active ? "sm" : "none"}
              _hover={{
                bg: active ? "sidebar.activeBg" : "sidebar.hoverBg",
                color: active ? "sidebar.activeFg" : "sidebar.fg",
              }}
              transition="background 0.15s ease, color 0.15s ease"
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
