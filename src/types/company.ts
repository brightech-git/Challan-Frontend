// Mirrors com.Brightech.Challan.Company.CompanyTypeEnum
export type CompanyType = "FROM" | "TO";

// Mirrors com.Brightech.Challan.Company.Company
export interface Company {
  companyId: string;
  companyName: string;
  companyType: CompanyType;
  costId?: string | null;
  address1?: string | null;
  address2?: string | null;
  address3?: string | null;
  address4?: string | null;
  areaCode?: string | null;
  phone?: string | null;
  email?: string | null;
  localTaxNo?: string | null;
  cstNo?: string | null;
  tinNo?: string | null;
  panNo?: string | null;
  tdsNo?: string | null;
  displayOrder?: number | null;
  autoGenerator?: string | null;
  userId?: number | null;
  shortKey?: string | null;
  active?: boolean | null;
  tanNo?: string | null;
  gstNo?: string | null;
  stateId?: number | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}

export type CompanyInput = Omit<Company, "updatedAt" | "createdAt">;
