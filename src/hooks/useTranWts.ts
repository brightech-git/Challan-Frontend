"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tranWtService } from "@/services";
import { TranWtInput } from "@/types";
import { getErrorMessage, toast } from "@/lib/toast";

export function useTranWts(search?: string) {
  return useQuery({
    queryKey: ["tranWts", { search }],
    queryFn: () => tranWtService.getAll(search),
  });
}

export function useTranWtsByDateRange(fromDate: string, toDate: string) {
  return useQuery({
    queryKey: ["tranWts", "report", { fromDate, toDate }],
    queryFn: () => tranWtService.getByDateRange(fromDate, toDate),
  });
}

export function useTranWt(id: number | null) {
  return useQuery({
    queryKey: ["tranWts", id],
    queryFn: () => tranWtService.getById(id as number),
    enabled: id != null,
  });
}

export function useCreateTranWt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TranWtInput) => tranWtService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tranWts"] });
      toast.success("Transaction created");
    },
    onError: (error) => {
      toast.error("Couldn't create transaction", getErrorMessage(error));
    },
  });
}

export function useUpdateTranWt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
      companyId,
    }: {
      id: number;
      input: TranWtInput;
      companyId: string;
    }) => tranWtService.update(id, input, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tranWts"] });
      toast.success("Transaction updated");
    },
    onError: (error) => {
      toast.error("Couldn't update transaction", getErrorMessage(error));
    },
  });
}

export function useDeleteTranWt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tranWtService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tranWts"] });
      toast.success("Transaction deleted");
    },
    onError: (error) => {
      toast.error("Couldn't delete transaction", getErrorMessage(error));
    },
  });
}
