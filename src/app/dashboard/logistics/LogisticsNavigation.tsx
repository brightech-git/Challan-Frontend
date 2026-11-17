"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Button, HStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

const pages = [
  {
    href: "/dashboard/logistics",
    label: "Create Sheet",
    title: "Create Logistics Sheet",
  },
  {
    href: "/dashboard/logistics-sheets",
    label: "Saved Sheets",
    title: "Saved Logistics Sheets",
  },
];

export default function LogisticsNavigation({ actions }: { actions?: ReactNode }) {
  const pathname = usePathname().replace(/\/+$/, "");
  return (
    <HStack
      justify="space-between"
      gap={4}
      borderBottomWidth="1px"
      pb={3}
      mb={2}
      overflowX="auto"
    >
      <Box
        as="nav"
        aria-label="Logistics pages"
        display="flex"
        gap={2}
        flexShrink={0}
      >
        {pages.map(({ href, label }) => (
          <Button
            key={href}
            size="sm"
            borderRadius="lg"
            fontWeight="500"
            colorPalette="blue"
            variant={pathname === href ? "solid" : "outline"}
            bg={pathname === href ? "blue.600" : "bg.panel"}
            color={pathname === href ? "white" : "fg.muted"}
            borderWidth="1px"
            borderColor={pathname === href ? "blue.600" : "border"}
            boxShadow={pathname === href ? "sm" : "none"}
            _hover={{ bg: pathname === href ? "blue.700" : "bg.muted" }}
            asChild
          >
            <Link
              href={href}
              aria-current={pathname === href ? "page" : undefined}
            >
              {label}
            </Link>
          </Button>
        ))}
      </Box>
      {actions && <HStack gap={2} flexShrink={0}>{actions}</HStack>}
    </HStack>
  );
}
