"use client";

import { Avatar, Box, Heading, HStack, Menu, Portal, Text } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import { LuLogOut } from "react-icons/lu";
import { useAuth } from "@/hooks";
import { ColorModeButton } from "@/components/ui/color-mode";
import { getPageTitle } from "./nav-items";

export function Topbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <HStack
      as="header"
      justify="space-between"
      px={6}
      py={3}
      borderBottomWidth="3px"
      borderBottomColor="topbar.accent"
      bg="sidebar.bg"
      boxShadow="sm"
      gap={4}
    >
      <Heading size="md" color="topbar.fg">
        {title}
      </Heading>

      {/* <ColorModeButton /> */}

      <Menu.Root>
        <Menu.Trigger asChild>
          <HStack
            cursor="pointer"
            gap={2}
            px={2}
            py={1}
            borderRadius="full"
            _hover={{ bg: "topbar.hoverBg" }}
          >
            <Avatar.Root size="sm" bg="white" color="brand.700">
              <Avatar.Fallback name={user?.name ?? "?"} />
            </Avatar.Root>
            <Box display={{ base: "none", sm: "block" }}>
              <Text fontSize="sm" fontWeight="semibold" color="topbar.fg">
                {user?.name}
              </Text>
            </Box>
          </HStack>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item value="logout" onClick={logout} color="fg.error">
                <LuLogOut />
                Log out
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </HStack>
  );
}
