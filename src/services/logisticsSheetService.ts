import { apiClient, unwrap } from "@/lib/api/client";
import { LOGISTICS_SHEET } from "@/lib/api/endpoints";
import type { LogisticsSheet, LogisticsSheetDetails, LogisticsSheetRequest } from "@/types/logisticsSheet";

export const logisticsSheetService = {
  createBulk(rows: LogisticsSheetRequest[]) {
    return unwrap<LogisticsSheet[]>(apiClient.post(LOGISTICS_SHEET.ROOT, rows));
  },
  getAll(active?: boolean, tranId?: number) {
    return unwrap<LogisticsSheetDetails[]>(apiClient.get(LOGISTICS_SHEET.ROOT, { params: { active, tranId } }));
  },
  getById(id: number) {
    return unwrap<LogisticsSheet>(apiClient.get(LOGISTICS_SHEET.BY_ID(id)));
  },
  update(id: number, input: LogisticsSheetRequest) {
    return unwrap<LogisticsSheet>(apiClient.put(LOGISTICS_SHEET.BY_ID(id), input));
  },
  activate(groupId: number) {
    return unwrap<unknown>(apiClient.put(LOGISTICS_SHEET.ACTIVATE, null, { params: { groupId } }));
  },
  deactivate(id: number) {
    return unwrap<void>(apiClient.delete(LOGISTICS_SHEET.BY_ID(id)));
  },
  clear() {
    return unwrap<{ deactivatedCount: number }>(apiClient.patch(LOGISTICS_SHEET.CLEAR));
  },
};
