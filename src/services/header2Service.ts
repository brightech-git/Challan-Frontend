import { apiClient, unwrap } from "@/lib/api/client";
import { HEADER2 } from "@/lib/api/endpoints";

export interface Header2 {
  sno: number;
  headerName2: string;
}

export const header2Service = {
  getAll() {
    return unwrap<Header2[]>(apiClient.get(HEADER2.GET_ALL));
  },
  create(headerName2: string) {
    return unwrap<Header2>(apiClient.post(HEADER2.CREATE, { headerName2 }));
  },
  remove(sno: number) {
    return unwrap<void>(apiClient.delete(HEADER2.DELETE(sno)));
  },
};
