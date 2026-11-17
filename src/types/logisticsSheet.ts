import type { TranWt } from "./tranWt";

export interface LogisticsSheetRequest {
  tranId: number;
  challanId: number;
  fromCompanyId: string;
  toCompanyId: string;
  brnNo: string;
  boxWt: string;
  active: boolean;
}

export interface LogisticsSheet extends Omit<LogisticsSheetRequest, "brnNo" | "boxWt"> {
  id: number;
  groupId: number;
  brnNo: number | string | null;
  boxWt: number | string | null;
}

export interface LogisticsSheetDetails extends LogisticsSheet {
  fromCompanyName?: string | null;
  fromCompanyAddress1?: string | null;
  fromCompanyAddress2?: string | null;
  fromCompanyAddress3?: string | null;
  toCompanyName?: string | null;
  toCompanyArea?: string | null;
  toCompanyAddress1?: string | null;
  toCompanyAddress2?: string | null;
  toCompanyAddress3?: string | null;
  tranWt?: TranWt | null;
}

// BOXWT is BigDecimal(20, 3). BRN No. is an identifier and may be alphanumeric.
export const validLogisticsDecimal = (value: string) => /^\d{1,17}(?:\.\d{1,3})?$/.test(value.trim());
