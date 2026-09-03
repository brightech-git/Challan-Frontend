"use client";

import { Avatar, Box, HStack, Menu, Portal, Text } from "@chakra-ui/react";
import { LuLogOut } from "react-icons/lu";
import { useAuth } from "@/hooks";
import { ColorModeButton } from "@/components/ui/color-mode";

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <HStack
      as="header"
      justify="flex-end"
      px={6}
      py={3}
      borderBottomWidth="1px"
      bg="bg.panel"
      gap={4}
    >
      <ColorModeButton />

      <Menu.Root>
        <Menu.Trigger asChild>
          <HStack cursor="pointer" gap={2}>
            <Avatar.Root size="sm">
              <Avatar.Fallback name={user?.name ?? "?"} />
            </Avatar.Root>
            <Box display={{ base: "none", sm: "block" }}>
              <Text fontSize="sm" fontWeight="medium">
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
