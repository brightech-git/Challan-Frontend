import { apiClient, unwrap } from "@/lib/api/client";
import { CHALLAN_FORMAT } from "@/lib/api/endpoints";
import { ChallanFormat, ChallanFormatInput } from "@/types";

export const challanFormatService = {
  create(input: ChallanFormatInput) {
    return unwrap<ChallanFormat>(apiClient.post(CHALLAN_FORMAT.CREATE, input));
  },

  getAll() {
    return unwrap<ChallanFormat[]>(apiClient.get(CHALLAN_FORMAT.GET_ALL));
  },

  getById(id: string) {
    return unwrap<ChallanFormat>(apiClient.get(CHALLAN_FORMAT.GET_BY_ID(id)));
  },

  update(id: string, input: ChallanFormatInput) {
    return unwrap<ChallanFormat>(apiClient.put(CHALLAN_FORMAT.UPDATE(id), input));
  },

  remove(id: string) {
    return unwrap<void>(apiClient.delete(CHALLAN_FORMAT.DELETE(id)));
  },
};
