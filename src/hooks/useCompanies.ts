"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companyService, CompanyListParams } from "@/services";
import { CompanyInput } from "@/types";
import { getErrorMessage, toast } from "@/lib/toast";

const companiesKey = (params?: CompanyListParams) => ["companies", params] as const;

export function useCompanies(params?: CompanyListParams) {
  return useQuery({
    queryKey: companiesKey(params),
    queryFn: () => companyService.getAll(params),
  });
}

// Active-only company list, used for From/To company pickers (e.g. the
// TranWt/challan creation form) where an inactive company shouldn't be
// selectable for a new transaction.
export function useActiveCompanies(params?: CompanyListParams) {
  return useQuery({
    queryKey: ["companies", "active", params],
    queryFn: () => companyService.getActive(params),
  });
}

export function useCompany(id: string | null) {
  return useQuery({
    queryKey: ["companies", id],
    queryFn: () => companyService.getById(id as string),
    enabled: id != null,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CompanyInput) => companyService.create(input),
    onSuccess: (company) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company created", `${company.companyName} was added.`);
    },
    onError: (error) => {
      toast.error("Couldn't create company", getErrorMessage(error));
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CompanyInput }) =>
      companyService.update(id, input),
    onSuccess: (company) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company updated", `${company.companyName} was saved.`);
    },
    onError: (error) => {
      toast.error("Couldn't update company", getErrorMessage(error));
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => companyService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company deleted");
    },
    onError: (error) => {
      toast.error("Couldn't delete company", getErrorMessage(error));
    },
  });
}
