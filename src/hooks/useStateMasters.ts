"use client";

import { useQuery } from "@tanstack/react-query";
import { stateMasterService } from "@/services/stateMasterService";

export function useStateMasters() {
  return useQuery({
    queryKey: ["stateMasters"],
    queryFn: () => stateMasterService.getAll(),
  });
}
