"use client";

import { Card, Flex, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { LuBuilding2, LuFileText, LuGem, LuReceipt } from "react-icons/lu";
import { useCompanies, useMetalMasts, useChallanFormats, useTranWts, useUsers } from "@/hooks";

function StatCard({
  label,
  value,
  icon,
  accent = "brand",
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: "brand" | "secondary";
}) {
  return (
    <Card.Root
      borderWidth="1px"
      borderColor={`${accent}.100`}
      bg={`${accent}.50`}
      _dark={{ bg: "gray.900", borderColor: `${accent}.800` }}
      overflow="hidden"
      transition="transform 0.15s ease, box-shadow 0.15s ease"
      _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
    >
      <Card.Body>
        <Flex align="center" justify="space-between" mb={3}>
          <Text color="fg.muted" fontSize="sm" fontWeight="medium">
            {label}
          </Text>
          <Flex
            align="center"
            justify="center"
            w="40px"
            h="40px"
            borderRadius="lg"
            bg={`${accent}.600`}
            color="white"
            fontSize="lg"
            boxShadow="sm"
          >
            {icon}
          </Flex>
        </Flex>
        <Heading size="2xl" color={`${accent}.700`} _dark={{ color: `${accent}.300` }}>
          {value}
        </Heading>
      </Card.Body>
    </Card.Root>
  );
}

export default function DashboardHomePage() {
  const companies = useCompanies();
  const metals = useMetalMasts();
  const users = useUsers();
  const tranWts = useTranWts();

  return (
    <>
      <Heading size="lg" mb={6} color="fg.default">
        Overview
      </Heading>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
        <StatCard
          label="Companies"
          value={companies.data?.length ?? (companies.isLoading ? "…" : 0)}
          icon={<LuBuilding2 />}
        />
        <StatCard
          label="Metals"
          value={metals.data?.length ?? (metals.isLoading ? "…" : 0)}
          icon={<LuGem />}
        />
        <StatCard
          label="Users"
          value={users.data?.length ?? (users.isLoading ? "…" : 0)}
          icon={<LuFileText />}
          accent="secondary"
        />
        <StatCard
          label="Transactions"
          value={tranWts.data?.length ?? (tranWts.isLoading ? "…" : 0)}
          icon={<LuReceipt />}
          accent="secondary"
        />
      </SimpleGrid>
    </>
  );
}
