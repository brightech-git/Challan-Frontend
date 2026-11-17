"use client";

import { Stack } from "@chakra-ui/react";
import SavedLogisticsSheets from "../logistics/SavedLogisticsSheets";


export default function LogisticsSheetsPage() {
  return (
    <Stack gap={3}>
      <SavedLogisticsSheets />
    </Stack>
  );
}
