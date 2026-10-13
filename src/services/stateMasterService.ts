import { apiClient, unwrap } from "@/lib/api/client";
import { STATE_MASTER } from "@/lib/api/endpoints";

export interface StateMaster {
  stateId: number;
  stateCode: string;
  stateName: string;
}

export const stateMasterService = {
  getAll() {
    return unwrap<StateMaster[]>(apiClient.get(STATE_MASTER.GET_ALL));
  },
};
