"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { header2Service } from "@/services";
import { getErrorMessage, toast } from "@/lib/toast";

export function useHeader2s() {
  return useQuery({
    queryKey: ["header2"],
    queryFn: () => header2Service.getAll(),
  });
}

export function useCreateHeader2() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (headerName2: string) => header2Service.create(headerName2),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["header2"] });
      toast.success("Header created");
    },
    onError: (error) => {
      toast.error("Couldn't create header", getErrorMessage(error));
    },
  });
}

export function useDeleteHeader2() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sno: number) => header2Service.remove(sno),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["header2"] });
      toast.success("Header deleted");
    },
    onError: (error) => {
      toast.error("Couldn't delete header", getErrorMessage(error));
    },
  });
}
