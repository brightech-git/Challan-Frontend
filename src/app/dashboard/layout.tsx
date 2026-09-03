import { Box, Flex } from "@chakra-ui/react";
import { AuthGuard, Sidebar, Topbar } from "@/components/layout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Flex minH="100vh">
        <Sidebar />
        <Flex direction="column" flex={1} minW={0}>
          <Topbar />
          <Box as="main" flex={1} p={6} overflowX="auto">
            {children}
          </Box>
        </Flex>
      </Flex>
    </AuthGuard>
  );
}
