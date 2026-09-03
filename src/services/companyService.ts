import { apiClient, unwrap } from "@/lib/api/client";
import { COMPANY } from "@/lib/api/endpoints";
import { Company, CompanyInput, CompanyType } from "@/types";

export interface CompanyListParams {
  companyType?: CompanyType;
  search?: string;
}

export const companyService = {
  create(input: CompanyInput) {
    return unwrap<Company>(apiClient.post(COMPANY.CREATE, input));
  },

  getAll(params?: CompanyListParams) {
    return unwrap<Company[]>(apiClient.get(COMPANY.GET_ALL, { params }));
  },

  getActive(params?: CompanyListParams) {
    return unwrap<Company[]>(apiClient.get(COMPANY.GET_ACTIVE, { params }));
  },

  getById(id: string) {
    return unwrap<Company>(apiClient.get(COMPANY.GET_BY_ID(id)));
  },

  update(id: string, input: CompanyInput) {
    return unwrap<Company>(apiClient.put(COMPANY.UPDATE(id), input));
  },

  remove(id: string) {
    return unwrap<void>(apiClient.delete(COMPANY.DELETE(id)));
  },
};
