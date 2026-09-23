"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { header1Service } from "@/services";
import { getErrorMessage, toast } from "@/lib/toast";

export function useHeader1s() {
  return useQuery({
    queryKey: ["header1"],
    queryFn: () => header1Service.getAll(),
  });
}

export function useCreateHeader1() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (headerName1: string) => header1Service.create(headerName1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["header1"] });
      toast.success("Header created");
    },
    onError: (error) => {
      toast.error("Couldn't create header", getErrorMessage(error));
    },
  });
}

export function useDeleteHeader1() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sno: number) => header1Service.remove(sno),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["header1"] });
      toast.success("Header deleted");
    },
    onError: (error) => {
      toast.error("Couldn't delete header", getErrorMessage(error));
    },
  });
}
