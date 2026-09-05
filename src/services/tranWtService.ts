import { apiClient, unwrap } from "@/lib/api/client";
import { TRAN_WT } from "@/lib/api/endpoints";
import { TranWt, TranWtInput } from "@/types";

export const tranWtService = {
  create(input: TranWtInput) {
    return unwrap<TranWt>(apiClient.post(TRAN_WT.CREATE, input));
  },

  getAll(search?: string) {
    return unwrap<TranWt[]>(
      apiClient.get(TRAN_WT.GET_ALL, { params: search ? { search } : undefined })
    );
  },

  getByDateRange(fromDate: string, toDate: string) {
    return unwrap<TranWt[]>(
      apiClient.get(TRAN_WT.GET_ALL, { params: { fromDate, toDate } })
    );
  },

  getById(id: number) {
    return unwrap<TranWt>(apiClient.get(TRAN_WT.GET_BY_ID(id)));
  },

  print(id: number) {
    return apiClient.get(TRAN_WT.PRINT_BY_ID(id));
  },

  // companyId is required as a query param by the backend on update.
  update(id: number, input: TranWtInput, companyId: string) {
    return unwrap<TranWt>(
      apiClient.put(TRAN_WT.UPDATE(id), input, { params: { companyId } })
    );
  },

  remove(id: number) {
    return unwrap<void>(apiClient.delete(TRAN_WT.DELETE(id)));
  },
};
