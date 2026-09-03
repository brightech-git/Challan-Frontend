"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { challanFormatService } from "@/services";
import { ChallanFormatInput } from "@/types";
import { getErrorMessage, toast } from "@/lib/toast";

export function useChallanFormats() {
  return useQuery({
    queryKey: ["challanFormats"],
    queryFn: () => challanFormatService.getAll(),
  });
}

export function useChallanFormat(id: string | null) {
  return useQuery({
    queryKey: ["challanFormats", id],
    queryFn: () => challanFormatService.getById(id as string),
    enabled: id != null,
  });
}

export function useCreateChallanFormat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ChallanFormatInput) => challanFormatService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challanFormats"] });
      toast.success("Challan format created");
    },
    onError: (error) => {
      toast.error("Couldn't create challan format", getErrorMessage(error));
    },
  });
}

export function useUpdateChallanFormat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ChallanFormatInput }) =>
      challanFormatService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challanFormats"] });
      toast.success("Challan format updated");
    },
    onError: (error) => {
      toast.error("Couldn't update challan format", getErrorMessage(error));
    },
  });
}

export function useDeleteChallanFormat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => challanFormatService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challanFormats"] });
      toast.success("Challan format deleted");
    },
    onError: (error) => {
      toast.error("Couldn't delete challan format", getErrorMessage(error));
    },
  });
}
