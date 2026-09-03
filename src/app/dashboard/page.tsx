"use client";

import { Card, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { LuBuilding2, LuFileText, LuGem, LuReceipt } from "react-icons/lu";
import { useCompanies, useMetalMasts, useChallanFormats, useTranWts } from "@/hooks";

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
    <Card.Root borderTopWidth="3px" borderTopColor={`${accent}.600`}>
      <Card.Body>
        <Text color="fg.muted" fontSize="sm" mb={2}>
          {label}
        </Text>
        <Heading size="2xl" display="flex" alignItems="center" gap={3}>
          <Text as="span" color={`${accent}.600`} display="inline-flex">
            {icon}
          </Text>
          {value}
        </Heading>
      </Card.Body>
    </Card.Root>
  );
}

export default function DashboardHomePage() {
  const companies = useCompanies();
  const metals = useMetalMasts();
  const formats = useChallanFormats();
  const tranWts = useTranWts();

  return (
    <>
      <Heading size="lg" mb={6}>
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
          label="Challan Formats"
          value={formats.data?.length ?? (formats.isLoading ? "…" : 0)}
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
