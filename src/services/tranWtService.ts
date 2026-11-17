import { apiClient, unwrap } from "@/lib/api/client";
import { TRAN_WT } from "@/lib/api/endpoints";
import { TranWt, TranWtInput } from "@/types";

export const tranWtService = {
  create(input: TranWtInput) {
    return unwrap<TranWt>(apiClient.post(TRAN_WT.CREATE, input));
  },

  getAll(search?: string, fromDate?: string, toDate?: string) {
    const params = {
      ...(search ? { search } : {}),
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {}),
    };
    return unwrap<TranWt[]>(
      apiClient.get(TRAN_WT.GET_ALL, { params })
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

  async updatePartyName(id: number, partyName: string) {
    // PUT accepts a transaction entity. Reload it first to preserve other fields.
    const transaction = await tranWtService.getById(id);
    const responseOnlyFields = new Set([
      "id", "createdDate", "updatedDate", "fromCompanyDetails", "toCompanyDetails",
      "fromCompanyName", "toCompanyName", "metalName",
    ]);
    const input = Object.fromEntries(Object.entries(transaction)
      .filter(([key]) => !responseOnlyFields.has(key))) as TranWtInput;
    return tranWtService.update(id, { ...input, partyName }, transaction.fromCompanyId);
  },

  remove(id: number) {
    return unwrap<void>(apiClient.delete(TRAN_WT.DELETE(id)));
  },

};
