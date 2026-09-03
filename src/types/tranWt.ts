import { Company } from "./company";

// Mirrors com.Brightech.Challan.TranWt.TranType
export type TranType = "NETWT" | "GRSWT";

// Mirrors com.Brightech.Challan.TranWt.TranWt
export interface TranWt {
  id: number;
  fromCompanyId: string;
  toCompanyId: string;
  tranDate?: string | null;
  metalId?: string | null;
  description?: string | null;
  grsWt?: number | null;
  netWt?: number | null;
  stnWt?: number | null;
  rate?: number | null;
  calType?: TranType | null;
  value?: number | null;
  cgstPer?: number | null;
  sgstPer?: number | null;
  igstPer?: number | null;
  csstAmt?: number | null;
  sgstAmt?: number | null;
  igstAmt?: number | null;
  total?: number | null;
  hsnCode?: string | null;
  updatedDate?: string | null;
  createdDate?: string | null;
  userId?: number | null;
  // Transient fields populated by the backend for convenience
  fromCompanyDetails?: Company | null;
  toCompanyDetails?: Company | null;
  metalName?: string | null;
}

export type TranWtInput = Omit<
  TranWt,
  | "id"
  | "updatedDate"
  | "createdDate"
  | "fromCompanyDetails"
  | "toCompanyDetails"
  | "metalName"
>;
