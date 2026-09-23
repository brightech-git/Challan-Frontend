import { apiClient, unwrap } from "@/lib/api/client";
import { HEADER1 } from "@/lib/api/endpoints";

export interface Header1 {
  sno: number;
  headerName1: string;
}

export const header1Service = {
  getAll() {
    return unwrap<Header1[]>(apiClient.get(HEADER1.GET_ALL));
  },
  create(headerName1: string) {
    return unwrap<Header1>(apiClient.post(HEADER1.CREATE, { headerName1 }));
  },
  remove(sno: number) {
    return unwrap<void>(apiClient.delete(HEADER1.DELETE(sno)));
  },
};
