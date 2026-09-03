"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { metalMastService } from "@/services";
import { MetalMastInput } from "@/types";
import { getErrorMessage, toast } from "@/lib/toast";

export function useMetalMasts(search?: string) {
  return useQuery({
    queryKey: ["metalMasts", { search }],
    queryFn: () => metalMastService.getAll(search),
  });
}

export function useMetalMast(id: string | null) {
  return useQuery({
    queryKey: ["metalMasts", id],
    queryFn: () => metalMastService.getById(id as string),
    enabled: id != null,
  });
}

export function useCreateMetalMast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MetalMastInput) => metalMastService.create(input),
    onSuccess: (metal) => {
      queryClient.invalidateQueries({ queryKey: ["metalMasts"] });
      toast.success("Metal created", `${metal.metalName} was added.`);
    },
    onError: (error) => {
      toast.error("Couldn't create metal", getErrorMessage(error));
    },
  });
}

export function useUpdateMetalMast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MetalMastInput }) =>
      metalMastService.update(id, input),
    onSuccess: (metal) => {
      queryClient.invalidateQueries({ queryKey: ["metalMasts"] });
      toast.success("Metal updated", `${metal.metalName} was saved.`);
    },
    onError: (error) => {
      toast.error("Couldn't update metal", getErrorMessage(error));
    },
  });
}
